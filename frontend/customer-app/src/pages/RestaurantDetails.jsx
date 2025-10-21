// src/pages/RestaurantDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Info,
  Heart,
  Share2,
  Calendar,
} from "lucide-react";
import { getRestaurantById } from "../services/restaurantService";
import logoImage from "../assets/logo.png";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchRestaurantDetails();
  }, [id, navigate]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRestaurantById(id);
      setRestaurant(data);
      setSelectedImage(data.thumbnail);
    } catch (err) {
      setError(err.detail || "Failed to load restaurant details");
      console.error("Error fetching restaurant:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = () => {
    alert("Reservation system coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Restaurant Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "Unable to load restaurant details"}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allImages = [
    restaurant.thumbnail,
    ...restaurant.ambiancePhotos,
    ...restaurant.menuPhotos,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
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

            <div className="flex items-center gap-3">
              <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                <Heart className="w-5 h-5 text-pink-500" />
              </button>
              <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                <Share2 className="w-5 h-5 text-purple-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="grid lg:grid-cols-2 gap-4 p-4">
            <div className="lg:col-span-1">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center text-8xl">🍽️</div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    🍽️
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              {allImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square rounded-xl overflow-hidden border-4 transition-all ${
                        selectedImage === img
                          ? "border-purple-500 scale-95"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center text-4xl bg-gray-100">🖼️</div>';
                        }}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📸</div>
                    <p>No additional photos</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-bold text-gray-900">
                        {restaurant.rating}
                      </span>
                      <span className="text-gray-500">
                        ({restaurant.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cuisine Tags */}
              {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {restaurant.cuisine.map((cuisine, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-full"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-4 font-semibold transition-all ${
                      activeTab === "overview"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("menu")}
                    className={`pb-4 font-semibold transition-all ${
                      activeTab === "menu"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => setActiveTab("ambiance")}
                    className={`pb-4 font-semibold transition-all ${
                      activeTab === "ambiance"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Ambiance
                  </button>
                  <button
                    onClick={() => setActiveTab("hours")}
                    className={`pb-4 font-semibold transition-all ${
                      activeTab === "hours"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Hours
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    About {restaurant.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {restaurant.description || "No description available."}
                  </p>

                  {restaurant.features && restaurant.features.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Features & Amenities
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {restaurant.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg">
                              ✓
                            </div>
                            <span className="font-medium text-gray-700">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "menu" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Menu Photos
                  </h3>
                  {restaurant.menuPhotos && restaurant.menuPhotos.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {restaurant.menuPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="aspect-video rounded-xl overflow-hidden bg-gray-100"
                        >
                          <img
                            src={photo}
                            alt={`Menu ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center text-6xl">📋</div>';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-gray-500">No menu photos available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "ambiance" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Ambiance Photos
                  </h3>
                  {restaurant.ambiancePhotos &&
                  restaurant.ambiancePhotos.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {restaurant.ambiancePhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="aspect-video rounded-xl overflow-hidden bg-gray-100"
                        >
                          <img
                            src={photo}
                            alt={`Ambiance ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center text-6xl">🏠</div>';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🏠</div>
                      <p className="text-gray-500">
                        No ambiance photos available
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "hours" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Operating Hours
                  </h3>
                  {restaurant.hours &&
                  Object.keys(restaurant.hours).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(restaurant.hours).map(([day, times]) => (
                        <div
                          key={day}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <span className="font-semibold text-gray-700 capitalize">
                            {day}
                          </span>
                          <span className="text-gray-600">
                            {typeof times === "object" ? (
                              times.closed ? (
                                <span className="text-red-500 font-semibold">
                                  Closed
                                </span>
                              ) : (
                                <span className="text-green-600 font-semibold">
                                  {times.open} - {times.close}
                                </span>
                              )
                            ) : (
                              times
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🕐</div>
                      <p className="text-gray-500">
                        Hours information not available
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Reserve Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Make a Reservation
                </h3>
                <p className="text-gray-600">Book your table now!</p>
              </div>

              <button
                onClick={handleReserve}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:scale-105 transition-all mb-6"
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Reserve Table
              </button>

              <div className="space-y-4 border-t pt-6">
                <h4 className="font-bold text-gray-900 mb-3">
                  Contact Information
                </h4>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">
                      {restaurant.address}
                      <br />
                      {restaurant.city}
                      {restaurant.zipcode && `, ${restaurant.zipcode}`}
                    </p>
                  </div>
                </div>

                {restaurant.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}

                {restaurant.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <a
                        href={`mailto:${restaurant.email}`}
                        className="text-sm text-purple-600 hover:underline break-all"
                      >
                        {restaurant.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-gray-900">Good to Know</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Please arrive 10 minutes before your reservation</li>
                <li>
                  • Reservations can be modified up to 2 hours in advance
                </li>
                <li>• Large parties (6+) may require special arrangements</li>
                <li>
                  • Contact the restaurant for special dietary requirements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}