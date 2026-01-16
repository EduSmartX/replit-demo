/**
 * Leave Allocations Section Component
 * Handles all leave allocation-related CRUD operations and routing
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LeaveAllocationForm, LeaveAllocationsList } from "@/components/leave";
import { useToast } from "@/hooks/use-toast";
import type { LeaveAllocation } from "@/lib/api/leave-api";
import { deleteLeaveAllocation, apiRequest, API_ENDPOINTS } from "@/lib/api/leave-api";

type ViewMode = "list" | "create" | "view" | "edit";

export function LeaveAllocationsSection() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedAllocation, setSelectedAllocation] = useState<LeaveAllocation | null>(null);

  // Extract allocation ID from URL
  const getAllocationIdFromPath = () => {
    const match = location.match(/\/allocations\/([a-zA-Z0-9]+)$/);
    return match ? match[1] : null;
  };

  const allocationId = getAllocationIdFromPath();

  // Fetch allocation detail when URL contains an ID
  const { data: allocationDetail } = useQuery({
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
        roles: data.roles_details.map((r: any) => r.name).join(", "),
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
    enabled: !!allocationId,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Update viewMode and selectedAllocation when URL changes
  useEffect(() => {
    if (allocationId && allocationDetail) {
      setSelectedAllocation(allocationDetail);
      setViewMode("view");
    } else if (!allocationId) {
      setViewMode("list");
      setSelectedAllocation(null);
    }
  }, [allocationId, allocationDetail]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => deleteLeaveAllocation(publicId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["leave-allocations"],
        exact: false,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["leave-allocations"],
        exact: false,
      });
      toast({
        title: "Success",
        description: "Leave allocation policy has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete leave allocation policy",
        variant: "destructive",
      });
    },
  });

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

  const handleDelete = async (allocation: LeaveAllocation) => {
    if (confirm(`Are you sure you want to delete the ${allocation.leave_type_name} policy?`)) {
      deleteMutation.mutate(allocation.public_id);
    }
  };

  return (
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
            const message =
              viewMode === "create"
                ? "Leave allocation policy has been created successfully"
                : "Leave allocation policy has been updated successfully";
            toast({
              title: "Success",
              description: message,
            });

            if (viewMode === "edit" && selectedAllocation) {
              await queryClient.invalidateQueries({
                queryKey: ["leave-allocation-detail", selectedAllocation.public_id],
              });
              setViewMode("view");
            } else {
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
  );
}
