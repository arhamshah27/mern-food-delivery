import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import axiosInstance from "../../api/axiosInstance";
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Shield,
  Clock,
  Compass,
  Bike,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axiosInstance.get("/settings");
        if (data.success) setSettings(data.settings);
      } catch {
        // Fallback
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
      isActive(path)
        ? "text-[#C6A15B] dark:text-[#E6D3A3] bg-[#C6A15B]/10 border border-[#C6A15B]/30 shadow-sm"
        : "text-slate-600 dark:text-[#A5A5AD] hover:text-slate-900 dark:hover:text-[#F5F0E6] hover:bg-slate-100 dark:hover:bg-[#1A1B23]"
    }`;

  const restaurantName = settings?.restaurantName || "Baroda Gourmet Kitchen";

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#08090D]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-[#C6A15B]/20 w-full transition-colors">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E202A] to-[#121318] border border-[#C6A15B]/40 flex items-center justify-center text-[#E6D3A3] shadow-md shadow-[#C6A15B]/10 group-hover:border-[#C6A15B] group-hover:scale-105 transition-all duration-200">
            <UtensilsCrossed className="w-5 h-5 text-[#C6A15B]" />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight block leading-tight">
              {restaurantName}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-[#C6A15B] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-pulse" />
              {settings?.isOpen ? "Palace Kitchen Open" : "Currently Closed"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link to="/" className={navLinkClass("/")}>
            Home
          </Link>
          <Link to="/menu" className={navLinkClass("/menu")}>
            <Compass className="w-4 h-4 text-[#C6A15B]" />
            Menu
          </Link>
          {user && (
            <Link to="/my-orders" className={navLinkClass("/my-orders")}>
              <Clock className="w-4 h-4 text-[#C6A15B]" />
              My Orders
            </Link>
          )}
          {(user?.role === "delivery_partner" || user?.role === "rider") && (
            <Link
              to="/delivery"
              className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 ml-1 ${
                isActive("/delivery")
                  ? "text-[#E6D3A3] bg-[#C6A15B]/20 border border-[#C6A15B]/50 shadow-sm"
                  : "text-[#C6A15B] bg-[#C6A15B]/10 border border-[#C6A15B]/25 hover:bg-[#C6A15B]/20"
              }`}
            >
              <Bike className="w-4 h-4 text-[#C6A15B]" />
              <span>Assigned Orders</span>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="px-3.5 py-2 text-sm font-semibold rounded-xl text-[#E6D3A3] bg-[#C6A15B]/15 border border-[#C6A15B]/35 hover:bg-[#C6A15B]/25 transition-all flex items-center gap-1.5 ml-1"
            >
              <Shield className="w-4 h-4 text-[#C6A15B]" />
              Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Cart Button */}
          <Link
            to="/cart"
            id="nav-cart-btn"
            className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-[#232530] text-slate-700 dark:text-[#E6D3A3] hover:text-[#C6A15B] dark:hover:text-[#F5F0E6] hover:border-[#C6A15B]/50 hover:bg-slate-100 dark:hover:bg-[#1A1B23] transition-all flex items-center justify-center group shadow-sm"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-5 h-5 text-slate-600 dark:text-[#A5A5AD] group-hover:text-[#C6A15B] transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#C6A15B] to-[#E6D3A3] text-[#08090D] text-[11px] font-extrabold h-5 min-w-5 px-1 rounded-full flex items-center justify-center shadow-md shadow-[#C6A15B]/30 border-2 border-white dark:border-[#08090D] animate-scale">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Auth Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/30 hover:border-[#C6A15B] transition-all focus:outline-none shadow-sm"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#C6A15B]/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C6A15B] to-[#9F7E3C] text-[#08090D] font-extrabold text-xs flex items-center justify-center shadow">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-[#F5F0E6] max-w-[100px] truncate">
                  {user.name?.split(" ")[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/25 rounded-2xl shadow-2xl py-2 z-40 text-sm">
                    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-[#232530]">
                      <p className="font-serif font-bold text-slate-900 dark:text-[#F5F0E6] truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#A5A5AD] truncate">{user.email}</p>
                      {user.role === "admin" && (
                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C6A15B] bg-[#C6A15B]/10 px-2 py-0.5 rounded-full border border-[#C6A15B]/25">
                          Royal Administrator
                        </span>
                      )}
                      {(user.role === "delivery_partner" || user.role === "rider") && (
                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C6A15B] bg-[#C6A15B]/10 px-2 py-0.5 rounded-full border border-[#C6A15B]/25">
                          Fleet Partner
                        </span>
                      )}
                    </div>

                    {(user.role === "delivery_partner" || user.role === "rider") && (
                      <Link
                        to="/delivery"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-[#C6A15B] hover:bg-[#C6A15B]/10 transition-colors font-semibold"
                      >
                        <Bike className="w-4 h-4 text-[#C6A15B]" />
                        Assigned Orders
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-700 dark:text-[#D8D4CA] hover:text-[#C6A15B] dark:hover:text-[#F5F0E6] hover:bg-slate-50 dark:hover:bg-[#1A1B23] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#C6A15B]" />
                      My Profile
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-700 dark:text-[#D8D4CA] hover:text-[#C6A15B] dark:hover:text-[#F5F0E6] hover:bg-slate-50 dark:hover:bg-[#1A1B23] transition-colors"
                    >
                      <Clock className="w-4 h-4 text-[#C6A15B]" />
                      My Orders
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-[#E6D3A3] hover:bg-[#C6A15B]/10 transition-colors font-semibold"
                      >
                        <Shield className="w-4 h-4 text-[#C6A15B]" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-200 dark:border-[#232530] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-[#E6D3A3] bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/30 hover:border-[#C6A15B] hover:bg-slate-50 dark:hover:bg-[#1A1B23] transition-all shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4.5 py-2 text-xs font-bold rounded-xl text-[#08090D] bg-gradient-to-r from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] shadow-md shadow-[#C6A15B]/20 hover:brightness-110 transition-all tracking-wide"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800/80 mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Theme</span>
            <ThemeToggle showLabel={true} />
          </div>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-orange-600 dark:hover:text-orange-400"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-orange-600 dark:hover:text-orange-400"
          >
            Menu
          </Link>
          {user ? (
            <>
              {(user.role === "delivery_partner" || user.role === "rider") && (
                <Link
                  to="/delivery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                >
                  <Bike className="w-4 h-4 text-emerald-500" />
                  <span>Assigned Orders</span>
                </Link>
              )}
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-orange-600 dark:hover:text-orange-400"
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-orange-600 dark:hover:text-orange-400"
              >
                Profile
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold rounded-xl text-amber-300 bg-amber-500/10 border border-amber-500/20"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl text-red-500 dark:text-red-400 hover:bg-red-500/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold rounded-xl text-slate-200 bg-slate-900 border border-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-md shadow-orange-500/20"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
