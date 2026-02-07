/**
 * Leave Request Reviews Page
 * Page wrapper for leave request review component
 */

import { PageWrapper } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { LeaveRequestReview } from "@/features/leave/components/admin/leave-request-review";

export default function LeaveRequestReviewsPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <LeaveRequestReview />
      </PageWrapper>
    </DashboardLayout>
  );
}
