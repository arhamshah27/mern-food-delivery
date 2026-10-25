import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context Providers
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Route Guards & Layouts
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DeliveryRoute from "./components/DeliveryRoute";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Customer Pages
import Home from "./pages/customer/Home";
import Menu from "./pages/customer/Menu";
import FoodDetails from "./pages/customer/FoodDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";
import OrderDetails from "./pages/customer/OrderDetails";
import Profile from "./pages/customer/Profile";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";

// Onboarding & Fleet Application Pages
import Onboard from "./pages/Onboard";
import PartnerApply from "./pages/PartnerApply";
import DeliveryHome from "./pages/delivery/DeliveryHome";
import DeliveryOrder from "./pages/delivery/DeliveryOrder";
import PendingReview from "./pages/delivery/PendingReview";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import MenuManagement from "./pages/admin/MenuManagement";
import Categories from "./pages/admin/Categories";
import AddOns from "./pages/admin/AddOns";
import Banners from "./pages/admin/Banners";
import Orders from "./pages/admin/Orders";
import Coupons from "./pages/admin/Coupons";
import Settings from "./pages/admin/Settings";
import Staff from "./pages/admin/Staff";
import Applications from "./pages/admin/Applications";
import LiveFleetMap from "./pages/admin/LiveFleetMap";

// System & Error Pages
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import ScrollToTop from "./components/common/ScrollToTop";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#0f172a",
                  color: "#f8fafc",
                  border: "1px solid #1e293b",
                  borderRadius: "16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                },
                success: {
                  iconTheme: { primary: "#f97316", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
              }}
            />

            <Routes>
              {/* Customer Facing Routes (within CustomerLayout) */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/food/:id" element={<FoodDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Protected Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Onboarding & Fleet Partner Public & Portal Routes */}
              <Route path="/onboard" element={<Onboard />} />
              <Route path="/partner/apply" element={<PartnerApply />} />
              <Route path="/delivery/pending" element={<PendingReview />} />

              {/* Delivery Partner Protected Portal Routes */}
              <Route
                path="/delivery"
                element={
                  <DeliveryRoute>
                    <DeliveryHome />
                  </DeliveryRoute>
                }
              />
              <Route
                path="/delivery/orders/:id"
                element={
                  <DeliveryRoute>
                    <DeliveryOrder />
                  </DeliveryRoute>
                }
              />

              {/* Admin Standalone Auth */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Management Dashboard Routes (protected by AdminRoute) */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="fleet" element={<LiveFleetMap />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="categories" element={<Categories />} />
                <Route path="addons" element={<AddOns />} />
                <Route path="banners" element={<Banners />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="staff" element={<Staff />} />
                <Route path="applications" element={<Applications />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Access Error & 404 Routes */}
              <Route path="/403" element={<Forbidden />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;