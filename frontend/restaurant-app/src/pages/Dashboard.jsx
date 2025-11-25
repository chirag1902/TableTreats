import React, { useState, useEffect, useRef } from 'react';
import { getRestaurantProfile , getTodayReservations} from '../api/restaurant';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, User, LogOut, Star, Calendar, 
  DollarSign, Users, TrendingUp, Edit, Clock,
  CheckCircle, XCircle, Package, ImagePlus, Image, Phone, Armchair, RefreshCw
} from 'lucide-react';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [restaurantData, setRestaurantData] = useState(null);
  const [todayReservations, setTodayReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryType, setGalleryType] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const intervalRef = useRef(null);

  // Function to fetch data
  const fetchRestaurantData = async (isPolling = false) => {
    if (isPolling) {
      setIsRefreshing(true);
    }

    const token = localStorage.getItem('restaurant_token');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      console.log('🔍 Fetching restaurant data...');
      
      const [profileData, reservationsData] = await Promise.all([
        getRestaurantProfile(),
        getTodayReservations()
      ]);
      
      console.log('📊 Profile Data:', profileData);
      console.log('📅 Today Reservations Data:', reservationsData);
      
      setRestaurantData(profileData);
      
      if (reservationsData) {
        const reservations = Array.isArray(reservationsData) 
          ? reservationsData 
          : reservationsData.reservations || [];
        
        console.log('✅ Setting reservations:', reservations);
        console.log('📊 Number of reservations:', reservations.length);
        
        setTodayReservations(reservations);
      } else {
        console.warn('⚠️ No reservations data received');
        setTodayReservations([]);
      }
      
      if (!profileData.isOnboarded) {
        navigate('/onboarding');
      }

      setLastRefreshTime(new Date());
      
    } catch (error) {
      console.error('❌ Failed to fetch restaurant data:', error);
      console.error('Error details:', error.message);
      
      if (!isPolling) {
        // Only set fallback data on initial load, not on polling
        setRestaurantData({
          name: "Your Restaurant",
          email: localStorage.getItem('restaurant_email') || "restaurant@example.com",
          thumbnail: null,
          address: "123 Main Street",
          city: "New Brunswick",
          zipcode: "08901",
          phone: "(732) 555-0123",
          cuisine: ["American"],
          features: ["Outdoor Seating", "WiFi"],
          ambiancePhotos: [],
          menuPhotos: [],
          rating: 4.8,
          totalReviews: 0,
          isOnboarded: false
        });
        
        setTodayReservations([]);
      }
      
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRestaurantData();
  }, [navigate]);

  // Set up polling - refresh every 2 minutes (120000ms)
  useEffect(() => {
    const POLLING_INTERVAL = 2 * 60 * 1000; // 2 minutes

    intervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing reservation data...');
      fetchRestaurantData(true);
    }, POLLING_INTERVAL);

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual refresh button
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchRestaurantData(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('restaurant_token');
    localStorage.removeItem('restaurant_email');
    // Clean up interval on logout
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    navigate('/signin');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const openGallery = (type) => {
    setGalleryType(type);
    setShowImageGallery(true);
  };

  const stats = [
    {
      title: "Today's Reservations",
      value: todayReservations.length.toString(),
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      title: "This Week's Revenue",
      value: "$3,450",
      change: "+15%",
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      title: "Total Customers",
      value: "1,234",
      change: "+23%",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      title: "Average Rating",
      value: restaurantData?.rating?.toString() || "4.8",
      change: "+0.2",
      icon: Star,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50"
    }
  ];

  const quickActions = [
    {
      title: "Edit Profile",
      description: "Update restaurant info, photos, hours",
      icon: Edit,
      gradient: "from-pink-500 to-purple-600",
      action: handleEditProfile
    },
    {
      title: "Seating Configuration",
      description: "Configure table arrangements",
      icon: Armchair,
      gradient: "from-indigo-500 to-purple-500",
      action: () => navigate('/seating-configuration')
    },
    {
      title: "Menu Management",
      description: "Update menu items and prices",
      icon: Package,
      gradient: "from-green-500 to-teal-500",
      action: () => navigate('/menu')
    },
    {
      title: "Create Deal",
      description: "Launch flash deals & happy hours",
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500",
      action: () => navigate('/deals')
    }
  ];

  const recentReservations = todayReservations.slice(0, 4).map(reservation => ({
    id: reservation._id,
    name: reservation.customer_name,
    time: reservation.time_slot,
    guests: reservation.number_of_guests,
    status: reservation.status
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurantData?.isOnboarded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🍽️</span>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to TableTreats Partner!
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Let's set up your restaurant profile so customers can discover and book your tables.
          </p>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">You'll need to provide:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                Restaurant details (address, phone, hours)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Photos (thumbnail, ambiance, menu cards)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                Cuisine types and special features
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Operating hours for each day
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Complete Restaurant Profile →
          </button>

          <button
            onClick={handleLogout}
            className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent block">
                  TableTreats
                </span>
                <span className="text-xs text-gray-500 font-medium">Partner Dashboard</span>
              </div>
            </div>

            <div className="flex-1 text-center hidden md:block">
              <h1 className="text-xl font-bold text-gray-900">{restaurantData.name}</h1>
              <p className="text-sm text-gray-500">{restaurantData.city}, NJ</p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full hover:shadow-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-blue-600 hidden sm:inline">
                  {lastRefreshTime.toLocaleTimeString()}
                </span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full hover:shadow-lg transition-all">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium hidden sm:inline">
                  {restaurantData.email?.split('@')[0]}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            {restaurantData.thumbnail ? (
              <img src={restaurantData.thumbnail} alt={restaurantData.name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <ImagePlus className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Add a cover photo</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">{restaurantData.name}</h2>
                  <button
                    onClick={handleEditProfile}
                    className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {restaurantData.address && `${restaurantData.address}, `}
                    {restaurantData.city && `${restaurantData.city}, `}
                    {restaurantData.zipcode || 'NJ'}
                  </span>
                </div>

                {restaurantData.phone && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Phone className="w-4 h-4" />
                    <span>{restaurantData.phone}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurantData.cuisine?.map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 text-sm mb-4">
                  {restaurantData.features?.slice(0, 6).map((f, i) => (
                    <span key={i} className="flex items-center gap-1 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {f}
                    </span>
                  ))}
                  {restaurantData.features?.length > 6 && (
                    <span className="text-purple-600 font-medium">+{restaurantData.features.length - 6} more</span>
                  )}
                </div>

                {(restaurantData.ambiancePhotos?.length > 0 || restaurantData.menuPhotos?.length > 0) && (
                  <div className="flex gap-3">
                    {restaurantData.ambiancePhotos?.length > 0 && (
                      <button
                        onClick={() => openGallery('ambiance')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-lg hover:shadow-md transition-all"
                      >
                        <Image className="w-4 h-4" />
                        <span className="text-sm font-semibold">Ambiance ({restaurantData.ambiancePhotos.length})</span>
                      </button>
                    )}
                    {restaurantData.menuPhotos?.length > 0 && (
                      <button
                        onClick={() => openGallery('menu')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 text-green-700 rounded-lg hover:shadow-md transition-all"
                      >
                        <Image className="w-4 h-4" />
                        <span className="text-sm font-semibold">Menu ({restaurantData.menuPhotos.length})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-3xl font-bold text-gray-900">{restaurantData.rating}</span>
                </div>
                <p className="text-sm text-gray-600">{restaurantData.totalReviews} reviews</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all text-left group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Reservations</h2>
            <button
              onClick={() => navigate('/reservations')}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentReservations.length > 0 ? (
              recentReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {reservation.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{reservation.name}</h4>
                      <p className="text-sm text-gray-600">{reservation.guests} guests</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{reservation.time}</span>
                      </div>
                    </div>

                    {reservation.status === 'confirmed' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Confirmed
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No reservations for today</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setShowImageGallery(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {galleryType === 'ambiance' ? 'Ambiance Photos' : 'Menu Photos'}
              </h3>
              <button onClick={() => setShowImageGallery(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(galleryType === 'ambiance' ? restaurantData.ambiancePhotos : restaurantData.menuPhotos)?.map((photo, index) => (
                <img key={index} src={photo} alt={`${galleryType} ${index + 1}`} className="w-full h-48 object-cover rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}