import { LogOut, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { ParentSidebar } from "@/components/dashboard/parent-sidebar";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { TeacherSidebar } from "@/components/dashboard/teacher-sidebar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { LeaveAllocationForm, LeaveAllocationsList, OrganizationHolidayCalendar } from "@/components/leave";
import { OrganizationPreferences } from "@/components/preferences/organization-preferences";
import type { LeaveAllocation } from "@/lib/api/leave-api";
import { deleteLeaveAllocation, apiRequest, API_ENDPOINTS } from "@/lib/api/leave-api";

type ViewMode = "list" | "create" | "view" | "edit";

export default function DashboardPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, organization, logout } = useUser();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedAllocation, setSelectedAllocation] = useState<LeaveAllocation | null>(null);

  // Get active menu from URL path
  const getActiveMenuFromPath = () => {
    const path = location.replace('/', '');
    return path === 'dashboard' || path === '' ? 'overview' : path.split('/')[0];
  };

  const [activeMenu, setActiveMenu] = useState(getActiveMenuFromPath());

  // Extract allocation ID from URL
  const getAllocationIdFromPath = () => {
    const match = location.match(/\/allocations\/([a-zA-Z0-9]+)$/);
    return match ? match[1] : null;
  };

  const allocationId = getAllocationIdFromPath();

  // Fetch allocation detail when URL contains an ID
  const { data: allocationDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["leave-allocation-detail", allocationId],
    queryFn: async () => {
      if (!allocationId) return null;
      const response = await apiRequest<any>(API_ENDPOINTS.leave.allocationDetail(allocationId), {
        method: "GET",
      });
      
      // Handle standardized API response
      if (!response.success || response.code < 200 || response.code >= 300) {
        throw new Error(response.message || "Failed to fetch allocation details");
      }
      
      const data = response.data;
      
      // Transform API response to match LeaveAllocation interface
      return {
        public_id: data.public_id,
        leave_type_id: data.leave_type.id,
        leave_type_name: data.leave_type.name,
        name: data.name || "",
        description: data.description || "",
        total_days: data.total_days,
        max_carry_forward_days: data.max_carry_forward_days,
        roles: data.roles_details.map((r: any) => r.name).join(', '),
        effective_from: data.effective_from,
        effective_to: data.effective_to,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by_public_id: data.created_by_public_id,
        created_by_name: data.created_by_name,
        updated_by_public_id: data.updated_by_public_id,
        updated_by_name: data.updated_by_name,
      } as LeaveAllocation;
    },
    enabled: !!allocationId && activeMenu === "allocations",
    staleTime: 0,
    refetchOnMount: true,
  });

  // Update viewMode and selectedAllocation when URL changes
  useEffect(() => {
    if (allocationId && allocationDetail) {
      setSelectedAllocation(allocationDetail);
    } else if (!allocationId && activeMenu === "allocations") {
      setViewMode("list");
      setSelectedAllocation(null);
    }
  }, [allocationId, allocationDetail, activeMenu]);

  // Update activeMenu when location changes
  useEffect(() => {
    const menu = getActiveMenuFromPath();
    setActiveMenu(menu);
  }, [location]);

  // Handle menu change with URL update
  const handleMenuChange = (menuId: string) => {    
    setViewMode("list");
    setSelectedAllocation(null);
    
    if (menuId === 'overview') {
      setLocation('/dashboard');
    } else {
      setLocation(`/${menuId}`);
    }
  };

  const handleView = (allocation: LeaveAllocation) => {
    setSelectedAllocation(allocation);
    setViewMode("view");
    setLocation(`/allocations/${allocation.public_id}`);
  };

  const handleEdit = (allocation: LeaveAllocation) => {
    setSelectedAllocation(allocation);
    setViewMode("edit");
    setLocation(`/allocations/${allocation.public_id}`);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => deleteLeaveAllocation(publicId),
    onSuccess: async () => {
      // Invalidate and refetch allocations - use exact: false to match all variations
      await queryClient.invalidateQueries({ 
        queryKey: ["leave-allocations"],
        exact: false,
        refetchType: 'active'
      });
      // Force refetch
      await queryClient.refetchQueries({ 
        queryKey: ["leave-allocations"],
        exact: false 
      });
      toast({
        title: "Success",
        description: "Leave allocation policy has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete leave allocation policy",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (allocation: LeaveAllocation) => {
    if (confirm(`Are you sure you want to delete the ${allocation.leave_type_name} policy?`)) {
      deleteMutation.mutate(allocation.public_id);
    }
  };

  useEffect(() => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    if (organization && !organization.is_approved) {
      setLocation("/organization-pending");
    }
  }, [user, organization, setLocation]);

  if (!user || !organization) {
    return null;
  }

  if (!organization.is_approved) {
    return null;
  }

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    logout();
    setLocation("/auth");
  };

  const getRoleColor = () => {
    switch (user.role) {
      case "admin":
        return "from-blue-600 via-teal-500 to-green-600";
      case "teacher":
        return "from-purple-600 via-pink-500 to-rose-600";
      case "parent":
        return "from-amber-600 via-orange-500 to-red-600";
      default:
        return "from-blue-600 via-teal-500 to-green-600";
    }
  };

  const getRoleBackground = () => {
    switch (user.role) {
      case "admin":
        return "bg-gradient-to-br from-blue-50 via-green-50 to-blue-50";
      case "teacher":
        return "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50";
      case "parent":
        return "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50";
      default:
        return "bg-gradient-to-br from-blue-50 via-green-50 to-blue-50";
    }
  };

  return (
    <div className={`flex h-screen ${getRoleBackground()}`}>
      {/* Sidebar based on role */}
      {user.role === "admin" && (
        <AdminSidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      )}
      {user.role === "teacher" && (
        <TeacherSidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      )}
      {user.role === "parent" && (
        <ParentSidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Top Bar - Fixed */}
        <div
          className={`fixed top-0 right-0 left-0 md:left-0 h-16 bg-gradient-to-r ${getRoleColor()} z-50 flex items-center justify-between px-4 shadow-lg md:px-8`}
        >
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-white/80" />
            <div>
              <p className="text-lg leading-tight font-bold text-white">{organization.name}</p>
              <p className="text-xs text-white/70">
                {organization.board_affiliation.toUpperCase()} • {organization.organization_type}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{user.full_name}</p>
              <p className="text-xs text-white/70 capitalize">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full text-white hover:bg-white/20"
              data-testid="button-logout-top"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto mt-16">
          <div className="p-4 md:p-8">
            {activeMenu === "overview" && (
              <RoleDashboard role={user.role} username={user.full_name} />
            )}

          {/* Leave Allocations */}
          {activeMenu === "allocations" && user.role === "admin" && (
            <>
              {viewMode === "list" ? (
                <LeaveAllocationsList 
                  onCreateNew={() => {
                    setSelectedAllocation(null);
                    setViewMode("create");
                  }}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <LeaveAllocationForm 
                  mode={viewMode}
                  initialData={selectedAllocation}
                  onEdit={() => setViewMode("edit")}
                  onSuccess={async () => {
                    const message = viewMode === "create" 
                      ? "Leave allocation policy has been created successfully"
                      : "Leave allocation policy has been updated successfully";
                    toast({
                      title: "Success",
                      description: message,
                    });
                    
                    if (viewMode === "edit" && selectedAllocation) {
                      // After update, stay on same URL and switch to view mode
                      await queryClient.invalidateQueries({ 
                        queryKey: ["leave-allocation-detail", selectedAllocation.public_id] 
                      });
                      setViewMode("view");
                    } else {
                      // After create, go back to list
                      setViewMode("list");
                      setSelectedAllocation(null);
                      setLocation("/allocations");
                    }
                  }}
                  onCancel={() => {
                    setViewMode("list");
                    setSelectedAllocation(null);
                    setLocation("/allocations");
                  }}
                />
              )}
            </>
          )}

          {/* Organization Holiday Calendar */}
          {activeMenu === "organization" && user.role === "admin" && (
            <OrganizationHolidayCalendar />
          )}

          {/* Organization Preferences */}
          {activeMenu === "preferences" && user.role === "admin" && (
            <OrganizationPreferences />
          )}

          {/* Placeholder for other menu items */}
          {activeMenu !== "overview" && activeMenu !== "allocations" && activeMenu !== "organization" && activeMenu !== "preferences" && (
            <div className="py-20 text-center">
              <div className="mb-6 inline-block rounded-full bg-gradient-to-br from-blue-100 to-green-100 p-12">
                <div className="text-4xl">🚀</div>
              </div>
              <h2
                className={`bg-gradient-to-r text-3xl font-bold ${getRoleColor()} mb-2 bg-clip-text text-transparent`}
              >
                Coming Soon
              </h2>
              <p className="text-gray-600">
                The <span className="font-semibold">{activeMenu}</span> section is under
                development.
              </p>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}
