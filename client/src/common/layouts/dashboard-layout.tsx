/**
 * Dashboard Layout Component
 * Provides the common layout structure (sidebar + topbar) for all dashboard pages
 */

import { Building2, LogOut, Settings, User as UserIcon, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/core/contexts";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/modules/admin";
import { ParentSidebar } from "@/modules/parent";
import { TeacherSidebar } from "@/modules/teacher";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, organization, logout } = useUser();
  const scrollPositionRef = useRef<number>(0);
  const shouldRestoreScroll = useRef<boolean>(false);

  // Get active menu from URL path
  const getActiveMenuFromPath = () => {
    const path = location.replace("/", "");

    // Handle settings routes
    if (path.startsWith("settings/profile")) {
      return "profile-settings";
    }

    // Handle student detail pages: /classes/:classId/students/:studentId
    if (path.includes("/students/") || path === "students") {
      return "students";
    }

    // Handle teacher detail pages: /teachers/:id
    if (path.startsWith("teachers")) {
      return "teachers";
    }

    // Handle other detail pages - extract first segment
    return path === "dashboard" || path === "" ? "overview" : path.split("/")[0];
  };

  const activeMenu = getActiveMenuFromPath();

  // Restore scroll position after navigation
  useEffect(() => {
    if (shouldRestoreScroll.current) {
      // Use multiple timeouts to ensure DOM is fully rendered and content is loaded
      const timer1 = setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "instant" as ScrollBehavior,
        });
      }, 0);

      const timer2 = setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "instant" as ScrollBehavior,
        });
        shouldRestoreScroll.current = false;
      }, 100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [location]);

  const handleMenuChange = (menuId: string) => {
    // Store current scroll position
    scrollPositionRef.current = window.scrollY;
    shouldRestoreScroll.current = true;

    if (menuId === "overview") {
      setLocation("/dashboard");
    } else if (menuId === "profile-settings") {
      setLocation("/settings/profile");
    } else {
      setLocation(`/${menuId}`);
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    logout();
    setLocation("/auth");
  };

  const getRoleColor = () => {
    switch (user?.role) {
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
    switch (user?.role) {
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

  if (!user || !organization) {
    return null;
  }

  return (
    <div className={`flex min-h-screen ${getRoleBackground()}`}>
      {/* Top Bar - Fixed - Full Width */}
      <div
        className={`fixed top-0 right-0 left-0 h-16 bg-gradient-to-r ${getRoleColor()} z-50 flex items-center justify-between px-4 shadow-lg md:px-8`}
      >
        <div className="flex items-center space-x-3">
          <Building2 className="h-5 w-5 text-white/80" />
          <div>
            <p className="text-lg leading-tight font-bold text-white">{organization.name}</p>
            <p className="text-xs text-white/70">
              {organization.board_affiliation.toUpperCase()} • {organization.organization_type}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user.full_name}</p>
            <p className="text-xs text-white/70 capitalize">{user.role}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 rounded-full text-white hover:bg-white/20"
                title="User Menu"
              >
                <UserIcon className="h-5 w-5" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/settings/profile")}>
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="button-logout-top">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
      <main className="flex flex-1 flex-col overflow-x-hidden">
        {/* Scrollable Content Area */}
        <div className="mt-16 min-h-screen flex-1 px-4 pb-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
