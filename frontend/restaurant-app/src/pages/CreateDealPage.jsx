const deleteDeal = async (dealId) => {
  if (!window.confirm("Are you sure you want to delete this deal?")) {
    return;
  }

  try {
    setLoading(true);
    const token = localStorage.getItem("restaurant_token");

    const response = await fetch(
      `https://tabletreats-restaurantapp.onrender.com/api/restaurant/promos/${dealId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      setSuccess("Deal deleted successfully!");
      await fetchDeals();
      setTimeout(() => setSuccess(""), 3000);
    } else if (response.status === 401) {
      window.location.href = "/signin";
    } else {
      setError("Failed to delete deal");
    }
  } catch (err) {
    console.error("Error deleting deal:", err);
    setError("An error occurred while deleting the deal");
  } finally {
    setLoading(false);
  }
};
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Percent,
  Gift,
  Calendar,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";

export default function CreateDealPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deals, setDeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDealId, setEditingDealId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    valid_days: [0],
    time_start: "00:00",
    time_end: "23:59",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem("restaurant_token");

      const response = await fetch(
        "https://tabletreats-restaurantapp.onrender.com/api/restaurant/promos",
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
        setDeals(Array.isArray(data) ? data : data.promos || []);
      } else if (response.status === 401) {
        window.location.href = "/signin";
      }
    } catch (err) {
      console.error("Error fetching deals:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDayToggle = (dayIndex) => {
    setFormData((prev) => ({
      ...prev,
      valid_days: prev.valid_days.includes(dayIndex)
        ? prev.valid_days.filter((d) => d !== dayIndex)
        : [...prev.valid_days, dayIndex].sort(),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Deal title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Deal description is required");
      return false;
    }
    if (formData.discount_type !== "bogo" && !formData.discount_value) {
      setError("Discount value is required");
      return false;
    }
    if (
      formData.discount_type === "percentage" &&
      (formData.discount_value < 0 || formData.discount_value > 100)
    ) {
      setError("Percentage must be between 0 and 100");
      return false;
    }
    if (!formData.start_date) {
      setError("Start date is required");
      return false;
    }
    if (!formData.end_date) {
      setError("End date is required");
      return false;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError("End date must be after start date");
      return false;
    }
    if (formData.valid_days.length === 0) {
      setError("Select at least one valid day");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("restaurant_token");

      const dealPayload = {
        title: formData.title,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value:
          formData.discount_type === "bogo"
            ? null
            : parseInt(formData.discount_value),
        valid_days: formData.valid_days.map((i) =>
        daysOfWeek[i].toLowerCase()),
        time_start: formData.time_start,
        time_end: formData.time_end,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      };

      const url = editingDealId
        ? `https://tabletreats-restaurantapp.onrender.com/api/restaurant/promos/${editingDealId}`
        : "https://tabletreats-restaurantapp.onrender.com/api/restaurant/promos";

      const method = editingDealId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dealPayload),
      });

      if (response.ok) {
        setSuccess(
          editingDealId
            ? "Deal updated successfully!"
            : "Deal created successfully!"
        );

        setFormData({
          title: "",
          description: "",
          discount_type: "percentage",
          discount_value: "",
          valid_days: [0],
          time_start: "00:00",
          time_end: "23:59",
          start_date: "",
          end_date: "",
          is_active: true,
        });

        setEditingDealId(null);
        setShowForm(false);
        await fetchDeals();

        setTimeout(() => setSuccess(""), 3000);
      } else if (response.status === 401) {
        window.location.href = "/signin";
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save deal");
      }
    } catch (err) {
      console.error("Error saving deal:", err);
      setError("An error occurred while saving the deal");
    } finally {
      setLoading(false);
    }
  };

  const toggleDealStatus = async (dealId, currentStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("restaurant_token");

      const response = await fetch(
        `https://tabletreats-restaurantapp.onrender.com/api/restaurant/promos/${dealId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: !currentStatus,
          }),
        }
      );

      if (response.ok) {
        setSuccess(
          `Deal ${!currentStatus ? "activated" : "deactivated"} successfully!`
        );
        await fetchDeals();
        setTimeout(() => setSuccess(""), 3000);
      } else if (response.status === 401) {
        window.location.href = "/signin";
      } else {
        setError("Failed to update deal status");
      }
    } catch (err) {
      console.error("Error updating deal:", err);
      setError("An error occurred while updating the deal");
    } finally {
      setLoading(false);
    }
  };

  const getDiscountDisplay = (deal) => {
    if (deal.discount_type === "percentage") {
      return `${deal.discount_value}% Off`;
    } else if (deal.discount_type === "flat_amount") {
      return `$${deal.discount_value} Off`;
    } else if (deal.discount_type === "bogo") {
      return "Buy 1 Get 1";
    }
  };

  const getDealIcon = (type) => {
    switch (type) {
      case "percentage":
        return <Percent className="w-5 h-5" />;
      case "flat_amount":
        return <DollarSign className="w-5 h-5" />;
      case "bogo":
        return <Gift className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const startEditDeal = (deal) => {
    setEditingDealId(deal.id);
    setFormData({
      title: deal.title,
      description: deal.description,
      discount_type: deal.discount_type,
      discount_value: deal.discount_value || "",
      valid_days: (deal.valid_days || []).map(day =>
      daysOfWeek.findIndex(d => d.toLowerCase() === day.toLowerCase())),
      time_start: deal.time_start || "00:00",
      time_end: deal.time_end || "23:59",
      start_date: deal.start_date || "",
      end_date: deal.end_date || "",
      is_active: deal.is_active,
    });
    setShowForm(true);
  };

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
                  Deals & Promotions
                </h1>
                <p className="text-sm text-gray-600">
                  {deals.filter((d) => d.is_active).length} active deals
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

        <div className="mb-8">
          <button
            onClick={() => {
              setEditingDealId(null);
              setFormData({
                title: "",
                description: "",
                discount_type: "percentage",
                discount_value: "",
                valid_days: [0],
                time_start: "00:00",
                time_end: "23:59",
                start_date: "",
                end_date: "",
                is_active: true,
              });
              setShowForm(!showForm);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              showForm
                ? "bg-gray-200 text-gray-800"
                : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg"
            }`}
          >
            <Plus className="w-5 h-5" />
            Create New Deal
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingDealId ? "Edit Deal" : "Create New Deal"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingDealId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Deal Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Weekend Special"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., 20% off on all items"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Discount Type *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      value: "percentage",
                      label: "Percentage (%)",
                      icon: Percent,
                    },
                    {
                      value: "flat_amount",
                      label: "Flat Amount ($)",
                      icon: DollarSign,
                    },
                    { value: "bogo", label: "Buy 1 Get 1", icon: Gift },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          discount_type: option.value,
                        }))
                      }
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        formData.discount_type === option.value
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <option.icon
                        className={`w-6 h-6 ${
                          formData.discount_type === option.value
                            ? "text-pink-600"
                            : "text-gray-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold text-center ${
                          formData.discount_type === option.value
                            ? "text-pink-600"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.discount_type !== "bogo" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleInputChange}
                      placeholder="Enter value"
                      min="0"
                      max={
                        formData.discount_type === "percentage"
                          ? "100"
                          : undefined
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                    />
                    <span className="absolute right-4 top-3 text-gray-600 font-semibold">
                      {formData.discount_type === "percentage" ? "%" : "$"}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="time_start"
                    value={formData.time_start}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="time_end"
                    value={formData.time_end}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Valid Days *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {daysOfWeek.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`py-2 px-1 rounded-lg font-semibold text-sm transition-all ${
                        formData.valid_days.includes(index)
                          ? "bg-pink-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500 cursor-pointer"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-semibold text-gray-900 cursor-pointer"
                >
                  Active immediately
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingDealId
                    ? "Update Deal"
                    : "Create Deal"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingDealId(null);
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {deals.filter((d) => d.is_active).length > 0 ? (
          <div className="space-y-4">
            {deals
              .filter((d) => d.is_active)
              .map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {getDealIcon(deal.discount_type)}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {deal.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-2">
                          {deal.description}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(deal.start_date)} -{" "}
                              {formatDate(deal.end_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {deal.time_start} - {deal.time_end}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {deal.valid_days &&
                            deal.valid_days.map((day) => (
                              <span
                                key={day}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full"
                              >
                                {daysOfWeek[day]
                                  ? daysOfWeek[day].slice(0, 3)
                                  : day}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-center px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">
                          {getDiscountDisplay(deal)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {deal.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditDeal(deal)}
                          className="px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold text-sm transition-all flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDeal(deal.id)}
                          disabled={loading}
                          className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold text-sm transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No active deals yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first deal to attract more customers
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Create Your First Deal
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
