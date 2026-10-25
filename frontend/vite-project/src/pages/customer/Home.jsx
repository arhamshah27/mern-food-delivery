import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Flame, Sparkles, Compass, Search, Utensils, Award, Clock, ShieldCheck, Crown } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import HeroBanner from "../../components/customer/HeroBanner";
import CategoryCard from "../../components/customer/CategoryCard";
import FoodCard from "../../components/customer/FoodCard";
import Modal from "../../components/common/Modal";
import AddOnSelector from "../../components/customer/AddOnSelector";
import { FoodCardSkeleton } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import { useCart } from "../../context/CartContext";

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoodForAddOns, setSelectedFoodForAddOns] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [bannersRes, catRes, popRes, featRes, setRes] = await Promise.all([
          axiosInstance.get("/banners"),
          axiosInstance.get("/categories"),
          axiosInstance.get("/foods?popularOnly=true"),
          axiosInstance.get("/foods?availableOnly=true"),
          axiosInstance.get("/settings"),
        ]);

        if (bannersRes.data.success) setBanners(bannersRes.data.banners);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (popRes.data.success) setPopularDishes(popRes.data.foods);
        if (featRes.data.success) setFeaturedDishes(featRes.data.foods.slice(0, 8));
        if (setRes.data.success) setSettings(setRes.data.settings);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (catId) => {
    navigate(`/menu?category=${catId}`);
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Banner */}
      <HeroBanner banners={banners} settings={settings} />

      {/* 2. Search & Highlights Bar */}
      <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C6A15B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search royal biryanis, tandoor specials, curries..."
            className="w-full bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-[#F5F0E6] placeholder-[#868896] text-sm pl-10 pr-24 py-3 rounded-xl border border-slate-300 dark:border-[#232530] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C6A15B] to-[#9F7E3C] text-[#08090D] font-bold text-xs hover:brightness-110 transition-all shadow-sm"
          >
            Find Dish
          </button>
        </form>

        {/* Operating status & delivery highlights */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-[#A5A5AD]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6A15B] animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-[#F5F0E6]">
              {settings?.isOpen ? "Kitchen is Open" : "Currently Closed"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C6A15B]" />
            <span>Salon Hours: {settings?.openingTime || "10 AM"} - {settings?.closingTime || "11:30 PM"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
            <span>Min Order: ₹{settings?.minimumOrderAmount || 150}</span>
          </div>
        </div>
      </div>

      {/* 3. Food Categories Carousel */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A15B] block mb-1">
              Curated Courses
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
              Explore Our Categories
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-semibold text-[#C6A15B] hover:text-[#E6D3A3] flex items-center gap-1 transition-colors"
          >
            See Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat._id}
                category={cat}
                isSelected={false}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-[#14151A] animate-pulse rounded-2xl border border-slate-300 dark:border-[#232530]" />
            ))}
          </div>
        ) : (
          <EmptyState title="No categories found" description="Categories will appear here once added." />
        )}
      </section>

      {/* 4. Popular Dishes Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#C6A15B] mb-1">
              <Crown className="w-3.5 h-3.5 text-[#C6A15B]" />
              Patron Favorites
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
              Most Celebrated Delicacies
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-semibold text-[#C6A15B] hover:text-[#E6D3A3] flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FoodCardSkeleton />
            <FoodCardSkeleton />
            <FoodCardSkeleton />
            <FoodCardSkeleton />
          </div>
        ) : popularDishes.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularDishes.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                onOpenAddOns={(f) => setSelectedFoodForAddOns(f)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No popular dishes right now"
            description="Explore our complete menu to find delicious choices."
            actionText="Browse Menu"
            onAction={() => navigate("/menu")}
          />
        )}
      </section>

      {/* 5. Featured Chef Specials */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#C6A15B] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
              Mastercraft In Every Bite
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
              Executive Chef&apos;s Collection
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-semibold text-[#C6A15B] hover:text-[#E6D3A3] flex items-center gap-1 transition-colors"
          >
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FoodCardSkeleton />
            <FoodCardSkeleton />
            <FoodCardSkeleton />
            <FoodCardSkeleton />
          </div>
        ) : featuredDishes.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDishes.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                onOpenAddOns={(f) => setSelectedFoodForAddOns(f)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Menu is being refreshed"
            description="Our chefs are preparing new delights. Check back shortly!"
          />
        )}
      </section>

      {/* Add-ons selection modal */}
      {selectedFoodForAddOns && (
        <Modal
          isOpen={!!selectedFoodForAddOns}
          onClose={() => setSelectedFoodForAddOns(null)}
          title={`Customize ${selectedFoodForAddOns.name}`}
        >
          <AddOnSelector
            food={selectedFoodForAddOns}
            onAddToCart={addToCart}
            onClose={() => setSelectedFoodForAddOns(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Home;
