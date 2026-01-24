import { Menu, X, BarChart3, User, Calendar, FileText, MessageSquare, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResizableSidebar } from "./resizable-sidebar";

const parentMenuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, section: "main" },
  { divider: true, label: "Child Information" },
  { id: "child-profile", label: "Child Profile", icon: User, section: "parent" },
  { id: "attendance", label: "Attendance", icon: Calendar, section: "parent" },
  { id: "progress", label: "Academic Progress", icon: FileText, section: "parent" },
  { divider: true, label: "Communication" },
  { id: "messages", label: "Messages", icon: MessageSquare, section: "parent" },
  { id: "reports", label: "Reports", icon: FileText, section: "parent" },
];

interface ParentSidebarProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export function ParentSidebar({ activeMenu, onMenuChange }: ParentSidebarProps) {
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
        className="border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50"
        minWidth={280}
        maxWidth={500}
        defaultWidth={350}
      >
        {(width) => (
          <>
            <div className="border-b border-amber-200 bg-gradient-to-r from-amber-600 to-orange-600 p-6">
              <div className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg flex-shrink-0">
                  <Heart className="h-6 w-6 text-amber-600" />
                </div>
                {width > 250 && (
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-white truncate">Parent Portal</h1>
                    <p className="text-xs text-amber-100 truncate">Child Updates</p>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4" data-testid="sidebar-parent">
              {parentMenuItems.map((item, index) => {
                if ("divider" in item && item.divider) {
                  return (
                    <div key={index} className="mt-2 py-4">
                      {width > 250 && (
                        <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-amber-700 uppercase truncate">
                          {item.label}
                        </p>
                      )}
                    </div>
                  );
                }

                const menuItem = item as (typeof parentMenuItems)[number] & {
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
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                        : "text-amber-900 hover:bg-amber-100"
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

            <div className="space-y-2 border-t border-amber-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
              {width > 250 ? (
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-semibold text-amber-600 truncate">Logged in as</p>
                  <p className="font-semibold text-amber-900 truncate" data-testid="sidebar-username">
                    Michael Smith
                  </p>
                  <p className="text-xs text-orange-700 truncate">Parent</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-sm font-bold">
                    MS
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
