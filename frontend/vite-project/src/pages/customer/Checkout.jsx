import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import axiosInstance from "../../api/axiosInstance";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import toast from "react-hot-toast";
import { loadRazorpay } from "../../utils/loadRazorpay";
import {
  MapPin,
  Phone,
  Clock,
  User,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    subtotal,
    deliveryCharge,
    tax,
    discount,
    totalAmount,
    coupon,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    deliveryAddress: user?.address || "",
    deliveryTime: "Standard (30-45 mins)",
    specialInstructions: "",
    paymentMethod: "COD",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0 && !orderConfirmed) {
      navigate("/cart");
    }
  }, [cartItems.length, orderConfirmed, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Contact phone number is required";
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Delivery house/street address is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required delivery details");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: cartItems,
        customerDetails: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          deliveryAddress: formData.deliveryAddress.trim(),
          deliveryTime: formData.deliveryTime,
          specialInstructions: formData.specialInstructions.trim(),
        },
        couponCode: coupon?.code || "",
        paymentMethod: formData.paymentMethod,
      };

      if (formData.paymentMethod === "Online") {
        const { data } = await axiosInstance.post("/payments/create-order", payload);
        const ok = await loadRazorpay();

        if (ok && window.Razorpay && data.keyId && !data.keyId.includes("simulated")) {
          const rzp = new window.Razorpay({
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            order_id: data.razorpayOrderId,
            name: "Baroda Gourmet Kitchen",
            description: `Order ${data.orderNumber}`,
            prefill: data.prefill,
            theme: { color: "#ea580c" },
            handler: async (resp) => {
              try {
                const { data: v } = await axiosInstance.post("/payments/verify", {
                  orderId: data.orderId,
                  ...resp,
                });
                clearCart();
                setOrderConfirmed(v.order);
                toast.success("Payment verified! Order placed.");
              } catch {
                toast.error("Payment verification failed");
              }
            },
            modal: {
              ondismiss: () => {
                axiosInstance.post("/payments/failed", {
                  orderId: data.orderId,
                  reason: "dismissed",
                });
                toast.error("Payment dismissed");
              },
            },
          });
          rzp.open();
          setSubmitting(false);
          return;
        } else {
          // Simulated test mode verification when live keys not provided
          const { data: v } = await axiosInstance.post("/payments/verify", {
            orderId: data.orderId,
            razorpay_payment_id: "pay_test_simulated",
          });
          clearCart();
          setOrderConfirmed(v.order);
          toast.success("Online payment verified in test mode!");
          setSubmitting(false);
          return;
        }
      }

      // COD flow
      const { data } = await axiosInstance.post("/orders", payload);
      if (data.success) {
        clearCart();
        setOrderConfirmed(data.order);
        toast.success("Feast ordered successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // If order was placed, show confirmation screen
  if (orderConfirmed) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#C6A15B]/15 text-[#C6A15B] flex items-center justify-center mx-auto shadow-2xl shadow-[#C6A15B]/10 border border-[#C6A15B]/40">
          <CheckCircle2 className="w-10 h-10 stroke-[2]" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A15B] block mb-1">
            Confirmed & Handcrafted
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-[#F5F0E6]">Order Successfully Placed!</h1>
          <p className="text-sm text-slate-600 dark:text-[#A5A5AD] mt-2">
            Order Reference: <span className="font-mono font-bold text-[#8E6E30] dark:text-[#E6D3A3]">{orderConfirmed.orderNumber}</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 text-left text-xs space-y-3.5 shadow-xl">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-[#A5A5AD]">Delivering To:</span>
            <span className="font-semibold text-slate-900 dark:text-[#F5F0E6] text-right max-w-xs">{orderConfirmed.customerDetails.deliveryAddress}</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-[#A5A5AD]">Contact Phone:</span>
            <span className="font-semibold text-slate-900 dark:text-[#F5F0E6]">{orderConfirmed.customerDetails.phone}</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-[#C6A15B]/15">
            <span className="text-slate-500 dark:text-[#A5A5AD]">Total Payable:</span>
            <span className="font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3] text-base">₹{orderConfirmed.totalAmount} ({orderConfirmed.paymentMethod})</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => navigate(`/orders/${orderConfirmed.orderNumber}`)}
            variant="primary"
            size="lg"
          >
            Track Royal Kitchen Status
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => navigate("/menu")}
            variant="secondary"
            size="lg"
          >
            Return to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#C6A15B]/20">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#8E6E30] dark:text-[#C6A15B] block mb-1">
          Finalize Experience
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
          Delivery Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A5AD] mt-1">
          Complete your contact and delivery location details to finalize your feast.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Delivery form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F0E6] border-b border-slate-200 dark:border-[#C6A15B]/15 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" />
              1. Guest Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                error={errors.name}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 98765 43210"
                icon={Phone}
                error={errors.phone}
                required
              />
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F0E6] border-b border-slate-200 dark:border-[#C6A15B]/15 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" />
              2. Delivery Address & Timings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#F5F0E6] mb-1.5">
                  Complete Address (House/Villa No., Landmark, Area) <span className="text-[#8E6E30] dark:text-[#C6A15B]">*</span>
                </label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Villa 402, Royal Palms, Behind Inorbit Mall, Gorwa Road, Vadodara"
                  className={`w-full bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-[#F5F0E6] placeholder-slate-400 dark:placeholder-slate-500 text-sm p-3.5 rounded-xl border transition-all outline-none resize-none ${
                    errors.deliveryAddress
                      ? "border-rose-500"
                      : "border-slate-300 dark:border-[#C6A15B]/25 focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20"
                  }`}
                />
                {errors.deliveryAddress && (
                  <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.deliveryAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#F5F0E6] mb-1.5">
                    Delivery Speed
                  </label>
                  <select
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-[#F5F0E6] text-sm p-3 rounded-xl border border-slate-300 dark:border-[#C6A15B]/25 focus:border-[#C6A15B] outline-none"
                  >
                    <option value="Standard (30-45 mins)">Standard Express (30-45 mins)</option>
                    <option value="Priority Rush (20-30 mins)">Priority Royal Rush (20-30 mins)</option>
                    <option value="Later Today">Schedule For Dinner (7:30 PM - 9:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#F5F0E6] mb-1.5">
                    Chauffeur Note (Optional)
                  </label>
                  <input
                    type="text"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    placeholder="e.g. Ring the bell, deliver quietly"
                    className="w-full bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-[#F5F0E6] placeholder-slate-400 dark:placeholder-slate-500 text-sm px-3.5 py-3 rounded-xl border border-slate-300 dark:border-[#C6A15B]/25 focus:border-[#C6A15B] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F0E6] border-b border-slate-200 dark:border-[#C6A15B]/15 pb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" />
              3. Payment Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                  formData.paymentMethod === "COD"
                    ? "bg-[#C6A15B]/15 border-[#C6A15B] text-slate-900 dark:text-[#F5F0E6] shadow-md shadow-[#C6A15B]/10"
                    : "bg-slate-50 dark:bg-[#08090D] border-slate-200 dark:border-[#C6A15B]/20 text-slate-700 dark:text-[#A5A5AD] hover:border-[#C6A15B]/40 hover:text-slate-900 dark:hover:text-[#F5F0E6]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === "COD"}
                  onChange={handleChange}
                  className="accent-[#C6A15B] w-4 h-4"
                />
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-5 h-5 text-[#8E6E30] dark:text-[#C6A15B]" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#F5F0E6]">Cash / UPI at Door</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#A5A5AD]">Pay cash or scan QR upon delivery</p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                  formData.paymentMethod === "Online"
                    ? "bg-[#C6A15B]/15 border-[#C6A15B] text-slate-900 dark:text-[#F5F0E6] shadow-md shadow-[#C6A15B]/10"
                    : "bg-slate-50 dark:bg-[#08090D] border-slate-200 dark:border-[#C6A15B]/20 text-slate-700 dark:text-[#A5A5AD] hover:border-[#C6A15B]/40 hover:text-slate-900 dark:hover:text-[#F5F0E6]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={formData.paymentMethod === "Online"}
                  onChange={handleChange}
                  className="accent-[#C6A15B] w-4 h-4"
                />
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-[#8E6E30] dark:text-[#E6D3A3]" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#F5F0E6]">Instant Online Checkout</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#A5A5AD]">Cards, UPI & Netbanking</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary & Place Order (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/25 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F0E6] border-b border-slate-200 dark:border-[#C6A15B]/15 pb-3">
              Order Summary ({cartItems.length} items)
            </h3>

            {/* Quick item preview */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.itemKey} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#8E6E30] dark:text-[#C6A15B]">{item.quantity}x</span>
                    <span className="text-slate-900 dark:text-[#F5F0E6] line-clamp-1 max-w-[130px] font-medium">{item.name}</span>
                  </div>
                  <span className="font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3]">₹{item.itemTotal}</span>
                </div>
              ))}
            </div>

            {/* Bill summary */}
            <div className="pt-3 border-t border-slate-200 dark:border-[#C6A15B]/15 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-[#A5A5AD]">
                <span>Culinary Subtotal</span>
                <span className="text-slate-900 dark:text-[#F5F0E6] font-semibold">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Privilege Coupon ({coupon?.code})</span>
                  <span className="font-bold">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-[#A5A5AD]">
                <span>Restaurant Taxes</span>
                <span className="text-slate-900 dark:text-[#F5F0E6] font-semibold">₹{tax}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-[#A5A5AD]">
                <span>Chauffeur Delivery</span>
                <span className="text-slate-900 dark:text-[#F5F0E6] font-semibold">₹{deliveryCharge}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#C6A15B]/20 flex justify-between items-baseline">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-[#F5F0E6]">Total Payable</span>
              <span className="text-3xl font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3]">₹{totalAmount}</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full text-base font-bold shadow-xl shadow-[#C6A15B]/20"
            >
              Confirm & Place Order
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-[#A5A5AD] text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8E6E30] dark:text-[#C6A15B]" />
              <span>Safe & Contactless Delivery Verified</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
