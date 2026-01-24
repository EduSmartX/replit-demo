/**
 * Admin Sidebar Navigation Component
 * Role-specific sidebar for administrators with menu items organized by sections:
 * - Main: Overview dashboard
 * - Administration: Organization settings, leave policies, preferences
 * - Management: Teachers, classes, subjects, students
 * - Operations: Attendance, leave requests
 */

import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  Menu,
  Settings,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResizableSidebar } from "./resizable-sidebar";

const adminMenuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, section: "main" },
  { divider: true, label: "Administration" },
  { id: "organization", label: "Organization Leaves", icon: Calendar, section: "admin" },
  { id: "allocations", label: "Leave Allocations", icon: FileText, section: "admin" },
  { id: "preferences", label: "Organization Preferences", icon: Settings, section: "admin" },
  { divider: true, label: "Management" },
  { id: "teachers", label: "Teachers", icon: Users, section: "admin" },
  { id: "classes", label: "Classes & Sections", icon: GraduationCap, section: "admin" },
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
        className="fixed top-4 left-4 z-[60] md:hidden text-white hover:bg-white/20"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      <ResizableSidebar
        isOpen={isOpen}
        className="border-blue-200 bg-gradient-to-b from-blue-50 to-green-50"
        minWidth={280}
        maxWidth={350}
        defaultWidth={330}
      >
        {(width) => (
          <>
            <div className="border-b border-blue-200 bg-gradient-to-r from-blue-600 to-teal-600 p-6">
              <div className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg flex-shrink-0">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                {width > 250 && (
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-white truncate">School Admin</h1>
                    <p className="text-xs text-blue-100 truncate">Full Control</p>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4" data-testid="sidebar-admin">
              {adminMenuItems.map((item, index) => {
                if ("divider" in item && item.divider) {
                  return (
                    <div key={index} className="mt-2 py-4">
                      {width > 250 && (
                        <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-blue-700 uppercase truncate">
                          {item.label}
                        </p>
                      )}
                    </div>
                  );
                }

                const menuItem = item as (typeof adminMenuItems)[number] & {
                  id: string;
                  icon: typeof BarChart3;
                };
                const Icon = menuItem.icon;
                const isActive = activeMenu === menuItem.id;

                return (
                  <button
                    key={menuItem.id}
                    onClick={(e) => {
                      e.preventDefault();
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
                    title={menuItem.label}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {width > 250 && <span className="truncate">{menuItem.label}</span>}
                  </button>
                );
              })}
            </nav>

            <div className="space-y-2 border-t border-blue-200 bg-gradient-to-r from-green-50 to-blue-50 p-4">
              {width > 250 ? (
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-semibold text-blue-600 truncate">Logged in as</p>
                  <p className="font-semibold text-blue-900 truncate" data-testid="sidebar-username">
                    John Doe
                  </p>
                  <p className="text-xs text-green-700 truncate">School Admin</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    JD
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </ResizableSidebar>
    </>
  );
}
