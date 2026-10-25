import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, ShoppingBag, Plus, Minus, Check, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useCart } from "../../context/CartContext";

const FALLBACK_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80";

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [imgSrc, setImgSrc] = useState(FALLBACK_FOOD_IMAGE);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/foods/${id}`);
        if (data.success) {
          setFood(data.food);
          setImgSrc(data.food.image || FALLBACK_FOOD_IMAGE);
        }
      } catch (err) {
        console.error("Failed to load dish details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDish();
  }, [id]);

  if (loading) {
    return <Loader text="Loading dish details..." />;
  }

  if (!food) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-2">Dish not found</h2>
        <p className="text-slate-400 mb-6">This item may have been removed or is unavailable.</p>
        <Link to="/menu">
          <Button variant="primary">Return to Menu</Button>
        </Link>
      </div>
    );
  }

  const isVeg = food.foodType === "veg";

  const toggleAddOn = (addOn) => {
    if (selectedAddOns.some((item) => item._id === addOn._id)) {
      setSelectedAddOns(selectedAddOns.filter((item) => item._id !== addOn._id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const unitPrice = Number(food.price) + addOnsTotal;
  const grandTotal = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(food, selectedAddOns, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 hover:text-[#C6A15B] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#C6A15B]" /> Back to Royal Menu
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Large Food Image */}
        <div className="relative rounded-3xl overflow-hidden border border-[#C6A15B]/25 bg-[#14151A] shadow-2xl aspect-[4/3] group">
          <img
            src={imgSrc}
            alt={food.name}
            onError={() => setImgSrc(FALLBACK_FOOD_IMAGE)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-black/20" />

          {/* Top Indicators */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center bg-[#08090D]/90 backdrop-blur-md shadow-md ${
                isVeg ? "border-emerald-500/80" : "border-rose-500/80"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${isVeg ? "bg-emerald-500" : "bg-rose-500"}`}
              />
            </div>

            <div className="flex items-center gap-2">
              {!food.isAvailable && (
                <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-950/80 border border-rose-500/40 text-rose-300 backdrop-blur-md shadow">
                  Out of Stock
                </span>
              )}
              {food.isPopular && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C6A15B] text-[#08090D] shadow-lg shadow-[#C6A15B]/20">
                  <Sparkles className="w-3.5 h-3.5 fill-[#08090D]" /> Chef's Special
                </span>
              )}
            </div>
          </div>

          {/* Prep time badge */}
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#08090D]/85 backdrop-blur-md text-xs font-medium text-[#F5F0E6] border border-[#C6A15B]/20">
            <Clock className="w-4 h-4 text-[#C6A15B]" />
            <span>Approx. {food.preparationTime || 20} mins prep</span>
          </div>
        </div>

        {/* Details & Customization Column */}
        <div className="space-y-6">
          <div>
            {food.category?.name && (
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A15B] block mb-1.5">
                {food.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight mb-3">
              {food.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#A5A5AD] leading-relaxed font-light">{food.description}</p>
          </div>

          {/* Pricing Highlight */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Base Portion</span>
              <span className="text-3xl font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3]">₹{food.price}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Preparation</span>
              <span
                className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  isVeg
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                }`}
              >
                {isVeg ? "Pure Vegetarian" : "Non-Vegetarian"}
              </span>
            </div>
          </div>

          {/* Add-ons List */}
          {food.addOns && food.addOns.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F0E6]">
                  Select Accompaniments & Pairings
                </h3>
                <span className="text-xs text-[#8E6E30] dark:text-[#C6A15B] font-medium">Customizable</span>
              </div>

              <div className="space-y-2.5">
                {food.addOns.map((addOn) => {
                  const isChecked = selectedAddOns.some((item) => item._id === addOn._id);
                  return (
                    <div
                      key={addOn._id}
                      onClick={() => toggleAddOn(addOn)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? "bg-[#C6A15B]/15 border-[#C6A15B] text-slate-900 dark:text-[#F5F0E6] shadow-sm"
                          : "bg-white dark:bg-[#14151A] border-slate-200 dark:border-[#C6A15B]/15 text-slate-700 dark:text-[#A5A5AD] hover:border-[#C6A15B]/40 hover:text-slate-900 dark:hover:text-[#F5F0E6]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-[#C6A15B] border-[#C6A15B] text-[#08090D]"
                              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#08090D]"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-[#F5F0E6]">{addOn.name}</p>
                          {addOn.description && (
                            <p className="text-xs text-slate-500 dark:text-[#A5A5AD]">{addOn.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#8E6E30] dark:text-[#E6D3A3] font-serif">+₹{addOn.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Final Total */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#C6A15B]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Portions:</span>
              <div className="flex items-center bg-slate-100 dark:bg-[#08090D] rounded-xl border border-slate-200 dark:border-[#C6A15B]/25 p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#C6A15B] hover:bg-slate-200 dark:hover:bg-[#14151A] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-[#F5F0E6]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#C6A15B] hover:bg-slate-200 dark:hover:bg-[#14151A] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Total Experience</span>
              <span className="text-3xl font-serif font-bold text-[#8E6E30] dark:text-[#E6D3A3]">₹{grandTotal}</span>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!food.isAvailable}
              variant={isAdded ? "outline" : "primary"}
              size="lg"
              className={`flex-1 w-full text-base font-bold py-3.5 shadow-xl transition-all ${
                isAdded
                  ? "!border-emerald-500 !text-emerald-600 dark:!text-emerald-400 bg-emerald-500/10 shadow-emerald-500/20"
                  : "shadow-[#C6A15B]/20"
              }`}
              icon={isAdded ? Check : ShoppingBag}
            >
              {food.isAvailable
                ? isAdded
                  ? `Added ${quantity > 1 ? `(${quantity}) ` : ""}to Cart ✓`
                  : `Add to Cart • ₹${grandTotal}`
                : "Currently Out of Stock"}
            </Button>

            {totalItems > 0 && (
              <Button
                onClick={() => navigate("/cart")}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-sm font-semibold py-3.5 px-5 flex items-center justify-center gap-2"
                icon={ArrowRight}
              >
                <span>View Cart</span>
                <span className="px-2 py-0.5 rounded-full bg-[#8E6E30]/15 text-[#8E6E30] dark:bg-[#C6A15B]/20 dark:text-[#E6D3A3] text-xs font-bold">
                  {totalItems}
                </span>
              </Button>
            )}
          </div>

          {/* Kitchen assurance */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-[#A5A5AD] pt-2">
            <ShieldCheck className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" />
            <span>Handcrafted fresh to order • Served in tamper-proof royal packaging</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
