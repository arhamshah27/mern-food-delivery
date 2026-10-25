import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  PlusCircle,
  Image as ImageIcon,
  ShoppingBag,
  TicketPercent,
  Settings,
  LogOut,
  ChevronLeft,
  Store,
  ExternalLink,
  Bike,
  Users,
  UserCheck,
} from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";

const NAV_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/orders", label: "Orders & Assignments", icon: ShoppingBag },
  { path: "/admin/fleet", label: "Live Fleet Map", icon: Bike },
  { path: "/admin/menu", label: "Menu Management", icon: UtensilsCrossed },
  { path: "/admin/categories", label: "Categories", icon: Layers },
  { path: "/admin/addons", label: "Add-ons", icon: PlusCircle },
  { path: "/admin/banners", label: "Banners", icon: ImageIcon },
  { path: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { path: "/admin/staff", label: "Staff & Crew", icon: Users },
  { path: "/admin/applications", label: "Fleet Applications", icon: UserCheck },
  { path: "/admin/settings", label: "Salon Settings", icon: Settings },
];

const AdminSidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white dark:bg-[#08090D] border-r border-slate-200 dark:border-[#C6A15B]/15 transition-all duration-300 flex flex-col justify-between shrink-0 shadow-sm
          ${isCollapsed ? "w-20" : "w-64"}
          fixed inset-y-0 left-0 z-50 lg:static lg:sticky lg:top-0 lg:h-screen
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top Header */}
        <div>
          <div className="h-18 flex items-center justify-between px-4 border-b border-slate-200 dark:border-[#232530]">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 overflow-hidden select-none"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E202A] to-[#121318] border border-[#C6A15B]/40 flex items-center justify-center text-[#E6D3A3] shrink-0 shadow-md shadow-[#C6A15B]/10">
                <Store className="w-5 h-5 text-[#C6A15B]" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-serif font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight block leading-tight text-sm">
                    Baroda Kitchen
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E6E30] dark:text-[#C6A15B]">
                    Royal Administration
                  </span>
                </div>
              )}
            </Link>

            {/* Toggle collapse (desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-500 dark:text-[#A5A5AD] hover:text-slate-900 dark:hover:text-[#F5F0E6] hover:bg-slate-100 dark:hover:bg-[#14151A] transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all select-none
                    ${
                      active
                        ? "bg-gradient-to-r from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] text-[#08090D] font-bold shadow-md shadow-[#C6A15B]/20"
                        : "text-slate-600 dark:text-[#A5A5AD] hover:text-slate-900 dark:hover:text-[#F5F0E6] hover:bg-slate-100 dark:hover:bg-[#14151A]"
                    }
                    ${isCollapsed ? "justify-center px-0" : ""}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#08090D]" : "text-[#8E6E30] dark:text-[#C6A15B]"}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-200 dark:border-[#232530] space-y-2">
          {/* Theme Mode Toggle */}
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between px-2 py-1"}`}>
            {!isCollapsed && <span className="text-xs font-semibold text-slate-500 dark:text-[#868896]">Theme</span>}
            <ThemeToggle showLabel={false} />
          </div>

          {/* Customer Site Preview link */}
          <Link
            to="/"
            target="_blank"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-[#A5A5AD] hover:text-[#8E6E30] dark:hover:text-[#C6A15B] hover:bg-slate-100 dark:hover:bg-[#14151A] transition-colors ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="View Live Customer Website"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-[#8E6E30] dark:text-[#C6A15B]" />
            {!isCollapsed && <span>Customer Website</span>}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-red-400 hover:text-rose-700 dark:hover:text-red-300 hover:bg-rose-50 dark:hover:bg-red-500/10 transition-colors ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
