import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react";

const Forbidden = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-2xl shadow-red-500/10">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-black text-red-400 block tracking-tight">403</span>
          <h1 className="text-2xl font-black text-white">Access Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            You do not have administrative or crew clearance to access this portal. Please log in with authorized staff credentials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" icon={Home} className="w-full justify-center">
              Return Home
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="md" icon={LogIn} className="w-full justify-center">
              Staff Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
