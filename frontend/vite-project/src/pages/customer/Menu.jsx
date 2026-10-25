import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import FoodCard from "../../components/customer/FoodCard";
import FoodFilters from "../../components/customer/FoodFilters";
import { FoodCardSkeleton } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import AddOnSelector from "../../components/customer/AddOnSelector";
import { useCart } from "../../context/CartContext";
import { Utensils } from "lucide-react";

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [foodType, setFoodType] = useState(searchParams.get("type") || "all");

  const [selectedFoodForAddOns, setSelectedFoodForAddOns] = useState(null);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosInstance.get("/categories");
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Sync URL search params with state
  useEffect(() => {
    const queryCat = searchParams.get("category");
    const querySearch = searchParams.get("search");
    const queryType = searchParams.get("type");

    if (queryCat) setSelectedCategory(queryCat);
    if (querySearch) setSearch(querySearch);
    if (queryType) setFoodType(queryType);
  }, [searchParams]);

  // Fetch foods with filters
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "all") params.append("category", selectedCategory);
        if (foodType !== "all") params.append("foodType", foodType);
        if (search.trim()) params.append("search", search.trim());

        const { data } = await axiosInstance.get(`/foods?${params.toString()}`);
        if (data.success) {
          setFoods(data.foods);
        }
      } catch (err) {
        console.error("Failed to fetch foods", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchFoods();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, foodType, search]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setFoodType("all");
    setSearchParams({});
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Royal Centered Header */}
      <div className="text-center max-w-3xl mx-auto pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 text-[#E6D3A3] text-xs font-bold uppercase tracking-widest mb-3 shadow-lg shadow-[#C6A15B]/10">
          <Utensils className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Royal Culinary Salon</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight mb-3">
          Discover Our{" "}
          <span className="gold-text italic font-normal">
            Signature Menu
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-[#A5A5AD] max-w-2xl mx-auto leading-relaxed font-sans">
          Crafted with passion using handpicked whole spices, fresh garden herbs, and century-old culinary traditions.
        </p>
      </div>

      {/* 2. Centered Filter Hub */}
      <FoodFilters
        search={search}
        setSearch={setSearch}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={(catId) => {
          setSelectedCategory(catId);
          setSearchParams((prev) => {
            if (catId === "all") prev.delete("category");
            else prev.set("category", catId);
            return prev;
          });
        }}
        foodType={foodType}
        setFoodType={(type) => {
          setFoodType(type);
          setSearchParams((prev) => {
            if (type === "all") prev.delete("type");
            else prev.set("type", type);
            return prev;
          });
        }}
        onReset={handleResetFilters}
        totalResults={foods.length}
      />

      {/* 3. Centered Food Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      ) : foods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {foods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onOpenAddOns={(f) => setSelectedFoodForAddOns(f)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Utensils}
          title="No culinary matches found"
          description="We couldn't find any dishes matching your selected filters. Try searching for something else."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Add-ons Customization Modal */}
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

export default Menu;
