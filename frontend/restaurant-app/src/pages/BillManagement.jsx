import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Percent,
  Gift,
  X,
  Download,
  Send,
  Edit2,
} from "lucide-react";

export default function BillManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deals, setDeals] = useState([]);
  const [checkedInReservations, setCheckedInReservations] = useState([]);

  const [billItems, setBillItems] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [taxRate, setTaxRate] = useState(8.5);
  const [notes, setNotes] = useState("");

  // NEW: Track existing bill state
  const [existingBill, setExistingBill] = useState(null);
  const [billExists, setBillExists] = useState(false);

  const [manualItemForm, setManualItemForm] = useState({
    dish_name: "",
    quantity: 1,
    unit_price: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const getToken = () => {
    try {
      const token = localStorage.getItem("restaurant_token");
      return token || "";
    } catch (e) {
      console.error("Token retrieval error:", e);
      return "";
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        setError("Authentication token not found. Please log in first.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [dealsRes, reservationsRes] = await Promise.all([
        fetch(
          "https://tabletreats-restaurantapp.onrender.com/api/restaurant/promos",
          {
            headers,
          }
        ),
        fetch(
          "https://tabletreats-restaurantapp.onrender.com/api/restaurant/reservations/today/check-in-status",
          {
            headers,
          }
        ),
      ]);

      if (dealsRes.ok) {
        const data = await dealsRes.json();
        setDeals(Array.isArray(data) ? data : data.promos || []);
      } else {
        console.error("Deals fetch failed:", dealsRes.status);
      }

      if (reservationsRes.ok) {
        const data = await reservationsRes.json();
        const checkedIn = data.reservations?.filter((r) => r.checked_in) || [];
        setCheckedInReservations(
          checkedIn.map((res) => ({
            reservation_id: res.id,
            customer_name: res.customer_name,
            customer_email: res.customer_email || "",
            customer_phone: res.customer_phone || "",
            number_of_guests: res.number_of_guests,
            time_slot: res.time_slot,
            display_text: `${res.customer_name} - ${res.number_of_guests} guests`,
          }))
        );
      } else {
        const errData = await reservationsRes.json().catch(() => ({}));
        console.error(
          "Reservations fetch failed:",
          reservationsRes.status,
          errData
        );
        setError("Failed to load checked-in customers. Please try again.");
      }

      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        `Connection error: ${err.message}. Ensure backend is running on https://tabletreats-restaurantapp.onrender.com`
      );
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch existing bill for a reservation
  const fetchExistingBill = async (reservationId) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(
        `https://tabletreats-restaurantapp.onrender.com/api/restaurant/bills/${reservationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const billData = await response.json();
        setExistingBill(billData);
        setBillExists(true);

        // Clear form since bill already exists
        setBillItems([]);
        setNotes("");
        setTaxRate(8.5);
      } else if (response.status === 404) {
        // No existing bill
        setExistingBill(null);
        setBillExists(false);
        setBillItems([]);
        setNotes("");
        setTaxRate(8.5);
      }
    } catch (err) {
      console.error("Error fetching existing bill:", err);
      // If endpoint doesn't exist yet, assume no bill exists
      setExistingBill(null);
      setBillExists(false);
    }
  };

  const handleReservationChange = (reservationId) => {
    const reservation = checkedInReservations.find(
      (r) => r.reservation_id === reservationId
    );
    setSelectedReservation(reservation);

    // Fetch existing bill if one exists
    if (reservationId) {
      fetchExistingBill(reservationId);
    } else {
      setExistingBill(null);
      setBillExists(false);
      setBillItems([]);
    }
  };

  const addManualItem = () => {
    if (!manualItemForm.dish_name.trim() || !manualItemForm.unit_price) {
      setError("Please fill in all fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setBillItems([
      ...billItems,
      {
        dish_id: Date.now().toString(),
        dish_name: manualItemForm.dish_name,
        quantity: parseInt(manualItemForm.quantity) || 1,
        unit_price: parseFloat(manualItemForm.unit_price),
        promo_id: null,
      },
    ]);

    setManualItemForm({
      dish_name: "",
      quantity: 1,
      unit_price: "",
    });
    setError("");
  };

  const updateItemQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setBillItems(
      billItems.map((item) =>
        item.dish_id === dishId ? { ...item, quantity } : item
      )
    );
  };

  const applyDealToItem = (dishId, promoId) => {
    setBillItems(
      billItems.map((item) => {
        if (item.dish_id === dishId) {
          return {
            ...item,
            promo_id: promoId || null,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (dishId) => {
    setBillItems(billItems.filter((item) => item.dish_id !== dishId));
  };

  const calculateItemSubtotal = (item) => {
    return item.quantity * item.unit_price;
  };

  const calculateItemDiscount = (item) => {
    if (!item.promo_id) return 0;

    const promo = deals.find((d) => d.id === item.promo_id);
    if (!promo || !promo.is_active) return 0;

    const subtotal = calculateItemSubtotal(item);

    if (promo.discount_type === "percentage") {
      return (subtotal * promo.discount_value) / 100;
    } else if (promo.discount_type === "flat_amount") {
      return Math.min(promo.discount_value, subtotal);
    } else if (promo.discount_type === "bogo") {
      if (item.quantity >= 2) {
        const freeItems = Math.floor(item.quantity / 2);
        return freeItems * item.unit_price;
      }
    }
    return 0;
  };

  const calculations = {
    subtotal: billItems.reduce(
      (sum, item) => sum + calculateItemSubtotal(item),
      0
    ),
    totalDiscount: billItems.reduce(
      (sum, item) => sum + calculateItemDiscount(item),
      0
    ),
    get subtotalAfterDiscount() {
      return this.subtotal - this.totalDiscount;
    },
    get taxAmount() {
      return (this.subtotalAfterDiscount * taxRate) / 100;
    },
    get total() {
      return this.subtotalAfterDiscount + this.taxAmount;
    },
  };

  const handleCreateBill = async () => {
    if (!selectedReservation) {
      setError("Please select a reservation");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (billItems.length === 0) {
      setError("Add at least one item to create a bill");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = getToken();

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const items = billItems.map((item) => ({
        dish_name: item.dish_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        promo_id: item.promo_id || undefined,
      }));

      const billData = {
        reservation_id: selectedReservation.reservation_id,
        items: items,
        tax_rate: taxRate,
        notes: notes || undefined,
      };

      console.log("Creating bill with data:", billData);

      const response = await fetch(
        "https://tabletreats-restaurantapp.onrender.com/api/restaurant/bills",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(billData),
        }
      );

      const responseData = await response.json();
      console.log("Bill creation response:", responseData);

      if (response.ok) {
        setSuccess(
          `Bill ${
            isEditingExistingBill ? "updated" : "created"
          } successfully! Total: $${responseData.total.toFixed(2)}`
        );

        setBillItems([]);
        setSelectedReservation(null);
        setNotes("");
        setTaxRate(8.5);
        setExistingBill(null);
        setIsEditingExistingBill(false);

        await fetchData();

        setTimeout(() => setSuccess(""), 5000);
      } else {
        // NEW: Check if error is "bill already exists"
        if (
          responseData.detail &&
          responseData.detail.includes("already exists")
        ) {
          setError("Bill already exists. Loading existing bill...");
          await fetchExistingBill(selectedReservation.reservation_id);
          setTimeout(() => setError(""), 3000);
        } else {
          setError(responseData.detail || "Failed to create bill");
          setTimeout(() => setError(""), 5000);
        }
      }
    } catch (err) {
      console.error("Error creating bill:", err);
      setError("Connection error: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bill Management
              </h1>
              <p className="text-sm text-gray-600">
                Create bills for checked-in customers
              </p>
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

        {/* NEW: Show existing bill notification */}
        {billExists && existingBill && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-700 font-semibold">
                Bill Already Created
              </p>
              <p className="text-amber-600 text-sm">
                A bill has already been created for this reservation. You cannot
                create a new bill.
              </p>
              <div className="mt-2 text-sm text-amber-600">
                <p>
                  <span className="font-semibold">Total Amount:</span> $
                  {existingBill.total?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Section - Bill Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select Reservation */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Select Customer
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  <p className="text-gray-500 mt-3">
                    Loading checked-in customers...
                  </p>
                </div>
              ) : checkedInReservations.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No checked-in customers available
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Customers must be checked in before creating a bill
                  </p>
                </div>
              ) : (
                <select
                  value={selectedReservation?.reservation_id || ""}
                  onChange={(e) => handleReservationChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="">Select a customer</option>
                  {checkedInReservations.map((res) => (
                    <option key={res.reservation_id} value={res.reservation_id}>
                      {res.display_text} - {res.time_slot}
                    </option>
                  ))}
                </select>
              )}

              {selectedReservation && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Name:</span>{" "}
                    {selectedReservation.customer_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Email:</span>{" "}
                    {selectedReservation.customer_email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Phone:</span>{" "}
                    {selectedReservation.customer_phone}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Guests:</span>{" "}
                    {selectedReservation.number_of_guests}
                  </p>
                </div>
              )}
            </div>

            {/* Add Manual Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Add Items
              </h2>
              {billExists ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">
                    Bill Already Created
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    You cannot add items because a bill has already been created
                    for this customer.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Dish Name
                    </label>
                    <input
                      type="text"
                      value={manualItemForm.dish_name}
                      onChange={(e) =>
                        setManualItemForm({
                          ...manualItemForm,
                          dish_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Chicken Burrito"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={manualItemForm.quantity}
                        onChange={(e) =>
                          setManualItemForm({
                            ...manualItemForm,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        value={manualItemForm.unit_price}
                        onChange={(e) =>
                          setManualItemForm({
                            ...manualItemForm,
                            unit_price: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addManualItem}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Item
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Bill Summary */}
          <div className="space-y-6">
            {/* Bill Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Bill Items
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {billItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No items added
                  </p>
                ) : (
                  billItems.map((item) => {
                    const discount = calculateItemDiscount(item);
                    const subtotal = calculateItemSubtotal(item);
                    const promo = deals.find((d) => d.id === item.promo_id);

                    return (
                      <div
                        key={item.dish_id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {item.dish_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${item.unit_price.toFixed(2)} each
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.dish_id)}
                            className="p-1 hover:bg-red-100 rounded-lg text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() =>
                              updateItemQuantity(
                                item.dish_id,
                                item.quantity - 1
                              )
                            }
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-semibold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(
                                item.dish_id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            min="1"
                            className="w-16 text-center border border-gray-300 rounded py-1"
                          />
                          <button
                            onClick={() =>
                              updateItemQuantity(
                                item.dish_id,
                                item.quantity + 1
                              )
                            }
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-semibold"
                          >
                            +
                          </button>
                          <span className="text-sm text-gray-600 ml-auto font-semibold">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>

                        {discount > 0 && promo && (
                          <div className="text-sm text-green-600 font-semibold mb-2 flex items-center gap-1">
                            <Gift className="w-3 h-3" />-{promo.title}: $$
                            {discount.toFixed(2)}
                          </div>
                        )}

                        <select
                          value={item.promo_id || ""}
                          onChange={(e) =>
                            applyDealToItem(item.dish_id, e.target.value)
                          }
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-pink-500 outline-none"
                        >
                          <option value="">No deal applied</option>
                          {deals
                            .filter((d) => d.is_active)
                            .map((deal) => (
                              <option key={deal.id} value={deal.id}>
                                {deal.title} (
                                {deal.discount_type === "percentage"
                                  ? `${deal.discount_value}%`
                                  : deal.discount_type === "bogo"
                                  ? "BOGO"
                                  : `$${deal.discount_value}`}
                                )
                              </option>
                            ))}
                        </select>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Tax Rate */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add bill notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-sm"
                rows="3"
              />
            </div>

            {/* Bill Calculations */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">
                  ${calculations.subtotal.toFixed(2)}
                </span>
              </div>
              {calculations.totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -${calculations.totalDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-700">After Discount</span>
                <span className="font-semibold">
                  ${calculations.subtotalAfterDiscount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax ({taxRate}%)</span>
                <span className="font-semibold">
                  ${calculations.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t-2 border-pink-200 pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  ${calculations.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Create/Update Bill Button */}
            <button
              onClick={handleCreateBill}
              disabled={
                loading ||
                billItems.length === 0 ||
                !selectedReservation ||
                billExists
              }
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {billExists
                ? "Bill Already Created"
                : loading
                ? "Processing..."
                : "Create Bill"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
