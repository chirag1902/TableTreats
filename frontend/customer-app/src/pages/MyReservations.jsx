// Customer reservations management page displaying all bookings with filtering and search
// Shows reservation statistics (total, confirmed, upcoming, cancelled) and allows cancellation
// Provides links to pay bills for checked-in reservations and displays reservation details

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
  const [cancelModal, setCancelModal] = useState({
    show: false,
    reservation: null,
  });

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
          r.id === cancelModal.reservation.id
            ? { ...r, status: "cancelled" }
            : r
        )
      );
      setCancelModal({ show: false, reservation: null });
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      alert(err.message || "Failed to cancel reservation. Please try again.");
    }
  };

  const canCancelReservation = (reservation) => {
    if (
      reservation.status === "cancelled" ||
      reservation.status === "completed"
    ) {
      return false;
    }
    const reservationDateTime = new Date(
      `${reservation.date}T${reservation.time_slot}`
    );
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            Loading your reservations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Cancel Reservation?
              </h3>
              <button
                onClick={() =>
                  setCancelModal({ show: false, reservation: null })
                }
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your reservation at{" "}
              <span className="font-semibold">
                {cancelModal.reservation?.restaurant_name}
              </span>
              ?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {cancelModal.reservation?.date}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {cancelModal.reservation?.time_slot}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {cancelModal.reservation?.number_of_guests} guests
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setCancelModal({ show: false, reservation: null })
                }
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleCancelReservation}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Cancel It
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Reservations
          </h1>
          <p className="text-gray-600">View and manage your bookings</p>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Calendar className="w-5 h-5" />
            Book New Table
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-purple-500" />
              <span className="text-sm text-gray-600 font-medium">Total</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">All Reservations</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-sm text-gray-600 font-medium">Active</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.confirmed}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-sm text-gray-600 font-medium">Soon</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Upcoming</p>
            <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-8 h-8 text-red-500" />
              <span className="text-sm text-gray-600 font-medium">
                Cancelled
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Cancelled</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.cancelled}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reservations..."
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

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600 font-semibold">
            {filteredReservations.length} Reservation
            {filteredReservations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No reservations found
            </h3>
            <p className="text-gray-600 mb-6">
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
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {reservation.restaurant_name?.charAt(0) || "R"}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {reservation.restaurant_name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <User className="w-4 h-4" />
                          <span className="text-sm">
                            {reservation.customer_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">
                            {reservation.customer_phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {reservation.special_requests && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Note:</span>{" "}
                          {reservation.special_requests}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Date
                        </p>
                        <p className="font-semibold text-gray-900">
                          {reservation.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Time
                        </p>
                        <p className="font-semibold text-gray-900">
                          {reservation.time_slot}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Guests
                        </p>
                        <p className="font-semibold text-gray-900">
                          {reservation.number_of_guests}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    {reservation.checked_in ? (
                      <>
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm flex items-center gap-2 border-2 border-blue-300">
                          <CheckCircle className="w-4 h-4" />
                          Checked In
                        </span>
                        {reservation.bill && (
                          <>
                            {reservation.bill.paid ? (
                              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm flex items-center gap-2 border-2 border-green-300">
                                <CheckCircle className="w-4 h-4" />
                                Payment Successful
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  navigate(`/bill/${reservation.id}`)
                                }
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2 justify-center"
                              >
                                <CreditCard className="w-4 h-4" />
                                Pay Bill
                              </button>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span
                          className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 border-2 ${getStatusColor(
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
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        ) : (
                          <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-semibold flex items-center gap-2 border-2 border-gray-200 cursor-not-allowed">
                            <X className="w-4 h-4" />
                            Cancel
                          </span>
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
    </div>
  );
}
