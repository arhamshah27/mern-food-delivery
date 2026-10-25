import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Mail, Lock, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(formData);
      toast.success("Welcome back to Baroda Gourmet!");
      if (data.user?.role === "admin" || data.user?.role === "owner" || data.user?.role === "shop_manager") {
        navigate(from !== "/" ? from : "/admin/dashboard", { replace: true });
      } else if (data.user?.role === "delivery_partner" || data.user?.role === "rider") {
        navigate(from !== "/" ? from : "/delivery", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/25 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors">
        {/* Ambient gold glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#C6A15B]/10 blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E202A] to-[#121318] border border-[#C6A15B]/40 flex items-center justify-center text-[#E6D3A3] mx-auto mb-4 shadow-lg shadow-[#C6A15B]/15">
            <UtensilsCrossed className="w-7 h-7 text-[#C6A15B]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-[#A5A5AD] mt-1 font-sans">
            Sign in to track orders, save addresses, and enjoy privileges.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={Lock}
            error={errors.password}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-3 font-bold shadow-lg shadow-[#C6A15B]/20"
          >
            Sign In to Order
          </Button>
        </form>

        <p className="text-xs text-center text-[#A5A5AD] mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-[#C6A15B] font-semibold hover:text-[#E6D3A3] transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
