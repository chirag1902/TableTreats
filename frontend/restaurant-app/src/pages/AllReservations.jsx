import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  LogIn,
  AlertCircle,
  Undo,
} from "lucide-react";

export default function AllReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("confirmed");
  const [checkingInId, setCheckingInId] = useState(null);
  const [undoingCheckInId, setUndoingCheckInId] = useState(null);

  useEffect(() => {
    fetchAllReservations();
  }, []);

  const fetchAllReservations = async () => {
    const token = localStorage.getItem("restaurant_token");

    try {
      const response = await fetch(
        "https://tabletreats-restaurantapp.onrender.com/api/restaurant/reservations",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reservationsList = Array.isArray(data)
          ? data
          : data.reservations || [];
        console.log("Fetched reservations:", reservationsList);
        // Log checked_in status for debugging
        reservationsList.forEach((res) => {
          console.log(`${res.customer_name}: checked_in =`, res.checked_in);
        });
        setReservations(reservationsList);
      } else if (response.status === 401) {
        window.location.href = "/signin";
      }
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setError("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (reservationId) => {
    console.log("Check-in button clicked for reservation:", reservationId);

    if (!reservationId) {
      setError("Invalid reservation ID");
      return;
    }

    setError("");
    setSuccess("");
    setCheckingInId(reservationId);

    try {
      const token = localStorage.getItem("restaurant_token");

      const response = await fetch(
        `https://tabletreats-restaurantapp.onrender.com/api/restaurant/reservations/${reservationId}/check-in`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = await response.json();
      console.log("Check-in response:", responseData);

      if (response.ok) {
        setSuccess(`${responseData.customer_name} checked in successfully!`);
        // Update the local state immediately
        setReservations((prevReservations) =>
          prevReservations.map((res) =>
            res.id === reservationId
              ? {
                  ...res,
                  checked_in: true,
                  checked_in_at: new Date().toISOString(),
                }
              : res
          )
        );
        setTimeout(() => setSuccess(""), 3000);
      } else if (response.status === 401) {
        window.location.href = "/signin";
      } else if (
        response.status === 400 &&
        responseData.detail?.includes("already checked in")
      ) {
        // If already checked in, update local state to reflect that
        setReservations((prevReservations) =>
          prevReservations.map((res) =>
            res.id === reservationId ? { ...res, checked_in: true } : res
          )
        );
        setSuccess("Customer is already checked in");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        console.error("Check-in error:", responseData);
        setError(
          responseData.message ||
            responseData.detail ||
            "Failed to check in customer"
        );
        setTimeout(() => setError(""), 4000);
      }
    } catch (err) {
      console.error("Error checking in:", err);
      setError(`An error occurred while checking in: ${err.message}`);
      setTimeout(() => setError(""), 4000);
    } finally {
      setCheckingInId(null);
    }
  };

  const handleUndoCheckIn = async (reservationId) => {
    console.log("Undo check-in for reservation:", reservationId);

    setError("");
    setSuccess("");
    setUndoingCheckInId(reservationId);

    try {
      const token = localStorage.getItem("restaurant_token");

      const response = await fetch(
        `https://tabletreats-restaurantapp.onrender.com/api/restaurant/reservations/${reservationId}/undo-check-in`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setSuccess("Check-in undone successfully!");
        // Update the local state immediately
        setReservations((prevReservations) =>
          prevReservations.map((res) =>
            res.id === reservationId
              ? { ...res, checked_in: false, checked_in_at: null }
              : res
          )
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(
          responseData.message ||
            responseData.detail ||
            "Failed to undo check-in"
        );
        setTimeout(() => setError(""), 4000);
      }
    } catch (err) {
      console.error("Error undoing check-in:", err);
      setError(`An error occurred: ${err.message}`);
      setTimeout(() => setError(""), 4000);
    } finally {
      setUndoingCheckInId(null);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    return filterStatus === "all" || reservation.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  All Reservations
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredReservations.length} reservations found
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setFilterStatus("confirmed")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === "confirmed"
                  ? "bg-green-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus("cancelled")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === "cancelled"
                  ? "bg-red-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No reservations found
            </h3>
            <p className="text-gray-500">
              {filterStatus !== "all"
                ? "Try switching filters"
                : "No reservations have been made yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => {
              const isCheckedIn = reservation.checked_in === true;
              const reservationId = reservation.id || reservation._id;

              return (
                <div
                  key={reservationId}
                  className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${
                    isCheckedIn ? "border-l-4 border-green-500" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {reservation.customer_name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {reservation.customer_name}
                          </h3>
                          {isCheckedIn && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Checked In
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {reservation.customer_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{reservation.customer_email}</span>
                            </div>
                          )}
                          {reservation.customer_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{reservation.customer_phone}</span>
                            </div>
                          )}
                        </div>

                        {reservation.special_requests && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <span className="font-semibold">
                                Special Request:
                              </span>{" "}
                              {reservation.special_requests}
                            </p>
                          </div>
                        )}

                        {isCheckedIn && reservation.checked_in_at && (
                          <div className="mt-2 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700">
                              <span className="font-semibold">
                                Checked in at:
                              </span>{" "}
                              {new Date(
                                reservation.checked_in_at
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-gray-700 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold">
                              {formatDate(reservation.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">
                              {formatTime(reservation.time_slot)}
                            </span>
                          </div>
                        </div>

                        <div className="text-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                          <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <span className="text-lg font-bold text-gray-900">
                            {reservation.number_of_guests}
                          </span>
                          <p className="text-xs text-gray-600">guests</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(
                            reservation.status
                          )}`}
                        >
                          {reservation.status === "confirmed" && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {reservation.status === "cancelled" && (
                            <XCircle className="w-4 h-4" />
                          )}
                          {reservation.status.charAt(0).toUpperCase() +
                            reservation.status.slice(1)}
                        </span>

                        {reservation.status === "confirmed" && (
                          <>
                            {!isCheckedIn ? (
                              <button
                                onClick={() => handleCheckIn(reservationId)}
                                disabled={checkingInId === reservationId}
                                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                              >
                                <LogIn className="w-4 h-4" />
                                {checkingInId === reservationId
                                  ? "Checking in..."
                                  : "Check In"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUndoCheckIn(reservationId)}
                                disabled={undoingCheckInId === reservationId}
                                className="px-4 py-2 bg-gray-500 text-white rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-gray-600 transition-all disabled:opacity-50"
                              >
                                <Undo className="w-4 h-4" />
                                {undoingCheckInId === reservationId
                                  ? "Undoing..."
                                  : "Undo Check-in"}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
