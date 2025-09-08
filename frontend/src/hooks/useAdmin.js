import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Hook for managing admin data (stats, users, stores)
export const useAdminData = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(userFilter && { role: userFilter })
      });

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.data.users || []);
      setTotalUsers(response.data.data.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setRefreshing(false);
    }
  }, [currentPage, searchTerm, userFilter]);

  const fetchStores = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/admin/stores');
      const storesData = response.data.data?.stores || response.data.data || [];
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    loading,
    stats,
    users,
    stores,
    totalUsers,
    refreshing,
    searchTerm,
    userFilter,
    currentPage,
    setSearchTerm,
    setUserFilter,
    setCurrentPage,
    setUsers,
    setStores,
    fetchDashboardData,
    fetchUsers,
    fetchStores
  };
};

// Hook for managing admin actions (create, update, delete)
export const useAdminActions = () => {
  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });
  
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    ownerName: '',
    ownerPassword: ''
  });

  const handleCreateUser = async (e, callbacks = {}) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', userForm);
      toast.success('User created successfully');
      setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
      if (callbacks.onSuccess) callbacks.onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create user');
    }
  };

  const handleCreateStore = async (e, callbacks = {}) => {
    e.preventDefault();
    try {
      await api.post('/admin/stores', storeForm);
      toast.success('Store created successfully');
      setStoreForm({ name: '', email: '', address: '', city: '', state: '', zip_code: '', ownerName: '', ownerPassword: '' });
      if (callbacks.onSuccess) callbacks.onSuccess();
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create store');
    }
  };

  const handleDeleteUser = async (userId, callback) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        if (callback) callback();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus, callback) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      if (callback) callback();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleViewUser = async (user) => {
    try {
      if (typeof user === 'object' && user.id) {
        return user;
      } else {
        const response = await api.get(`/admin/users/${user}`);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
      return null;
    }
  };

  return {
    userForm,
    storeForm,
    setUserForm,
    setStoreForm,
    handleCreateUser,
    handleCreateStore,
    handleDeleteUser,
    handleUserStatusToggle,
    handleViewUser
  };
};
