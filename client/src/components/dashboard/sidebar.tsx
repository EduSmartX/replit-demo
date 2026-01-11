import {
  Menu,
  X,
  BarChart3,
  Settings,
  Users,
  BookOpen,
  Calendar,
  FileText,
  CheckCircle2,
  Building2,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
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
}

export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-blue-200 bg-gradient-to-b from-blue-50 to-green-50 transition-transform duration-300 md:z-0 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar-admin"
      >
        {/* Header */}
        <div className="border-b border-blue-200 bg-gradient-to-r from-blue-600 to-teal-600 p-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg">
              <span className="text-lg font-bold text-blue-600">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">School App</h1>
              <p className="text-xs text-blue-100">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item, index) => {
            if ("divider" in item && item.divider) {
              return (
                <div key={index} className="mt-2 py-4">
                  <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-blue-700 uppercase">
                    {item.label}
                  </p>
                </div>
              );
            }

            const menuItem = item as (typeof menuItems)[number] & {
              id: string;
              icon: typeof BarChart3;
            };
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
                  "flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md"
                    : "text-blue-900 hover:bg-blue-100"
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
        <div className="space-y-2 border-t border-blue-200 bg-gradient-to-r from-green-50 to-blue-50 p-4">
          <div className="space-y-1 text-sm">
            <p className="text-xs font-semibold text-blue-600">Logged in as</p>
            <p className="font-semibold text-blue-900" data-testid="sidebar-username">
              John Doe
            </p>
            <p className="text-xs text-green-700">Principal</p>
          </div>
        </div>
      </aside>
    </>
  );
}
