import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import { Utensils, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/20 shadow-2xl shadow-orange-500/10">
          <Utensils className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-black text-orange-400 block tracking-tight">404</span>
          <h1 className="text-2xl font-black text-white">Page Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            The feast you are looking for isn't on our menu, or this link has wandered off into the kitchen pantry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" icon={Home} className="w-full justify-center">
              Back to Home
            </Button>
          </Link>
          <Link to="/menu" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" icon={Utensils} className="w-full justify-center">
              Explore Menu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
