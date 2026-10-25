import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import StatusBadge from "../../components/admin/StatusBadge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import { Clock, Eye, ShoppingBag, ArrowRight } from "lucide-react";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const { data } = await axiosInstance.get("/orders/my-orders");
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to load user orders", err);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    fetchOrders();

    const timer = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <Loader text="Loading your feast orders..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders yet"
        description="You haven't ordered any delicious meals from our kitchen yet."
        actionText="Order Your First Meal"
        onAction={() => navigate("/menu")}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#C6A15B]/20 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A15B] block mb-1">
            Gastronomic Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
            My Order History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A5AD] mt-0.5">
            View past orders, receipts, and track live culinary preparations.
          </p>
        </div>
        <span className="text-xs font-serif font-semibold text-[#E6D3A3] bg-[#14151A] px-3.5 py-1.5 rounded-xl border border-[#C6A15B]/25 shadow-inner">
          {orders.length} Royal Orders
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-5 sm:p-6 shadow-md hover:border-[#C6A15B]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
          >
            {/* Left: Info & items */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono font-bold text-base text-slate-900 dark:text-[#F5F0E6] tracking-tight">
                  {order.orderNumber}
                </span>
                <StatusBadge status={order.status} />
                <span className="text-xs text-slate-500 dark:text-[#A5A5AD] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8E6E30] dark:text-[#C6A15B]" />
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Items Summary */}
              <p className="text-xs text-slate-700 dark:text-[#F5F0E6]/90 font-medium">
                {order.items
                  .map((item) => `${item.quantity}x ${item.name}`)
                  .join(", ")}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-[#A5A5AD] pt-1">
                <span>
                  Payment: <strong className="text-slate-900 dark:text-[#F5F0E6] font-semibold">{order.paymentMethod}</strong> (
                  {order.paymentStatus})
                </span>
                <span className="text-[#C6A15B]">•</span>
                <span>
                  Delivery: <strong className="text-slate-900 dark:text-[#F5F0E6] font-semibold">{order.customerDetails?.deliveryTime}</strong>
                </span>
              </div>
            </div>

            {/* Right: Total & View button */}
            <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-[#C6A15B]/15">
              <div className="sm:text-right">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-[#A5A5AD] block leading-none mb-1">Total</span>
                <span className="text-2xl font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3]">₹{order.totalAmount}</span>
              </div>

              <Link to={`/orders/${order.orderNumber}`}>
                <Button variant="primary" size="sm" icon={Eye}>
                  Track Order
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
