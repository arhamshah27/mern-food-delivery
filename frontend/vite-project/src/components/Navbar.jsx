import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineLogout,
    HiOutlineUser,
    HiOutlineViewGrid,
} from "react-icons/hi";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(path)
            ? "bg-white/15 text-white shadow-lg shadow-white/5 backdrop-blur-sm"
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`;

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    to={user ? "/dashboard" : "/login"}
                    className="flex items-center gap-2 group"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25 transition-transform duration-200 group-hover:scale-110">
                        <span className="text-lg font-bold text-white">B</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        BarodaWeb
                    </span>
                </Link>

                {/* Desktop Nav */}
                {user && (
                    <div className="hidden items-center gap-2 md:flex">
                        <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                            <HiOutlineViewGrid className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link to="/profile" className={navLinkClass("/profile")}>
                            <HiOutlineUser className="h-4 w-4" />
                            Profile
                        </Link>

                        <div className="mx-2 h-6 w-px bg-white/15" />

                        {/* User badge */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5">
                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt={user.name}
                                        className="h-7 w-7 rounded-full object-cover ring-2 ring-violet-400/40"
                                    />
                                ) : (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-medium text-white/80">
                                    {user.name}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300"
                            >
                                <HiOutlineLogout className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile toggle */}
                {user && (
                    <button
                        className="text-white/70 md:hidden hover:text-white"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? (
                            <HiOutlineX className="h-6 w-6" />
                        ) : (
                            <HiOutlineMenu className="h-6 w-6" />
                        )}
                    </button>
                )}
            </div>

            {/* Mobile Nav */}
            {user && mobileOpen && (
                <div className="border-t border-white/10 bg-slate-900/95 px-4 py-3 backdrop-blur-xl md:hidden">
                    <div className="flex flex-col gap-2">
                        <Link
                            to="/dashboard"
                            className={navLinkClass("/dashboard")}
                            onClick={() => setMobileOpen(false)}
                        >
                            <HiOutlineViewGrid className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link
                            to="/profile"
                            className={navLinkClass("/profile")}
                            onClick={() => setMobileOpen(false)}
                        >
                            <HiOutlineUser className="h-4 w-4" />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                        >
                            <HiOutlineLogout className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
