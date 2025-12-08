// src/pages/BillPage.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  CheckCircle,
  Receipt,
  Tag,
  ArrowLeft,
  Loader,
  AlertCircle,
} from "lucide-react";
import { getBill, payBill } from "../services/api";

export default function BillPage() {
  const [bill, setBill] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBillData();
  }, []);

  const fetchBillData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract reservation ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const reservationId =
        urlParams.get("id") || window.location.pathname.split("/").pop();

      if (!reservationId || reservationId === "bill") {
        throw new Error("Reservation ID not found in URL");
      }

      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to view your bill");
      }

      // Fetch bill data using API service
      const data = await getBill(reservationId);

      // Set reservation data
      setReservation({
        id: data.reservation_id,
        restaurant_name: data.restaurant_name,
        customer_name: data.customer_name,
        date: data.date,
        time_slot: data.time_slot,
        number_of_guests: data.number_of_guests,
      });

      // Set bill data
      setBill({
        bill_id: data.bill_id,
        items: data.items || [],
        subtotal: data.subtotal || 0,
        discount_total: data.discount_total || 0,
        subtotal_after_discount: data.subtotal_after_discount || 0,
        tax_rate: data.tax_rate || 0,
        tax_amount: data.tax_amount || 0,
        total: data.total || 0,
        notes: data.notes,
        paid: data.paid || false,
        paid_at: data.paid_at,
        created_at: data.created_at,
      });

      // If bill is already paid, show success screen
      if (data.paid) {
        setPaymentComplete(true);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching bill:", error);
      const errorMessage =
        error.detail ||
        error.message ||
        "Failed to load bill. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to make payment");
      }

      // Get reservation ID
      const urlParams = new URLSearchParams(window.location.search);
      const reservationId =
        urlParams.get("id") || window.location.pathname.split("/").pop();

      if (!reservationId || reservationId === "bill") {
        throw new Error("Reservation ID not found");
      }

      // Call payment API using service
      const data = await payBill(reservationId);
      console.log("Payment successful:", data);

      setPaying(false);
      setPaymentComplete(true);
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error.detail || error.message || "Payment failed. Please try again.";
      alert(errorMessage);
      setPaying(false);
    }
  };

  const handleBackClick = () => {
    // Navigate back to reservations page
    window.location.href = "/reservations";
  };

  // Helper function to get deal display text
  const getDealDisplayText = (dealApplied) => {
    if (!dealApplied) return null;

    // If it's already a string, return it
    if (typeof dealApplied === "string") return dealApplied;

    // If it's an object, format it nicely
    if (typeof dealApplied === "object") {
      const { deal_name, deal_type, discount_value } = dealApplied;
      return deal_name || `${deal_type}: $${discount_value}`;
    }

    return null;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Bill
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Try Again
            </button>
            <button
              onClick={handleBackClick}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Back to Reservations
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Complete State
  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment of ${bill.total.toFixed(2)} has been processed
            successfully.
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800 break-all">
              <span className="font-semibold">Transaction ID:</span>{" "}
              {bill.bill_id}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Restaurant:</span>{" "}
              {reservation.restaurant_name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Date:</span> {reservation.date} at{" "}
              {reservation.time_slot}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Guests:</span>{" "}
              {reservation.number_of_guests}
            </p>
          </div>
          <button
            onClick={handleBackClick}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  // Main Bill Display
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Payment</h1>
              <p className="text-sm text-gray-500">
                {reservation.restaurant_name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Reservation Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-gray-900">
              Reservation Details
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">
                  {reservation.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-semibold text-gray-900">
                  {reservation.time_slot}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Guests</p>
                <p className="font-semibold text-gray-900">
                  {reservation.number_of_guests}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Items */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Bill Details
            </h2>
            <p className="text-pink-100 text-sm mt-1 break-all">
              Bill ID: {bill.bill_id}
            </p>
          </div>

          <div className="p-6">
            {/* Items */}
            {bill.items.length > 0 ? (
              <div className="space-y-4 mb-6">
                {bill.items.map((item, index) => {
                  const dealText = getDealDisplayText(item.deal_applied);

                  return (
                    <div
                      key={item.item_id || index}
                      className="flex items-start justify-between pb-4 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.dish_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ${item.unit_price.toFixed(2)} × {item.quantity}
                        </p>
                        {dealText && (
                          <div className="flex items-center gap-1 mt-1">
                            <Tag className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">
                              Deal Applied: {dealText}
                            </span>
                          </div>
                        )}
                        {item.discount_amount > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Discount: -${item.discount_amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        {item.discount_amount > 0 && (
                          <p className="text-sm text-gray-400 line-through">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        )}
                        <p className="font-semibold text-gray-900">
                          ${item.final_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No items in this bill
              </div>
            )}

            {/* Summary */}
            <div className="space-y-3 pt-4 border-t-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${bill.subtotal.toFixed(2)}</span>
              </div>
              {bill.discount_total > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${bill.discount_total.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax ({bill.tax_rate}%)</span>
                <span>${bill.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2">
                <span>Total Amount</span>
                <span>${bill.total.toFixed(2)}</span>
              </div>
            </div>

            {bill.notes &&
              bill.notes !== "string" &&
              bill.notes.trim() !== "" && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Note:</span> {bill.notes}
                  </p>
                </div>
              )}

            {bill.created_at && (
              <div className="mt-4 text-xs text-gray-500 text-center">
                Bill created on {new Date(bill.created_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Payment Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={handlePayment}
            disabled={paying || bill.paid}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Processing Payment...
              </>
            ) : bill.paid ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Already Paid
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                Pay ${bill.total.toFixed(2)}
              </>
            )}
          </button>
          <p className="text-center text-sm text-gray-500 mt-3">
            Secure payment powered by Restaurant Reservation System
          </p>
        </div>
      </main>
    </div>
  );
}
