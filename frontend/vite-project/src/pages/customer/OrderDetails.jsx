import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import OrderStatusTracker from "../../components/customer/OrderStatusTracker";
import TrackingMap from "../../components/customer/TrackingMap";
import StatusBadge from "../../components/admin/StatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { ArrowLeft, Clock, MapPin, Phone, Receipt, RefreshCw, Bike } from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setLoading(false);
        if (isManual) setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchOrder();

    // Auto-refresh order status every 10 seconds if order is active
    const interval = setInterval(() => {
      if (order && !["Delivered", "Cancelled", "delivered", "cancelled"].includes(order.status)) {
        fetchOrder();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrder, order?.status]);

  if (loading) {
    return <Loader text="Retrieving live order tracking..." />;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Could not find order #{id}.</p>
        <Link to="/my-orders">
          <Button variant="primary">Return to My Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#C6A15B]/20">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-400 hover:text-[#8E6E30] dark:hover:text-[#C6A15B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" /> Back to My Orders
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/25 text-slate-700 dark:text-[#E6D3A3] hover:text-[#8E6E30] dark:hover:text-[#F5F0E6] hover:border-[#8E6E30] dark:hover:border-[#C6A15B] transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#8E6E30] dark:text-[#C6A15B]" : "text-[#8E6E30] dark:text-[#C6A15B]"}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Visual Live Status Tracker */}
      <OrderStatusTracker
        status={order.status}
        cancelledReason={order.cancelledReason}
      />

      {/* Live Map Tracking when Out for Delivery */}
      {["Out for delivery", "out_for_delivery"].includes(order.status) && (
        <TrackingMap order={order} />
      )}

      {/* Order Info & Delivery Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Details */}
        <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-6 shadow-md space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F0E6] flex items-center gap-2 border-b border-slate-200 dark:border-[#C6A15B]/15 pb-2.5">
            <MapPin className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" />
            Delivery Destination
          </h3>
          <p className="text-sm font-semibold text-slate-900 dark:text-[#F5F0E6]">{order.customerDetails.name}</p>
          <p className="text-xs text-slate-600 dark:text-[#A5A5AD] leading-relaxed">
            {order.customerDetails.deliveryAddress}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
            <Phone className="w-3.5 h-3.5 text-[#8E6E30] dark:text-[#C6A15B]" />
            <span className="text-slate-900 dark:text-[#F5F0E6] font-medium">{order.customerDetails.phone}</span>
          </p>
          {order.customerDetails.specialInstructions && (
            <p className="text-xs text-amber-800 dark:text-[#E6D3A3] bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 dark:border-[#C6A15B]/20">
              Note: {order.customerDetails.specialInstructions}
            </p>
          )}
        </div>

        {/* Order Meta */}
        <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-6 shadow-md space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F0E6] flex items-center gap-2 border-b border-slate-200 dark:border-[#C6A15B]/15 pb-2.5">
            <Receipt className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" />
            Order Reference
          </h3>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-[#A5A5AD]">Order ID</span>
            <span className="font-mono font-bold text-[#8E6E30] dark:text-[#E6D3A3]">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-[#A5A5AD]">Placed On</span>
            <span className="text-slate-900 dark:text-[#F5F0E6] font-medium">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-[#A5A5AD]">Payment</span>
            <span className="font-semibold text-slate-900 dark:text-[#F5F0E6]">
              {order.paymentMethod} ({order.paymentStatus})
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-[#A5A5AD]">Current Status</span>
            <StatusBadge status={order.status} />
          </div>
          {order.assignedPartner && (
            <div className="pt-2 border-t border-slate-200 dark:border-[#C6A15B]/15 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-[#A5A5AD] flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-[#8E6E30] dark:text-[#C6A15B]" /> Chauffeur
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-[#F5F0E6] block">{order.assignedPartner.name}</span>
                {order.assignedPartner.phone && (
                  <a
                    href={`tel:${order.assignedPartner.phone}`}
                    className="text-[#8E6E30] dark:text-[#C6A15B] hover:underline font-semibold"
                  >
                    Call {order.assignedPartner.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items Breakdown & Receipt */}
      <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F0E6] border-b border-slate-200 dark:border-[#C6A15B]/15 pb-3">
          Culinary Selection
        </h3>

        <div className="divide-y divide-slate-200 dark:divide-[#C6A15B]/10">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-[#8E6E30] dark:text-[#C6A15B] mt-0.5 font-mono">
                  {item.quantity}x
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-[#F5F0E6]">{item.name}</h4>
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.selectedAddOns.map((addOn, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[10px] text-slate-700 dark:text-[#E6D3A3] bg-slate-100 dark:bg-[#08090D] px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#C6A15B]/20 font-medium"
                        >
                          +{addOn.name} (₹{addOn.price})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-sm font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3] shrink-0">₹{item.itemTotal}</span>
            </div>
          ))}
        </div>

        {/* Pricing calculations */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#C6A15B]/15 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-[#A5A5AD]">
            <span>Culinary Subtotal</span>
            <span className="text-slate-900 dark:text-[#F5F0E6] font-semibold">₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-[#C6A15B]">
              <span>Privilege Discount ({order.couponCode})</span>
              <span className="font-bold">-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600 dark:text-[#A5A5AD]">
            <span>Packaging & Taxes</span>
            <span className="text-slate-900 dark:text-[#F5F0E6] font-semibold">₹{order.tax}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-[#A5A5AD]">
            <span>Chauffeur Delivery</span>
            <span className="text-slate-900 dark:text-[#F5F0E6] font-semibold">₹{order.deliveryCharge}</span>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-[#C6A15B]/20 flex justify-between items-baseline">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-[#F5F0E6]">Grand Total</span>
            <span className="text-2xl font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3]">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
