/**
 * Classes Management Page
 * 
 * Administrative interface for managing classes and sections.
 * Supports creating, viewing, editing, and deleting sections.
 * Handles routing for list view and detail views.
 * Implements modular approach with reusable hooks and centralized dialogs.
 * 
 * @route /classes
 * @route /classes/:id (for viewing/editing specific class)
 */

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PageWrapper, SuccessDialog, DeleteConfirmationDialog } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { ClassesList, MultiRowClassForm, SingleClassForm } from "@/features/classes";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useReactivateMutation } from "@/hooks/use-reactivate-mutation";
import { deleteClass, fetchClass, reactivateClass, type MasterClass } from "@/lib/api/class-api";

type ViewMode = "list" | "create" | "view" | "edit";

export default function ClassesPage() {
  const [location, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedClass, setSelectedClass] = useState<MasterClass | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; classData: MasterClass | null }>({
    open: false,
    classData: null,
  });
  const [reactivateDialog, setReactivateDialog] = useState<{ open: boolean; classData: MasterClass | null }>({
    open: false,
    classData: null,
  });

  const getClassIdFromPath = () => {
    const match = location.match(/\/classes\/([a-zA-Z0-9]+)$/);
    return match ? match[1] : null;
  };

  const classId = getClassIdFromPath();

  const { data: classDetail, isLoading: isLoadingClass } = useQuery({
    queryKey: ["class-detail", classId],
    queryFn: async () => {
      if (!classId) {
        return null;
      }
      const response = await fetchClass(classId);
      return response.data;
    },
    enabled: !!classId,
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (classId && classDetail) {
      setSelectedClass(classDetail);
      setViewMode("view");
    } else if (!classId) {
      setViewMode("list");
      setSelectedClass(null);
    }
  }, [classId, classDetail]);

  const deleteClassMutation = useDeleteMutation({
    resourceName: "Section",
    deleteFn: deleteClass,
    queryKeys: ["classes", "class-detail"],
    onSuccessCallback: () => {
      setSuccessMessage({
        title: "Section Deleted!",
        description: "The section has been successfully deleted.",
      });
      setShowSuccessDialog(true);
    },
  });

  const reactivateClassMutation = useReactivateMutation({
    resourceName: "Section",
    reactivateFn: reactivateClass,
    queryKeys: ["classes", "class-detail"],
    onSuccessCallback: () => {
      setSuccessMessage({
        title: "Section Reactivated!",
        description: "The section has been successfully reactivated.",
      });
      setShowSuccessDialog(true);
    },
  });

  const handleDeleteClass = (classData: MasterClass) => {
    setDeleteDialog({ open: true, classData });
  };

  const handleReactivateClass = (classData: MasterClass) => {
    setReactivateDialog({ open: true, classData });
  };

  const confirmDelete = () => {
    if (deleteDialog.classData) {
      deleteClassMutation.mutate(deleteDialog.classData.public_id);
      setDeleteDialog({ open: false, classData: null });
    }
  };

  const confirmReactivate = () => {
    if (reactivateDialog.classData) {
      reactivateClassMutation.mutate(reactivateDialog.classData.public_id);
      setReactivateDialog({ open: false, classData: null });
    }
  };

  const handleView = (classData: MasterClass) => {
    setViewMode("view");
    setLocation(`/classes/${classData.public_id}`);
  };

  const handleEdit = (classData: MasterClass) => {
    setViewMode("edit");
    setLocation(`/classes/${classData.public_id}`);
  };

  const handleCreateNew = () => {
    setSelectedClass(null);
    setViewMode("create");
  };

  const handleSuccess = (isCreate: boolean = false) => {
    setSuccessMessage({
      title: isCreate ? "Section(s) Created!" : "Section Updated!",
      description: isCreate
        ? "The section(s) have been successfully created."
        : "The section has been successfully updated.",
    });
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    
    if (successMessage.title.includes("Deleted") || successMessage.title.includes("Reactivated")) {
      setViewMode("list");
      setSelectedClass(null);
      setLocation("/classes");
    } else if (viewMode === "create") {
      setViewMode("list");
      setSelectedClass(null);
      setLocation("/classes");
    } else if (viewMode === "edit") {
      setSelectedClass(null);
      setViewMode("view");
    }
  };

  const handleCancel = () => {
    if (viewMode === "edit") {
      setViewMode("view");
    } else {
      setViewMode("list");
      setSelectedClass(null);
      setLocation("/classes");
    }
  };

  return (
    <DashboardLayout>
      <PageWrapper>
        {viewMode === "list" ? (
          <ClassesList
            onCreateNew={handleCreateNew}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClass}
            onReactivate={handleReactivateClass}
          />
        ) : viewMode === "create" ? (
          <MultiRowClassForm
            onSuccess={() => handleSuccess(true)}
            onCancel={handleCancel}
          />
        ) : (isLoadingClass || (classId && !selectedClass)) ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Loading class data...</p>
            </div>
          </div>
        ) : (
          <SingleClassForm
            mode={viewMode}
            initialData={selectedClass}
            onEdit={() => setViewMode("edit")}
            onSuccess={() => handleSuccess(false)}
            onCancel={handleCancel}
          />
        )}
      </PageWrapper>

      <SuccessDialog
        open={showSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        onClose={handleSuccessDialogClose}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        description={`Are you sure you want to delete the section "${deleteDialog.classData?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, classData: null })}
        isDeleting={deleteClassMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={reactivateDialog.open}
        title="Reactivate Section"
        description={`Are you sure you want to reactivate the section "${reactivateDialog.classData?.name}"?`}
        confirmLabel="Reactivate"
        onConfirm={confirmReactivate}
        onCancel={() => setReactivateDialog({ open: false, classData: null })}
        isDeleting={reactivateClassMutation.isPending}
        variant="default"
      />
    </DashboardLayout>
  );
}
