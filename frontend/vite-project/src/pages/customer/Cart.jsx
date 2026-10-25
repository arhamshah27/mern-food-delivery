import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartItem from "../../components/customer/CartItem";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { ShoppingBag, ArrowRight, Ticket, Check, X, ShieldAlert, Sparkles } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    deliveryCharge,
    tax,
    discount,
    totalAmount,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
    settings,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCodeInput.trim());
    setCouponLoading(false);
    setCouponCodeInput("");
  };

  const minOrder = settings?.minimumOrderAmount || 150;
  const isBelowMinOrder = subtotal < minOrder;

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your feast cart is empty"
        description="Looks like you haven't added any handcrafted royal delicacies to your order yet."
        actionText="Explore Signature Menu"
        onAction={() => navigate("/menu")}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#232530]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
            Your Order Cart
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A5AD] font-sans mt-0.5">
            Review your delicacies and proceed to royal delivery.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-[#868896] hover:text-red-400 transition-colors self-start sm:self-auto"
        >
          Clear All Dishes
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items list (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.itemKey} item={item} />
          ))}

          {/* Add more dishes banner */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#232530] flex items-center justify-between shadow-sm">
            <span className="text-xs text-slate-700 dark:text-[#D8D4CA] font-medium">Craving an extra accompaniment or dessert?</span>
            <Link
              to="/menu"
              className="text-xs font-bold text-[#8E6E30] dark:text-[#C6A15B] hover:underline transition-colors flex items-center gap-1.5"
            >
              Add more dishes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Order Summary & Coupon (1 Col on lg) */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E6E30] dark:text-[#C6A15B]">
              <Ticket className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" />
              Apply Privilege Coupon
            </div>

            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <div>
                    <span className="text-xs font-extrabold uppercase">{coupon.code}</span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">
                      Privilege discount of ₹{discount} applied!
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. WELCOME25)"
                  className="flex-1 bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-[#F5F0E6] placeholder-slate-400 dark:placeholder-[#868896] text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#232530] focus:border-[#C6A15B] outline-none uppercase"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  loading={couponLoading}
                  disabled={!couponCodeInput.trim()}
                >
                  Apply
                </Button>
              </form>
            )}

            <p className="text-[11px] text-slate-500 dark:text-[#868896]">
              Tip: Use <span className="text-[#8E6E30] dark:text-[#C6A15B] font-semibold">WELCOME25</span> for 25% off orders over ₹400!
            </p>
          </div>

          {/* Bill Breakdown Box */}
          <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-[#F5F0E6] border-b border-slate-200 dark:border-[#232530] pb-3">
              Order Total & Taxes
            </h3>

            <div className="space-y-2.5 text-xs font-sans">
              <div className="flex justify-between text-slate-600 dark:text-[#D8D4CA]">
                <span>Delicacies Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-[#F5F0E6]">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Privilege Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-[#D8D4CA]">
                <span>Kitchen Packaging & Taxes ({settings?.taxPercentage ?? 5}%)</span>
                <span className="font-semibold text-slate-900 dark:text-[#F5F0E6]">₹{tax}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-[#D8D4CA]">
                <span>Insulated Doorstep Delivery</span>
                <span className="font-semibold text-slate-900 dark:text-[#F5F0E6]">₹{deliveryCharge}</span>
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-200 dark:border-[#232530] flex justify-between items-baseline">
              <div>
                <span className="font-serif text-sm font-bold text-slate-900 dark:text-[#F5F0E6] block">Total Amount</span>
                <span className="text-[11px] text-slate-500 dark:text-[#868896]">Inclusive of all duties</span>
              </div>
              <span className="font-serif text-2xl font-bold text-[#8E6E30] dark:text-[#E6D3A3]">₹{totalAmount}</span>
            </div>

            {/* Minimum Order Warning */}
            {isBelowMinOrder && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-[#E6D3A3] text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-[#C6A15B] shrink-0" />
                <span>
                  Minimum order amount is ₹{minOrder}. Add ₹{minOrder - subtotal} more to proceed.
                </span>
              </div>
            )}

            {/* Proceed Button */}
            <Button
              onClick={() => navigate("/checkout")}
              disabled={isBelowMinOrder}
              variant="primary"
              size="lg"
              className="w-full text-sm font-bold shadow-lg shadow-[#C6A15B]/20"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
