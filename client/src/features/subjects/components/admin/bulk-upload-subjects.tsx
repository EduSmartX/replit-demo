/**
 * Bulk Upload Subjects Component
 * Uses the generic BulkUploadDialog with subject-specific configuration
 */

import { BulkUploadDialog } from "@/common/components/dialogs";
import { bulkUploadSubjects, downloadSubjectTemplate } from "@/lib/api/subject-api";

export function BulkUploadSubjects() {
  const handleDownloadTemplate = async () => {
    return downloadSubjectTemplate();
  };

  return (
    <BulkUploadDialog
      title="Bulk Upload Subjects"
      description="Download the template, fill in subject details, and upload the file"
      triggerLabel="Bulk Upload"
      triggerVariant="outline"
      downloadTemplate={handleDownloadTemplate}
      uploadFile={bulkUploadSubjects}
      invalidateQueryKeys={["subjects"]}
      templateFileName="subject_import_template.xlsx"
      acceptedFileTypes=".xlsx,.xls"
    />
  );
}
