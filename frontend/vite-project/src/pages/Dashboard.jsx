import { useAuth } from "../context/AuthContext";
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineCalendar,
    HiOutlineShieldCheck,
    HiOutlineClock,
} from "react-icons/hi";

const Dashboard = () => {
    const { user } = useAuth();

    const stats = [
        {
            label: "Account Status",
            value: "Active",
            icon: HiOutlineShieldCheck,
            color: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-500/20",
        },
        {
            label: "Member Since",
            value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                })
                : "—",
            icon: HiOutlineCalendar,
            color: "from-violet-500 to-fuchsia-500",
            shadow: "shadow-violet-500/20",
        },
        {
            label: "Last Updated",
            value: user?.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })
                : "—",
            icon: HiOutlineClock,
            color: "from-cyan-500 to-blue-500",
            shadow: "shadow-cyan-500/20",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            {/* Decorative blurs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
                <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Welcome banner */}
                <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/10 to-cyan-600/20 p-6 backdrop-blur-xl sm:p-8">
                    <div className="flex flex-col items-center gap-5 sm:flex-row">
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={user.name}
                                className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-2 ring-white/20"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-bold text-white shadow-lg">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                Welcome back, {user?.name?.split(" ")[0]}! 👋
                            </h1>
                            <p className="mt-1 text-white/50">
                                Here&apos;s an overview of your account.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats cards */}
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-xl ${stat.shadow}`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg transition-transform duration-200 group-hover:scale-110`}
                                >
                                    <stat.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                                        {stat.label}
                                    </p>
                                    <p className="text-lg font-semibold text-white">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Profile details card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                    <h2 className="mb-6 text-lg font-semibold text-white">
                        Account Details
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                            <HiOutlineUser className="h-5 w-5 text-violet-400" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                                    Full Name
                                </p>
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                            <HiOutlineMail className="h-5 w-5 text-cyan-400" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                                    Email Address
                                </p>
                                <p className="text-sm font-medium text-white">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
