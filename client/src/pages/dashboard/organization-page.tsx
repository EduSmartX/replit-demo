/**
 * Organization Holiday Calendar Page
 */

import { OrganizationHolidayCalendar } from "@/components/leave";
import { DashboardLayout } from "@/layouts/dashboard-layout";

export default function OrganizationPage() {
  return (
    <DashboardLayout>
      <OrganizationHolidayCalendar />
    </DashboardLayout>
  );
}
