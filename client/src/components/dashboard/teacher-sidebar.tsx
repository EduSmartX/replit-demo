import {
  Menu,
  X,
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const teacherMenuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, section: "main" },
  { divider: true, label: "Classes" },
  { id: "my-classes", label: "My Classes", icon: GraduationCap, section: "teacher" },
  { id: "students", label: "Students", icon: Users, section: "teacher" },
  { id: "subjects", label: "Subjects", icon: BookOpen, section: "teacher" },
  { divider: true, label: "Operations" },
  { id: "attendance", label: "Mark Attendance", icon: CheckCircle2, section: "teacher" },
  { id: "assignments", label: "Assignments", icon: FileText, section: "teacher" },
  { id: "schedule", label: "Class Schedule", icon: Calendar, section: "teacher" },
];

interface TeacherSidebarProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export function TeacherSidebar({ activeMenu, onMenuChange }: TeacherSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

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

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-purple-200 bg-gradient-to-b from-purple-50 to-pink-50 transition-transform duration-300 md:z-0 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar-teacher"
      >
        <div className="border-b border-purple-200 bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Teacher Portal</h1>
              <p className="text-xs text-purple-100">Manage Classes</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {teacherMenuItems.map((item, index) => {
            if ("divider" in item && item.divider) {
              return (
                <div key={index} className="mt-2 py-4">
                  <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-purple-700 uppercase">
                    {item.label}
                  </p>
                </div>
              );
            }

            const menuItem = item as (typeof teacherMenuItems)[number] & {
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
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "text-purple-900 hover:bg-purple-100"
                )}
                data-testid={`menu-${menuItem.id}`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{menuItem.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-purple-200 bg-gradient-to-r from-pink-50 to-purple-50 p-4">
          <div className="space-y-1 text-sm">
            <p className="text-xs font-semibold text-purple-600">Logged in as</p>
            <p className="font-semibold text-purple-900" data-testid="sidebar-username">
              Sarah Johnson
            </p>
            <p className="text-xs text-pink-700">Mathematics Teacher</p>
          </div>
        </div>
      </aside>
    </>
  );
}
