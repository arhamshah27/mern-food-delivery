import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AdminHeader from "../../components/admin/AdminHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { Save, Store, Clock, IndianRupee, ShieldCheck } from "lucide-react";

const Settings = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    restaurantName: "",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    openingTime: "10:00 AM",
    closingTime: "11:30 PM",
    workingDays: "Monday - Sunday",
    isOpen: true,
    deliveryCharge: 40,
    taxPercentage: 5,
    minimumOrderAmount: 150,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/settings");
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        toast.error("Failed to load restaurant settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axiosInstance.put("/settings", settings);
      if (data.success) {
        setSettings(data.settings);
        toast.success("Restaurant settings updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Loading restaurant configuration..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminHeader
        title="Restaurant Settings"
        breadcrumbs={["Management", "Settings"]}
        setIsMobileOpen={setIsMobileOpen}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Status Toggle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Ordering Status</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instantly toggle online orders on or off for the customer website.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isOpen"
              checked={settings.isOpen}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* General Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#8E6E30] dark:text-orange-400" />
            Restaurant Identity & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Restaurant Brand Name"
              name="restaurantName"
              value={settings.restaurantName}
              onChange={handleChange}
              placeholder="Baroda Gourmet Kitchen"
              required
            />

            <Input
              label="Brand Tagline"
              name="tagline"
              value={settings.tagline}
              onChange={handleChange}
              placeholder="Fresh flavors delivered to your doorstep"
            />

            <Input
              label="Support Phone"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
            />

            <Input
              label="Support Email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
              placeholder="order@barodagourmet.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Physical Restaurant Address
            </label>
            <textarea
              name="address"
              value={settings.address}
              onChange={handleChange}
              rows={2}
              placeholder="Kitchen street address..."
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700/80 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8E6E30] dark:text-orange-400" />
            Operating Timings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Kitchen Opening Time"
              name="openingTime"
              value={settings.openingTime}
              onChange={handleChange}
              placeholder="10:00 AM"
            />

            <Input
              label="Kitchen Closing Time"
              name="closingTime"
              value={settings.closingTime}
              onChange={handleChange}
              placeholder="11:30 PM"
            />

            <Input
              label="Working Days"
              name="workingDays"
              value={settings.workingDays}
              onChange={handleChange}
              placeholder="Monday - Sunday"
            />
          </div>
        </div>

        {/* Delivery & Billing Fees */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-[#8E6E30] dark:text-orange-400" />
            Delivery & Tax Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Delivery Fee (₹)"
              name="deliveryCharge"
              type="number"
              value={settings.deliveryCharge}
              onChange={handleChange}
              placeholder="40"
              required
            />

            <Input
              label="Free Delivery Above (₹)"
              name="freeDeliveryAbove"
              type="number"
              value={settings.freeDeliveryAbove ?? 499}
              onChange={handleChange}
              placeholder="499"
            />

            <Input
              label="GST / Packaging Tax (%)"
              name="taxPercentage"
              type="number"
              value={settings.taxPercentage}
              onChange={handleChange}
              placeholder="5"
              required
            />

            <Input
              label="Delivery Radius (km)"
              name="deliveryRadiusKm"
              type="number"
              value={settings.deliveryRadiusKm ?? 12}
              onChange={handleChange}
              placeholder="12"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[#C6A15B]/40 dark:hover:border-orange-500/40 transition-colors">
              <input
                type="checkbox"
                name="onlinePaymentEnabled"
                checked={settings.onlinePaymentEnabled !== false}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#8E6E30] dark:text-orange-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-[#C6A15B]"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Enable Online Payments (Razorpay / UPI)</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Allows customer to pay online during checkout</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[#C6A15B]/40 dark:hover:border-orange-500/40 transition-colors">
              <input
                type="checkbox"
                name="codEnabled"
                checked={settings.codEnabled !== false}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#8E6E30] dark:text-orange-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-[#C6A15B]"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Enable Cash on Delivery (COD)</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Allows customer to pay in cash upon arrival</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            icon={Save}
            className="shadow-xl shadow-orange-500/25"
          >
            Save Restaurant Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
