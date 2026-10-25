import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import axiosInstance from "../../api/axiosInstance";
import AdminHeader from "../../components/admin/AdminHeader";
import StatCard from "../../components/admin/StatCard";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Button from "../../components/common/Button";
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  Bike,
  Users,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Navigation,
} from "lucide-react";

const Dashboard = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d"); // 'today', '7d', '30d'

  const fetchDashboardStats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/dashboard?range=${range}`);
      if (data.success) {
        setStatsData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Auto-refresh every 30s per IMPLEMENTATION.md §6
    const timer = setInterval(() => {
      fetchDashboardStats(true);
    }, 30000);

    return () => clearInterval(timer);
  }, [range]);

  const stats = statsData?.stats || {
    todayOrders: 0,
    todayRevenue: 0,
    avgOrderValue: 0,
    activeDeliveries: 0,
    pendingApplications: 0,
  };

  const statusSummary = statsData?.statusSummary || {
    Placed: 0,
    Preparing: 0,
    OutForDelivery: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  const recentOrdersColumns = [
    {
      header: "Order #",
      accessor: "orderNumber",
      render: (row) => (
        <Link
          to={`/admin/orders`}
          className="font-bold text-slate-900 dark:text-white hover:text-[#8E6E30] dark:hover:text-orange-400 transition-colors"
        >
          {row.orderNumber}
        </Link>
      ),
    },
    {
      header: "Customer",
      accessor: "customerDetails",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{row.customerDetails?.name}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{row.customerDetails?.phone}</p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "totalAmount",
      render: (row) => <span className="font-bold text-slate-900 dark:text-white">₹{row.totalAmount}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Time",
      accessor: "createdAt",
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Operations Control Hub"
        description="Live restaurant KPI metrics, sales trends, fleet statuses, and dish popularity."
        onMenuClick={() => setIsMobileOpen(true)}
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => fetchDashboardStats()}
              variant="secondary"
              size="sm"
              icon={RefreshCw}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards (5 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Today's Orders"
          value={loading ? "..." : stats.todayOrders}
          icon={ShoppingBag}
          color="orange"
          description="Total orders today"
        />

        <StatCard
          title="Today's Revenue"
          value={loading ? "..." : `₹${stats.todayRevenue}`}
          icon={IndianRupee}
          color="emerald"
          description="Gross earnings"
        />

        <StatCard
          title="Avg Order Value"
          value={loading ? "..." : `₹${stats.avgOrderValue}`}
          icon={TrendingUp}
          color="purple"
          description="Per ticket basket"
        />

        <Link to="/admin/fleet" className="block">
          <StatCard
            title="Active Deliveries"
            value={loading ? "..." : stats.activeDeliveries}
            icon={Bike}
            color="blue"
            description="View live fleet map →"
          />
        </Link>

        <Link to="/admin/applications" className="block">
          <StatCard
            title="Driver Applicants"
            value={loading ? "..." : stats.pendingApplications}
            icon={Users}
            color="amber"
            description="Pending reviews →"
          />
        </Link>
      </div>

      {/* Orders by Status Chips Bar */}
      <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#232530] pb-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C6A15B]">
            Order Pipeline by Stage
          </span>
          <Link to="/admin/orders" className="text-xs font-semibold text-[#C6A15B] hover:text-[#E6D3A3] hover:underline">
            Manage All Orders →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/admin/orders"
            className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center hover:border-blue-500/50 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase text-blue-400 block tracking-wider">Placed</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F0E6]">{statusSummary.Placed}</span>
          </Link>

          <Link
            to="/admin/orders"
            className="p-3.5 rounded-xl bg-[#C6A15B]/10 border border-[#C6A15B]/30 text-center hover:border-[#C6A15B] transition-colors"
          >
            <span className="text-[10px] font-bold uppercase text-[#C6A15B] block tracking-wider">Kitchen Preparing</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F0E6]">{statusSummary.Preparing}</span>
          </Link>

          <Link
            to="/admin/fleet"
            className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center hover:border-purple-500/50 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase text-purple-400 block tracking-wider">Out on Route</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F0E6]">{statusSummary.OutForDelivery}</span>
          </Link>

          <Link
            to="/admin/orders"
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center hover:border-emerald-500/50 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase text-emerald-400 block tracking-wider">Delivered</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F0E6]">{statusSummary.Delivered}</span>
          </Link>

          <Link
            to="/admin/orders"
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center hover:border-rose-500/50 transition-colors col-span-2 sm:col-span-1"
          >
            <span className="text-[10px] font-bold uppercase text-rose-400 block tracking-wider">Cancelled</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F0E6]">{statusSummary.Cancelled}</span>
          </Link>
        </div>
      </div>

      {/* Revenue Trend Chart & Top Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#232530] pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-[#F5F0E6]">
                Revenue & Sales Performance
              </h3>
              <p className="text-xs text-[#A5A5AD]">Total revenue generated across selected period</p>
            </div>

            <div className="flex bg-slate-100 dark:bg-[#08090D] p-1 rounded-xl border border-slate-200 dark:border-[#232530] text-xs font-semibold">
              <button
                onClick={() => setRange("today")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  range === "today" ? "bg-gradient-to-r from-[#C6A15B] to-[#9F7E3C] text-[#08090D] font-bold shadow-sm" : "text-[#A5A5AD] hover:text-[#F5F0E6]"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setRange("7d")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  range === "7d" ? "bg-gradient-to-r from-[#C6A15B] to-[#9F7E3C] text-[#08090D] font-bold shadow-sm" : "text-[#A5A5AD] hover:text-[#F5F0E6]"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setRange("30d")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  range === "30d" ? "bg-gradient-to-r from-[#C6A15B] to-[#9F7E3C] text-[#08090D] font-bold shadow-sm" : "text-[#A5A5AD] hover:text-[#F5F0E6]"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData?.revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232530" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#868896"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#232530" }}
                />
                <YAxis
                  stroke="#868896"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#232530" }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#14151A",
                    borderColor: "rgba(198, 161, 91, 0.35)",
                    borderRadius: "14px",
                    fontSize: "12px",
                    color: "#F5F0E6",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#C6A15B"
                  radius={[6, 6, 0, 0]}
                  barSize={range === "30d" ? 14 : 28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Dishes by Quantity (1 col) */}
        <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#232530] pb-3">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-[#F5F0E6]">
              Top 5 Royal Dishes
            </h3>
            <span className="text-[11px] text-[#C6A15B] font-semibold uppercase tracking-wider">By volume</span>
          </div>

          {statsData?.topDishes && statsData.topDishes.length > 0 ? (
            <div className="space-y-3">
              {statsData.topDishes.map((dish, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#08090D] border border-slate-200 dark:border-[#232530] hover:border-[#C6A15B]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-black text-[#C6A15B]">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-[#F5F0E6] line-clamp-1">{dish._id}</p>
                      <span className="text-[10px] text-[#A5A5AD]">
                        {dish.totalQuantity} orders fulfilled
                      </span>
                    </div>
                  </div>
                  <span className="font-serif text-xs font-bold text-[#E6D3A3]">
                    ₹{dish.totalRevenue}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#A5A5AD] italic py-8 text-center">
              Top dishes data will populate as orders are completed.
            </p>
          )}
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Kitchen Orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            View Full Table <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={recentOrdersColumns}
          data={statsData?.recentOrders || []}
          loading={loading}
          emptyMessage="No recent orders found."
        />
      </div>
    </div>
  );
};

export default Dashboard;
