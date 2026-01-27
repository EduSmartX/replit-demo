/**
 * Students Management Page
 * 
 * Complete student management interface following Teacher pattern with URL routing
 */

import { DeleteConfirmationDialog, PageWrapper, SuccessDialog } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { StudentsList } from "@/features/students/components/admin/students-list";
import { StudentForm } from "@/features/students/components/common/student-form";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useReactivateMutation } from "@/hooks/use-reactivate-mutation";
import type { Student, StudentDetail } from "@/lib/api/student-api";
import { deleteStudent, getStudent, reactivateStudent } from "@/lib/api/student-api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type ViewMode = "list" | "create" | "edit" | "view";

export default function StudentsPage() {
  const [location, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [selectedStudentMeta, setSelectedStudentMeta] = useState<{ classId: string } | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; student: Student | null }>({
    open: false,
    student: null,
  });
  const [reactivateDialog, setReactivateDialog] = useState<{ open: boolean; student: Student | null }>({
    open: false,
    student: null,
  });

  // Get student ID and class ID from URL path
  const getStudentInfoFromPath = () => {
    // Skip if creating new student
    if (location.endsWith('/students/new')) {
      return { classId: null, publicId: null };
    }
    // Try format: /classes/:classId/students/:publicId
    const matchWithClass = location.match(/\/classes\/([a-zA-Z0-9-]+)\/students\/([a-zA-Z0-9-]+)$/);
    if (matchWithClass) {
      return { classId: matchWithClass[1], publicId: matchWithClass[2] };
    }
    // Fallback: /students/:publicId (legacy - requires selectedStudentMeta)
    const matchLegacy = location.match(/\/students\/([a-zA-Z0-9-]+)$/);
    if (matchLegacy) {
      return { classId: selectedStudentMeta?.classId || null, publicId: matchLegacy[1] };
    }
    return { classId: null, publicId: null };
  };

  const { classId: urlClassId, publicId: studentId } = getStudentInfoFromPath();

  // Fetch student detail when URL has student ID
  const { data: studentDetail, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["student-detail", urlClassId, studentId],
    queryFn: async () => {
      if (!studentId || !urlClassId) {
        return null;
      }
      const data = await getStudent(urlClassId, studentId);
      return data;
    },
    enabled: !!studentId && !!urlClassId,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Update selected student and view mode based on URL and fetched data
  useEffect(() => {
    // Check for "new" path to enter create mode
    if (location.endsWith("/students/new")) {
      setViewMode("create");
      setSelectedStudent(null);
      setSelectedStudentMeta(null);
      return;
    }
    
    if (studentId && studentDetail) {
      setSelectedStudent(studentDetail);
      if (viewMode !== "edit") {
        setViewMode("view");
      }
    } else if (!studentId) {
      setViewMode("list");
      setSelectedStudent(null);
      setSelectedStudentMeta(null);
    }
  }, [studentId, studentDetail, viewMode, location]);

  const deleteStudentMutation = useDeleteMutation({
    resourceName: "Student",
    deleteFn: (publicId: string) => {
      const student = deleteDialog.student;
      if (!student) {
        throw new Error("Student not found");
      }
      return deleteStudent(student.class_info.public_id, publicId);
    },
    queryKeys: ["students", "student-detail"],
    onSuccessCallback: () => {
      setSuccessMessage({
        title: "Student Deleted!",
        description: "The student has been successfully deleted.",
      });
      setShowSuccessDialog(true);
    },
  });

  const reactivateStudentMutation = useReactivateMutation({
    resourceName: "Student",
    reactivateFn: (publicId: string) => {
      const student = reactivateDialog.student;
      if (!student) {
        throw new Error("Student not found");
      }
      return reactivateStudent(student.class_info.public_id, publicId);
    },
    queryKeys: ["students", "student-detail"],
    onSuccessCallback: () => {
      setSuccessMessage({
        title: "Student Reactivated!",
        description: "The student has been successfully reactivated.",
      });
      setShowSuccessDialog(true);
    },
  });

  const _handleDeleteStudent = (student: Student) => {
    setDeleteDialog({ open: true, student });
  };

  const _handleReactivateStudent = (student: Student) => {
    setReactivateDialog({ open: true, student });
  };

  const confirmDelete = () => {
    if (deleteDialog.student) {
      deleteStudentMutation.mutate(deleteDialog.student.public_id);
      setDeleteDialog({ open: false, student: null });
    }
  };

  const confirmReactivate = () => {
    if (reactivateDialog.student) {
      reactivateStudentMutation.mutate(reactivateDialog.student.public_id);
      setReactivateDialog({ open: false, student: null });
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudentMeta({ classId: student.class_info.public_id });
    setViewMode("view");
    setLocation(`/classes/${student.class_info.public_id}/students/${student.public_id}`);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudentMeta({ classId: student.class_info.public_id });
    setViewMode("edit");
    setLocation(`/classes/${student.class_info.public_id}/students/${student.public_id}`);
  };

  const handleCreateNew = () => {
    setSelectedStudent(null);
    setSelectedStudentMeta(null);
    setViewMode("create");
    setLocation("/students/new");
  };

  const handleSuccess = () => {
    const isCreate = viewMode === "create";
    setSuccessMessage({
      title: isCreate ? "Student Created!" : "Student Updated!",
      description: isCreate
        ? "The student has been successfully added to your organization."
        : "The student information has been updated successfully.",
    });
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    
    if (viewMode === "create") {
      setViewMode("list");
      setSelectedStudent(null);
      setSelectedStudentMeta(null);
      setLocation("/students");
    } else if (viewMode === "edit") {
      // Clear selectedStudent to force refetch of updated data
      setSelectedStudent(null);
      setViewMode("view");
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedStudent(null);
    setSelectedStudentMeta(null);
    setLocation("/students");
  };

  return (
    <DashboardLayout>
      <PageWrapper>
        {viewMode === "list" && (
          <StudentsList
            onCreateNew={handleCreateNew}
            onView={handleViewStudent}
            onEdit={handleEditStudent}
          />
        )}
        
        {viewMode !== "list" && viewMode !== "create" && (isLoadingStudent || (studentId && !studentDetail)) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Loading student data...</p>
            </div>
          </div>
        )}
        
        {viewMode !== "list" && !isLoadingStudent && (viewMode === "create" || studentDetail) && (
          <StudentForm
            mode={viewMode}
            classId={urlClassId || selectedStudentMeta?.classId}
            initialData={studentDetail || selectedStudent}
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
            setSelectedStudent(null);
            setSelectedStudentMeta(null);
            setLocation("/students");
          } else {
            handleSuccessDialogClose();
          }
        }}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        description={`Are you sure you want to delete ${deleteDialog.student?.user_info?.full_name || 'this student'}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, student: null })}
        isDeleting={deleteStudentMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={reactivateDialog.open}
        title="Reactivate Student"
        description={`Are you sure you want to reactivate ${reactivateDialog.student?.user_info?.full_name || 'this student'}?`}
        confirmLabel="Reactivate"
        onConfirm={confirmReactivate}
        onCancel={() => setReactivateDialog({ open: false, student: null })}
        isDeleting={reactivateStudentMutation.isPending}
        variant="default"
      />
    </DashboardLayout>
  );
}
