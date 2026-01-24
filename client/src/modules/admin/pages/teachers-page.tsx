import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PageWrapper, SuccessDialog, DeleteConfirmationDialog } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { TeachersList, TeacherForm } from "@/features/teachers";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useReactivateMutation } from "@/hooks/use-reactivate-mutation";
import { deleteTeacher, fetchTeacherById, reactivateTeacher } from "@/lib/api/teacher-api";
import type { Teacher } from "@/lib/api/teacher-api";

export default function TeachersPage() {
  const [location, setLocation] = useLocation();
  
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit" | "view">("list");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teacher: Teacher | null }>({
    open: false,
    teacher: null,
  });
  const [reactivateDialog, setReactivateDialog] = useState<{ open: boolean; teacher: Teacher | null }>({
    open: false,
    teacher: null,
  });

  const getTeacherIdFromPath = () => {
    const match = location.match(/\/teachers\/([a-zA-Z0-9-]+)$/);
    return match ? match[1] : null;
  };

  const teacherId = getTeacherIdFromPath();

  const { data: teacherDetail, isLoading: isLoadingTeacher } = useQuery({
    queryKey: ["teacher-detail", teacherId],
    queryFn: async () => {
      if (!teacherId) {
        return null;
      }
      const teacherData = await fetchTeacherById(teacherId);
      return teacherData;
    },
    enabled: !!teacherId,
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (teacherId && teacherDetail) {
      setSelectedTeacher(teacherDetail);
      setViewMode("view");
    } else if (!teacherId) {
      setViewMode("list");
      setSelectedTeacher(null);
    }
  }, [teacherId, teacherDetail]);

  const deleteTeacherMutation = useDeleteMutation({
    resourceName: "Teacher",
    deleteFn: deleteTeacher,
    queryKeys: ["teachers", "teacher-detail"],
    onSuccessCallback: () => {
      setSuccessMessage({
        title: "Teacher Deleted!",
        description: "The teacher has been successfully deleted.",
      });
      setShowSuccessDialog(true);
    },
  });

  const reactivateTeacherMutation = useReactivateMutation({
    resourceName: "Teacher",
    reactivateFn: reactivateTeacher,
    queryKeys: ["teachers", "teacher-detail"],
    onSuccessCallback: () => {
      setSuccessMessage({
        title: "Teacher Reactivated!",
        description: "The teacher has been successfully reactivated.",
      });
      setShowSuccessDialog(true);
    },
  });

  const handleDeleteTeacher = (teacher: Teacher) => {
    setDeleteDialog({ open: true, teacher });
  };

  const handleReactivateTeacher = (teacher: Teacher) => {
    setReactivateDialog({ open: true, teacher });
  };

  const confirmDelete = () => {
    if (deleteDialog.teacher) {
      deleteTeacherMutation.mutate(deleteDialog.teacher.public_id);
      setDeleteDialog({ open: false, teacher: null });
    }
  };

  const confirmReactivate = () => {
    if (reactivateDialog.teacher) {
      reactivateTeacherMutation.mutate(reactivateDialog.teacher.public_id);
      setReactivateDialog({ open: false, teacher: null });
    }
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setViewMode("view");
    setLocation(`/teachers/${teacher.public_id}`);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setViewMode("edit");
    setLocation(`/teachers/${teacher.public_id}`);
  };

  const handleCreateNew = () => {
    setSelectedTeacher(null);
    setViewMode("create");
  };

  const handleSuccess = () => {
    const isCreate = viewMode === "create";
    setSuccessMessage({
      title: isCreate ? "Teacher Created!" : "Teacher Updated!",
      description: isCreate
        ? "The teacher has been successfully added to your organization."
        : "The teacher information has been updated successfully.",
    });
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    
    if (viewMode === "create") {
      setViewMode("list");
      setSelectedTeacher(null);
      setLocation("/teachers");
    } else if (viewMode === "edit") {
      // Clear selectedTeacher to force refetch of updated data
      setSelectedTeacher(null);
      setViewMode("view");
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedTeacher(null);
    setLocation("/teachers");
  };

  return (
    <DashboardLayout>
      <PageWrapper>
        {viewMode === "list" ? (
          <TeachersList
            onCreateNew={handleCreateNew}
            onView={handleViewTeacher}
            onEdit={handleEditTeacher}
            onDelete={handleDeleteTeacher}
            onReactivate={handleReactivateTeacher}
          />
        ) : (isLoadingTeacher || (teacherId && !selectedTeacher)) ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Loading teacher data...</p>
            </div>
          </div>
        ) : (
          <TeacherForm
            mode={viewMode}
            initialData={selectedTeacher}
            onEdit={() => setViewMode("edit")}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </PageWrapper>

      <SuccessDialog
        open={showSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        onClose={() => {
          setShowSuccessDialog(false);
          if (successMessage.title.includes("Deleted") || successMessage.title.includes("Reactivated")) {
            setViewMode("list");
            setSelectedTeacher(null);
            setLocation("/teachers");
          } else {
            handleSuccessDialogClose();
          }
        }}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        description={`Are you sure you want to delete ${deleteDialog.teacher?.user?.full_name || 'this teacher'}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, teacher: null })}
        isDeleting={deleteTeacherMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={reactivateDialog.open}
        title="Reactivate Teacher"
        description={`Are you sure you want to reactivate ${reactivateDialog.teacher?.user?.full_name || 'this teacher'}?`}
        confirmLabel="Reactivate"
        onConfirm={confirmReactivate}
        onCancel={() => setReactivateDialog({ open: false, teacher: null })}
        isDeleting={reactivateTeacherMutation.isPending}
        variant="default"
      />
    </DashboardLayout>
  );
}