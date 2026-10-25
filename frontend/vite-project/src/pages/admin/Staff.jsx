import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Bike,
  Mail,
  Phone,
  Copy,
  Check,
  RefreshCw,
  Power,
  Search,
} from "lucide-react";

const Staff = () => {
  const { setIsMobileOpen } = useOutletContext();
  const { user: currentUser } = useAuth();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'admin', 'delivery_partner'
  const [search, setSearch] = useState("");

  // Invite Admin Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", phone: "" });
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviting, setInviting] = useState(false);

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "owner";

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.append("role", activeTab);
      if (search.trim()) params.append("search", search.trim());

      const { data } = await axiosInstance.get(`/admin/staff?${params.toString()}`);
      if (data.success) {
        setStaff(data.staff);
      }
    } catch (err) {
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [activeTab, search]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) {
      toast.error("Name and email are required");
      return;
    }

    setInviting(true);
    try {
      const { data } = await axiosInstance.post("/admin/staff/invite", inviteForm);
      if (data.success) {
        setGeneratedInviteUrl(data.inviteUrl);
        toast.success("Manager invited! Copy the link below.");
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate invite");
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedInviteUrl) return;
    navigator.clipboard.writeText(generatedInviteUrl);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === "active" ? "suspended" : "active";
    try {
      const { data } = await axiosInstance.patch(`/admin/staff/${member._id}/status`, {
        status: nextStatus,
      });
      if (data.success) {
        toast.success(data.message);
        setStaff((prev) =>
          prev.map((s) => (s._id === member._id ? { ...s, status: nextStatus } : s))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  const handleResendInvite = async (memberId) => {
    try {
      const { data } = await axiosInstance.post(`/admin/staff/${memberId}/resend-invite`);
      if (data.success) {
        setGeneratedInviteUrl(data.inviteUrl);
        setIsInviteOpen(true);
        toast.success("Fresh invitation link generated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend invite");
    }
  };

  const columns = [
    {
      header: "Staff Member",
      accessor: "name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white text-xs block">{row.name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      render: (row) => {
        const isRider = row.role === "delivery_partner" || row.role === "rider";
        const isAdm = row.role === "admin" || row.role === "owner" || row.role === "shop_manager";

        return (
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 w-fit ${
              isAdm
                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            }`}
          >
            {isAdm ? <ShieldCheck className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
            {isAdm ? "Admin" : "Delivery Rider"}
          </span>
        );
      },
    },
    {
      header: "Phone",
      accessor: "phone",
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.phone || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const s = row.status;
        return (
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              s === "active"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : s === "invited"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : s === "suspended"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessor: "_id",
      render: (row) => {
        // Can't modify self
        const isSelf = String(row._id) === String(currentUser?._id);
        const canManage = isAdmin;

        if (isSelf || !canManage) return <span className="text-xs text-slate-400 dark:text-slate-600">—</span>;

        return (
          <div className="flex items-center gap-2">
            {row.status === "invited" && isAdmin && (
              <button
                onClick={() => handleResendInvite(row._id)}
                className="text-[11px] font-semibold text-[#8E6E30] dark:text-orange-400 hover:opacity-80 underline"
              >
                Resend Link
              </button>
            )}

            {["active", "suspended"].includes(row.status) && (
              <Button
                onClick={() => handleToggleStatus(row)}
                variant={row.status === "active" ? "danger" : "secondary"}
                size="sm"
                className="text-[11px] py-1 px-2.5"
              >
                {row.status === "active" ? "Suspend" : "Activate"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Staff & Crew Management"
        description="Directory of administrators and active delivery riders."
        onMenuClick={() => setIsMobileOpen(true)}
        action={
          isAdmin ? (
            <Button
              onClick={() => {
                setGeneratedInviteUrl("");
                setInviteForm({ name: "", email: "", phone: "" });
                setIsInviteOpen(true);
              }}
              variant="primary"
              size="sm"
              icon={UserPlus}
            >
              Invite Admin
            </Button>
          ) : null
        }
      />

      {/* Role Tabs & Search */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm dark:shadow-lg">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-[#C6A15B] dark:bg-orange-500 text-white shadow-md shadow-[#C6A15B]/20 dark:shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            All Staff
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "admin"
                ? "bg-[#C6A15B] dark:bg-orange-500 text-white shadow-md shadow-[#C6A15B]/20 dark:shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setActiveTab("delivery_partner")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "delivery_partner"
                ? "bg-[#C6A15B] dark:bg-orange-500 text-white shadow-md shadow-[#C6A15B]/20 dark:shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Delivery Riders
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or email..."
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Staff Table */}
      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        emptyMessage="No staff members found matching filter."
      />

      {/* Invite Admin Modal */}
      {isInviteOpen && (
        <Modal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          title="Invite Administrator"
          maxWidth="max-w-md"
        >
          {generatedInviteUrl ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <Check className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Invitation Link Generated!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Share this secure single-use link with the new administrator. It will expire in 48 hours.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-mono select-all">
                  {generatedInviteUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-[#C6A15B] hover:bg-[#B38C44] dark:bg-orange-500 dark:hover:bg-orange-600 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="pt-2">
                <Button onClick={() => setIsInviteOpen(false)} variant="secondary" size="md" className="w-full justify-center">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <Input
                label="Candidate Name *"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                placeholder="Priya Sharma"
                required
              />
              <Input
                label="Email Address *"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="priya@barodagourmet.com"
                required
              />
              <Input
                label="Phone (Optional)"
                type="tel"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                placeholder="9876543210"
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button onClick={() => setIsInviteOpen(false)} variant="secondary" size="sm">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={inviting}>
                  {inviting ? "Generating..." : "Generate Invite Link"}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Staff;
