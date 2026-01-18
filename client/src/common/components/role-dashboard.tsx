/**
 * Role Dashboard Router Component
 * Dynamically renders the appropriate dashboard component based on user role.
 * Acts as a routing switch between AdminDashboard, TeacherDashboard, and ParentDashboard.
 */

import { AdminDashboard } from "@/modules/admin";
import { ParentDashboard } from "@/modules/parent";
import { TeacherDashboard } from "@/modules/teacher";
import { UserRole } from "@/core/contexts";

interface RoleDashboardProps {
  role: UserRole;
  username: string;
}

export function RoleDashboard({ role, username }: RoleDashboardProps) {
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard username={username} />;
    case "parent":
      return <ParentDashboard username={username} />;
    default:
      return <AdminDashboard />;
  }
}
