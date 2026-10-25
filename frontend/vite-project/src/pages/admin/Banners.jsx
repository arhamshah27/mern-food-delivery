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

const Banners = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText: "Order Now",
    buttonLink: "/menu",
    displayOrder: "1",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/banners?all=true");
      if (data.success) setBanners(data.banners);
    } catch (err) {
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      buttonText: "Order Now",
      buttonLink: "/menu",
      displayOrder: "1",
      isActive: true,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "Order Now",
      buttonLink: banner.buttonLink || "/menu",
      displayOrder: (banner.displayOrder || 1).toString(),
      isActive: !!banner.isActive,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Banner title is required");
      return;
    }

    if (!editingBanner && !imageFile) {
      toast.error("Please upload a banner image");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("subtitle", formData.subtitle.trim());
      payload.append("buttonText", formData.buttonText);
      payload.append("buttonLink", formData.buttonLink);
      payload.append("displayOrder", formData.displayOrder);
      payload.append("isActive", formData.isActive);
      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (editingBanner) {
        await axiosInstance.put(`/banners/${editingBanner._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner updated!");
      } else {
        await axiosInstance.post("/banners", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner published!");
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save banner");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/banners/${id}`);
      toast.success("Banner deleted");
      setDeleteConfirmId(null);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete banner");
    }
  };

  const columns = [
    {
      header: "Banner",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={row.title}
            className="w-20 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-snug">{row.title}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{row.subtitle}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Button Target",
      accessor: "buttonLink",
      render: (row) => (
        <span className="text-xs text-[#8E6E30] dark:text-orange-400 font-mono">{row.buttonLink}</span>
      ),
    },
    {
      header: "Order",
      accessor: "displayOrder",
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">#{row.displayOrder || 1}</span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => <StatusBadge status={row.isActive ? "Active" : "Inactive"} />,
    },
    {
      header: "Actions",
      accessor: "_id",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit banner"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(row._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete banner"
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
        title="Banner Management"
        breadcrumbs={["Management", "Banners"]}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Homepage Hero Banners</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showcase seasonal festivals, weekend chef specials, and promotions.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Add Banner
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        loading={loading}
        emptyMessage="No banners configured"
        emptyDescription="Add promotional banners to highlight specials on the customer homepage."
      />

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBanner ? "Edit Hero Banner" : "New Hero Banner"}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Banner Title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Royal Nawabi Feast 20% Off"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Subtitle / Description
              </label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                rows={2}
                placeholder="Delicious details about this special promo..."
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Button Text"
                name="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Order Now"
              />

              <Input
                label="Button Destination URL"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                placeholder="/menu"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Display Order (Sequence)"
                name="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                placeholder="1"
              />

              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 self-end">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#C6A15B] dark:accent-orange-500 rounded"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active On Site</span>
              </label>
            </div>

            <ImageUpload
              currentImageUrl={editingBanner?.image}
              onImageSelected={setImageFile}
              label="Banner Background Image"
              helperText="High-res food photography (approx. 1400x500)"
            />

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={formSubmitting}>
                {editingBanner ? "Save Changes" : "Publish Banner"}
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
          title="Delete Banner"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove this promotional banner from the website?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setDeleteConfirmId(null)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button onClick={() => handleDelete(deleteConfirmId)} variant="danger" size="md">
                Delete Banner
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Banners;
