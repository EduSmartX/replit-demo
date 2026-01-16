/**
 * Dashboard Top Bar Component
 * Displays organization info and user profile with logout
 */

import { LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Organization {
  name: string;
  board_affiliation: string;
  organization_type: string;
}

interface User {
  full_name: string;
  role: string;
}

interface DashboardTopBarProps {
  organization: Organization;
  user: User;
  roleColor: string;
  onLogout: () => void;
}

export function DashboardTopBar({ organization, user, roleColor, onLogout }: DashboardTopBarProps) {
  return (
    <div
      className={`fixed top-0 right-0 left-0 h-16 bg-gradient-to-r md:left-0 ${roleColor} z-50 flex items-center justify-between px-4 shadow-lg md:px-8`}
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="rounded-full text-white hover:bg-white/20"
          data-testid="button-logout-top"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
