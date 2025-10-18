import axios from 'axios';

const API_URL = 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Existing functions...
export async function restaurantSignup(payload) {
  const { data } = await api.post('/restaurant/signup', payload);
  return data;
}

export async function restaurantLogin(credentials) {
  const { data } = await api.post('/restaurant/login', credentials);
  
  if (data.access_token) {
    localStorage.setItem('restaurant_token', data.access_token);
  } else {
    localStorage.setItem('restaurant_token', 'logged_in');
    localStorage.setItem('restaurant_email', credentials.email);
  }
  
  return data;
}

// ✅ NEW: Complete onboarding
export async function completeOnboarding(formData) {
  const token = localStorage.getItem('restaurant_token');
  
  // Create FormData for file uploads
  const payload = new FormData();
  
  // Add text fields
  payload.append('restaurant_name', formData.restaurantName);
  payload.append('address', formData.address);
  payload.append('city', formData.city);
  payload.append('zipcode', formData.zipcode);
  payload.append('phone', formData.phone);
  payload.append('description', formData.description);
  
  // Add cuisines and features as JSON
  payload.append('cuisines', JSON.stringify(formData.cuisines));
  payload.append('features', JSON.stringify(formData.features));
  payload.append('hours', JSON.stringify(formData.hours));
  
  // Add thumbnail
  if (formData.thumbnail) {
    payload.append('thumbnail', formData.thumbnail);
  }
  
  // Add ambiance photos
  formData.ambiancePhotos.forEach((photo, index) => {
    payload.append(`ambiance_photo_${index}`, photo);
  });
  
  // Add menu photos
  formData.menuPhotos.forEach((photo, index) => {
    payload.append(`menu_photo_${index}`, photo);
  });
  
  const { data } = await axios.post(
    `${API_URL}/restaurant/complete-profile`,
    payload,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return data;
}

// ✅ NEW: Get restaurant profile
export async function getRestaurantProfile() {
  const token = localStorage.getItem('restaurant_token');
  
  const { data } = await api.get('/restaurant/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return data;
}