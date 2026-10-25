import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";

const AddOns = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [addOns, setAddOns] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true,
    associatedDishes: [],
  });

  const fetchAddOnsAndFoods = async () => {
    setLoading(true);
    try {
      const [addOnsRes, foodsRes] = await Promise.all([
        axiosInstance.get("/addons"),
        axiosInstance.get("/foods"),
      ]);
      if (addOnsRes.data.success) setAddOns(addOnsRes.data.addOns);
      if (foodsRes.data.success) setFoods(foodsRes.data.foods);
    } catch (err) {
      toast.error("Failed to load add-ons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddOnsAndFoods();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddOn(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      isAvailable: true,
      associatedDishes: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addOn) => {
    setEditingAddOn(addOn);
    setFormData({
      name: addOn.name,
      description: addOn.description || "",
      price: addOn.price.toString(),
      isAvailable: !!addOn.isAvailable,
      associatedDishes: (addOn.associatedDishes || []).map((d) => d._id || d),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === "") {
      toast.error("Add-on name and price are required");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        isAvailable: formData.isAvailable,
        associatedDishes: formData.associatedDishes,
      };

      if (editingAddOn) {
        await axiosInstance.put(`/addons/${editingAddOn._id}`, payload);
        toast.success("Add-on updated!");
      } else {
        await axiosInstance.post("/addons", payload);
        toast.success("Add-on created!");
      }

      setIsModalOpen(false);
      fetchAddOnsAndFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save add-on");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/addons/${id}`);
      toast.success("Add-on removed");
      setDeleteConfirmId(null);
      fetchAddOnsAndFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete add-on");
    }
  };

  const columns = [
    {
      header: "Add-On Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{row.description}</p>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (row) => <span className="font-bold text-[#8E6E30] dark:text-orange-400">+₹{row.price}</span>,
    },
    {
      header: "Availability",
      accessor: "isAvailable",
      render: (row) => (
        <StatusBadge status={row.isAvailable ? "Available" : "Out of Stock"} />
      ),
    },
    {
      header: "Associated Dishes",
      accessor: "associatedDishes",
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.associatedDishes?.length ? `${row.associatedDishes.length} dishes linked` : "All/Any Dish"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit add-on"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(row._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete add-on"
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
        title="Add-on Management"
        breadcrumbs={["Management", "Add-ons"]}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Custom Dish Add-ons</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create extra dips, cheese toppings, and accompaniments for meals.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Add Add-on
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={addOns}
        loading={loading}
        emptyMessage="No add-ons created"
        emptyDescription="Create extra sauces or toppings customers can add to meals."
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAddOn ? "Edit Add-on" : "New Add-on Option"}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Add-on Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Extra Desi Ghee"
              required
            />

            <Input
              label="Price (₹)"
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="30"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Brief description of this add-on..."
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-[#C6A15B] dark:accent-orange-500 rounded"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                In Stock & Available to Select
              </span>
            </label>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={formSubmitting}>
                {editingAddOn ? "Save Changes" : "Create Add-on"}
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
          title="Delete Add-on"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this add-on?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setDeleteConfirmId(null)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button onClick={() => handleDelete(deleteConfirmId)} variant="danger" size="md">
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddOns;
