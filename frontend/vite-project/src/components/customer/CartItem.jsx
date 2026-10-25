import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";

const FALLBACK_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [imgSrc, setImgSrc] = React.useState(item.image || FALLBACK_FOOD_IMAGE);

  const isVeg = item.foodType === "veg";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#14151A] border border-slate-200 dark:border-slate-800/80 shadow-md hover:border-[#C6A15B]/40 transition-all">
      {/* Left: Thumbnail & Details */}
      <div className="flex items-start gap-3.5">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
          <img
            src={imgSrc}
            alt={item.name}
            onError={() => setImgSrc(FALLBACK_FOOD_IMAGE)}
            className="w-full h-full object-cover"
          />
          {/* Veg badge on thumbnail */}
          <div
            className={`absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-sm border flex items-center justify-center bg-white/95 dark:bg-slate-950/90 shadow-sm ${
              isVeg ? "border-emerald-500" : "border-red-500"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-emerald-500" : "bg-red-500"}`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{item.name}</h4>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            ₹{item.unitPrice} each
          </span>

          {/* Add-ons list if any */}
          {item.selectedAddOns && item.selectedAddOns.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.selectedAddOns.map((addOn, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium"
                >
                  +{addOn.name} (₹{addOn.price})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Quantity controls & Item Total */}
      <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800/60">
        {/* Quantity Stepper */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-1">
          <button
            onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right min-w-[70px]">
          <span className="text-sm font-extrabold text-slate-900 dark:text-white block">₹{item.itemTotal}</span>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeFromCart(item.itemKey)}
          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
