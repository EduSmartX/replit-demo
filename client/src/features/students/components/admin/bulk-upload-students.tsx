import { useState } from "react";
import { BulkUploadDialog } from "@/common/components/dialogs";
import { bulkUploadStudents, downloadStudentTemplate } from "@/lib/api/student-api";

export function BulkUploadStudents() {
  const [isMinimalFields, setIsMinimalFields] = useState(false);

  const handleDownloadTemplate = async () => {
    return downloadStudentTemplate(isMinimalFields);
  };

  const getTemplateFileName = () => {
    return isMinimalFields
      ? "student_import_template_minimal.xlsx"
      : "student_import_template_full.xlsx";
  };

  return (
    <BulkUploadDialog
      title="Bulk Upload Students"
      description={
        isMinimalFields
          ? "Download the minimal template with only mandatory fields, fill in student details, and upload the file"
          : "Download the template, fill in student details, and upload the file"
      }
      triggerLabel="Bulk Upload"
      triggerVariant="outline"
      downloadTemplate={handleDownloadTemplate}
      uploadFile={bulkUploadStudents}
      invalidateQueryKeys={["students"]}
      templateFileName={getTemplateFileName()}
      acceptedFileTypes=".xlsx,.xls"
      showMinimalFieldsCheckbox={true}
      isMinimalFields={isMinimalFields}
      onMinimalFieldsChange={(checked) => setIsMinimalFields(checked)}
      minimalFieldsLabel="Minimal Fields Only"
    />
  );
}
