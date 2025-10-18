import React, { useState } from 'react';
import { completeOnboarding } from '../api/restaurant';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, Check, Upload, X, 
  MapPin, Phone, Clock, Utensils, Music, 
  Wine, Wifi, Car, UtensilsCrossed, Home
} from 'lucide-react';

export default function RestaurantOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    restaurantName: '',
    address: '',
    city: '',
    zipcode: '',
    phone: '',
    description: '',
    
    // Step 2: Images
    thumbnail: null,
    ambiancePhotos: [],
    menuPhotos: [],
    
    // Step 3: Operating Hours
    hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    
    // Step 4: Cuisine & Features
    cuisines: [],
    features: []
  });

  const totalSteps = 4;

  const cuisineOptions = [
    { name: 'Italian', emoji: '🍝' },
    { name: 'American', emoji: '🍔' },
    { name: 'Japanese', emoji: '🍣' },
    { name: 'Mexican', emoji: '🌮' },
    { name: 'Indian', emoji: '🍛' },
    { name: 'Chinese', emoji: '🥡' },
    { name: 'Thai', emoji: '🍜' },
    { name: 'Mediterranean', emoji: '🥙' },
    { name: 'French', emoji: '🥐' },
    { name: 'Korean', emoji: '🍲' },
    { name: 'Spanish', emoji: '🥘' },
    { name: 'Greek', emoji: '🧆' }
  ];

  const featureOptions = [
    { name: 'Outdoor Seating', icon: Home },
    { name: 'Live Music', icon: Music },
    { name: 'Alcohol', icon: Wine },
    { name: 'WiFi', icon: Wifi },
    { name: 'Parking', icon: Car },
    { name: 'Vegetarian Options', icon: UtensilsCrossed },
    { name: 'Vegan Options', icon: Utensils },
    { name: 'Gluten-Free Options', icon: Utensils },
    { name: 'Pet Friendly', icon: Home },
    { name: 'Delivery Available', icon: Car },
    { name: 'Takeout Available', icon: Home },
    { name: 'Reservations Required', icon: Clock }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'thumbnail') {
      setFormData({ ...formData, thumbnail: files[0] });
    } else if (type === 'ambiance') {
      setFormData({ ...formData, ambiancePhotos: [...formData.ambiancePhotos, ...files] });
    } else if (type === 'menu') {
      setFormData({ ...formData, menuPhotos: [...formData.menuPhotos, ...files] });
    }
  };

  const removePhoto = (type, index) => {
    if (type === 'thumbnail') {
      setFormData({ ...formData, thumbnail: null });
    } else if (type === 'ambiance') {
      const newPhotos = formData.ambiancePhotos.filter((_, i) => i !== index);
      setFormData({ ...formData, ambiancePhotos: newPhotos });
    } else if (type === 'menu') {
      const newPhotos = formData.menuPhotos.filter((_, i) => i !== index);
      setFormData({ ...formData, menuPhotos: newPhotos });
    }
  };

  const handleHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: { ...formData.hours[day], [field]: value }
      }
    });
  };

  const toggleCuisine = (cuisine) => {
    if (formData.cuisines.includes(cuisine)) {
      setFormData({ ...formData, cuisines: formData.cuisines.filter(c => c !== cuisine) });
    } else {
      setFormData({ ...formData, cuisines: [...formData.cuisines, cuisine] });
    }
  };

  const toggleFeature = (feature) => {
    if (formData.features.includes(feature)) {
      setFormData({ ...formData, features: formData.features.filter(f => f !== feature) });
    } else {
      setFormData({ ...formData, features: [...formData.features, feature] });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await completeOnboarding(formData);
      console.log('Profile created:', response);
      
      // Show success message
      alert('Restaurant profile created successfully! 🎉');
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.detail || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

//   // Add error display in your form
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
//       {/* ... header ... */}
      
//       <div className="bg-white rounded-3xl shadow-2xl p-8">
//         {/* Show error if any */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
//             {error}
//           </div>
//         )}
        
//         {/* ... rest of form ... */}
        
//         {/* Update submit button */}
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Check className="w-5 h-5" />
//           {loading ? 'Saving...' : 'Complete Setup'}
//         </button>
//       </div>
//     </div>
//   );
// }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              TableTreats Partner
            </h1>
          </div>
          <p className="text-gray-600">Complete your restaurant profile</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-110 shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-2 mx-2 rounded-full transition-all ${
                    currentStep > step ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Basic Info</span>
            <span>Photos</span>
            <span>Hours</span>
            <span>Details</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Name *</label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  placeholder="Bella Vista Ristorante"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New Brunswick"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Zipcode *</label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    placeholder="08901"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(732) 555-0123"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell customers about your restaurant..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Photos</h2>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Photo *</label>
                <p className="text-sm text-gray-500 mb-3">This will be the main photo customers see</p>
                {!formData.thumbnail ? (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-500 transition-colors bg-gradient-to-br from-gray-50 to-purple-50">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-600 font-medium">Click to upload cover photo</span>
                    <span className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                  </label>
                ) : (
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(formData.thumbnail)} 
                      alt="Thumbnail" 
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => removePhoto('thumbnail')}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Ambiance Photos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ambiance Photos</label>
                <p className="text-sm text-gray-500 mb-3">Show the atmosphere of your restaurant (up to 6 photos)</p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {formData.ambiancePhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt={`Ambiance ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removePhoto('ambiance', index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {formData.ambiancePhotos.length < 6 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-600">Add ambiance photos</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'ambiance')} />
                  </label>
                )}
              </div>

              {/* Menu Photos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Menu Photos</label>
                <p className="text-sm text-gray-500 mb-3">Upload photos of your menu (up to 4 photos)</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {formData.menuPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt={`Menu ${index + 1}`} 
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removePhoto('menu', index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {formData.menuPhotos.length < 4 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-600">Add menu photos</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'menu')} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Operating Hours */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Operating Hours</h2>
              
              {Object.keys(formData.hours).map((day) => (
                <div key={day} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl">
                  <div className="w-28">
                    <span className="font-semibold text-gray-900 capitalize">{day}</span>
                  </div>
                  
                  {!formData.hours[day].closed ? (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={formData.hours[day].open}
                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData.hours[day].close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <button
                        onClick={() => handleHoursChange(day, 'closed', true)}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 font-medium"
                      >
                        Mark Closed
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 text-gray-500 font-medium">Closed</div>
                      <button
                        onClick={() => handleHoursChange(day, 'closed', false)}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg"
                      >
                        Set Hours
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Cuisine & Features */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cuisine Types</h2>
                <p className="text-gray-600 mb-4">Select all that apply (minimum 1)</p>
                <div className="grid grid-cols-3 gap-3">
                  {cuisineOptions.map((cuisine) => (
                    <button
                      key={cuisine.name}
                      onClick={() => toggleCuisine(cuisine.name)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.cuisines.includes(cuisine.name)
                          ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 scale-105'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cuisine.emoji}</div>
                      <div className="text-sm font-semibold text-gray-900">{cuisine.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Features & Amenities</h2>
                <p className="text-gray-600 mb-4">What makes your restaurant special?</p>
                <div className="grid grid-cols-2 gap-3">
                  {featureOptions.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <button
                        key={feature.name}
                        onClick={() => toggleFeature(feature.name)}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          formData.features.includes(feature.name)
                            ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50'
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${formData.features.includes(feature.name) ? 'text-pink-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-semibold text-gray-900">{feature.name}</span>
                        {formData.features.includes(feature.name) && (
                          <Check className="w-5 h-5 text-pink-600 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
              >
                <Check className="w-5 h-5" />
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )};
