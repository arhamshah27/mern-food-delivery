import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineUser,
    HiOutlinePhotograph,
} from "react-icons/hi";
import toast from "react-hot-toast";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(file.type)) {
            toast.error("Only JPEG, PNG, WebP, and GIF images are allowed");
            return;
        }

        // Validate file size (5 MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5 MB");
            return;
        }

        setProfileImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("password", formData.password);
            if (profileImage) {
                data.append("profileImage", profileImage);
            }

            await register(data);
            toast.success("Account created successfully!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4 py-12">
            {/* Decorative orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-violet-500/5 backdrop-blur-xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/30">
                            <span className="text-2xl font-bold text-white">B</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="mt-1 text-sm text-white/50">
                            Join BarodaWeb today
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Profile Image Upload */}
                        <div className="flex justify-center">
                            <label
                                htmlFor="profileImage"
                                className="group relative cursor-pointer"
                            >
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-white/5 transition-all duration-200 group-hover:border-violet-500/50 group-hover:bg-white/10">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <HiOutlinePhotograph className="mx-auto h-8 w-8 text-white/30" />
                                            <span className="mt-1 block text-xs text-white/30">
                                                Photo
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="profileImage"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/70">
                                Full Name
                            </label>
                            <div className="relative">
                                <HiOutlineUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                <input
                                    id="register-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/70">
                                Email
                            </label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                <input
                                    id="register-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/70">
                                Password
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min 6 characters"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                >
                                    {showPassword ? (
                                        <HiOutlineEyeOff className="h-5 w-5" />
                                    ) : (
                                        <HiOutlineEye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/70">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                <input
                                    id="register-confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
                                    Creating account…
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-white/40">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-violet-400 transition-colors hover:text-violet-300"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
