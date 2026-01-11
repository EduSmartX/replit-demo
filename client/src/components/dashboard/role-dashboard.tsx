import { DashboardContent as AdminDashboard } from "./dashboard-content";
import { ParentDashboardContent } from "./parent-dashboard";
import { TeacherDashboardContent } from "./teacher-dashboard";
import { UserRole } from "@/context/user-context";

interface RoleDashboardProps {
  role: UserRole;
  username: string;
}

export function RoleDashboard({ role, username }: RoleDashboardProps) {
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboardContent username={username} />;
    case "parent":
      return <ParentDashboardContent username={username} />;
    default:
      return <AdminDashboard />;
  }
}
