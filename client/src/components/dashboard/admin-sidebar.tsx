import { useState } from "react";
import { Menu, X, BarChart3, Settings, Users, BookOpen, Calendar, FileText, CheckCircle2, Building2, Briefcase, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminMenuItems = [
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

interface AdminSidebarProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export function AdminSidebar({ activeMenu, onMenuChange }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 md:hidden z-40"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-50 to-green-50 border-r border-blue-200 flex flex-col transition-transform duration-300 z-40 md:z-0 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar-admin"
      >
        <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-teal-600">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">School Admin</h1>
              <p className="text-xs text-blue-100">Full Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {adminMenuItems.map((item, index) => {
            if ("divider" in item && item.divider) {
              return (
                <div key={index} className="py-4 mt-2">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider px-3 mb-3">
                    {item.label}
                  </p>
                </div>
              );
            }

            const menuItem = item as typeof adminMenuItems[number] & { id: string; icon: typeof BarChart3 };
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

        <div className="p-4 border-t border-blue-200 bg-gradient-to-r from-green-50 to-blue-50 space-y-2">
          <div className="text-sm space-y-1">
            <p className="text-xs text-blue-600 font-semibold">Logged in as</p>
            <p className="font-semibold text-blue-900" data-testid="sidebar-username">John Doe</p>
            <p className="text-xs text-green-700">School Admin</p>
          </div>
        </div>
      </aside>
    </>
  );
}
