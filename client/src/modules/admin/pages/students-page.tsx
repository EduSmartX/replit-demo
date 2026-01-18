/**
 * Students Management Page
 * 
 * Complete student management interface for administrators.
 * Supports CRUD operations, filtering, and detailed student views.
 * Manages view states and coordinates between list and form components.
 * 
 * @route /students
 * @route /students/:id (for viewing/editing specific student)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { StudentsList } from "@/features/students/components/admin/students-list";
import { StudentForm } from "@/features/students";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/common/layouts";
import { deleteStudent, fetchStudentById } from "@/lib/api/student-api";
import type { Student } from "@/lib/api/student-api";

type ViewMode = "list" | "create" | "view" | "edit";

export default function StudentsPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // View state management: Controls whether showing list, create form, view mode, or edit form
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Extract student ID from URL to support direct navigation to /students/:id
  const getStudentIdFromPath = () => {
    const match = location.match(/\/students\/([a-zA-Z0-9-]+)$/);
    return match ? match[1] : null;
  };

  const studentId = getStudentIdFromPath();

  // Conditional fetch: Only query student detail when URL contains a student ID
  const { data: studentDetail } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const studentData = await fetchStudentById(studentId);
      return studentData;
    },
    enabled: !!studentId,
    staleTime: 0,
    refetchOnMount: true,
  });

  // URL-driven view sync: Update local state when URL changes (supports browser back/forward)
  useEffect(() => {
    if (studentId && studentDetail) {
      setSelectedStudent(studentDetail);
      setViewMode("view");
    } else if (!studentId) {
      setViewMode("list");
      setSelectedStudent(null);
    }
  }, [studentId, studentDetail]);

  // Student delete mutation
  const deleteStudentMutation = useMutation({
    mutationFn: (publicId: string) => deleteStudent(publicId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["students"],
        exact: false,
        refetchType: "active",
      });
      await queryClient.refetchQueries({ queryKey: ["students"], exact: false });
      toast({
        title: "Success",
        description: "Student has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  const handleDeleteStudent = async (publicId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(publicId);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setViewMode("view");
    setLocation(`/students/${student.public_id}`);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setViewMode("edit");
    setLocation(`/students/${student.public_id}`);
  };

  return (
    <DashboardLayout>
      {viewMode === "list" ? (
        <StudentsList
          onCreateNew={(classId) => {
            setSelectedStudent(null);
            setSelectedClassId(classId);
            setViewMode("create");
          }}
          onView={handleViewStudent}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
        />
      ) : (
        <StudentForm
          mode={viewMode}
          classId={viewMode === "create" ? selectedClassId : selectedStudent?.class_assigned?.public_id}
          initialData={selectedStudent}
          onEdit={() => setViewMode("edit")}
          onSuccess={async () => {
            const message =
              viewMode === "create"
                ? "Student has been created successfully"
                : "Student has been updated successfully";
            toast({
              title: "Success",
              description: message,
            });

            // Go back to list after create or update
            setViewMode("list");
            setSelectedStudent(null);
            setLocation("/students");
          }}
          onCancel={() => {
            setViewMode("list");
            setSelectedStudent(null);
            setLocation("/students");
          }}
        />
      )}
    </DashboardLayout>
  );
}
