import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Users, Store } from 'lucide-react';
import { LoadingSpinner, Button } from '../components/UI';
import api from '../services/api';
import toast from 'react-hot-toast';

// Import clean modular components
import {
  OverviewTab,
  UsersTab,
  StoresTab,
  AddUserModal,
  AddStoreModal,
  UserDetailsModal
} from '../components/admin';

const AdminDashboard = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  
  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  
  // Modal states
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', address: '', role: 'user'
  });
  const [storeForm, setStoreForm] = useState({
    name: '', email: '', address: '', city: '', state: '', zip_code: '', ownerName: '', ownerPassword: ''
  });

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'stores', label: 'Stores', icon: Store }
  ];

  // Data fetching functions
  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, storesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?page=1&limit=50'),
        api.get('/admin/stores')
      ]);
      
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users || []);
      setStores(storesRes.data.data?.stores || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: 1, limit: 50,
        ...(searchTerm && { search: searchTerm }),
        ...(userFilter && { role: userFilter })
      });
      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  // Action handlers
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', userForm);
      toast.success('User created successfully');
      setShowAddUser(false);
      setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create user');
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating store with data:', storeForm);
      await api.post('/admin/stores', storeForm);
      toast.success('Store created successfully');
      setShowAddStore(false);
      setStoreForm({ name: '', email: '', address: '', city: '', state: '', zip_code: '', ownerName: '', ownerPassword: '' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating store:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error?.message || 'Failed to create store');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [searchTerm, userFilter, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users and stores</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowAddUser(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button onClick={() => setShowAddStore(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Store
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            onViewUser={handleViewUser}
            onToggleStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
          />
        )}
        
        {activeTab === 'stores' && <StoresTab stores={stores} />}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        userForm={userForm}
        setUserForm={setUserForm}
        onSubmit={handleCreateUser}
      />

      <AddStoreModal
        isOpen={showAddStore}
        onClose={() => setShowAddStore(false)}
        storeForm={storeForm}
        setStoreForm={setStoreForm}
        onSubmit={handleCreateStore}
      />

      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminDashboard;
