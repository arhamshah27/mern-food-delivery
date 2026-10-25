import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import { Clock, AlertCircle, ArrowLeft, RefreshCw, LogOut } from "lucide-react";

const PendingReview = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isRejected = user?.status === "rejected";
  const rejectionReason = user?.deliveryProfile?.rejectionReason;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl text-center space-y-6">
        {/* Status Icon */}
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border ${
            isRejected
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse"
          }`}
        >
          {isRejected ? <AlertCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isRejected ? "Application Not Approved" : "Application Under Review"}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isRejected
              ? "Your application for delivery partner was not approved by our operations team."
              : "Thank you for applying to Baroda Gourmet! Our restaurant managers are currently verifying your driving documents."}
          </p>
        </div>

        {/* Reason or Timeline info */}
        {isRejected ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-700 dark:text-red-300 text-left">
            <span className="font-bold block text-red-800 dark:text-red-400 mb-1">Feedback:</span>
            {rejectionReason || "Please verify your driving license and registration details."}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-700 dark:text-slate-300 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
              <span className="font-bold text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Pending Verification
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Estimated Review Time:</span>
              <span className="text-slate-900 dark:text-slate-200 font-semibold">2 to 4 hours</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {isRejected ? (
            <Link to="/partner/apply">
              <Button variant="primary" size="md" className="w-full justify-center">
                Re-apply with Updated Documents
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              size="md"
              icon={RefreshCw}
              className="w-full justify-center"
            >
              Check Status Again
            </Button>
          )}

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            icon={LogOut}
            className="w-full justify-center text-slate-400"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PendingReview;
