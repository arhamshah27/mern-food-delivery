import React, { useState } from "react";
import { Plus, Minus, Check, ShoppingBag } from "lucide-react";
import Button from "../common/Button";

const AddOnSelector = ({ food, onAddToCart, onClose }) => {
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const toggleAddOn = (addOn) => {
    if (selectedAddOns.some((item) => item._id === addOn._id)) {
      setSelectedAddOns(selectedAddOns.filter((item) => item._id !== addOn._id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const unitTotal = Number(food.price) + addOnsTotal;
  const grandTotal = unitTotal * quantity;

  const handleConfirm = () => {
    onAddToCart(food, selectedAddOns, quantity);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6">
      {/* Dish Summary */}
      <div className="flex gap-4 items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <img
          src={
            food.image ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"
          }
          alt={food.name}
          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
        />
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{food.name}</h4>
          <span className="text-sm font-semibold text-[#8E6E30] dark:text-orange-400">Base Price: ₹{food.price}</span>
        </div>
      </div>

      {/* Add-ons List */}
      {food.addOns && food.addOns.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Customize with Add-ons (Optional)
            </h5>
            <span className="text-[11px] text-slate-500">Pick any</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {food.addOns.map((addOn) => {
              const isChecked = selectedAddOns.some((item) => item._id === addOn._id);
              return (
                <div
                  key={addOn._id}
                  onClick={() => toggleAddOn(addOn)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-[#C6A15B]/15 border-[#C6A15B] text-slate-900 dark:text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-[#C6A15B]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-[#C6A15B] border-[#C6A15B] text-[#08090D]"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{addOn.name}</p>
                      {addOn.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{addOn.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#8E6E30] dark:text-orange-400">+₹{addOn.price}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">No add-ons available for this dish.</p>
      )}

      {/* Quantity & Total */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quantity:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-1">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-500 block">Total</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">₹{grandTotal}</span>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        variant="primary"
        size="lg"
        className="w-full font-bold shadow-lg shadow-[#C6A15B]/20"
        icon={ShoppingBag}
      >
        Add to Order • ₹{grandTotal}
      </Button>
    </div>
  );
};

export default AddOnSelector;
