import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ImageUpload from "../../components/admin/ImageUpload";
import {
  Mail,
  Lock,
  User,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  Phone,
  FileText,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("customer"); // "customer" or "delivery_partner"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    vehicleType: "bike",
    vehicleNumber: "",
    licenceNumber: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (role === "delivery_partner" && !formData.phone.trim()) {
      errs.phone = "Phone number is required for delivery partners";
    }
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name.trim());
      formPayload.append("email", formData.email.trim().toLowerCase());
      formPayload.append("password", formData.password);
      formPayload.append("role", role);
      if (formData.phone) formPayload.append("phone", formData.phone.trim());

      if (role === "delivery_partner") {
        formPayload.append("vehicleType", formData.vehicleType);
        if (formData.vehicleNumber) formPayload.append("vehicleNumber", formData.vehicleNumber.trim().toUpperCase());
        if (formData.licenceNumber) formPayload.append("licenceNumber", formData.licenceNumber.trim().toUpperCase());
      }

      if (profileImageFile) {
        formPayload.append("profileImage", profileImageFile);
      }

      const res = await register(formPayload);

      if (role === "delivery_partner") {
        toast.success("Welcome to the Delivery Fleet! Your rider account is active.");
        navigate("/delivery", { replace: true });
      } else {
        toast.success("Welcome to Baroda Gourmet! Account created successfully.");
        navigate("/menu", { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/25 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors">
        {/* Decorative Glow */}
        <div
          className={`absolute -top-24 -right-24 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
            role === "delivery_partner" ? "bg-emerald-500/15" : "bg-[#C6A15B]/15"
          }`}
        />

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg transition-all duration-300 border ${
              role === "delivery_partner"
                ? "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white border-emerald-400/40 shadow-emerald-500/30 scale-105"
                : "bg-gradient-to-br from-[#1E202A] to-[#121318] border-[#C6A15B]/40 text-[#E6D3A3] shadow-[#C6A15B]/15"
            }`}
          >
            {role === "delivery_partner" ? (
              <Bike className="w-7 h-7" />
            ) : (
              <UtensilsCrossed className="w-7 h-7 text-[#C6A15B]" />
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#A5A5AD] mt-1 font-sans">
            {role === "delivery_partner"
              ? "Join the Baroda Fleet: deliver hot food, set your shifts, and earn."
              : "Order handcrafted cuisines, explore live menus, and track deliveries."}
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#D8D4CA] mb-2">
            Register As:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Customer Option */}
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 ${
                role === "customer"
                  ? "border-[#C6A15B] bg-[#C6A15B]/10 dark:bg-[#C6A15B]/15 shadow-sm ring-2 ring-[#C6A15B]/25"
                  : "border-slate-200 dark:border-[#232530] bg-slate-50 dark:bg-[#08090D] hover:border-[#C6A15B]/40 opacity-70 hover:opacity-100"
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors ${
                  role === "customer"
                    ? "bg-[#C6A15B] text-[#08090D] shadow-sm font-bold"
                    : "bg-slate-200 dark:bg-[#1A1B23] text-slate-600 dark:text-[#A5A5AD]"
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-serif font-bold text-sm ${
                      role === "customer"
                        ? "text-[#C6A15B] dark:text-[#E6D3A3]"
                        : "text-slate-800 dark:text-[#D8D4CA]"
                    }`}
                  >
                    Customer
                  </span>
                  {role === "customer" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-[#A5A5AD] line-clamp-1 mt-0.5">
                  Order & dine
                </p>
              </div>
            </button>

            {/* Rider Option */}
            <button
              type="button"
              onClick={() => setRole("delivery_partner")}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 ${
                role === "delivery_partner"
                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-sm ring-2 ring-emerald-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 opacity-70 hover:opacity-100"
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors ${
                  role === "delivery_partner"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Bike className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold text-sm ${
                      role === "delivery_partner"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    Delivery Rider
                  </span>
                  {role === "delivery_partner" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  Deliver & earn
                </p>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={role === "delivery_partner" ? "e.g. Ramesh Kumar" : "e.g. Priya Patel"}
            icon={User}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              label={role === "delivery_partner" ? "Phone Number *" : "Phone Number"}
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              icon={Phone}
              error={errors.phone}
              required={role === "delivery_partner"}
            />
          </div>

          {/* Rider Specific Fields */}
          {role === "delivery_partner" && (
            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5" />
                <span>Rider Vehicle & Licence Details</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "bike", label: "Motorcycle" },
                    { value: "scooter", label: "Scooter" },
                    { value: "cycle", label: "Bicycle" },
                  ].map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, vehicleType: v.value })}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        formData.vehicleType === v.value
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="GJ-06-AB-1234"
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Driving Licence No.
                  </label>
                  <input
                    type="text"
                    name="licenceNumber"
                    value={formData.licenceNumber}
                    onChange={handleChange}
                    placeholder="DL-0620240019"
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              icon={Lock}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              icon={Lock}
              error={errors.confirmPassword}
              required
            />
          </div>

          <div className="pt-1">
            <ImageUpload
              label="Profile Photo (Optional)"
              onImageSelected={setProfileImageFile}
              helperText="Upload your avatar image"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className={`w-full mt-4 font-bold shadow-lg transition-all duration-300 ${
              role === "delivery_partner"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25"
                : "bg-gradient-to-r from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] text-[#08090D] hover:brightness-110 shadow-[#C6A15B]/25"
            }`}
          >
            {role === "delivery_partner" ? "Register as Fleet Partner" : "Create Customer Account"}
          </Button>
        </form>

        <p className="text-xs text-center text-[#A5A5AD] mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#C6A15B] font-semibold hover:text-[#E6D3A3] hover:underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
