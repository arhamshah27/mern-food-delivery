import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";
import {
  Search,
  Eye,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  Receipt,
  AlertCircle,
  Filter,
  UserCheck,
  Bike,
} from "lucide-react";

const VALID_STATUSES = [
  "Placed",
  "Preparing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

const Orders = () => {
  const { setIsMobileOpen } = useOutletContext();

  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Inspect Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // Assign Partner Modal
  const [assignModalOrder, setAssignModalOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);

      const { data } = await axiosInstance.get(`/orders?${params.toString()}`);
      if (data.success) {
        setOrders(data.orders);
        if (selectedOrder) {
          const updated = data.orders.find((o) => o._id === selectedOrder._id);
          if (updated) setSelectedOrder(updated);
        }
      }
    } catch (err) {
      if (!silent) toast.error("Failed to fetch orders");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const { data } = await axiosInstance.get("/orders/partners/available");
      if (data.success) {
        setPartners(data.partners);
      }
    } catch (err) {
      console.warn("Could not load delivery partners", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPartners();

    // 10 second auto-polling to ensure live order updates per spec
    const timer = setInterval(() => {
      fetchOrders(true);
      fetchPartners();
    }, 10000);

    return () => clearInterval(timer);
  }, [search, statusFilter, dateFilter]);

  const handleStatusChange = async (orderId, newStatus, reason = "") => {
    if (newStatus === "Cancelled" && !reason) {
      const orderToCancel = orders.find((o) => o._id === orderId);
      setCancelModalOrder(orderToCancel);
      return;
    }

    const targetOrder = orders.find((o) => o._id === orderId);
    if (newStatus === "Out for delivery" && !targetOrder?.assignedPartner && !targetOrder?.delivery?.partner) {
      toast.error("Please assign a delivery partner before marking Out for Delivery");
      setAssignModalOrder(targetOrder);
      return;
    }

    setStatusUpdating(true);
    try {
      const { data } = await axiosInstance.put(`/orders/${orderId}/status`, {
        status: newStatus,
        cancelledReason: reason,
      });

      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.order : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(data.order);
        }
        setCancelModalOrder(null);
        setCancelReason("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignPartner = async () => {
    if (!assignModalOrder || !selectedPartnerId) return;
    setAssigning(true);
    try {
      const { data } = await axiosInstance.patch(`/orders/${assignModalOrder._id}/assign`, {
        partnerId: selectedPartnerId,
      });
      if (data.success) {
        toast.success(data.message || "Partner assigned successfully");
        setOrders((prev) =>
          prev.map((o) => (o._id === assignModalOrder._id ? data.order : o))
        );
        if (selectedOrder && selectedOrder._id === assignModalOrder._id) {
          setSelectedOrder(data.order);
        }
        setAssignModalOrder(null);
        setSelectedPartnerId("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign partner");
    } finally {
      setAssigning(false);
    }
  };

  const columns = [
    {
      header: "Order ID",
      accessor: "orderNumber",
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-white text-xs tracking-tight">
          {row.orderNumber}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: "customerDetails",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs">{row.customerDetails?.name}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#8E6E30] dark:text-orange-400" />
            {row.customerDetails?.phone}
          </p>
        </div>
      ),
    },
    {
      header: "Items",
      accessor: "items",
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          {row.items?.length || 0} items ({row.items?.reduce((sum, i) => sum + i.quantity, 0)} qty)
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: "totalAmount",
      render: (row) => (
        <div>
          <span className="font-black text-[#8E6E30] dark:text-orange-400 text-sm">₹{row.totalAmount}</span>
          <span className="text-[10px] text-slate-500 block">({row.paymentMethod})</span>
        </div>
      ),
    },
    {
      header: "Partner",
      accessor: "assignedPartner",
      render: (row) => {
        const partner = row.assignedPartner;
        if (partner) {
          return (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <Bike className="w-3.5 h-3.5" />
              <span>{partner.name}</span>
            </div>
          );
        }
        if (["Placed", "Preparing", "placed", "preparing"].includes(row.status)) {
          return (
            <button
              onClick={() => {
                setAssignModalOrder(row);
                setSelectedPartnerId("");
              }}
              className="text-[11px] font-semibold text-[#8E6E30] dark:text-orange-400 hover:underline"
            >
              + Assign Partner
            </button>
          );
        }
        return <span className="text-xs text-slate-500">—</span>;
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const getStatusStyles = (status) => {
          switch (status) {
            case "Delivered":
              return "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-400";
            case "Cancelled":
              return "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:border-rose-500/40 dark:text-rose-400";
            case "Out for delivery":
              return "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:border-purple-500/40 dark:text-purple-400";
            case "Preparing":
              return "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-400";
            case "Placed":
            default:
              return "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:border-blue-500/40 dark:text-blue-400";
          }
        };

        return (
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row._id, e.target.value)}
            disabled={statusUpdating || row.status === "Cancelled" || row.status === "Delivered"}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border outline-none transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm ${getStatusStyles(
              row.status
            )}`}
          >
            {VALID_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                {st}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      header: "Actions",
      accessor: "_id",
      render: (row) => (
        <button
          onClick={() => setSelectedOrder(row)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          title="Inspect full order receipt"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Orders Management"
        description="Live view of customer incoming feast orders, partner dispatch, and kitchen preparation stages."
        onMenuClick={() => setIsMobileOpen(true)}
        action={
          <Button
            onClick={() => {
              fetchOrders();
              fetchPartners();
            }}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
          >
            Refresh
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm dark:shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, name, or phone..."
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#C6A15B] dark:focus:border-orange-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-[#8E6E30] dark:text-orange-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Orders</option>
              {VALID_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 outline-none cursor-pointer"
          />

          {(search || statusFilter !== "all" || dateFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setDateFilter("");
              }}
              className="text-xs text-[#8E6E30] dark:text-orange-400 hover:opacity-80 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found matching the filter criteria."
      />

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            {/* Customer Details */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Customer Details</span>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.customerDetails?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Contact Phone:</span>
                  <span className="text-slate-900 dark:text-white">{selectedOrder.customerDetails?.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 block">Delivery Address:</span>
                  <span className="text-slate-900 dark:text-white">{selectedOrder.customerDetails?.deliveryAddress}</span>
                </div>
              </div>

              {selectedOrder.customerDetails?.specialInstructions && (
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  Note: {selectedOrder.customerDetails.specialInstructions}
                </p>
              )}
            </div>

            {/* Delivery Partner Info */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Assigned Delivery Partner
                </span>
                {selectedOrder.assignedPartner ? (
                  <div className="text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedOrder.assignedPartner.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">({selectedOrder.assignedPartner.phone || "Active"})</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">No partner assigned yet</span>
                )}
              </div>
              {["Placed", "Preparing", "placed", "preparing"].includes(selectedOrder.status) && (
                <Button
                  onClick={() => {
                    setAssignModalOrder(selectedOrder);
                    setSelectedPartnerId("");
                  }}
                  variant="secondary"
                  size="sm"
                  icon={Bike}
                >
                  {selectedOrder.assignedPartner ? "Reassign" : "Assign Partner"}
                </Button>
              )}
            </div>

            {/* Dishes list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Items In This Order
              </h4>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {item.quantity}x {item.name}
                      </p>
                      {item.selectedAddOns?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.selectedAddOns.map((a, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-transparent"
                            >
                              +{a.name} (₹{a.price})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">₹{item.itemTotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill breakdown */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount ({selectedOrder.couponCode})</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Taxes</span>
                <span>₹{selectedOrder.tax}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Delivery Charge</span>
                <span>₹{selectedOrder.deliveryCharge}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-xl font-black text-[#8E6E30] dark:text-orange-400">
                  ₹{selectedOrder.totalAmount}
                </span>
              </div>
            </div>

            {/* Update Status Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Change Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {VALID_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={() => setSelectedOrder(null)} variant="secondary" size="md">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Partner Assignment Modal */}
      {assignModalOrder && (
        <Modal
          isOpen={!!assignModalOrder}
          onClose={() => setAssignModalOrder(null)}
          title={`Assign Delivery Partner: Order #${assignModalOrder.orderNumber}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Select an active delivery partner for this order:
            </p>
            {partners.length === 0 ? (
              <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                No active delivery partners found. Add or approve partners in Staff management.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {partners.map((p) => (
                  <label
                    key={p._id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPartnerId === p._id
                        ? "border-[#C6A15B] bg-[#C6A15B]/10 dark:border-orange-500 dark:bg-orange-500/10"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="partner"
                        value={p._id}
                        checked={selectedPartnerId === p._id}
                        onChange={() => setSelectedPartnerId(p._id)}
                        className="text-[#8E6E30] dark:text-orange-500 focus:ring-[#C6A15B]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{p.phone || p.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      {p.activeOrderCount || 0} active orders
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setAssignModalOrder(null)} variant="secondary" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleAssignPartner}
                disabled={!selectedPartnerId || assigning}
                variant="primary"
                size="sm"
              >
                {assigning ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <Modal
          isOpen={!!cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          title="Confirm Order Cancellation"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel order #{cancelModalOrder.orderNumber}? Please specify a reason.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
              placeholder="e.g. Out of stock ingredients or delivery out of area"
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setCancelModalOrder(null)} variant="secondary" size="sm">
                Back
              </Button>
              <Button
                onClick={() =>
                  handleStatusChange(cancelModalOrder._id, "Cancelled", cancelReason || "Cancelled by restaurant")
                }
                variant="danger"
                size="sm"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
