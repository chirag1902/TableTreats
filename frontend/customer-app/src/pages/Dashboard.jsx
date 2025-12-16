// src/pages/Dashboard.jsx

// Main customer dashboard displaying restaurants with filters by cuisine and location
// Auto-detects user location via geolocation API and allows manual location changes
// Groups restaurants by deals/offers and standard listings with search functionality

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  User,
  LogOut,
  Star,
  Navigation,
  Edit2,
} from "lucide-react";
import { logout } from "../services/authService";
import {
  getAllRestaurants,
  searchRestaurants,
} from "../services/restaurantService";
import logoImage from "../assets/logo.png";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userName, setUserName] = useState("Guest");
  const [userLocation, setUserLocation] = useState("Detecting location...");
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [groupedRestaurants, setGroupedRestaurants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
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

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Initialize user data
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

      // Update location if we detected it
      if (
        userLocation !== "Detecting location..." &&
        userLocation !== "Location unavailable"
      ) {
        userData.location = userLocation;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
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
  }, [navigate, userLocation]);

  // Fetch restaurants when location or category changes
  useEffect(() => {
    if (
      userLocation &&
      userLocation !== "Detecting location..." &&
      userLocation !== "Location unavailable"
    ) {
      fetchRestaurants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, userLocation]);

  // Search debounce
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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setUserLocation("New Brunswick");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoordinates({ latitude, longitude });

        try {
          // Use reverse geocoding to get city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Unknown";

          // Only use city name, no state
          setUserLocation(city);
          setLocationError(null);

          // Update user data in localStorage
          const userDataStr = localStorage.getItem("userData");
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            userData.location = city;
            userData.coordinates = { latitude, longitude };
            localStorage.setItem("userData", JSON.stringify(userData));
          }
        } catch (error) {
          console.error("Error getting location name:", error);
          setUserLocation("New Brunswick");
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError("Unable to detect location");
        setUserLocation("New Brunswick");
      }
    );
  };

  const handleManualLocationChange = () => {
    if (manualLocation.trim()) {
      // Extract only city name if user enters "City, State" format
      const cityOnly = manualLocation.split(",")[0].trim();
      setUserLocation(cityOnly);

      // Update localStorage
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.location = cityOnly;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      setShowLocationModal(false);
      setManualLocation("");
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use location as is (already just city name)
      const params = {
        city: userLocation,
        limit: 50,
        skip: 0,
      };

      if (selectedCategory !== "All") {
        params.cuisine = selectedCategory;
      }

      const data = await getAllRestaurants(params);

      // Group by deals
      groupByDeals(data);
    } catch (err) {
      setError(err.detail || "Failed to load restaurants");
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupByDeals = (restaurantList) => {
    const grouped = {
      "Special Offers & Deals": [],
      "Available Restaurants": [],
    };

    restaurantList.forEach((restaurant) => {
      if (restaurant.activeDeals && restaurant.activeDeals.length > 0) {
        // Add restaurant to Special Offers with all its deals
        grouped["Special Offers & Deals"].push({
          ...restaurant,
          deals: restaurant.activeDeals,
        });
      } else {
        grouped["Available Restaurants"].push(restaurant);
      }
    });

    // Remove empty groups
    if (grouped["Special Offers & Deals"].length === 0) {
      delete grouped["Special Offers & Deals"];
    }
    if (grouped["Available Restaurants"].length === 0) {
      delete grouped["Available Restaurants"];
    }

    setGroupedRestaurants(grouped);
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

      // Filter by user location (city only)
      const filteredData = data.filter(
        (restaurant) =>
          restaurant.city &&
          restaurant.city.toLowerCase().includes(userLocation.toLowerCase())
      );

      groupByDeals(filteredData);
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

  const renderRestaurantCard = (restaurant) => (
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
          <div className="text-8xl">{getCategoryEmoji(restaurant.cuisine)}</div>
        )}
        {restaurant.deals && restaurant.deals.length > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            {restaurant.deals[0].discount_type === "percentage"
              ? `${restaurant.deals[0].discount_value}% OFF`
              : `$${restaurant.deals[0].discount_value} OFF`}
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
            <span className="font-semibold">{restaurant.rating}</span>
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

        {restaurant.deals && restaurant.deals.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
            <p className="text-xs text-orange-800 font-semibold">
              {restaurant.deals[0].title}
            </p>
            {restaurant.deals.length > 1 && (
              <p className="text-xs text-orange-600 mt-1">
                +{restaurant.deals.length - 1} more deal
                {restaurant.deals.length > 2 ? "s" : ""}
              </p>
            )}
          </div>
        )}

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
  );

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
              <div className="flex items-center gap-2">
                <button
                  onClick={detectLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  title="Refresh location"
                >
                  <Navigation className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {userLocation}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setManualLocation(userLocation);
                    setShowLocationModal(true);
                  }}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  title="Change location"
                >
                  <Edit2 className="w-4 h-4 text-pink-500" />
                </button>
              </div>

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

      {/* Location Change Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Change Location
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter City Name
              </label>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="e.g., New Brunswick"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleManualLocationChange();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setManualLocation("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualLocationChange}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Location Error */}
        {locationError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 text-center">{locationError}</p>
          </div>
        )}

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
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

        {/* Grouped Restaurants */}
        {!loading && !error && Object.keys(groupedRestaurants).length > 0 && (
          <div className="space-y-12">
            {Object.entries(groupedRestaurants).map(
              ([groupName, groupRestaurants]) => (
                <div key={groupName}>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    {groupName === "Special Offers & Deals" ? "🎊" : "🍽️"}{" "}
                    {groupName} in {userLocation}
                  </h2>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupRestaurants.map(renderRestaurantCard)}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && Object.keys(groupedRestaurants).length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No restaurants found in {userLocation}
            </h3>
            <p className="text-gray-500 mb-4">
              Try changing your location or search criteria
            </p>
            <button
              onClick={() => setShowLocationModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Change Location
            </button>
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
