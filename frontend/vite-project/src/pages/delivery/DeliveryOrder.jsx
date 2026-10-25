import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/admin/StatusBadge";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Phone,
  MapPin,
  ExternalLink,
  IndianRupee,
  Navigation,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const DeliveryOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cashCollected, setCashCollected] = useState(false);
  const [lastGpsSent, setLastGpsSent] = useState(null);
  const [gpsSecondsAgo, setGpsSecondsAgo] = useState(0);

  const gpsWatchRef = useRef(null);

  const fetchOrder = async () => {
    try {
      const { data } = await axiosInstance.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.order);
        setCashCollected(Boolean(data.order.cashCollected));
      }
    } catch (err) {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // GPS Sharing effect when order is out_for_delivery
  useEffect(() => {
    if (!order) return;
    const isOut =
      order.status === "Out for delivery" || order.status === "out_for_delivery";

    if (isOut && navigator.geolocation) {
      // Send location update every 8 seconds
      const sendLocation = (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        axiosInstance
          .patch(`/delivery/orders/${order._id}/location`, { lat, lng })
          .then(() => {
            setLastGpsSent(new Date());
            setGpsSecondsAgo(0);
          })
          .catch((err) => console.warn("GPS sync failed:", err.message));
      };

      navigator.geolocation.getCurrentPosition(sendLocation, () => {});
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(sendLocation, () => {});
      }, 8000);

      // Seconds ago counter
      const counter = setInterval(() => {
        setGpsSecondsAgo((prev) => prev + 1);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(counter);
      };
    }
  }, [order?.status, order?._id]);

  const handleStartDelivery = async () => {
    setUpdating(true);
    try {
      const { data } = await axiosInstance.patch(`/delivery/orders/${order._id}/status`, {
        status: "out_for_delivery",
      });
      if (data.success) {
        toast.success("Delivery started! GPS sharing activated.");
        setOrder(data.order);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start delivery");
    } finally {
      setUpdating(false);
    }
  };

  const handleCashToggle = async () => {
    if (cashCollected) return;
    try {
      const { data } = await axiosInstance.patch(
        `/delivery/orders/${order._id}/cash-collected`
      );
      if (data.success) {
        setCashCollected(true);
        toast.success("Cash marked as collected!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record cash payment");
    }
  };

  const handleMarkDelivered = async () => {
    const isCod = order.paymentMethod === "COD" || order.paymentMethod === "cod";
    if (isCod && !cashCollected) {
      toast.error("Please collect cash and check 'Cash Collected' before completing delivery");
      return;
    }

    setUpdating(true);
    try {
      const { data } = await axiosInstance.patch(`/delivery/orders/${order._id}/status`, {
        status: "delivered",
      });
      if (data.success) {
        toast.success("Order marked delivered! Great job.");
        navigate("/delivery");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete delivery");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader text="Loading live delivery manifest..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
          <Link to="/delivery">
            <Button variant="primary">Return to Delivery Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCod = order.paymentMethod === "COD" || order.paymentMethod === "cod";
  const isOut =
    order.status === "Out for delivery" || order.status === "out_for_delivery";
  const isDelivered =
    order.status === "Delivered" || order.status === "delivered";

  // Google Maps navigation deep link
  const destLat = order.addressDetails?.lat || 22.3072;
  const destLng = order.addressDetails?.lng || 73.1812;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-100">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between">
        <Link
          to="/delivery"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span className="font-extrabold text-xs text-white">
          Order #{order.orderNumber}
        </span>
        <StatusBadge status={order.status} />
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-5">
        {/* GPS Live Sharing Pill when Out for delivery */}
        {isOut && (
          <div className="bg-emerald-950/70 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs font-bold text-emerald-300 block">
                  Sharing live location with customer
                </span>
                <span className="text-[10px] text-emerald-400/80">
                  {lastGpsSent
                    ? `Last ping sent ${gpsSecondsAgo}s ago`
                    : "Connecting to GPS satellites..."}
                </span>
              </div>
            </div>
            <Navigation className="w-5 h-5 text-emerald-400 animate-spin" />
          </div>
        )}

        {/* Customer & Destination Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Deliver To
              </span>
              <span className="text-base font-extrabold text-white">
                {order.customerDetails?.name}
              </span>
            </div>

            {/* Tap to Call */}
            <a
              href={`tel:${order.customerDetails?.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              <Phone className="w-3.5 h-3.5" /> Call Customer
            </a>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 text-slate-300">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {order.customerDetails?.deliveryAddress}
              </span>
            </div>

            {order.customerDetails?.specialInstructions && (
              <p className="text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                Note: {order.customerDetails.specialInstructions}
              </p>
            )}

            {/* Open in Google Maps */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-bold text-xs pt-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps (Turn-by-turn Navigation)
            </a>
          </div>
        </div>

        {/* Payment & Items Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment & Order Items
            </span>
            <span className="text-sm font-black text-orange-400">
              Total: ₹{order.totalAmount}
            </span>
          </div>

          {/* COD Collect Banner */}
          {isCod && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                cashCollected
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-950/60 border-amber-500/40 text-amber-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    Cash On Delivery
                  </span>
                  <span className="text-lg font-black text-white">
                    Collect ₹{order.totalAmount}
                  </span>
                </div>

                {!isDelivered && (
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-700">
                    <input
                      type="checkbox"
                      checked={cashCollected}
                      onChange={handleCashToggle}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-xs font-bold text-white">
                      {cashCollected ? "Cash Collected" : "Mark Received"}
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="divide-y divide-slate-800 text-xs">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <span className="text-white">
                  <strong>{item.quantity}x</strong> {item.name}
                </span>
                <span className="text-slate-400">₹{item.itemTotal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="space-y-3 pt-2">
          {!isOut && !isDelivered && (
            <Button
              onClick={handleStartDelivery}
              disabled={updating}
              variant="primary"
              size="lg"
              className="w-full justify-center"
              icon={Bike}
            >
              {updating ? "Starting..." : "Start Delivery & Share Live GPS"}
            </Button>
          )}

          {isOut && (
            <Button
              onClick={handleMarkDelivered}
              disabled={updating || (isCod && !cashCollected)}
              variant="primary"
              size="lg"
              className="w-full justify-center bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
              icon={CheckCircle2}
            >
              {updating ? "Completing..." : "Confirm Delivered to Customer"}
            </Button>
          )}

          {isDelivered && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
              <h4 className="text-sm font-bold text-emerald-400">Delivery Completed</h4>
              <p className="text-xs text-slate-300 mt-1">This order has been safely delivered.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrder;
