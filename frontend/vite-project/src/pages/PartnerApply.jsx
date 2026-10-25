import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import toast from "react-hot-toast";
import {
  Bike,
  User,
  Mail,
  Phone,
  Lock,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

const PartnerApply = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "bike",
    vehicleNumber: "",
    licenceNumber: "",
    shift: "full_day",
  });

  const [licenceFile, setLicenceFile] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((k) => data.append(k, formData[k]));
      if (licenceFile) data.append("licence", licenceFile);
      if (idFile) data.append("id_proof", idFile);
      if (photoFile) data.append("photo", photoFile);

      const res = await axiosInstance.post("/onboard/partner/apply", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Application submitted successfully!");
        if (res.data.token) {
          localStorage.setItem("authToken", res.data.token);
        }
        if (res.data.user) {
          setUser(res.data.user);
        }
        navigate("/delivery/pending");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit partner application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#C6A15B]/10 dark:bg-orange-500/10 text-[#8E6E30] dark:text-orange-400 flex items-center justify-center mx-auto border border-[#C6A15B]/20 dark:border-orange-500/20 shadow-xl shadow-[#C6A15B]/10 dark:shadow-orange-500/10">
            <Bike className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Join Our Delivery Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Flexible shifts, daily payout perks, and instant onboarding. Deliver gourmet meals across Vadodara.
          </p>
        </div>

        {/* Application Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6"
        >
          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E6E30] dark:text-orange-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              1. Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ramesh Patel"
                icon={User}
                required
              />
              <Input
                label="Email Address *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@gmail.com"
                icon={Mail}
                required
              />
              <Input
                label="Mobile Phone *"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                icon={Phone}
                required
              />
              <Input
                label="Choose Password *"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                icon={Lock}
                required
              />
            </div>
          </div>

          {/* Vehicle & Shift Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E6E30] dark:text-orange-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              2. Vehicle & Availability
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
                >
                  <option value="bike">Motorcycle (Bike)</option>
                  <option value="scooter">Scooter (Activa / EV)</option>
                  <option value="cycle">Bicycle</option>
                </select>
              </div>

              <Input
                label="Vehicle Registration Number"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="GJ-06-AB-1234"
              />

              <Input
                label="Driving Licence Number"
                name="licenceNumber"
                value={formData.licenceNumber}
                onChange={handleChange}
                placeholder="GJ0620210001234"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Shift
                </label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
                >
                  <option value="full_day">Full Day (10 AM - 10 PM)</option>
                  <option value="morning">Morning Shift (10 AM - 4 PM)</option>
                  <option value="evening">Evening Dinner Peak (5 PM - 11 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Verification */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E6E30] dark:text-orange-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              3. Verification Documents (Optional or upload now)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-center cursor-pointer hover:border-[#C6A15B]/50 dark:hover:border-orange-500/50 bg-slate-50 dark:bg-slate-950/50 transition-colors block">
                <UploadCloud className="w-5 h-5 text-[#8E6E30] dark:text-orange-400 mx-auto mb-1.5" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Driving Licence</span>
                <span className="text-[10px] text-slate-500">
                  {licenceFile ? licenceFile.name : "Choose File"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLicenceFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <label className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-center cursor-pointer hover:border-[#C6A15B]/50 dark:hover:border-orange-500/50 bg-slate-50 dark:bg-slate-950/50 transition-colors block">
                <FileText className="w-5 h-5 text-[#8E6E30] dark:text-orange-400 mx-auto mb-1.5" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Aadhaar / ID</span>
                <span className="text-[10px] text-slate-500">
                  {idFile ? idFile.name : "Choose File"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <label className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-center cursor-pointer hover:border-[#C6A15B]/50 dark:hover:border-orange-500/50 bg-slate-50 dark:bg-slate-950/50 transition-colors block">
                <User className="w-5 h-5 text-[#8E6E30] dark:text-orange-400 mx-auto mb-1.5" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Selfie Photo</span>
                <span className="text-[10px] text-slate-500">
                  {photoFile ? photoFile.name : "Choose File"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            disabled={submitting}
            icon={ArrowRight}
          >
            {submitting ? "Submitting Application..." : "Submit Partner Application"}
          </Button>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400">
            Already applied or registered?{" "}
            <Link to="/login" className="text-[#8E6E30] dark:text-orange-400 hover:opacity-80 font-semibold">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PartnerApply;
