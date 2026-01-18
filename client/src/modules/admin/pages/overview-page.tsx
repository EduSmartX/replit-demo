/**
 * Dashboard Overview Page
 * 
 * Main landing page displaying role-specific dashboards.
 * Routes users to admin, teacher, or parent dashboard based on their role.
 * 
 * @route /dashboard
 */

import { RoleDashboard } from "@/common/components";
import { useUser } from "@/core/contexts";
import { DashboardLayout } from "@/common/layouts";

export default function OverviewPage() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <DashboardLayout>
      <RoleDashboard role={user.role} username={user.full_name} />
    </DashboardLayout>
  );
}
