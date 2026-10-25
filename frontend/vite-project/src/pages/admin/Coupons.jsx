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
import { Plus, Edit2, Trash2, TicketPercent } from "lucide-react";

const Coupons = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrder: "0",
    expirationDate: "",
    usageLimit: "100",
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/coupons");
      if (data.success) setCoupons(data.coupons);
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minimumOrder: "0",
      expirationDate: defaultDate.toISOString().split("T")[0],
      usageLimit: "100",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue.toString(),
      minimumOrder: (coupon.minimumOrder || 0).toString(),
      expirationDate: new Date(coupon.expirationDate).toISOString().split("T")[0],
      usageLimit: (coupon.usageLimit || 100).toString(),
      isActive: !!coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || formData.discountValue === "" || !formData.expirationDate) {
      toast.error("Coupon code, discount value, and expiration date are required");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minimumOrder: Number(formData.minimumOrder || 0),
        expirationDate: formData.expirationDate,
        usageLimit: Number(formData.usageLimit || 100),
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await axiosInstance.put(`/coupons/${editingCoupon._id}`, payload);
        toast.success("Coupon updated!");
      } else {
        await axiosInstance.post("/coupons", payload);
        toast.success("New coupon created!");
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      setDeleteConfirmId(null);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  const columns = [
    {
      header: "Code",
      accessor: "code",
      render: (row) => (
        <span className="font-mono font-bold text-[#8E6E30] dark:text-orange-400 bg-[#C6A15B]/10 dark:bg-orange-500/10 border border-[#C6A15B]/20 dark:border-orange-500/20 px-2.5 py-1 rounded-lg text-xs">
          {row.code}
        </span>
      ),
    },
    {
      header: "Discount",
      accessor: "discountValue",
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.discountType === "percentage" ? `${row.discountValue}%` : `₹${row.discountValue}`}
        </span>
      ),
    },
    {
      header: "Min Order",
      accessor: "minimumOrder",
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.minimumOrder > 0 ? `₹${row.minimumOrder}` : "None"}
        </span>
      ),
    },
    {
      header: "Redemptions",
      accessor: "usedCount",
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.usedCount || 0} / {row.usageLimit} used
        </span>
      ),
    },
    {
      header: "Expiry Date",
      accessor: "expirationDate",
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(row.expirationDate).toLocaleDateString()}
        </span>
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
            title="Edit coupon"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(row._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete coupon"
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
        title="Promotional Coupons"
        breadcrumbs={["Management", "Coupons"]}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Discounts & Coupon Codes</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create percentage or flat discount vouchers for checkouts.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Create Coupon
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        emptyMessage="No coupons active"
        emptyDescription="Create discount coupons to reward loyal customers."
      />

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCoupon ? "Edit Coupon" : "New Promotional Coupon"}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Coupon Code"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. WELCOME25"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Cash Amount (₹)</option>
                </select>
              </div>

              <Input
                label={formData.discountType === "percentage" ? "Percentage Off (%)" : "Flat Amount (₹)"}
                name="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder="25"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Order (₹)"
                name="minimumOrder"
                type="number"
                value={formData.minimumOrder}
                onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                placeholder="400"
              />

              <Input
                label="Max Usage Limit"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Expiration Date *
              </label>
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
                required
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
                Active & Redeemable at Checkout
              </span>
            </label>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={formSubmitting}>
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Coupon"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this coupon? Customers will no longer be able to redeem it.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setDeleteConfirmId(null)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button onClick={() => handleDelete(deleteConfirmId)} variant="danger" size="md">
                Delete Coupon
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Coupons;
