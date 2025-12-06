import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyReservations, cancelReservation } from "../services/api";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  ChevronLeft,
  Star,
  User,
  CreditCard,
  X,
} from "lucide-react";

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [cancelModal, setCancelModal] = useState({ show: false, reservation: null });

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await getMyReservations();
        setReservations(data);
        setFilteredReservations(data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch reservations:", err);
        setError("Failed to load reservations. Please try again.");
        setReservations([]);
        setFilteredReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  useEffect(() => {
    let filtered = reservations;

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    const today = new Date().toISOString().split("T")[0];
    if (dateFilter === "today") {
      filtered = filtered.filter((r) => r.date === today);
    } else if (dateFilter === "upcoming") {
      filtered = filtered.filter(
        (r) => r.date >= today && r.status !== "cancelled"
      );
    } else if (dateFilter === "past") {
      filtered = filtered.filter((r) => r.date < today);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.restaurant_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          r.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.customer_phone?.includes(searchQuery)
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, statusFilter, dateFilter, searchQuery]);

  const handleCancelReservation = async () => {
    if (!cancelModal.reservation) return;

    try {
      await cancelReservation(cancelModal.reservation.id);

      setReservations(
        reservations.map((r) =>
          r.id === cancelModal.reservation.id ? { ...r, status: "cancelled" } : r
        )
      );

      setCancelModal({ show: false, reservation: null });
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      alert(err.message || "Failed to cancel reservation. Please try again.");
    }
  };

  const canCancelReservation = (reservation) => {
    if (reservation.status === "cancelled" || reservation.status === "completed") {
      return false;
    }

    const reservationDateTime = new Date(`${reservation.date}T${reservation.time_slot}`);
    const now = new Date();
    
    return reservationDateTime > now;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(
      (r) => r.status?.toLowerCase() === "confirmed"
    ).length,
    upcoming: reservations.filter(
      (r) => r.date >= today && r.status?.toLowerCase() !== "cancelled"
    ).length,
    cancelled: reservations.filter(
      (r) => r.status?.toLowerCase() === "cancelled"
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel Reservation?</h3>
              <button
                onClick={() => setCancelModal({ show: false, reservation: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your reservation at{" "}
                <span className="font-semibold">{cancelModal.reservation?.restaurant_name}</span>?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{cancelModal.reservation?.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{cancelModal.reservation?.time_slot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{cancelModal.reservation?.number_of_guests} guests</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ show: false, reservation: null })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleCancelReservation}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel It
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Reservations
                </h1>
                <p className="text-sm text-gray-500">
                  View and manage your bookings
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Book New Table</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-yellow-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 font-semibold">Total</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">All Reservations</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-semibold">
                Active
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Confirmed</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.confirmed}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-purple-600 font-semibold">
                Soon
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Upcoming</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-red-600 font-semibold">
                Cancelled
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Cancelled</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.cancelled}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search restaurants or reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredReservations.length} Reservation
              {filteredReservations.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No reservations found
              </h3>
              <p className="text-gray-500 mb-6">
                {reservations.length === 0
                  ? "You haven't made any reservations yet"
                  : "Try adjusting your filters or search query"}
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {reservation.restaurant_name?.charAt(0) || "R"}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {reservation.restaurant_name}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {reservation.customer_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {reservation.customer_phone}
                            </div>
                          </div>
                          {reservation.special_requests && (
                            <p className="text-sm text-gray-600 italic">
                              Note: {reservation.special_requests}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 lg:gap-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-pink-500" />
                        <div>
                          <div className="text-xs text-gray-500">Date</div>
                          <div className="font-semibold">
                            {reservation.date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="text-xs text-gray-500">Time</div>
                          <div className="font-semibold">
                            {reservation.time_slot}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-xs text-gray-500">Guests</div>
                          <div className="font-semibold">
                            {reservation.number_of_guests}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {reservation.checked_in ? (
                        <>
                          <span className="px-4 py-2 rounded-full text-sm font-semibold border-2 flex items-center gap-2 justify-center bg-purple-100 text-purple-700 border-purple-300">
                            <CheckCircle className="w-4 h-4" />
                            Checked In
                          </span>
                          {reservation.bill && (
                            <button
                              onClick={() => navigate(`/bill/${reservation.id}`)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2 justify-center"
                            >
                              <CreditCard className="w-4 h-4" />
                              Pay Bill
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 flex items-center gap-2 justify-center ${getStatusColor(
                              reservation.status
                            )}`}
                          >
                            {getStatusIcon(reservation.status)}
                            {reservation.status?.charAt(0).toUpperCase() +
                              reservation.status?.slice(1)}
                          </span>

                          {canCancelReservation(reservation) ? (
                            <button
                              onClick={() =>
                                setCancelModal({ show: true, reservation })
                              }
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold flex items-center gap-2 justify-center"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-semibold flex items-center gap-2 justify-center"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}