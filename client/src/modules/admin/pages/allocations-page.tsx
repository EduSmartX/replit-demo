/**
 * Leave Allocations Management Page
 * 
 * @route /allocations
 * @route /allocations/:id (for viewing/editing specific allocation)
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PageWrapper, SuccessDialog, DeleteConfirmationDialog } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { LeaveAllocationForm, LeaveAllocationsList } from "@/features/leave";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { deleteLeaveAllocation, apiRequest, API_ENDPOINTS } from "@/lib/api/leave-api";
import type { LeaveAllocation } from "@/lib/api/leave-api";

type ViewMode = "list" | "create" | "view" | "edit";

export default function AllocationsPage() {
  const [location, setLocation] = useLocation();
  const _queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedAllocation, setSelectedAllocation] = useState<LeaveAllocation | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; allocation: LeaveAllocation | null }>({
    open: false,
    allocation: null,
  });

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
      if (!allocationId) {
        return null;
      }
      const response = await apiRequest<{
        success: boolean;
        message: string;
        data: unknown;
        code: number;
      }>(API_ENDPOINTS.leave.allocationDetail(allocationId), {
        method: "GET",
      });

      if (!response.success || response.code < 200 || response.code >= 300) {
        throw new Error(response.message || "Failed to fetch allocation details");
      }

      const data = response.data as Record<string, unknown>;

      return {
        public_id: data.public_id,
        leave_type_id: (data.leave_type as { id: number }).id,
        leave_type_name: (data.leave_type as { name: string }).name,
        name: (data.name as string) || "",
        description: (data.description as string) || "",
        total_days: data.total_days,
        max_carry_forward_days: data.max_carry_forward_days,
        roles: (data.roles_details as Array<{ name: string }>).map((r) => r.name).join(", "),
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
  const deleteMutation = useDeleteMutation({
    resourceName: "Leave allocation policy",
    deleteFn: deleteLeaveAllocation,
    queryKeys: ["leave-allocations"],
    onSuccessCallback: () => {
      setSuccessMessage({
        title: "Policy Deleted!",
        description: "The leave allocation policy has been successfully deleted.",
      });
      setShowSuccessDialog(true);
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
    setDeleteDialog({ open: true, allocation });
  };

  const confirmDelete = () => {
    if (deleteDialog.allocation) {
      deleteMutation.mutate(deleteDialog.allocation.public_id);
      setDeleteDialog({ open: false, allocation: null });
    }
  };

  return (
    <DashboardLayout>
      <PageWrapper>
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
            onSuccess={() => {
              const isCreate = viewMode === "create";
              setSuccessMessage({
                title: isCreate ? "Policy Created!" : "Policy Updated!",
                description: isCreate
                  ? "Leave allocation policy has been created successfully."
                  : "Leave allocation policy has been updated successfully.",
              });
              setShowSuccessDialog(true);
            }}
            onCancel={() => {
              setViewMode("list");
              setSelectedAllocation(null);
              setLocation("/allocations");
            }}
          />
        )}
      </PageWrapper>

      <SuccessDialog
        open={showSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        onClose={() => {
          setShowSuccessDialog(false);
          if (successMessage.title.includes("Deleted")) {
            setViewMode("list");
            setSelectedAllocation(null);
            setLocation("/allocations");
          } else if (viewMode === "create") {
            setViewMode("list");
            setSelectedAllocation(null);
            setLocation("/allocations");
          } else if (viewMode === "edit") {
            setViewMode("view");
          }
        }}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        description={`Are you sure you want to delete the ${deleteDialog.allocation?.leave_type_name} policy? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, allocation: null })}
        isDeleting={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
