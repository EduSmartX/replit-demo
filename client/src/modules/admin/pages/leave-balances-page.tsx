import { PageWrapper } from "@/common/components/layout/page-wrapper";
import { DashboardLayout } from "@/common/layouts/dashboard-layout";
import { LeaveBalanceManagement } from "@/features/leave/components/common/leave-balance-management";

export function LeaveBalancesPage() {
  return (
    <DashboardLayout>
      <PageWrapper
        title="Leave Balances"
        description="Manage employee leave balances and allocations"
      >
        <LeaveBalanceManagement />
      </PageWrapper>
    </DashboardLayout>
  );
}
