import { LogOut, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { ParentSidebar } from "@/components/dashboard/parent-sidebar";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { TeacherSidebar } from "@/components/dashboard/teacher-sidebar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, organization, logout } = useUser();

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
        <AdminSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      )}
      {user.role === "teacher" && (
        <TeacherSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      )}
      {user.role === "parent" && (
        <ParentSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-20 md:ml-64 md:pt-0">
        {/* Top Bar */}
        <div
          className={`fixed top-0 right-0 left-0 h-16 bg-gradient-to-r md:left-64 ${getRoleColor()} z-30 flex items-center justify-between px-4 shadow-lg md:px-8`}
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

        {/* Content */}
        <div className="p-4 pt-8 md:p-8">
          {activeMenu === "overview" && (
            <RoleDashboard role={user.role} username={user.full_name} />
          )}

          {/* Placeholder for other menu items */}
          {activeMenu !== "overview" && (
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
      </main>
    </div>
  );
}
