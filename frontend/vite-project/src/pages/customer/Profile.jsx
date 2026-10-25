import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ImageUpload from "../../components/admin/ImageUpload";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, Camera, Save, Shield } from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axiosInstance.put("/users/profile", formData);
      if (data.success) {
        updateUser(data.user);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const imageFormData = new FormData();
      imageFormData.append("profileImage", file);
      const { data } = await axiosInstance.put("/users/profile/image", imageFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        updateUser(data.user);
        toast.success("Profile photo updated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="pb-4 border-b border-[#C6A15B]/20">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A15B] block mb-1">
          Patron Profile
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
          My Account Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A5AD] mt-1">
          Manage your personal details, dietary preferences, and default delivery destinations.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Top Avatar Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-[#C6A15B]/15">
          <div className="relative group">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-[#C6A15B]/50 shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] flex items-center justify-center text-3xl font-serif font-bold text-[#08090D] shadow-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-[#F5F0E6]">{user?.name}</h2>
              {user?.role === "admin" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#08090D] bg-[#C6A15B] px-2.5 py-0.5 rounded-full shadow-sm">
                  <Shield className="w-3 h-3 fill-[#08090D]" /> Royal Steward (Admin)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-[#A5A5AD] mt-1">{user?.email}</p>

            {/* Quick avatar upload */}
            <div className="mt-3">
              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#08090D] border border-slate-300 dark:border-[#C6A15B]/25 hover:border-[#C6A15B] text-xs font-semibold text-slate-800 dark:text-[#E6D3A3] hover:text-slate-900 dark:hover:text-[#F5F0E6] cursor-pointer transition-colors shadow-inner">
                <Camera className="w-3.5 h-3.5 text-[#8E6E30] dark:text-[#C6A15B]" />
                {uploadingImage ? "Uploading..." : "Change Portrait"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">
                Edit Details
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              icon={Mail}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              icon={Phone}
              placeholder="e.g. 98765 43210"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#F5F0E6] mb-1.5">
                Default Residence / Delivery Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows={2}
                placeholder="House/Villa no., street, landmark, area"
                className={`w-full bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-[#F5F0E6] placeholder-slate-400 text-sm p-3 rounded-xl border border-slate-300 dark:border-[#C6A15B]/25 outline-none resize-none transition-all ${
                  isEditing ? "focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B]/30" : "opacity-60 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-slate-200 dark:border-[#C6A15B]/15 flex justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={saving}
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
