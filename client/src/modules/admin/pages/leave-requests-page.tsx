/**
 * Admin Leave Requests Page
 * Shows admin's personal leave dashboard with balances and requests
 * Uses reusable LeaveDashboard component
 */

import { PageWrapper } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { LeaveDashboard } from "@/features/leave";

export default function LeaveRequestsPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <LeaveDashboard />
      </PageWrapper>
    </DashboardLayout>
  );
}
