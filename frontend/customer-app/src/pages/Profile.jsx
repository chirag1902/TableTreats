// src/pages/Profile.jsx

// Customer profile page showing user information and membership tier based on reservation count
// Displays quick stats (total bookings, confirmed, upcoming) and recent reservation history
// Includes membership progress tracking and quick action buttons for booking and viewing reservations

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Mail,
  Calendar,
  Award,
  Clock,
  ArrowLeft,
  Star,
  TrendingUp,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { getMyReservations } from "../services/api";
import { logout } from "../services/authService";
import logoImage from "../assets/logo.png";

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userDataStr);
      setUserData(user);
      fetchReservations();
    } catch (err) {
      console.error("Error parsing user data:", err);
      navigate("/login");
    }
  }, [navigate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError(err.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getMembershipTier = (reservationCount) => {
    if (reservationCount >= 20)
      return {
        name: "Platinum",
        color: "from-gray-400 to-gray-600",
        icon: "💎",
        nextTier: null,
        needed: 0,
      };
    if (reservationCount >= 10)
      return {
        name: "Gold",
        color: "from-yellow-400 to-yellow-600",
        icon: "🥇",
        nextTier: "Platinum",
        needed: 20 - reservationCount,
      };
    if (reservationCount >= 5)
      return {
        name: "Silver",
        color: "from-gray-300 to-gray-500",
        icon: "🥈",
        nextTier: "Gold",
        needed: 10 - reservationCount,
      };
    return {
      name: "Bronze",
      color: "from-orange-400 to-orange-600",
      icon: "🥉",
      nextTier: "Silver",
      needed: 5 - reservationCount,
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const membershipInfo = getMembershipTier(reservations.length);
  const today = new Date().toISOString().split("T")[0];
  const upcomingReservations = reservations.filter(
    (r) => r.date >= today && r.status?.toLowerCase() !== "cancelled"
  );
  const confirmedReservations = reservations.filter(
    (r) => r.status?.toLowerCase() === "confirmed"
  );
  const recentReservations = reservations.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">
                Back to Dashboard
              </span>
            </button>

            <div className="flex items-center gap-2">
              <img
                src={logoImage}
                alt="TableTreats Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                TableTreats
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <User className="w-16 h-16 text-purple-600" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userData?.full_name || userData?.name || "Guest User"}
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 text-gray-600">
                  {userData?.email && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Mail className="w-4 h-4" />
                      <span>{userData.email}</span>
                    </div>
                  )}
                  {(userData?.location || userData?.city) && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <MapPin className="w-4 h-4" />
                      <span>{userData.location || userData.city}</span>
                    </div>
                  )}
                  {userData?.role && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Award className="w-4 h-4" />
                      <span className="capitalize">{userData.role}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Membership & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Membership Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Membership</h2>
              </div>

              <div
                className={`bg-gradient-to-br ${membershipInfo.color} rounded-xl p-6 text-white mb-4`}
              >
                <div className="text-4xl mb-2">{membershipInfo.icon}</div>
                <div className="text-2xl font-bold mb-1">
                  {membershipInfo.name}
                </div>
                <div className="text-sm opacity-90">
                  Member ID: #{userData?.id?.slice(-6) || "000000"}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Reservations</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {reservations.length}
                  </span>
                </div>

                {membershipInfo.nextTier && (
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Next: {membershipInfo.nextTier}</span>
                      <span className="font-semibold">
                        {membershipInfo.needed} more
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (reservations.length /
                              (reservations.length + membershipInfo.needed)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Total Bookings</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    {reservations.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Confirmed</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {confirmedReservations.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Upcoming</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {upcomingReservations.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all"
                >
                  <span className="font-medium text-gray-700">
                    Book New Table
                  </span>
                  <ChevronRight className="w-5 h-5 text-purple-500" />
                </button>
                <button
                  onClick={() => navigate("/my-reservations")}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all"
                >
                  <span className="font-medium text-gray-700">
                    View All Reservations
                  </span>
                  <ChevronRight className="w-5 h-5 text-purple-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Reservations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Reservations
                  </h2>
                </div>
                <button
                  onClick={() => navigate("/my-reservations")}
                  className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-600 text-center">{error}</p>
                </div>
              )}

              {recentReservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No reservations yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start exploring restaurants and make your first reservation!
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    Browse Restaurants
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      onClick={() => navigate("/my-reservations")}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-500 transition-all hover:shadow-md cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {reservation.restaurant_name?.charAt(0) || "R"}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {reservation.restaurant_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {reservation.customer_name}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${
                            reservation.status?.toLowerCase() === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : reservation.status?.toLowerCase() ===
                                "cancelled"
                              ? "bg-red-100 text-red-700"
                              : reservation.status?.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(reservation.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{reservation.time_slot}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{reservation.number_of_guests} guests</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reservations.length > 3 && (
                    <button
                      onClick={() => navigate("/my-reservations")}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 font-semibold transition-all"
                    >
                      View {reservations.length - 3} More Reservations
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
