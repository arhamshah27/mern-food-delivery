import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-[#F5F0E6] flex flex-col lg:flex-row w-full transition-colors">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet context={{ setIsMobileOpen }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
