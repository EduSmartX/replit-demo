/**
 * Bulk Upload Holidays Component
 * Uses the generic BulkUploadDialog with holiday-specific configuration
 */

import { downloadHolidayTemplate, bulkUploadHolidays } from "@/lib/api/holiday-api";
import { BulkUploadDialog } from "@/common/components/dialogs";

export function BulkUploadHolidays() {
  return (
    <BulkUploadDialog
      title="Bulk Upload Holidays"
      description="Download the template, fill in holiday details, and upload the file"
      triggerLabel="Bulk Upload"
      triggerVariant="outline"
      downloadTemplate={downloadHolidayTemplate}
      uploadFile={bulkUploadHolidays}
      invalidateQueryKeys={["holiday-calendar"]}
      templateFileName="holiday_upload_template.xlsx"
      acceptedFileTypes=".xlsx,.xls"
    />
  );
}
