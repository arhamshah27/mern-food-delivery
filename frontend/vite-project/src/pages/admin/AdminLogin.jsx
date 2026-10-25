import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Shield, Mail, Lock, Store } from "lucide-react";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please provide both email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await login(formData);
      if (data.user?.role !== "admin") {
        toast.error("Access denied: Not an administrator account");
        setError("This account does not have administrator privileges");
        return;
      }
      toast.success("Welcome to Restaurant Administration");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Decorative background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Baroda Gourmet Kitchen Executive Console
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Admin Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@barodagourmet.com"
            icon={Mail}
            required
          />

          <Input
            label="Admin Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2 font-bold shadow-lg shadow-orange-500/25"
          >
            Access Dashboard
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Default credentials for seeded environment: <br />
            <span className="font-semibold text-slate-300">admin@barodagourmet.com</span> /{" "}
            <span className="font-semibold text-slate-300">Admin@123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
