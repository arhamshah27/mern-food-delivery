import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";
import {
  Bike,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const Applications = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  // Inspect Modal
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [rejectModalPartner, setRejectModalPartner] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/admin/staff/partners/applications?status=${statusFilter}`
      );
      if (data.success) {
        setPartners(data.partners);
      }
    } catch (err) {
      toast.error("Failed to load partner applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleApprove = async (partnerId) => {
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.patch(`/admin/staff/partners/${partnerId}/approve`);
      if (data.success) {
        toast.success(data.message || "Partner approved!");
        fetchApplications();
        setSelectedPartner(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve partner");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalPartner) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.patch(
        `/admin/staff/partners/${rejectModalPartner._id}/reject`,
        { reason: rejectReason }
      );
      if (data.success) {
        toast.success(data.message || "Partner rejected");
        fetchApplications();
        setRejectModalPartner(null);
        setSelectedPartner(null);
        setRejectReason("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Applicant",
      accessor: "name",
      render: (row) => (
        <div>
          <span className="font-bold text-white text-xs block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "phone",
      render: (row) => (
        <span className="text-xs text-slate-300 flex items-center gap-1">
          <Phone className="w-3 h-3 text-orange-400" />
          {row.phone || "—"}
        </span>
      ),
    },
    {
      header: "Vehicle & Shift",
      accessor: "deliveryProfile",
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-white capitalize block">
            {row.deliveryProfile?.vehicleType || "bike"} ({row.deliveryProfile?.vehicleNumber || "No plate"})
          </span>
          <span className="text-[10px] text-slate-400 capitalize">
            {row.deliveryProfile?.shift?.replace("_", " ") || "Full Day"}
          </span>
        </div>
      ),
    },
    {
      header: "Applied On",
      accessor: "createdAt",
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
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
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : s === "pending"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
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
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPartner(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Inspect application details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === "pending" && (
            <>
              <button
                onClick={() => handleApprove(row._id)}
                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                title="Approve Partner"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setRejectModalPartner(row);
                  setRejectReason("");
                }}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                title="Reject Partner"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Delivery Partner Applications"
        description="Review driver onboarding applications, verification credentials, and approve active fleet accounts."
        onMenuClick={() => setIsMobileOpen(true)}
      />

      {/* Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex gap-2 shadow-lg">
        {["pending", "active", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
              statusFilter === tab
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "all" ? "All Applications" : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={partners}
        loading={loading}
        emptyMessage={`No ${statusFilter} delivery partner applications found.`}
      />

      {/* Inspect Partner Modal */}
      {selectedPartner && (
        <Modal
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          title={`Application: ${selectedPartner.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            {/* Applicant details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Email Address:</span>
                <span className="font-bold text-white">{selectedPartner.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Number:</span>
                <span className="font-bold text-white">{selectedPartner.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Vehicle:</span>
                <span className="text-white capitalize">
                  {selectedPartner.deliveryProfile?.vehicleType} (
                  {selectedPartner.deliveryProfile?.vehicleNumber || "Unspecified"}
                  )
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Driving Licence #:</span>
                <span className="text-white font-mono">
                  {selectedPartner.deliveryProfile?.licenceNumber || "Pending"}
                </span>
              </div>
            </div>

            {/* Documents preview */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Uploaded Verification Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedPartner.deliveryProfile?.documents?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-800 rounded-xl p-3 bg-slate-950 space-y-2 text-center"
                  >
                    <span className="text-[11px] font-bold text-slate-300 capitalize block">
                      {doc.type.replace("_", " ")}
                    </span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-lg border border-slate-800 group"
                    >
                      <img
                        src={doc.url}
                        alt={doc.type}
                        className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                      />
                    </a>
                    <span className="text-[10px] text-orange-400 hover:underline cursor-pointer block">
                      Click to View Full Size
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <Button onClick={() => setSelectedPartner(null)} variant="secondary" size="md">
                Close
              </Button>
              {selectedPartner.status === "pending" && (
                <>
                  <Button
                    onClick={() => {
                      setRejectModalPartner(selectedPartner);
                      setRejectReason("");
                    }}
                    variant="danger"
                    size="md"
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedPartner._id)}
                    variant="primary"
                    size="md"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Approving..." : "Approve Application"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModalPartner && (
        <Modal
          isOpen={!!rejectModalPartner}
          onClose={() => setRejectModalPartner(null)}
          title={`Reject Application: ${rejectModalPartner.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Provide feedback on why this delivery partner application is being rejected:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Invalid driving license document, blurry image"
              className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-800 focus:border-red-500 outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setRejectModalPartner(null)} variant="secondary" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="danger"
                size="sm"
                disabled={actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Applications;
