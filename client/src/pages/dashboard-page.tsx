/**
 * Dashboard Page Component
 * Main authenticated dashboard page with role-based content and navigation.
 * Handles URL routing, menu navigation, and renders role-specific dashboards.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { RoleDashboard } from "@/common/components";
import { useUser } from "@/core/contexts";
import { CalendarExceptionManagement } from "@/features/attendance";
import { OrganizationHolidayCalendar } from "@/features/leave";
import { OrganizationPreferences } from "@/features/preferences";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/modules/admin";
import { ParentSidebar } from "@/modules/parent";
import { TeacherSidebar } from "@/modules/teacher";

export default function DashboardPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, organization, logout } = useUser();

  const [activeMenu, setActiveMenu] = useState(() => {
    const path = location.replace("/", "");
    return path === "dashboard" || path === "" ? "overview" : path.split("/")[0];
  });

  // Update activeMenu when location changes
  useEffect(() => {
    const path = location.replace("/", "");
    const menu = path === "dashboard" || path === "" ? "overview" : path.split("/")[0];
    setActiveMenu(menu);
  }, [location]);

  // Handle menu change with URL update
  const handleMenuChange = (menuId: string) => {
    if (menuId === "overview") {
      setLocation("/dashboard");
    } else {
      setLocation(`/${menuId}`);
    }
  };

  useEffect(() => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    if (organization && !organization.is_approved) {
      setLocation("/organization-pending");
    }
  }, [user, organization, setLocation]);

  if (!user || !organization) {
    return null;
  }

  if (!organization.is_approved) {
    return null;
  }

  const _handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    logout();
    setLocation("/auth");
  };

  const _getRoleColor = () => {
    switch (user.role) {
      case "admin":
        return "from-blue-600 via-teal-500 to-green-600";
      case "teacher":
        return "from-purple-600 via-pink-500 to-rose-600";
      case "parent":
        return "from-amber-600 via-orange-500 to-red-600";
      default:
        return "from-blue-600 via-teal-500 to-green-600";
    }
  };

  const getRoleBackground = () => {
    switch (user.role) {
      case "admin":
        return "bg-gradient-to-br from-blue-50 via-green-50 to-blue-50";
      case "teacher":
        return "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50";
      case "parent":
        return "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50";
      default:
        return "bg-gradient-to-br from-blue-50 via-green-50 to-blue-50";
    }
  };

  return (
    <div className={`flex min-h-screen ${getRoleBackground()}`}>
      {/* Sidebar based on role */}
      {user.role === "admin" && (
        <AdminSidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      )}
      {user.role === "teacher" && (
        <TeacherSidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      )}
      {user.role === "parent" && (
        <ParentSidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      )}

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Top Bar */}
        {/* <DashboardTopBar
          organization={organization}
          user={user}
          roleColor={getRoleColor()}
          onLogout={handleLogout}
        /> */}

        {/* Scrollable Content Area */}
        <div className="mt-16 flex-1 pb-8">
          <div className="p-4 md:p-8">
            {activeMenu === "overview" && (
              <RoleDashboard role={user.role} username={user.full_name} />
            )}

            {/* Leave Allocations */}
            {/* {activeMenu === "allocations" && user.role === "admin" && <LeaveAllocationsSection />} */}

            {/* Organization Holiday Calendar */}
            {activeMenu === "organization" && user.role === "admin" && (
              <OrganizationHolidayCalendar />
            )}

            {/* Exceptional Work Policy */}
            {activeMenu === "exceptional-work" && user.role === "admin" && (
              <CalendarExceptionManagement />
            )}

            {/* Organization Preferences */}
            {activeMenu === "preferences" && user.role === "admin" && <OrganizationPreferences />}

            {/* Teachers Management */}
            {/* {activeMenu === "teachers" && user.role === "admin" && <TeachersManagementSection />} */}

            {/* Placeholder for other menu items */}
            {/* {activeMenu !== "overview" &&
              activeMenu !== "allocations" &&
              activeMenu !== "organization" &&
              activeMenu !== "preferences" &&
              activeMenu !== "teachers" && (
                <ComingSoonPlaceholder activeMenu={activeMenu} roleColor={getRoleColor()} />
              )} */}
          </div>
        </div>
      </main>
    </div>
  );
}
