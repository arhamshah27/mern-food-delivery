import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineCamera,
    HiOutlineTrash,
    HiOutlinePencil,
    HiOutlineCheck,
    HiOutlineX,
} from "react-icons/hi";
import toast from "react-hot-toast";

const Profile = () => {
    const { user, updateUser, logout } = useAuth();

    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ── Update name / email ───────────────────────────────────────────
    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            toast.error("Name and email are required");
            return;
        }
        setSaving(true);
        try {
            const { data } = await axiosInstance.put("/users/profile", formData);
            updateUser(data.user);
            setEditing(false);
            toast.success("Profile updated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ name: user?.name || "", email: user?.email || "" });
        setEditing(false);
    };

    // ── Image upload ──────────────────────────────────────────────────
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(file.type)) {
            toast.error("Only JPEG, PNG, WebP, and GIF images are allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5 MB");
            return;
        }

        setUploadingImage(true);
        try {
            const fd = new FormData();
            fd.append("profileImage", file);
            const { data } = await axiosInstance.put("/users/profile/image", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            updateUser(data.user);
            toast.success("Profile image updated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Image upload failed");
        } finally {
            setUploadingImage(false);
        }
    };

    // ── Delete account ────────────────────────────────────────────────
    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await axiosInstance.delete("/users/account");
            toast.success("Account deleted");
            await logout();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            {/* Decorative blurs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 right-1/3 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-2xl font-bold text-white">My Profile</h1>

                {/* Avatar Card */}
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-5 sm:flex-row">
                        {/* Avatar with upload overlay */}
                        <div className="group relative">
                            <div className="h-28 w-28 overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/20">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-4xl font-bold text-white">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100"
                            >
                                {uploadingImage ? (
                                    <svg
                                        className="h-6 w-6 animate-spin text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                ) : (
                                    <HiOutlineCamera className="h-6 w-6 text-white" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                            <p className="text-sm text-white/50">{user?.email}</p>
                            <p className="mt-1 text-xs text-white/30">
                                Joined{" "}
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })
                                    : "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Card */}
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">
                            Profile Information
                        </h2>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 rounded-xl bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-400 transition-colors hover:bg-violet-500/20"
                            >
                                <HiOutlinePencil className="h-4 w-4" />
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/50">
                                Full Name
                            </label>
                            <div className="relative">
                                <HiOutlineUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                <input
                                    id="profile-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none transition-all ${editing
                                            ? "border-white/10 bg-white/5 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                            : "border-transparent bg-white/[0.03] cursor-default"
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/50">
                                Email Address
                            </label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                <input
                                    id="profile-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none transition-all ${editing
                                            ? "border-white/10 bg-white/5 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                            : "border-transparent bg-white/[0.03] cursor-default"
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save / Cancel buttons */}
                    {editing && (
                        <div className="mt-5 flex gap-3">
                            <button
                                id="profile-save"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110 disabled:opacity-50"
                            >
                                <HiOutlineCheck className="h-4 w-4" />
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/15"
                            >
                                <HiOutlineX className="h-4 w-4" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Danger Zone */}
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
                    <h2 className="mb-2 text-lg font-semibold text-red-400">
                        Danger Zone
                    </h2>
                    <p className="mb-4 text-sm text-red-300/60">
                        Permanently delete your account and all associated data. This action
                        cannot be undone.
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                        <HiOutlineTrash className="h-4 w-4" />
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white">Delete Account?</h3>
                        <p className="mt-2 text-sm text-white/50">
                            This will permanently remove your account, profile image, and all
                            data. You cannot undo this.
                        </p>
                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/15"
                            >
                                Cancel
                            </button>
                            <button
                                id="confirm-delete"
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? "Deleting…" : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
