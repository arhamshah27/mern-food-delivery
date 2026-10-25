import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./common/Loader";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader text="Verifying administrative access..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!["admin", "owner", "shop_manager"].includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default AdminRoute;
