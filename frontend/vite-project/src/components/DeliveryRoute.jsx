import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./common/Loader";

const DeliveryRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader text="Connecting to delivery fleet..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Delivery partner pending review check
  if (user.role === "delivery_partner" && (user.status === "pending" || user.status === "rejected")) {
    return <Navigate to="/delivery/pending" replace />;
  }

  if (!["delivery_partner", "rider", "owner", "admin"].includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default DeliveryRoute;
