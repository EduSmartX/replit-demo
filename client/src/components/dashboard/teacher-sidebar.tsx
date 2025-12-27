import { useState } from "react";
import { Menu, X, BarChart3, Users, BookOpen, Calendar, CheckCircle2, FileText, GraduationCap } from "lucide-react";
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
          "fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-purple-50 to-pink-50 border-r border-purple-200 flex flex-col transition-transform duration-300 z-40 md:z-0 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar-teacher"
      >
        <div className="p-6 border-b border-purple-200 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Teacher Portal</h1>
              <p className="text-xs text-purple-100">Manage Classes</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {teacherMenuItems.map((item, index) => {
            if ("divider" in item && item.divider) {
              return (
                <div key={index} className="py-4 mt-2">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider px-3 mb-3">
                    {item.label}
                  </p>
                </div>
              );
            }

            const menuItem = item as typeof teacherMenuItems[number] & { id: string; icon: typeof BarChart3 };
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

        <div className="p-4 border-t border-purple-200 bg-gradient-to-r from-pink-50 to-purple-50 space-y-2">
          <div className="text-sm space-y-1">
            <p className="text-xs text-purple-600 font-semibold">Logged in as</p>
            <p className="font-semibold text-purple-900" data-testid="sidebar-username">Sarah Johnson</p>
            <p className="text-xs text-pink-700">Mathematics Teacher</p>
          </div>
        </div>
      </aside>
    </>
  );
}
