import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/auth");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Sidebar */}
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-64 pt-20 md:pt-0">
        {/* Top Bar */}
        <div className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 shadow-lg z-30 flex items-center justify-between px-4 md:px-8">
          <div className="text-white font-bold text-lg">Dashboard</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white hover:bg-white/20 rounded-full"
            data-testid="button-logout-top"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 pt-8">
          {activeMenu === "overview" && <DashboardContent />}
          
          {/* Placeholder for other menu items */}
          {activeMenu !== "overview" && (
            <div className="text-center py-20">
              <div className="inline-block bg-gradient-to-br from-blue-100 to-green-100 rounded-full p-12 mb-6">
                <div className="text-4xl">🚀</div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-600">
                The <span className="font-semibold text-blue-600">{activeMenu}</span> section is under development.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
