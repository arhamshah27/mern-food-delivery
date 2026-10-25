import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/admin/StatusBadge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  Bike,
  Power,
  Navigation,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  IndianRupee,
  LogOut,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

const DeliveryHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({ delivered: 0, cashToCollect: 0, cashCollected: 0 });
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [tab, setTab] = useState("active"); // 'active' or 'history'

  const fetchDeliveryData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [profRes, ordRes] = await Promise.all([
        axiosInstance.get("/delivery/me"),
        axiosInstance.get(`/delivery/orders?history=${tab === "history" ? 1 : 0}`),
      ]);

      if (profRes.data.success) {
        setProfile(profRes.data.user);
        setIsOnline(profRes.data.isOnline);
        setStats(profRes.data.stats || { delivered: 0, cashToCollect: 0, cashCollected: 0 });
      }

      if (ordRes.data.success) {
        setAssignedOrders(ordRes.data.orders);
      }
    } catch (err) {
      if (!silent) toast.error("Failed to load delivery dispatch info");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();

    // Live 10 second auto-polling for new assigned orders
    const timer = setInterval(() => {
      fetchDeliveryData(true);
    }, 10000);

    return () => clearInterval(timer);
  }, [tab]);

  const handleToggleOnline = async () => {
    setToggling(true);
    const targetStatus = !isOnline;

    // Request browser geolocation when going online
    if (targetStatus && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        (err) => {
          console.warn("Location permission not granted:", err.message);
        }
      );
    }

    try {
      const { data } = await axiosInstance.patch("/delivery/online", {
        isOnline: targetStatus,
      });

      if (data.success) {
        setIsOnline(data.isOnline);
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change status");
    } finally {
      setToggling(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const { data } = await axiosInstance.patch(`/delivery/orders/${orderId}/accept`);
      if (data.success) {
        toast.success("Order accepted! Head over to the restaurant kitchen.");
        fetchDeliveryData(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept order");
    }
  };

  if (loading) {
    return <Loader text="Connecting to delivery dispatch network..." />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#08090D] pb-16 text-slate-900 dark:text-[#F5F0E6]">
      {/* Top Mobile Bar */}
      <div className="bg-white dark:bg-[#14151A] border-b border-slate-200 dark:border-[#C6A15B]/20 p-4 sticky top-0 z-30 flex items-center justify-between shadow-sm dark:shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C6A15B]/15 text-[#8E6E30] dark:text-[#C6A15B] flex items-center justify-center border border-[#C6A15B]/30 shadow-inner">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-base text-slate-900 dark:text-[#F5F0E6] block leading-tight">
              {profile?.name || user?.name}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#8E6E30] dark:text-[#C6A15B] font-semibold">
              Royal Chauffeur Fleet
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-[#C6A15B] hover:bg-slate-100 dark:hover:bg-[#08090D] border border-transparent hover:border-[#C6A15B]/20 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-5">
        {/* Big Online/Offline Switch Card */}
        <div
          className={`rounded-3xl p-6 border transition-all shadow-md dark:shadow-2xl flex items-center justify-between ${
            isOnline
              ? "bg-gradient-to-r from-[#C6A15B]/15 to-white dark:from-[#C6A15B]/20 dark:via-[#14151A] dark:to-[#14151A] border-[#C6A15B]/50 shadow-[#C6A15B]/10"
              : "bg-white dark:bg-[#14151A] border-slate-200 dark:border-[#C6A15B]/20"
          }`}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isOnline ? "bg-[#8E6E30] dark:bg-[#C6A15B] animate-ping" : "bg-slate-400 dark:bg-slate-600"
                }`}
              />
              <span className="text-base font-serif font-bold text-slate-900 dark:text-[#F5F0E6]">
                {isOnline ? "Active on Duty" : "Currently Off Duty"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#A5A5AD] mt-1 font-light">
              {isOnline
                ? "Ready & receiving royal dining dispatch requests"
                : "Toggle on when ready to begin your dispatch shift"}
            </p>
          </div>

          <button
            onClick={handleToggleOnline}
            disabled={toggling}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-md ${
              isOnline
                ? "bg-[#C6A15B] text-white dark:text-[#08090D] hover:bg-[#B38C44] dark:hover:bg-[#E6D3A3] shadow-[#C6A15B]/25"
                : "bg-slate-50 dark:bg-[#14151A] border border-slate-300 dark:border-[#C6A15B]/40 text-slate-700 dark:text-[#E6D3A3] hover:border-[#C6A15B]"
            }`}
          >
            {toggling ? "Updating..." : isOnline ? "End Shift" : "Start Shift"}
          </button>
        </div>

        {/* Today's Metrics Banner */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-4 text-center shadow-sm dark:shadow-lg">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Delivered
            </span>
            <span className="text-2xl font-serif font-bold text-slate-900 dark:text-[#F5F0E6]">{stats.delivered}</span>
          </div>

          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-4 text-center shadow-sm dark:shadow-lg">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              COD Due
            </span>
            <span className="text-2xl font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3]">₹{stats.cashToCollect}</span>
          </div>

          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-4 text-center shadow-sm dark:shadow-lg">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Cash In Hand
            </span>
            <span className="text-2xl font-serif font-bold text-[#8E6E30] dark:text-[#C6A15B]">₹{stats.cashCollected}</span>
          </div>
        </div>

        {/* Tab Toggle: Active vs History */}
        <div className="flex bg-slate-100 dark:bg-[#14151A] p-1.5 rounded-2xl border border-slate-200 dark:border-[#C6A15B]/20 shadow-inner">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === "active"
                ? "bg-[#C6A15B] text-white shadow-md font-bold"
                : "text-slate-600 dark:text-[#A5A5AD] hover:text-slate-900 dark:hover:text-[#F5F0E6]"
            }`}
          >
            Assigned Feasts ({assignedOrders.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === "history"
                ? "bg-[#C6A15B] text-white shadow-md font-bold"
                : "text-slate-600 dark:text-[#A5A5AD] hover:text-slate-900 dark:hover:text-[#F5F0E6]"
            }`}
          >
            Today's Delivered
          </button>
        </div>

        {/* Assigned Orders List */}
        {assignedOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#14151A]/60 border border-slate-200 dark:border-[#C6A15B]/15 rounded-3xl p-10 text-center space-y-3 shadow-sm">
            <ShoppingBag className="w-10 h-10 text-[#C6A15B]/40 mx-auto" />
            <h3 className="text-base font-serif font-bold text-slate-900 dark:text-[#F5F0E6]">
              {tab === "active" ? "No active assigned deliveries" : "No completed deliveries today"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#A5A5AD] max-w-xs mx-auto leading-relaxed">
              {tab === "active"
                ? "Keep your status Online. New orders dispatched by the palace kitchen will appear right here."
                : "Completed deliveries for your current shift will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedOrders.map((order) => {
              const needsAccept =
                !order.delivery?.acceptedAt &&
                ["preparing", "placed", "Preparing", "Placed"].includes(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-5 shadow-sm dark:shadow-xl space-y-4 hover:border-[#C6A15B]/50 transition-all"
                >
                  {/* Top info */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#C6A15B]/15 pb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-[#F5F0E6]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#A5A5AD] block">
                        {order.customerDetails?.name} • {order.items?.length} items
                      </span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Destination */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-700 dark:text-[#F5F0E6]/90">
                      <MapPin className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B] shrink-0 mt-0.5" />
                      <span>{order.customerDetails?.deliveryAddress}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 dark:text-[#A5A5AD] pt-1">
                      <span>
                        Payment:{" "}
                        <strong className="text-slate-900 dark:text-[#F5F0E6] font-medium">
                          {order.paymentMethod}
                        </strong>{" "}
                        ({order.paymentStatus})
                      </span>
                      <span className="text-base font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3]">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-200 dark:border-[#C6A15B]/15 flex items-center justify-between gap-3">
                    {needsAccept ? (
                      <Button
                        onClick={() => handleAcceptOrder(order._id)}
                        variant="primary"
                        size="sm"
                        className="w-full justify-center"
                        icon={CheckCircle2}
                      >
                        Accept Assignment
                      </Button>
                    ) : (
                      <Link to={`/delivery/orders/${order._id}`} className="w-full">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full justify-center"
                          icon={Navigation}
                        >
                          Open Delivery Tracker
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryHome;
