/**
 * Manage Leave Balances Page
 * Page for managing leave balances for team members
 */

import { PageWrapper } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { ManageLeaveBalances } from "@/features/leave/components/admin/manage-leave-balances";

export default function ManageLeaveBalancesPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <ManageLeaveBalances />
      </PageWrapper>
    </DashboardLayout>
  );
}
