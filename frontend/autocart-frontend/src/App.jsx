import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

import BrandModels from "./pages/customer/BrandModels";
import VehicleDetails from "./pages/customer/VehicleDetails";
import VariantSelection from "./pages/customer/VariantSelection";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/customer/Profile";
import ChangePassword from "./pages/customer/ChangePassword";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setUser, logout, setLoading } from "./redux/slices/authSlice";
import { getCurrentUser } from "./services/authService";

import PaymentPage from "./pages/customer/PaymentPage";
import MyTestDrives from "./pages/customer/MyTestDrives";
import MyEnquiries from "./pages/customer/MyEnquiries";

import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import FloatingAiChatbot from "./components/ai/FloatingAiChatbot";

function App() {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const data = await getCurrentUser();
        dispatch(setUser(data));
      } catch (error) {
        // Logout only if /auth/me returns 401
        if (error.response?.status === 401) {
          dispatch(logout());
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <>
      {!hideNavbar && (
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard searchTerm={searchTerm} />}
        />

        <Route
          path="/brands/:brandId"
          element={<BrandModels />}
        />

        <Route
          path="/vehicle/:variantId"
          element={<VehicleDetails />}
        />

        <Route
          path="/models/:modelId"
          element={<VariantSelection />}
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
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

        <Route
          path="/my-test-drives"
          element={
            <ProtectedRoute>
              <MyTestDrives />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyEnquiries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      <FloatingAiChatbot />
    </>
  );
}

export default App;
