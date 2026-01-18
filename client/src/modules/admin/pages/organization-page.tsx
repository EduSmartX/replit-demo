/**
 * Organization Holiday Calendar Page
 * 
 * Displays and manages organization-wide holiday calendar.
 * Allows admins to add, edit, and remove holidays that apply to all users.
 * 
 * @route /organization
 */

import { OrganizationHolidayCalendar } from "@/features/leave";
import { DashboardLayout } from "@/common/layouts";

export default function OrganizationPage() {
  return (
    <DashboardLayout>
      <OrganizationHolidayCalendar />
    </DashboardLayout>
  );
}
