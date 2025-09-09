import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

export default api;

// Store API functions
export const storeAPI = {
  // Get all stores with optional search parameters
  getStores: async (params = {}) => {
    const response = await api.get('/stores', { params });
    return response.data;
  },

  // Get a single store by ID or 'me'
  getStore: async (id) => {
    if (id === 'me') {
      const response = await api.get('/store/profile');
      return response.data;
    }
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  // Get user's rating for a store
  getUserStoreRating: async (storeId) => {
    const response = await api.get(`/stores/${storeId}/rating`);
    return response.data;
  },

  // Update a store by ID or 'me'
  updateStore: async (storeId, storeData) => {
    if (storeId === 'me') {
      const response = await api.put('/store/profile', storeData);
      return response.data;
    }
    const response = await api.put(`/stores/${storeId}`, storeData);
    return response.data;
  },

  // Explicit getMyStore and updateMyStore for clarity
  getMyStore: async () => {
    const response = await api.get('/store/profile');
    return response.data;
  },
  updateMyStore: async (storeData) => {
    const response = await api.put('/store/profile', storeData);
    return response.data;
  }
};

// Review API functions
export const reviewAPI = {
  // Get reviews for a store
  getStoreReviews: async (storeId, params = {}) => {
    const response = await api.get(`/reviews/stores/${storeId}/reviews`, { params });
    return response.data;
  },

  // Create a new review
  createReview: async (storeId, reviewData) => {
    const response = await api.post(`/reviews/stores/${storeId}/reviews`, reviewData);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async () => {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  },

  // Get user's review for a specific store (need to check existing reviews)
  getUserStoreReview: async (storeId) => {
    // Since there's no specific endpoint, we get user reviews and filter
    const response = await api.get('/reviews/my-reviews');
    if (response.data.success) {
      const userReview = response.data.data.reviews.find(review => review.store_id === storeId);
      return {
        success: true,
        data: { userRating: userReview || null }
      };
    }
    return response.data;
  }
};

// Admin API functions
export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users with filtering and pagination
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get all stores for admin
  getAllStores: async (params = {}) => {
    const response = await api.get('/admin/stores', { params });
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Create new store
  createStore: async (storeData) => {
    const response = await api.post('/admin/stores', storeData);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId, statusData) => {
    const response = await api.put(`/admin/users/${userId}/status`, statusData);
    return response.data;
  },

  // Update user details
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Delete store (if backend supports it)
  deleteStore: async (storeId) => {
    const response = await api.delete(`/admin/stores/${storeId}`);
    return response.data;
  }
};
