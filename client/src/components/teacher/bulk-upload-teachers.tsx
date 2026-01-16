/**
 * Bulk Upload Teachers Component
 * Uses the generic BulkUploadDialog with teacher-specific configuration
 */

import { useState } from "react";
import { BulkUploadDialog } from "@/components/common/bulk-upload-dialog";
import { downloadTeacherTemplate, bulkUploadTeachers } from "@/lib/api/teacher-api";

export function BulkUploadTeachers() {
  const [isMinimalFields, setIsMinimalFields] = useState(false);

  const handleDownloadTemplate = async () => {
    return downloadTeacherTemplate(isMinimalFields);
  };

  const getTemplateFileName = () => {
    return isMinimalFields
      ? "teacher_import_template_minimal.xlsx"
      : "teacher_import_template_full.xlsx";
  };

  return (
    <BulkUploadDialog
      title="Bulk Upload Teachers"
      description={
        isMinimalFields
          ? "Download the minimal template with only mandatory fields, fill in teacher details, and upload the file"
          : "Download the template, fill in teacher details, and upload the file"
      }
      triggerLabel="Bulk Upload"
      triggerVariant="outline"
      downloadTemplate={handleDownloadTemplate}
      uploadFile={bulkUploadTeachers}
      invalidateQueryKeys={["teachers"]}
      templateFileName={getTemplateFileName()}
      acceptedFileTypes=".xlsx,.xls"
      showMinimalFieldsCheckbox={true}
      isMinimalFields={isMinimalFields}
      onMinimalFieldsChange={(checked) => setIsMinimalFields(checked)}
      minimalFieldsLabel="Minimal Fields Only"
    />
  );
}
