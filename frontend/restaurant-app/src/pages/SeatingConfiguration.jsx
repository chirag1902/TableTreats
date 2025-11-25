import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, X, Users, Armchair, Save, Edit2, 
  Check, AlertCircle, ChevronRight, Home
} from 'lucide-react';

export default function SeatingConfiguration() {
  const navigate = useNavigate();  
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [seatingConfig, setSeatingConfig] = useState({
    areas: [
      { id: 1, name: 'Indoor Dining', tables: [] }
    ]
  });

  // Fetch existing seating configuration from database
  useEffect(() => {
    const fetchSeatingConfig = async () => {
      try {
        const response = await fetch('/api/restaurant/seating-config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add your auth token here if needed
            // 'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.areas && data.areas.length > 0) {
            setSeatingConfig(data);
            setEditMode(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch seating config:', err);
        // Keep default empty config if fetch fails
      }
    };
    
    fetchSeatingConfig();
  }, []);

  const areaTypes = [
    'Indoor Dining',
    'Outdoor Patio',
    'Bar Area',
    'Private Room',
    'Lounge',
    'Rooftop',
    'Terrace',
    'Garden'
  ];

  const addArea = () => {
    const newArea = {
      id: Date.now(),
      name: areaTypes[0],
      tables: []
    };
    setSeatingConfig({
      areas: [...seatingConfig.areas, newArea]
    });
  };

  const removeArea = (areaId) => {
    setSeatingConfig({
      areas: seatingConfig.areas.filter(a => a.id !== areaId)
    });
  };

  const updateAreaName = (areaId, newName) => {
    setSeatingConfig({
      areas: seatingConfig.areas.map(area =>
        area.id === areaId ? { ...area, name: newName } : area
      )
    });
  };

  const addTable = (areaId) => {
    const newTable = {
      id: Date.now(),
      capacity: 2,
      quantity: 1
    };
    setSeatingConfig({
      areas: seatingConfig.areas.map(area =>
        area.id === areaId
          ? { ...area, tables: [...area.tables, newTable] }
          : area
      )
    });
  };

  const removeTable = (areaId, tableId) => {
    setSeatingConfig({
      areas: seatingConfig.areas.map(area =>
        area.id === areaId
          ? { ...area, tables: area.tables.filter(t => t.id !== tableId) }
          : area
      )
    });
  };

  const updateTable = (areaId, tableId, field, value) => {
    setSeatingConfig({
      areas: seatingConfig.areas.map(area =>
        area.id === areaId
          ? {
              ...area,
              tables: area.tables.map(table =>
                table.id === tableId ? { ...table, [field]: parseInt(value) || 0 } : table
              )
            }
          : area
      )
    });
  };

  const getTotalSeats = () => {
    return seatingConfig.areas.reduce((total, area) => {
      return total + area.tables.reduce((areaTotal, table) => {
        return areaTotal + (table.capacity * table.quantity);
      }, 0);
    }, 0);
  };

  const getAreaSeats = (area) => {
    return area.tables.reduce((total, table) => {
      return total + (table.capacity * table.quantity);
    }, 0);
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/restaurant/seating-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth token here if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(seatingConfig)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save seating configuration');
      }
      
      const data = await response.json();
      console.log('Seating config saved successfully:', data);
      
      setSaveSuccess(true);
      setEditMode(false);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save seating configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="hover:text-pink-600 transition-colors"
                  >
                    Dashboard
                   </button>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-semibold">Seating Configuration</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Chipotle - New Brunswick</h1>
              </div>
            </div>
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
             >
                <Home className="w-4 h-4" />
                Back to Dashboard
             </button>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3 text-green-700">
            <Check className="w-5 h-5" />
            <span className="font-semibold">Seating configuration saved successfully!</span>
          </div>
        )}

        {/* Overview Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seating Configuration</h2>
              <p className="text-gray-600">
                Configure your restaurant's seating areas and table arrangements for reservations
              </p>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Available Seats</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {getTotalSeats()}
              </div>
            </div>
          </div>

          {!editMode ? (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
              >
                <Edit2 className="w-5 h-5" />
                Edit Configuration
              </button>
            </div>
          ) : (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditMode(false)}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <div className="font-semibold mb-1">How Seating Configuration Works</div>
            <p className="text-blue-700">
              Define your seating areas (Indoor, Outdoor, Bar, etc.) and specify the number and capacity of tables in each area. 
              This helps customers see available seats when making reservations. For example: "Indoor Dining" with 5 tables 
              that seat 4 people each = 20 total seats available for booking in that area.
            </p>
          </div>
        </div>

        {/* Seating Areas */}
        <div className="space-y-6">
          {seatingConfig.areas.map((area, areaIndex) => (
            <div key={area.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Area Header */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 border-b-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Armchair className="w-6 h-6 text-pink-600" />
                    {editMode ? (
                      <select
                        value={area.name}
                        onChange={(e) => updateAreaName(area.id, e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 font-semibold text-gray-900 text-lg"
                      >
                        {areaTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <h3 className="text-xl font-bold text-gray-900">{area.name}</h3>
                    )}
                    <div className="ml-auto text-right">
                      <div className="text-sm text-gray-600">Area Capacity</div>
                      <div className="text-2xl font-bold text-gray-900">{getAreaSeats(area)} seats</div>
                    </div>
                  </div>
                  {editMode && seatingConfig.areas.length > 1 && (
                    <button
                      onClick={() => removeArea(area.id)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tables */}
              <div className="p-6">
                {area.tables.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tables configured for this area</p>
                    {editMode && (
                      <button
                        onClick={() => addTable(area.id)}
                        className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Table
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {area.tables.map((table, tableIndex) => (
                      <div key={table.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 font-medium">Seats per table</span>
                          {editMode ? (
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={table.capacity}
                              onChange={(e) => updateTable(area.id, table.id, 'capacity', e.target.value)}
                              className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:border-pink-500"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-900">{table.capacity}</span>
                          )}
                        </div>
                        <X className="text-gray-400 font-bold" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 font-medium">Number of tables</span>
                          {editMode ? (
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={table.quantity}
                              onChange={(e) => updateTable(area.id, table.id, 'quantity', e.target.value)}
                              className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:border-pink-500"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-900">{table.quantity}</span>
                          )}
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Total</div>
                            <div className="text-xl font-bold text-pink-600">
                              {table.capacity * table.quantity} seats
                            </div>
                          </div>
                          {editMode && (
                            <button
                              onClick={() => removeTable(area.id, table.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {editMode && (
                      <button
                        onClick={() => addTable(area.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-colors text-gray-600 hover:text-pink-600 font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        Add Table Configuration
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Area Button */}
        {editMode && (
          <button
            onClick={addArea}
            className="w-full mt-6 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-pink-300 rounded-2xl hover:border-pink-500 hover:bg-pink-50 transition-colors text-pink-600 font-semibold text-lg"
          >
            <Plus className="w-6 h-6" />
            Add New Seating Area
          </button>
        )}
      </div>
    </div>
  );
}