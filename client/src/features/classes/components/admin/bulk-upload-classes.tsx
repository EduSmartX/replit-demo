/**
 * Bulk Upload Classes Component
 * Uses the generic BulkUploadDialog with class-specific configuration
 */

import { useState } from "react";
import { BulkUploadDialog } from "@/common/components/dialogs";
import { bulkUploadClasses, downloadClassTemplate } from "@/lib/api/class-api";

export function BulkUploadClasses() {
  const [isMinimalFields, setIsMinimalFields] = useState(false);

  const handleDownloadTemplate = async () => {
    return downloadClassTemplate(isMinimalFields);
  };

  const getTemplateFileName = () => {
    return isMinimalFields
      ? "class_import_template_minimal.xlsx"
      : "class_import_template_full.xlsx";
  };

  return (
    <BulkUploadDialog
      title="Bulk Upload Classes/Sections"
      description={
        isMinimalFields
          ? "Download the minimal template with only mandatory fields, fill in class/section details, and upload the file"
          : "Download the template, fill in class/section details, and upload the file"
      }
      triggerLabel="Bulk Upload"
      triggerVariant="outline"
      downloadTemplate={handleDownloadTemplate}
      uploadFile={bulkUploadClasses}
      invalidateQueryKeys={["classes"]}
      templateFileName={getTemplateFileName()}
      acceptedFileTypes=".xlsx,.xls"
      showMinimalFieldsCheckbox={true}
      isMinimalFields={isMinimalFields}
      onMinimalFieldsChange={(checked) => setIsMinimalFields(checked)}
      minimalFieldsLabel="Minimal Fields Only"
    />
  );
}
