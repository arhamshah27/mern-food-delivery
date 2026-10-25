import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import ImageUpload from "../../components/admin/ImageUpload";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, RotateCcw } from "lucide-react";

const MenuManagement = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [foodType, setFoodType] = useState("all");
  const [availability, setAvailability] = useState("all");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    foodType: "veg",
    preparationTime: "20",
    isPopular: false,
    isAvailable: true,
    addOns: [],
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchFoodsAndMetadata = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (foodType !== "all") params.append("foodType", foodType);
      if (availability === "available") params.append("availableOnly", "true");

      const [foodsRes, catRes, addOnsRes] = await Promise.all([
        axiosInstance.get(`/foods?${params.toString()}`),
        axiosInstance.get("/categories?all=true"),
        axiosInstance.get("/addons"),
      ]);

      if (foodsRes.data.success) setFoods(foodsRes.data.foods);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (addOnsRes.data.success) setAddOns(addOnsRes.data.addOns);
    } catch (err) {
      toast.error("Failed to load menu dishes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodsAndMetadata();
  }, [search, selectedCategory, foodType, availability]);

  const handleOpenAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: "",
      description: "",
      category: categories[0]?._id || "",
      price: "",
      foodType: "veg",
      preparationTime: "20",
      isPopular: false,
      isAvailable: true,
      addOns: [],
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      category: food.category?._id || food.category || "",
      price: food.price.toString(),
      foodType: food.foodType || "veg",
      preparationTime: (food.preparationTime || 20).toString(),
      isPopular: !!food.isPopular,
      isAvailable: !!food.isAvailable,
      addOns: (food.addOns || []).map((a) => a._id || a),
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleToggleAddOn = (addOnId) => {
    setFormData((prev) => {
      const exists = prev.addOns.includes(addOnId);
      return {
        ...prev,
        addOns: exists
          ? prev.addOns.filter((id) => id !== addOnId)
          : [...prev.addOns, addOnId],
      };
    });
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category) {
      toast.error("Dish name, category, and price are required");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("description", formData.description.trim());
      payload.append("category", formData.category);
      payload.append("price", formData.price);
      payload.append("foodType", formData.foodType);
      payload.append("preparationTime", formData.preparationTime);
      payload.append("isPopular", formData.isPopular);
      payload.append("isAvailable", formData.isAvailable);
      payload.append("addOns", JSON.stringify(formData.addOns));

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (editingFood) {
        await axiosInstance.put(`/foods/${editingFood._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Dish updated successfully!");
      } else {
        await axiosInstance.post("/foods", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("New dish added to menu!");
      }

      setIsModalOpen(false);
      fetchFoodsAndMetadata();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save dish");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      await axiosInstance.delete(`/foods/${id}`);
      toast.success("Dish deleted from menu");
      setDeleteConfirmId(null);
      fetchFoodsAndMetadata();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete dish");
    }
  };

  const columns = [
    {
      header: "Dish",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={
              row.image ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80"
            }
            alt={row.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-snug">{row.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {row.category?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (row) => <span className="font-bold text-slate-900 dark:text-white">₹{row.price}</span>,
    },
    {
      header: "Dietary",
      accessor: "foodType",
      render: (row) => <StatusBadge status={row.foodType} />,
    },
    {
      header: "Status",
      accessor: "isAvailable",
      render: (row) => (
        <StatusBadge status={row.isAvailable ? "Available" : "Out of Stock"} />
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit dish"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(row._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete dish"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Menu Management"
        breadcrumbs={["Management", "Dishes"]}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Action Header & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
            />
          </div>

          <Button onClick={handleOpenAddModal} variant="primary" size="md" icon={Plus}>
            Add New Dish
          </Button>
        </div>

        {/* Filter selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
          >
            <option value="all">All Food Types</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
          >
            <option value="all">All Availability Status</option>
            <option value="available">Available In Stock</option>
          </select>
        </div>
      </div>

      {/* Dishes Data Table */}
      <DataTable
        columns={columns}
        data={foods}
        loading={loading}
        emptyMessage="No menu items found"
        emptyDescription="Add a new dish to your restaurant menu."
      />

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingFood ? "Edit Menu Dish" : "Add New Dish"}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveFood} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Dish Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Royal Shahi Paneer"
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
                  required
                >
                  <option value="">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Price (₹)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                placeholder="250"
                required
              />

              <Input
                label="Prep Time (mins)"
                name="preparationTime"
                type="number"
                value={formData.preparationTime}
                onChange={handleFormChange}
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={2}
                placeholder="Describe flavors, aromatic spices, and cooking technique..."
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none resize-none"
                required
              />
            </div>

            {/* Dietary & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Type
                </label>
                <select
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleFormChange}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 outline-none"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-5">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleFormChange}
                  className="w-4 h-4 accent-[#C6A15B] dark:accent-orange-500 rounded"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Popular Dish</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-5">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleFormChange}
                  className="w-4 h-4 accent-[#C6A15B] dark:accent-orange-500 rounded"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">In Stock</span>
              </label>
            </div>

            {/* Add-on Association Selection */}
            {addOns.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Link Add-ons
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                  {addOns.map((addOn) => {
                    const isChecked = formData.addOns.includes(addOn._id);
                    return (
                      <div
                        key={addOn._id}
                        onClick={() => handleToggleAddOn(addOn._id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                          isChecked
                            ? "bg-[#C6A15B]/15 border-[#C6A15B] text-slate-900 dark:text-white"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <p className="font-semibold truncate">{addOn.name}</p>
                        <span className="text-[10px] text-[#8E6E30] dark:text-orange-400">+₹{addOn.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Image Upload Component */}
            <ImageUpload
              currentImageUrl={editingFood?.image}
              onImageSelected={setImageFile}
              label="Dish Photo"
              helperText="Upload clean appetizing dish image"
            />

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={formSubmitting}
              >
                {editingFood ? "Save Changes" : "Create Dish"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirm Deletion"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this dish from your menu? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setDeleteConfirmId(null)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteFood(deleteConfirmId)}
                variant="danger"
                size="md"
              >
                Delete Dish
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MenuManagement;
