/**
 * Teachers Management Section Component
 * Handles all teacher-related CRUD operations and routing
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { TeachersList, TeacherForm } from "@/components/teacher";
import { useToast } from "@/hooks/use-toast";
import { deleteTeacher, fetchTeacherDetail } from "@/lib/api/teacher-api";
import type { Teacher } from "@/lib/api/teacher-api";

type ViewMode = "list" | "create" | "view" | "edit";

export function TeachersManagementSection() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Extract teacher ID from URL
  const getTeacherIdFromPath = () => {
    const match = location.match(/\/teachers\/([a-zA-Z0-9-]+)$/);
    return match ? match[1] : null;
  };

  const teacherId = getTeacherIdFromPath();

  // Fetch teacher detail when URL contains a teacher ID
  const { data: teacherDetail } = useQuery({
    queryKey: ["teacher-detail", teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      const teacherData = await fetchTeacherDetail(teacherId);
      return teacherData;
    },
    enabled: !!teacherId,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Update selectedTeacher when teacher detail loads
  useEffect(() => {
    if (teacherId && teacherDetail) {
      setSelectedTeacher(teacherDetail);
    } else if (!teacherId) {
      setViewMode("list");
      setSelectedTeacher(null);
    }
  }, [teacherId, teacherDetail]);

  // Teacher delete mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: (publicId: string) => deleteTeacher(publicId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["teachers"],
        exact: false,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["teachers"],
        exact: false,
      });
      toast({
        title: "Success",
        description: "Teacher has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTeacher = (teacher: Teacher) => {
    deleteTeacherMutation.mutate(teacher.public_id);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode("view");
    setLocation(`/teachers/${teacher.public_id}`);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode("edit");
    setLocation(`/teachers/${teacher.public_id}`);
  };

  return (
    <>
      {viewMode === "list" ? (
        <TeachersList
          onCreateNew={() => {
            setSelectedTeacher(null);
            setViewMode("create");
          }}
          onView={handleViewTeacher}
          onEdit={handleEditTeacher}
          onDelete={handleDeleteTeacher}
        />
      ) : (
        <TeacherForm
          mode={viewMode}
          initialData={selectedTeacher}
          onEdit={() => setViewMode("edit")}
          onSuccess={async () => {
            const message =
              viewMode === "create"
                ? "Teacher has been created successfully"
                : "Teacher has been updated successfully";
            toast({
              title: "Success",
              description: message,
            });

            // Always go back to list after create or update
            setViewMode("list");
            setSelectedTeacher(null);
            setLocation("/teachers");
          }}
          onCancel={() => {
            setViewMode("list");
            setSelectedTeacher(null);
            setLocation("/teachers");
          }}
        />
      )}
    </>
  );
}
