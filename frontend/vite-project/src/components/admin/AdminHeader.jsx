import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Menu as MenuIcon, User, Shield, ExternalLink } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";

const AdminHeader = ({ title = "Dashboard", breadcrumbs = [], setIsMobileOpen }) => {
  const { user } = useAuth();
  const [restaurantName, setRestaurantName] = useState("Baroda Gourmet Kitchen");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axiosInstance.get("/settings");
        if (data.success && data.settings?.restaurantName) {
          setRestaurantName(data.settings.restaurantName);
        }
      } catch {
        // Fallback
      }
    };
    fetchSettings();
  }, []);

  return (
    <header className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
      {/* Left: Mobile hamburger & Titles */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-[#A5A5AD] hover:text-white bg-[#08090D] border border-[#232530] focus:outline-none"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-5 h-5 text-[#C6A15B]" />
        </button>

        <div>
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#868896] font-medium mb-1">
              <span>Admin</span>
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  <span>/</span>
                  <span className={i === breadcrumbs.length - 1 ? "text-[#C6A15B] font-semibold" : ""}>
                    {b}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right: Restaurant Name & Admin badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />

        <div className="hidden sm:block text-right">
          <p className="font-serif text-xs font-bold text-slate-900 dark:text-[#F5F0E6]">{restaurantName}</p>
          <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase font-semibold text-[#C6A15B] tracking-wider mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-pulse" />
            Live Command Center
          </div>
        </div>

        <div className="flex items-center gap-2.5 pl-3 sm:border-l border-slate-200 dark:border-[#232530]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] flex items-center justify-center text-[#08090D] font-black text-xs shadow-md ring-1 ring-[#C6A15B]/30">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-[#F5F0E6]">{user?.name || "Administrator"}</p>
            <span className="text-[10px] text-[#C6A15B] font-bold uppercase tracking-wider">
              {user?.role === "admin" || user?.role === "owner" || user?.role === "shop_manager"
                ? "Administrator"
                : user?.role === "delivery_partner"
                ? "Delivery Rider"
                : "Customer"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
