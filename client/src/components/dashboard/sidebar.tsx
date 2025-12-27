import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut, Menu, X, BarChart3, Settings, Users, BookOpen, Calendar, FileText, CheckCircle2, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, section: "main" },
  { divider: true, label: "Administration" },
  { id: "organization", label: "Organization Leaves", icon: Calendar, section: "admin" },
  { id: "allocations", label: "Leave Allocations", icon: FileText, section: "admin" },
  { id: "preferences", label: "Organization Preferences", icon: Settings, section: "admin" },
  { divider: true, label: "Management" },
  { id: "teachers", label: "Teachers", icon: Users, section: "admin" },
  { id: "classes", label: "Classes", icon: Building2, section: "admin" },
  { id: "subjects", label: "Subjects", icon: BookOpen, section: "admin" },
  { id: "students", label: "Students", icon: Users, section: "admin" },
  { divider: true, label: "Operations" },
  { id: "attendance", label: "Attendance", icon: CheckCircle2, section: "admin" },
  { id: "requests", label: "Leave Requests", icon: Briefcase, section: "admin" },
];

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeMenu, onMenuChange, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    onLogout();
    setLocation("/auth");
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 md:hidden z-40"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 z-40 md:z-0 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar-admin"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">School App</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item, index) => {
            if ("divider" in item && item.divider) {
              return (
                <div key={index} className="py-4 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                    {item.label}
                  </p>
                </div>
              );
            }

            const menuItem = item as typeof menuItems[number] & { id: string; icon: typeof LogOut };
            const Icon = menuItem.icon;
            const isActive = activeMenu === menuItem.id;

            return (
              <button
                key={menuItem.id}
                onClick={() => {
                  onMenuChange(menuItem.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
                data-testid={`menu-${menuItem.id}`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{menuItem.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="text-sm space-y-1">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="font-semibold text-foreground" data-testid="sidebar-username">John Doe</p>
            <p className="text-xs text-muted-foreground">Principal</p>
          </div>
          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
