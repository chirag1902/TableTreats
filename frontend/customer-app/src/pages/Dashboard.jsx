// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, User, LogOut, Star } from "lucide-react";
import { logout } from "../services/authService";
import {
  getAllRestaurants,
  searchRestaurants,
} from "../services/restaurantService";
import logoImage from "../assets/logo.png";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("All Restaurants");
  const [userName, setUserName] = useState("Guest");
  const [userLocation, setUserLocation] = useState("New Brunswick, NJ");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDataStr = localStorage.getItem("userData");

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

    const handleAuthLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      navigate("/login");
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [navigate]);

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedFilter, userLocation]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        fetchRestaurants();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 20,
        skip: 0,
      };

      if (selectedCategory !== "All") {
        params.cuisine = selectedCategory;
      }

      const data = await getAllRestaurants(params);
      setRestaurants(data);
    } catch (err) {
      setError(err.detail || "Failed to load restaurants");
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchRestaurants();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await searchRestaurants(searchQuery);
      setRestaurants(data);
    } catch (err) {
      setError(err.detail || "Search failed");
      console.error("Error searching restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const getCategoryEmoji = (cuisines) => {
    if (!cuisines || cuisines.length === 0) return "🍽️";

    const cuisine = cuisines[0].toLowerCase();
    const category = categories.find((cat) =>
      cuisine.includes(cat.name.toLowerCase())
    );

    return category ? category.emoji : "🍽️";
  };

  const getCategoryGradient = (cuisines) => {
    if (!cuisines || cuisines.length === 0) return "from-gray-400 to-gray-600";

    const cuisine = cuisines[0].toLowerCase();
    const category = categories.find((cat) =>
      cuisine.includes(cat.name.toLowerCase())
    );

    return category ? category.gradient : "from-gray-400 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
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

            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <MapPin className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium hidden sm:inline">
                  {userLocation}
                </span>
              </button>

              <button 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full hover:shadow-lg transition-all cursor-pointer"
              >
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading restaurants...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && !error && restaurants.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : `🍽️ Available Restaurants`}
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => handleRestaurantClick(restaurant.id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer"
                >
                  <div
                    className={`h-48 bg-gradient-to-br ${getCategoryGradient(
                      restaurant.cuisine
                    )} relative flex items-center justify-center`}
                  >
                    {restaurant.thumbnail ? (
                      <img
                        src={restaurant.thumbnail}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-8xl">
                        {getCategoryEmoji(restaurant.cuisine)}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                      {restaurant.name}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">
                          {restaurant.rating}
                        </span>
                        <span>({restaurant.totalReviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {restaurant.cuisine &&
                        restaurant.cuisine.slice(0, 2).map((cuisine, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                          >
                            {cuisine}
                          </span>
                        ))}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{restaurant.city}</span>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
