import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("overview");

  const handleLogout = () => {
    // Clear session/auth state here if needed
    console.log("User logged out");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          {activeMenu === "overview" && <DashboardContent />}
          
          {/* Placeholder for other menu items */}
          {activeMenu !== "overview" && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">
                The <span className="font-semibold">{activeMenu}</span> section is under development.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
