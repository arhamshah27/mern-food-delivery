import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import toast from "react-hot-toast";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await login(formData);
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4">
            {/* Decorative orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-violet-500/5 backdrop-blur-xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                            <span className="text-2xl font-bold text-white">B</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                        <p className="mt-1 text-sm text-white/50">
                            Sign in to your BarodaWeb account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/70">
                                Email
                            </label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                <input
                                    id="login-email"
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
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
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

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    Signing in…
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-white/40">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-violet-400 transition-colors hover:text-violet-300"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
