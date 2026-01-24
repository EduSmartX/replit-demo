/**
 * Organization Holiday Calendar Page
 * 
 * Displays and manages organization-wide holiday calendar.
 * Allows admins to add, edit, and remove holidays that apply to all users.
 * 
 * @route /organization
 */

import { PageWrapper } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { OrganizationHolidayCalendar } from "@/features/leave";

export default function OrganizationPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <OrganizationHolidayCalendar />
      </PageWrapper>
    </DashboardLayout>
  );
}
