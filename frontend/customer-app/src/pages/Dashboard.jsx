// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, User, LogOut, Star } from "lucide-react";
import { logout } from "../services/authService";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("All Restaurants");
  const [userName, setUserName] = useState("Guest");
  const [userLocation, setUserLocation] = useState("New Brunswick, NJ");
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem("authToken");
    const userDataStr = sessionStorage.getItem("userData");

    if (!token || !userDataStr) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      setUserName(userData.name || "Guest");
      setUserLocation(userData.location || "New Brunswick, NJ");
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }

    // Listen for logout events from API interceptor
    const handleAuthLogout = () => {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      navigate("/login");
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [navigate]);

  const categories = [
    { name: "Italian", emoji: "🍝", gradient: "from-red-500 to-orange-500" },
    { name: "American", emoji: "🍔", gradient: "from-blue-500 to-cyan-500" },
    { name: "Japanese", emoji: "🍣", gradient: "from-pink-500 to-purple-500" },
    { name: "Mexican", emoji: "🌮", gradient: "from-yellow-500 to-orange-500" },
    { name: "Indian", emoji: "🍛", gradient: "from-orange-600 to-red-600" },
    { name: "Chinese", emoji: "🥡", gradient: "from-red-600 to-pink-500" },
    { name: "Healthy", emoji: "🥗", gradient: "from-green-500 to-teal-500" },
    { name: "Desserts", emoji: "🍰", gradient: "from-pink-400 to-purple-400" },
  ];

  const filters = [
    { name: "All Restaurants", icon: "🎯" },
    { name: "Premium Dining", icon: "💎" },
    { name: "Today's Deals", icon: "🎊" },
    { name: "Top Rated", icon: "⭐" },
    { name: "Open Now", icon: "🕐" },
    { name: "New Arrivals", icon: "🆕" },
  ];

  const featuredDeals = [
    {
      id: 1,
      name: "Bella Italia Trattoria",
      cuisine: "Italian",
      rating: 4.8,
      reviews: 324,
      distance: "0.5 mi",
      priceRange: "$$",
      emoji: "🍝",
      gradient: "from-amber-600 via-orange-500 to-red-600",
      badge: "25% OFF",
      badgeColor: "bg-red-500",
      offer: "Get 25% off your entire bill",
      timing: "Valid until 10 PM tonight",
      popular: true,
    },
    {
      id: 2,
      name: "Sakura Sushi House",
      cuisine: "Japanese",
      rating: 4.9,
      reviews: 456,
      distance: "0.8 mi",
      priceRange: "$$",
      emoji: "🍣",
      gradient: "from-green-600 via-teal-500 to-blue-400",
      badge: "BOGO",
      badgeColor: "bg-green-500",
      offer: "Buy 1 Get 1 on select rolls",
      timing: "Happy Hour Special",
      popular: true,
    },
    {
      id: 3,
      name: "Prime Steakhouse",
      cuisine: "Steakhouse",
      rating: 4.7,
      reviews: 287,
      distance: "1.2 mi",
      priceRange: "$$$",
      emoji: "🥩",
      gradient: "from-purple-600 via-pink-500 to-red-500",
      badge: "30% OFF",
      badgeColor: "bg-purple-500",
      offer: "30% off dinner menu",
      timing: "Today only",
      popular: false,
    },
  ];

  const nearbyRestaurants = [
    {
      id: 7,
      name: "Artisan Coffee & Brunch",
      cuisine: "Cafe",
      rating: 4.9,
      reviews: 523,
      distance: "0.3 mi",
      priceRange: "$$",
      emoji: "☕",
      gradient: "from-pink-300 via-purple-300 to-indigo-300",
      openNow: true,
      nextTable: "15 min",
    },
    {
      id: 8,
      name: "Sweet Dreams Bakery",
      cuisine: "Desserts",
      rating: 4.7,
      reviews: 267,
      distance: "0.6 mi",
      priceRange: "$",
      emoji: "🍰",
      gradient: "from-yellow-300 via-pink-300 to-purple-300",
      openNow: true,
      nextTable: "30 min",
    },
  ];

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    navigate("/login");
  };

  const handleReserve = (restaurantName) => {
    alert(`Reservation page for ${restaurantName} coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                TableTreats
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines, deals..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <MapPin className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium hidden sm:inline">
                  {userLocation}
                </span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full hover:shadow-lg transition-all">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium hidden sm:inline">
                  {userName}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold hidden sm:inline">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform hover:scale-110 ${
                selectedCategory === "All" ? "transform scale-110" : ""
              }`}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                🎯
              </div>
              <span className="text-xs font-medium text-gray-700">All</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform hover:scale-110 ${
                  selectedCategory === category.name
                    ? "transform scale-110"
                    : ""
                }`}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-full flex items-center justify-center text-3xl shadow-lg`}
                >
                  {category.emoji}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setSelectedFilter(filter.name)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedFilter === filter.name
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-500"
              }`}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.name}
            </button>
          ))}
        </div>

        {/* Hot Deals Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            🔥 Hot Deals For You
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer"
              >
                <div
                  className={`h-48 bg-gradient-to-br ${restaurant.gradient} relative flex items-center justify-center`}
                >
                  <div className="text-8xl">{restaurant.emoji}</div>
                  <div
                    className={`absolute top-4 left-4 ${restaurant.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}
                  >
                    {restaurant.badge}
                  </div>
                  {restaurant.popular && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      🔥 Popular
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>

                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{restaurant.rating}</span>
                      <span>({restaurant.reviews})</span>
                    </div>
                    <span>•</span>
                    <span>{restaurant.cuisine}</span>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl mb-3">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {restaurant.offer}
                    </p>
                    <p className="text-xs text-gray-600">{restaurant.timing}</p>
                  </div>

                  <button
                    onClick={() => handleReserve(restaurant.name)}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Restaurants */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            📍 Popular Near You
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${restaurant.gradient} relative flex items-center justify-center`}
                >
                  <div className="text-7xl">{restaurant.emoji}</div>
                  {restaurant.openNow && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Open Now
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{restaurant.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{restaurant.cuisine}</span>
                  </div>

                  <button
                    onClick={() => handleReserve(restaurant.name)}
                    className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
