import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Mail,
  MapPin,
  ChevronLeft,
  Download,
  TrendingUp,
  DollarSign,
  User,
} from "lucide-react";

export default function RestaurantReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchReservations = async () => {
      // Simulate API call
      setTimeout(() => {
        const mockReservations = [
          {
            id: 1,
            customerName: "John Smith",
            email: "john.smith@email.com",
            phone: "(732) 555-0101",
            date: "2025-01-15",
            time: "19:00",
            guests: 4,
            status: "confirmed",
            specialRequests: "Window seat preferred",
            createdAt: "2025-01-10T10:30:00",
          },
          {
            id: 2,
            customerName: "Sarah Johnson",
            email: "sarah.j@email.com",
            phone: "(732) 555-0102",
            date: "2025-01-15",
            time: "19:30",
            guests: 2,
            status: "pending",
            specialRequests: "Anniversary celebration",
            createdAt: "2025-01-14T15:20:00",
          },
          {
            id: 3,
            customerName: "Mike Davis",
            email: "mike.davis@email.com",
            phone: "(732) 555-0103",
            date: "2025-01-15",
            time: "20:00",
            guests: 6,
            status: "confirmed",
            specialRequests: "High chair needed",
            createdAt: "2025-01-12T09:15:00",
          },
          {
            id: 4,
            customerName: "Emily Wilson",
            email: "emily.w@email.com",
            phone: "(732) 555-0104",
            date: "2025-01-15",
            time: "20:30",
            guests: 3,
            status: "pending",
            specialRequests: "",
            createdAt: "2025-01-14T18:45:00",
          },
          {
            id: 5,
            customerName: "Robert Brown",
            email: "robert.b@email.com",
            phone: "(732) 555-0105",
            date: "2025-01-15",
            time: "18:00",
            guests: 5,
            status: "cancelled",
            specialRequests: "Outdoor seating",
            createdAt: "2025-01-11T14:30:00",
          },
          {
            id: 6,
            customerName: "Lisa Anderson",
            email: "lisa.a@email.com",
            phone: "(732) 555-0106",
            date: "2025-01-16",
            time: "19:00",
            guests: 2,
            status: "confirmed",
            specialRequests: "Gluten-free options",
            createdAt: "2025-01-13T11:20:00",
          },
          {
            id: 7,
            customerName: "David Martinez",
            email: "david.m@email.com",
            phone: "(732) 555-0107",
            date: "2025-01-16",
            time: "20:00",
            guests: 8,
            status: "pending",
            specialRequests: "Birthday celebration - need cake service",
            createdAt: "2025-01-14T16:10:00",
          },
          {
            id: 8,
            customerName: "Jennifer Lee",
            email: "jennifer.lee@email.com",
            phone: "(732) 555-0108",
            date: "2025-01-14",
            time: "19:00",
            guests: 4,
            status: "completed",
            specialRequests: "",
            createdAt: "2025-01-10T08:45:00",
          },
        ];
        setReservations(mockReservations);
        setFilteredReservations(mockReservations);
        setLoading(false);
      }, 1000);
    };

    fetchReservations();
  }, []);

  // Filter reservations
  useEffect(() => {
    let filtered = reservations;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Date filter
    const today = new Date().toISOString().split("T")[0];
    if (dateFilter === "today") {
      filtered = filtered.filter((r) => r.date === today);
    } else if (dateFilter === "upcoming") {
      filtered = filtered.filter((r) => r.date >= today);
    } else if (dateFilter === "past") {
      filtered = filtered.filter((r) => r.date < today);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.phone.includes(searchQuery)
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, statusFilter, dateFilter, searchQuery]);

  const handleStatusChange = (id, newStatus) => {
    setReservations(
      reservations.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
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
    switch (status) {
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

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    pending: reservations.filter((r) => r.status === "pending").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
    totalGuests: reservations
      .filter((r) => r.status === "confirmed")
      .reduce((sum, r) => sum + r.guests, 0),
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
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
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
                  Reservations
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your table bookings
                </p>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-semibold">
                Total
              </span>
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
                +{stats.confirmed}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Confirmed</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.confirmed}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-yellow-600 font-semibold">
                Pending
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Awaiting Response</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-purple-600 font-semibold">
                Guests
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Expected Guests</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalGuests}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
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

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservations List */}
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
              <p className="text-gray-500">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {reservation.customerName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {reservation.customerName}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {reservation.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {reservation.phone}
                            </div>
                          </div>
                          {reservation.specialRequests && (
                            <p className="text-sm text-gray-600 italic">
                              Note: {reservation.specialRequests}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reservation Details */}
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
                            {reservation.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-xs text-gray-500">Guests</div>
                          <div className="font-semibold">
                            {reservation.guests}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold border-2 flex items-center gap-2 justify-center ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {getStatusIcon(reservation.status)}
                        {reservation.status.charAt(0).toUpperCase() +
                          reservation.status.slice(1)}
                      </span>

                      {reservation.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleStatusChange(reservation.id, "confirmed")
                            }
                            className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="w-5 h-5 mx-auto" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(reservation.id, "cancelled")
                            }
                            className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-5 h-5 mx-auto" />
                          </button>
                        </div>
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
