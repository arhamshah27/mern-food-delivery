import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import { Sparkles, ShieldCheck, Lock, Phone, AlertCircle, ArrowRight } from "lucide-react";

const Onboard = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token found in URL. Please use the complete link sent to you.");
      setLoading(false);
      return;
    }

    const checkInvite = async () => {
      try {
        const { data } = await axiosInstance.get(`/onboard/invite/${token}`);
        if (data.success) {
          setInviteData(data.invite);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "This invitation link has expired or is invalid. Please ask the restaurant owner to resend your invite."
        );
      } finally {
        setLoading(false);
      }
    };

    checkInvite();
  }, [token]);

  const handleAccept = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post("/onboard/accept", {
        token,
        password,
        phone,
      });

      if (data.success) {
        toast.success(data.message || "Welcome! Your account is active.");
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        setUser(data.user);
        // Direct new shop manager to admin dashboard
        navigate("/admin/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete account activation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Verifying team invitation..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Invitation Expired or Invalid</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <div className="pt-3">
            <Link to="/login">
              <Button variant="secondary" size="md">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome, {inviteData.name}!
          </h1>
          <p className="text-xs text-slate-400">
            You have been invited to join the kitchen as{" "}
            <strong className="text-orange-400 font-bold uppercase tracking-wider">
              {inviteData.role === "admin" || inviteData.role === "shop_manager" || inviteData.role === "owner"
                ? "Administrator"
                : inviteData.role === "delivery_partner"
                ? "Delivery Rider"
                : inviteData.role}
            </strong>
          </p>
          <p className="text-[11px] text-slate-500">{inviteData.email}</p>
        </div>

        {/* Set Password Form */}
        <form onSubmit={handleAccept} className="space-y-4">
          <Input
            label="Create Secure Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            required
          />

          <Input
            label="Contact Phone Number (Optional)"
            type="tel"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center mt-2"
            disabled={submitting}
            icon={ArrowRight}
          >
            {submitting ? "Activating..." : "Accept Invite & Enter Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboard;
