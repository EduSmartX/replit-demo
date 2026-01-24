/**
 * Students Management Page
 * 
 * Complete student management interface following Teacher pattern
 */

import { useState } from "react";
import { PageWrapper } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { StudentsList } from "@/features/students/components/admin/students-list";
import { StudentForm } from "@/features/students/components/common/student-form";
import type { Student, StudentDetail } from "@/lib/api/student-api";

type ViewMode = "list" | "create" | "edit" | "view";

export default function StudentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);

  const handleCreateNew = () => {
    setSelectedStudent(null);
    setViewMode("create");
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student as StudentDetail);
    setViewMode("view");
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student as StudentDetail);
    setViewMode("edit");
  };

  const handleSuccess = () => {
    setViewMode("list");
    setSelectedStudent(null);
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedStudent(null);
  };

  return (
    <DashboardLayout>
      <PageWrapper>
        {viewMode === "list" ? (
          <StudentsList onCreateNew={handleCreateNew} onView={handleView} onEdit={handleEdit} />
        ) : (
          <StudentForm
            mode={viewMode}
            initialData={selectedStudent}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </PageWrapper>
    </DashboardLayout>
  );
}
