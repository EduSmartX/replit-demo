/**
 * Dashboard Overview Page
 * Shows the role-based dashboard
 */

import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { useUser } from "@/context/user-context";
import { DashboardLayout } from "@/layouts/dashboard-layout";

export default function OverviewPage() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <DashboardLayout>
      <RoleDashboard role={user.role} username={user.full_name} />
    </DashboardLayout>
  );
}
