/**
 * Subjects Management Page
 * 
 * Administrative interface for managing subject assignments to classes.
 * Displays subjects grouped by class, supports filtering, and provides
 * CRUD operations for subject-teacher-class assignments.
 * 
 * @route /subjects
 * @route /subjects/:id
 */

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PageWrapper, SuccessDialog } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { SubjectsList } from "@/features/subjects";
import { SingleSubjectForm } from "@/features/subjects/components/admin/single-subject-form";
import { getSubject, type Subject } from "@/lib/api/subject-api";

type ViewMode = "list" | "create" | "edit";

export default function SubjectsPage() {
  const [location, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });

  const getSubjectIdFromPath = () => {
    // Skip if creating new subject
    if (location.endsWith('/subjects/new')) {
      return null;
    }
    const match = location.match(/\/subjects\/([a-zA-Z0-9]+)$/);
    return match ? match[1] : null;
  };

  const subjectId = getSubjectIdFromPath();

  const { data: subjectDetail, isLoading: isLoadingSubject } = useQuery({
    queryKey: ["subject-detail", subjectId],
    queryFn: async () => {
      if (!subjectId) {
        return null;
      }
      return getSubject(subjectId);
    },
    enabled: !!subjectId,
  });

  useEffect(() => {
    // Check for "new" path to enter create mode
    if (location.endsWith("/subjects/new")) {
      setViewMode("create");
      return;
    }
    
    if (subjectId && subjectDetail) {
      setViewMode("edit");
    } else if (!subjectId) {
      setViewMode("list");
    }
  }, [location, subjectId, subjectDetail]);

  const handleCreateNew = () => {
    setViewMode("create");
    setLocation("/subjects/new");
  };

  const handleEdit = (subject: Subject) => {
    setLocation(`/subjects/${subject.public_id}`);
  };

  const handleSuccess = (isCreate: boolean = false) => {
    setSuccessMessage({
      title: isCreate ? "Subject Assigned!" : "Subject Updated!",
      description: isCreate
        ? "The subject has been successfully assigned to the class."
        : "The subject assignment has been successfully updated.",
    });
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    
    if (viewMode === "create") {
      setViewMode("list");
      setLocation("/subjects");
    } else if (viewMode === "edit") {
      setViewMode("list");
      setLocation("/subjects");
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setLocation("/subjects");
  };

  if (viewMode === "create") {
    return (
      <DashboardLayout>
        <PageWrapper>
          <SingleSubjectForm onSuccess={() => handleSuccess(true)} onCancel={handleCancel} />
        </PageWrapper>

        <SuccessDialog
          open={showSuccessDialog}
          title={successMessage.title}
          description={successMessage.description}
          onClose={handleSuccessDialogClose}
        />
      </DashboardLayout>
    );
  }

  if (viewMode === "edit") {
    if (isLoadingSubject) {
      return (
        <DashboardLayout>
          <PageWrapper>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </PageWrapper>

          <SuccessDialog
            open={showSuccessDialog}
            title={successMessage.title}
            description={successMessage.description}
            onClose={handleSuccessDialogClose}
          />
        </DashboardLayout>
      );
    }

    if (!subjectDetail) {
      return (
        <DashboardLayout>
          <PageWrapper>
            <div className="text-center py-12">
              <p className="text-gray-500">Subject not found</p>
            </div>
          </PageWrapper>

          <SuccessDialog
            open={showSuccessDialog}
            title={successMessage.title}
            description={successMessage.description}
            onClose={handleSuccessDialogClose}
          />
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <PageWrapper>
          <SingleSubjectForm 
            subject={subjectDetail} 
            onSuccess={() => handleSuccess(false)} 
            onCancel={handleCancel} 
          />
        </PageWrapper>

        <SuccessDialog
          open={showSuccessDialog}
          title={successMessage.title}
          description={successMessage.description}
          onClose={handleSuccessDialogClose}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageWrapper>
        <SubjectsList onCreateNew={handleCreateNew} onEdit={handleEdit} />
      </PageWrapper>

      <SuccessDialog
        open={showSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        onClose={handleSuccessDialogClose}
      />
    </DashboardLayout>
  );
}
