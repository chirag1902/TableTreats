import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  CheckCircle,
  Receipt,
  DollarSign,
  Tag,
  ArrowLeft,
  Loader,
} from "lucide-react";

export default function BillPage() {
  const [bill, setBill] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    // Simulate fetching bill data
    // In real app, you'd get reservationId from URL params and call API
    setTimeout(() => {
      const mockReservation = {
        id: "mock-id",
        restaurant_name: "Chipotle",
        customer_name: "Dhruv Shah",
        date: "2025-12-02",
        time_slot: "21:00",
        number_of_guests: 5,
      };

      const mockBill = {
        bill_id: "9a0e843f-d756-4524-8766-cf3fc7930da0",
        items: [
          {
            item_id: "9671708b-b1db-4e41-a4ba-84a44a5abb27",
            dish_name: "Burrito",
            quantity: 5,
            unit_price: 11.68,
            subtotal: 58.4,
            discount_amount: 0,
            final_amount: 58.4,
            deal_applied: null,
          },
        ],
        subtotal: 58.4,
        discount_total: 0,
        subtotal_after_discount: 58.4,
        tax_rate: 8,
        tax_amount: 4.67,
        total: 63.07,
        notes: "string",
        created_at: new Date().toISOString(),
      };

      setReservation(mockReservation);
      setBill(mockBill);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePayment = async () => {
    setPaying(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaying(false);
      setPaymentComplete(true);
    }, 2000);
  };

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

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your payment of ${bill.total.toFixed(2)} has been processed successfully.
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Transaction ID:</span> {bill.bill_id}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Payment</h1>
              <p className="text-sm text-gray-500">{reservation.restaurant_name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Reservation Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-gray-900">Reservation Details</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">{reservation.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-semibold text-gray-900">{reservation.time_slot}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Guests</p>
                <p className="font-semibold text-gray-900">{reservation.number_of_guests}</p>
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
            <p className="text-pink-100 text-sm mt-1">Bill ID: {bill.bill_id}</p>
          </div>

          <div className="p-6">
            {/* Items */}
            <div className="space-y-4 mb-6">
              {bill.items.map((item) => (
                <div key={item.item_id} className="flex items-start justify-between pb-4 border-b">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.dish_name}</h3>
                    <p className="text-sm text-gray-500">
                      ${item.unit_price.toFixed(2)} × {item.quantity}
                    </p>
                    {item.deal_applied && (
                      <div className="flex items-center gap-1 mt-1">
                        <Tag className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          Deal Applied: {item.deal_applied}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
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
              ))}
            </div>

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

            {bill.notes && bill.notes !== "string" && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Note:</span> {bill.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Processing Payment...
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