import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, User, Users, 
  CheckCircle, XCircle, Phone, Mail, MapPin
} from 'lucide-react';
import axios from 'axios';

export default function AllReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('confirmed');

  useEffect(() => {
    fetchAllReservations();
  }, []);

  const fetchAllReservations = async () => {
    const token = localStorage.getItem('restaurant_token');
    
    try {
      const { data } = await axios.get(
        'http://localhost:8001/api/restaurant/reservations',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('All Reservations:', data);
      
      // Handle different response structures
      const reservationsList = Array.isArray(data) ? data : data.reservations || [];
      setReservations(reservationsList);
      
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    return filterStatus === 'all' || reservation.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Reservations</h1>
                <p className="text-sm text-gray-500">{filteredReservations.length} reservations found</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'confirmed'
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'cancelled'
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No reservations found</h3>
            <p className="text-gray-500">
              {filterStatus !== 'all'
                ? 'Try switching filters'
                : 'No reservations have been made yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {reservation.customer_name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {reservation.customer_name}
                      </h3>
                      
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
                            <span className="font-semibold">Special Request:</span> {reservation.special_requests}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="flex flex-col md:items-end gap-3">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-700 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-semibold">{formatDate(reservation.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">{reservation.time_slot}</span>
                        </div>
                      </div>

                      <div className="text-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                        <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <span className="text-lg font-bold text-gray-900">{reservation.number_of_guests}</span>
                        <p className="text-xs text-gray-600">guests</p>
                      </div>
                    </div>

                    <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(reservation.status)}`}>
                      {reservation.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                      {reservation.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}