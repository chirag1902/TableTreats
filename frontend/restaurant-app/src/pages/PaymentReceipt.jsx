// File: src/pages/PaymentReceipt.jsx
// Create this new file

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Receipt,
  Tag,
  Download,
  Mail,
  Phone,
  MapPin,
  DollarSign,
} from "lucide-react";

export default function PaymentReceipt() {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceiptData();
  }, []);

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract reservation ID from URL
      const reservationId = window.location.pathname.split("/").pop();

      if (!reservationId || reservationId === "payment-receipt") {
        throw new Error("Reservation ID not found in URL");
      }

      // Get token
      const token = localStorage.getItem("restaurant_token");
      if (!token) {
        throw new Error("Please log in to view receipt");
      }

      // Fetch bill details directly from the bill endpoint
      const response = await fetch(
        `https://tabletreats-restaurantapp.onrender.com/api/restaurant/bills/${reservationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/signin";
          return;
        }
        throw new Error("Failed to load receipt");
      }

      const data = await response.json();

      // Check if bill is paid
      if (!data.paid) {
        throw new Error("This bill has not been paid yet");
      }

      // Structure the data for display
      const receiptData = {
        id: data.reservation_id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        date: data.date,
        time_slot: data.time_slot,
        number_of_guests: data.number_of_guests,
        bill: {
          bill_id: data.bill_id,
          items: data.items,
          subtotal: data.subtotal,
          discount_total: data.discount_total,
          subtotal_after_discount: data.subtotal_after_discount,
          tax_rate: data.tax_rate,
          tax_amount: data.tax_amount,
          total: data.total,
          notes: data.notes,
          paid: data.paid,
          paid_at: data.paid_at,
          created_at: data.created_at,
        },
      };

      setReceipt(receiptData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      setError(error.message || "Failed to load receipt");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatMongoDate = (dateObj) => {
    if (!dateObj) return "";
    // Handle MongoDB date format: { "$date": "..." } or plain ISO string
    const dateString = dateObj.$date || dateObj;
    return new Date(dateString).toLocaleString();
  };

  const getDealDisplayText = (dealApplied) => {
    if (!dealApplied) return null;
    if (typeof dealApplied === "string") return dealApplied;
    if (typeof dealApplied === "object") {
      const { deal_name, deal_type, discount_value } = dealApplied;
      return deal_name || `${deal_type}: $${discount_value}`;
    }
    return null;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Receipt className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Receipt
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Payment Receipt
                </h1>
                <p className="text-sm text-gray-500">
                  Reservation #{receipt.id.slice(-8)}
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Print/Download
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Success Badge */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 mb-6 text-white print:bg-green-600">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Payment Successful</h2>
          </div>
          <p className="text-center text-green-100">
            Transaction completed on {formatMongoDate(receipt.bill.paid_at)}
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white print:bg-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">TableTreats</h3>
                <p className="text-pink-100 text-sm">
                  Restaurant Reservation System
                </p>
              </div>
              <Receipt className="w-12 h-12 text-pink-100" />
            </div>
            <div className="border-t border-pink-300 pt-4">
              <p className="text-sm text-pink-100">Transaction ID</p>
              <p className="font-mono text-lg font-semibold break-all">
                {receipt.bill.bill_id}
              </p>
            </div>
          </div>

          {/* Customer & Reservation Details */}
          <div className="p-6 border-b">
            <h4 className="text-lg font-bold text-gray-900 mb-4">
              Reservation Details
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-semibold text-gray-900">
                  {receipt.customer_name}
                </p>
              </div>
              {receipt.customer_email && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="font-semibold text-gray-900">
                    {receipt.customer_email}
                  </p>
                </div>
              )}
              {receipt.customer_phone && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="font-semibold text-gray-900">
                    {receipt.customer_phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date
                </p>
                <p className="font-semibold text-gray-900">
                  {formatDate(receipt.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time
                </p>
                <p className="font-semibold text-gray-900">
                  {formatTime(receipt.time_slot)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Party Size
                </p>
                <p className="font-semibold text-gray-900">
                  {receipt.number_of_guests} guests
                </p>
              </div>
            </div>
          </div>

          {/* Bill Items */}
          <div className="p-6 border-b">
            <h4 className="text-lg font-bold text-gray-900 mb-4">
              Order Details
            </h4>
            <div className="space-y-4">
              {receipt.bill.items.map((item, index) => {
                const dealText = getDealDisplayText(item.deal_applied);
                return (
                  <div
                    key={item.item_id || index}
                    className="flex items-start justify-between pb-4 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        {item.dish_name}
                      </h5>
                      <p className="text-sm text-gray-500">
                        ${Number(item.unit_price || 0).toFixed(2)} ×{" "}
                        {item.quantity}
                      </p>
                      {dealText && (
                        <div className="flex items-center gap-1 mt-1">
                          <Tag className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">
                            {dealText}
                          </span>
                        </div>
                      )}
                      {item.discount_amount > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Discount: -$
                          {Number(item.discount_amount || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      {item.discount_amount > 0 && (
                        <p className="text-sm text-gray-400 line-through">
                          ${Number(item.subtotal || 0).toFixed(2)}
                        </p>
                      )}
                      <p className="font-semibold text-gray-900">
                        ${Number(item.final_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="p-6 bg-gray-50">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${Number(receipt.bill.subtotal || 0).toFixed(2)}</span>
              </div>
              {receipt.bill.discount_total > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Total Discounts</span>
                  <span>
                    -${Number(receipt.bill.discount_total || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>
                  Tax ({Number(receipt.bill.tax_rate || 0).toFixed(1)}%)
                </span>
                <span>${Number(receipt.bill.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t-2">
                <span>Total Paid</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-6 h-6" />
                  {Number(receipt.bill.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {receipt.bill.notes &&
              receipt.bill.notes !== "string" &&
              receipt.bill.notes.trim() !== "" && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Note:</span>{" "}
                    {receipt.bill.notes}
                  </p>
                </div>
              )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 text-center print:bg-gray-100">
            <p className="text-sm text-gray-600 mb-2">
              Thank you for dining with us!
            </p>
            <p className="text-xs text-gray-500">
              This is an official payment receipt from TableTreats Restaurant
              Reservation System
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Receipt generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 print:hidden">
          <button
            onClick={handleBack}
            className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:shadow-lg transition-all border-2 border-gray-200"
          >
            Back to Reservations
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Print Receipt
          </button>
        </div>
      </main>
    </div>
  );
}
