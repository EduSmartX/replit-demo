/**
 * Teachers Management Page
 * 
 * Complete teacher management interface for administrators.
 * Supports CRUD operations, filtering, bulk uploads, and detailed teacher views.
 * Manages view states and coordinates between list and form components.
 * 
 * @route /teachers
 * @route /teachers/:id (for viewing/editing specific teacher)
 */

import { DashboardLayout } from "@/common/layouts";
import { TeacherForm, TeachersList } from "@/features/teachers";
import { useToast } from "@/hooks/use-toast";
import type { Teacher } from "@/lib/api/teacher-api";
import { deleteTeacher, fetchTeacherDetail, reactivateTeacher } from "@/lib/api/teacher-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type ViewMode = "list" | "create" | "view" | "edit";

export default function TeachersPage() {
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

  // Update viewMode and selectedTeacher when URL changes
  useEffect(() => {
    if (teacherId && teacherDetail) {
      setSelectedTeacher(teacherDetail);
      setViewMode("view");
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

  // Teacher reactivate mutation
  const reactivateTeacherMutation = useMutation({
    mutationFn: (publicId: string) => reactivateTeacher(publicId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["teachers"],
      });
      toast({
        title: "Success",
        description: "Teacher has been reactivated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reactivate teacher",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTeacher = async (publicId: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      deleteTeacherMutation.mutate(publicId);
    }
  };

  const handleReactivateTeacher = async (publicId: string) => {
    if (confirm("Are you sure you want to reactivate this teacher?")) {
      reactivateTeacherMutation.mutate(publicId);
    }
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
    <DashboardLayout>
      {viewMode === "list" ? (
        <TeachersList
          onCreateNew={() => {
            setSelectedTeacher(null);
            setViewMode("create");
          }}
          onView={handleViewTeacher}
          onEdit={handleEditTeacher}
          onDelete={handleDeleteTeacher}
          onReactivate={handleReactivateTeacher}
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

            // Go back to list after create or update
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
    </DashboardLayout>
  );
}
