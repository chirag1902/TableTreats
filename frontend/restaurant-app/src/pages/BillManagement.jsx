const addManualItem = () => {
    if (!manualItemForm.dish_name.trim() || !manualItemForm.unit_price) {
      setError('Please fill in all fields');
      return;
    }

    setBillItems([...billItems, {
      dish_id: Date.now().toString(), // Unique ID for manual items
      dish_name: manualItemForm.dish_name,
      quantity: parseInt(manualItemForm.quantity) || 1,
      unit_price: parseFloat(manualItemForm.unit_price),
      deal_applied: null
    }]);

    setManualItemForm({
      dish_name: '',
      quantity: 1,
      unit_price: ''
    });
    setError('');
  };import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle,
  DollarSign, Percent, Gift, X, Download, Send
} from 'lucide-react';

export default function BillManagement() {
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [menu, setMenu] = useState([]);
  const [deals, setDeals] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [billItems, setBillItems] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [taxRate, setTaxRate] = useState(8.5);
  const [notes, setNotes] = useState('');

  const [manualItemForm, setManualItemForm] = useState({
    dish_name: '',
    quantity: 1,
    unit_price: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('restaurant_token');
    try {
      // Fetch menu, deals, and reservations
      const [menuRes, dealsRes, reservationsRes] = await Promise.all([
        fetch('http://localhost:8001/api/restaurant/menu', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8001/api/restaurant/promos', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8001/api/restaurant/reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (menuRes.ok) {
        const data = await menuRes.json();
        setMenu(Array.isArray(data) ? data : data.menu || []);
      }
      if (dealsRes.ok) {
        const data = await dealsRes.json();
        setDeals(Array.isArray(data) ? data : data.promos || []);
      }
      if (reservationsRes.ok) {
        const data = await reservationsRes.json();
        setReservations(Array.isArray(data) ? data : data.reservations || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const addItem = (dish) => {
    const existingItem = billItems.find(item => item.dish_id === dish._id);
    if (existingItem) {
      updateItemQuantity(dish._id, existingItem.quantity + 1);
    } else {
      setBillItems([...billItems, {
        dish_id: dish._id,
        dish_name: dish.name,
        quantity: 1,
        unit_price: dish.price,
        deal_applied: null
      }]);
    }
  };

  const updateItemQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setBillItems(billItems.map(item =>
      item.dish_id === dishId ? { ...item, quantity } : item
    ));
  };

  const applyDealToItem = (dishId, deal) => {
    setBillItems(billItems.map(item => {
      if (item.dish_id === dishId) {
        return {
          ...item,
          deal_applied: deal ? {
            deal_id: deal.id,
            deal_type: deal.discount_type,
            discount_value: deal.discount_value
          } : null
        };
      }
      return item;
    }));
  };

  const removeItem = (dishId) => {
    setBillItems(billItems.filter(item => item.dish_id !== dishId));
  };

  const calculateItemSubtotal = (item) => {
    return item.quantity * item.unit_price;
  };

  const calculateItemDiscount = (item) => {
    if (!item.deal_applied) return 0;

    const subtotal = calculateItemSubtotal(item);
    if (item.deal_applied.deal_type === 'percentage') {
      return (subtotal * item.deal_applied.discount_value) / 100;
    } else if (item.deal_applied.deal_type === 'flat_amount') {
      return item.deal_applied.discount_value;
    } else if (item.deal_applied.deal_type === 'bogo') {
      return subtotal / 2;
    }
    return 0;
  };

  const calculations = {
    subtotal: billItems.reduce((sum, item) => sum + calculateItemSubtotal(item), 0),
    totalDiscount: billItems.reduce((sum, item) => sum + calculateItemDiscount(item), 0),
    get subtotalAfterDiscount() {
      return this.subtotal - this.totalDiscount;
    },
    get taxAmount() {
      return (this.subtotalAfterDiscount * taxRate) / 100;
    },
    get total() {
      return this.subtotalAfterDiscount + this.taxAmount;
    }
  };

  const handleCreateBill = async () => {
    if (billItems.length === 0) {
      setError('Add at least one item to create a bill');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('restaurant_token');

      const billData = {
        reservation_id: selectedReservation?._id,
        customer_name: selectedReservation?.customer_name || '',
        customer_email: selectedReservation?.customer_email || '',
        customer_phone: selectedReservation?.customer_phone || '',
        items: billItems.map(item => ({
          dish_name: item.dish_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: calculateItemSubtotal(item),
          discount_amount: calculateItemDiscount(item),
          deal_applied: item.deal_applied
        })),
        subtotal: calculations.subtotal,
        total_discount: calculations.totalDiscount,
        subtotal_after_discount: calculations.subtotalAfterDiscount,
        tax_rate: taxRate,
        tax_amount: calculations.taxAmount,
        total: calculations.total,
        notes: notes,
        status: 'draft'
      };

      const response = await fetch('http://localhost:8001/api/restaurant/bills', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(billData)
      });

      if (response.ok) {
        const newBill = await response.json();
        setSuccess('Bill created successfully!');
        setBillItems([]);
        setSelectedReservation(null);
        setNotes('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to create bill');
      }
    } catch (err) {
      console.error('Error creating bill:', err);
      setError('An error occurred while creating the bill');
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
              <h1 className="text-2xl font-bold text-gray-900">Bill Management</h1>
              <p className="text-sm text-gray-600">Create and manage customer bills</p>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Section - Bill Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select Reservation */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Customer</h2>
              <select
                value={selectedReservation?._id || ''}
                onChange={(e) => {
                  const reservation = reservations.find(r => r._id === e.target.value);
                  setSelectedReservation(reservation);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              >
                <option value="">Select a reservation</option>
                {reservations.map(res => (
                  <option key={res._id} value={res._id}>
                    {res.customer_name} - {res.number_of_guests} guests
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Items</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Dish Name</label>
                  <input
                    type="text"
                    value={manualItemForm.dish_name}
                    onChange={(e) => setManualItemForm({...manualItemForm, dish_name: e.target.value})}
                    placeholder="e.g., Chicken Burrito"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={manualItemForm.quantity}
                      onChange={(e) => setManualItemForm({...manualItemForm, quantity: parseInt(e.target.value) || 1})}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={manualItemForm.unit_price}
                      onChange={(e) => setManualItemForm({...manualItemForm, unit_price: parseFloat(e.target.value) || ''})}
                      placeholder="0.00"
                      step="0.01"
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
            </div>
          </div>

          {/* Right Section - Bill Summary */}
          <div className="space-y-6">
            {/* Bill Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Bill Items</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {billItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items added</p>
                ) : (
                  billItems.map((item) => (
                    <div key={item.dish_id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.dish_name}</p>
                          <p className="text-sm text-gray-600">${item.unit_price}</p>
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
                          onClick={() => updateItemQuantity(item.dish_id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.dish_id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => updateItemQuantity(item.dish_id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-600 ml-auto">
                          ${calculateItemSubtotal(item).toFixed(2)}
                        </span>
                      </div>

                      {calculateItemDiscount(item) > 0 && (
                        <div className="text-sm text-green-600 font-semibold mb-2">
                          -${calculateItemDiscount(item).toFixed(2)} discount
                        </div>
                      )}

                      <select
                        onChange={(e) => {
                          const deal = deals.find(d => d.id === e.target.value);
                          applyDealToItem(item.dish_id, deal);
                        }}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">Apply deal</option>
                        {deals.filter(d => d.is_active).map(deal => (
                          <option key={deal.id} value={deal.id}>
                            {deal.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tax Rate */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
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
                <span className="font-semibold">${calculations.subtotal.toFixed(2)}</span>
              </div>
              {calculations.totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-${calculations.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-700">After Discount</span>
                <span className="font-semibold">${calculations.subtotalAfterDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax ({taxRate}%)</span>
                <span className="font-semibold">${calculations.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-pink-200 pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  ${calculations.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Create Bill Button */}
            <button
              onClick={handleCreateBill}
              disabled={loading || billItems.length === 0}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}