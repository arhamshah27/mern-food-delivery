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
import { Plus, Edit2, Trash2 } from "lucide-react";

const Categories = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/categories?all=true");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", isActive: true });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      isActive: !!category.isActive,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("description", formData.description.trim());
      payload.append("isActive", formData.isActive);
      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (editingCategory) {
        await axiosInstance.put(`/categories/${editingCategory._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated successfully!");
      } else {
        await axiosInstance.post("/categories", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category created!");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      toast.success("Category deleted");
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const columns = [
    {
      header: "Category",
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
      header: "Status",
      accessor: "isActive",
      render: (row) => <StatusBadge status={row.isActive ? "Active" : "Inactive"} />,
    },
    {
      header: "Created Date",
      accessor: "createdAt",
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
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
            title="Edit category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(row._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete category"
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
        title="Category Management"
        breadcrumbs={["Management", "Categories"]}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Food Categories</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Organize your dishes for easy customer browsing.</p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories created"
        emptyDescription="Create your first food category to organize dishes."
      />

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? "Edit Category" : "Add New Category"}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Traditional Dum Biryanis"
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
                placeholder="Brief category summary..."
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#C6A15B] dark:accent-orange-500 rounded"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Visible to customers on website
              </span>
            </label>

            <ImageUpload
              currentImageUrl={editingCategory?.image}
              onImageSelected={setImageFile}
              label="Category Banner Image"
              helperText="Upload category thumbnail"
            />

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={formSubmitting}>
                {editingCategory ? "Save Changes" : "Create Category"}
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
          title="Delete Category"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this category? Associated menu items may need re-categorization.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setDeleteConfirmId(null)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button onClick={() => handleDelete(deleteConfirmId)} variant="danger" size="md">
                Delete Category
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Categories;
