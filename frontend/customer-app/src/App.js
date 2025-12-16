// src/App.jsx

// Main application component with routing configuration and route protection
// Implements ProtectedRoute wrapper for authenticated pages and PublicRoute for auth pages
// Defines all application routes including landing, dashboard, restaurant details, reservations, profile, and bill pages

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import RestaurantDetails from "./pages/RestaurantDetails";
import MyReservations from "./pages/MyReservations";
import Profile from "./pages/Profile";
import BillPage from "./pages/BillPage"; // NEW IMPORT
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    console.log("ProtectedRoute check:", {
      hasToken: !!token,
      hasUserData: !!userData,
    });

    setIsAuthenticated(!!token && !!userData);
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route wrapper (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("userData");

  if (token && userData) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes - redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute>
              <RestaurantDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute>
              <MyReservations />
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

        {/* NEW BILL ROUTE */}
        <Route
          path="/bill/:reservationId"
          element={
            <ProtectedRoute>
              <BillPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
