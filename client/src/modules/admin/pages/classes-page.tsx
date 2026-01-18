/**
 * Classes Management Page
 * 
 * Administrative interface for managing classes and sections.
 * Supports creating, viewing, editing, and deleting sections.
 * Handles routing for list view and detail views.
 * 
 * @route /classes
 * @route /classes/:id (for viewing/editing specific class)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/common/layouts";
import { ClassesList, MultiRowClassForm, SingleClassForm } from "@/features/classes";
import { useToast } from "@/hooks/use-toast";
import { deleteClass, fetchClass, type MasterClass } from "@/lib/api/class-api";

type ViewMode = "list" | "create" | "view" | "edit";

export default function ClassesPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedClass, setSelectedClass] = useState<MasterClass | null>(null);

  // Extract class ID from URL
  const getClassIdFromPath = () => {
    const match = location.match(/\/classes\/([a-zA-Z0-9]+)$/);
    return match ? match[1] : null;
  };

  const classId = getClassIdFromPath();

  // Fetch class detail when URL contains an ID
  const { data: classDetail } = useQuery({
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

  // Update viewMode and selectedClass when URL changes
  useEffect(() => {
    if (classId && classDetail) {
      setSelectedClass(classDetail);
      setViewMode("view");
    } else if (!classId) {
      setViewMode("list");
      setSelectedClass(null);
    }
  }, [classId, classDetail]);

  // Class delete mutation
  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => deleteClass(publicId),
    onSuccess: async () => {
      // Invalidate all queries starting with "classes"
      await queryClient.invalidateQueries({
        queryKey: ["classes"],
      });
      toast({
        title: "Success",
        description: "Section has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    },
  });

  const handleView = (classData: MasterClass) => {
    setSelectedClass(classData);
    setViewMode("view");
    setLocation(`/classes/${classData.public_id}`);
  };

  const handleEdit = (classData: MasterClass) => {
    setSelectedClass(classData);
    setViewMode("edit");
    setLocation(`/classes/${classData.public_id}`);
  };

  const handleDelete = async (classData: MasterClass) => {
    if (confirm(`Are you sure you want to delete the section "${classData.name}"?`)) {
      deleteMutation.mutate(classData.public_id);
    }
  };

  return (
    <DashboardLayout>
      {viewMode === "list" && (
        <ClassesList
          onCreateNew={() => {
            setSelectedClass(null);
            setViewMode("create");
          }}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {viewMode === "create" && (
        <MultiRowClassForm
          onSuccess={async () => {
            toast({
              title: "Success",
              description: "Section(s) have been created successfully",
            });

            // Invalidate and refetch classes list
            await queryClient.invalidateQueries({
              queryKey: ["classes"],
              exact: false,
            });

            // Go back to list after create
            setViewMode("list");
            setSelectedClass(null);
            setLocation("/classes");
          }}
          onCancel={() => {
            setViewMode("list");
            setSelectedClass(null);
            setLocation("/classes");
          }}
        />
      )}

      {(viewMode === "view" || viewMode === "edit") && (
        <SingleClassForm
          mode={viewMode}
          initialData={selectedClass}
          onEdit={() => setViewMode("edit")}
          onSuccess={async () => {
            toast({
              title: "Success",
              description: "Section has been updated successfully",
            });

            // Invalidate and refetch
            if (selectedClass) {
              await queryClient.invalidateQueries({
                queryKey: ["class-detail", selectedClass.public_id],
              });
              await queryClient.invalidateQueries({
                queryKey: ["classes"],
                exact: false,
              });
            }

            // Go back to view mode after edit
            if (viewMode === "edit") {
              setViewMode("view");
            }
          }}
          onCancel={() => {
            if (viewMode === "edit") {
              setViewMode("view");
            } else {
              setViewMode("list");
              setSelectedClass(null);
              setLocation("/classes");
            }
          }}
        />
      )}
    </DashboardLayout>
  );
}
