import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { AlertCircle, Shield, Plus } from 'lucide-react';
import { toast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { adminAPI } from '../services/api';

// Import modular components
import DashboardStats from '../components/admin/DashboardStats';
import UsersTab from '../components/admin/UsersTab';
import StoresTab from '../components/admin/StoresTab';
import AddUserModal from '../components/admin/AddUserModal';
import AddStoreModal from '../components/admin/AddStoreModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import StoreDetailsModal from '../components/admin/StoreDetailsModal';

// Custom hook for admin data management
const useAdminData = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, usersResponse, storesResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllUsers({ limit: 1000 }),
        adminAPI.getAllStores({ limit: 1000 })
      ]);

      if (statsResponse.success) setStats(statsResponse.data);
      if (usersResponse.success) setUsers(usersResponse.data.users || []);
      if (storesResponse.success) setStores(storesResponse.data.stores || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  // User actions
  const addUser = async (userData) => {
    try {
      console.log('Sending user data:', userData);
      const response = await adminAPI.createUser(userData);
      console.log('User creation response:', response);
      if (response.success) {
        setUsers(prevUsers => [response.data, ...prevUsers]);
        await refreshStats();
        toast({ title: "Success", description: "User created successfully" });
        return true;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      console.error("Error response:", error.response?.data);
      toast({ 
        title: "Error", 
        description: error.response?.data?.error?.message || "Failed to create user",
        variant: "destructive" 
      });
      return false;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await adminAPI.updateUser(userId, userData);
      if (response.success) {
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === userId ? { ...u, ...response.data } : u)
        );
        toast({ 
          title: "Success", 
          description: "User updated successfully" 
        });
        return true;
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update user", 
        variant: "destructive" 
      });
      return false;
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, { isActive });
      if (response.success) {
        // Update the user in the state immediately
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === userId ? { ...u, is_active: isActive } : u)
        );
        toast({ 
          title: "Success", 
          description: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
        });
        return true;
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update user status", 
        variant: "destructive" 
      });
      return false;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.success) {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        await refreshStats();
        toast({ title: "Success", description: "User deleted successfully" });
        return true;
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete user", 
        variant: "destructive" 
      });
      return false;
    }
  };

  // Store actions
  const addStore = async (storeData) => {
    try {
      console.log('Sending store data:', storeData);
      const response = await adminAPI.createStore(storeData);
      console.log('Store creation response:', response);
      if (response.success) {
        setStores(prevStores => [response.data, ...prevStores]);
        await refreshStats();
        toast({ title: "Success", description: "Store created successfully" });
        return true;
      }
    } catch (error) {
      console.error("Error creating store:", error);
      console.error("Error response:", error.response?.data);
      toast({ 
        title: "Error", 
        description: error.response?.data?.error?.message || "Failed to create store",
        variant: "destructive" 
      });
      return false;
    }
  };

  const updateStore = async (storeId, storeData) => {
    try {
      const response = await adminAPI.updateStore(storeId, storeData);
      if (response.success) {
        setStores(prevStores => 
          prevStores.map(s => s.id === storeId ? { ...s, ...response.data } : s)
        );
        toast({ 
          title: "Success", 
          description: "Store updated successfully" 
        });
        return true;
      }
    } catch (error) {
      console.error("Error updating store:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update store", 
        variant: "destructive" 
      });
      return false;
    }
  };

  const deleteStore = async (storeId) => {
    try {
      const response = await adminAPI.deleteStore(storeId);
      if (response.success) {
        setStores(prevStores => prevStores.filter(s => s.id !== storeId));
        await refreshStats();
        toast({ title: "Success", description: "Store deleted successfully" });
        return true;
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete store", 
        variant: "destructive" 
      });
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    stats,
    users,
    stores,
    loading,
    error,
    actions: {
      addUser,
      updateUser,
      updateUserStatus,
      deleteUser,
      addStore,
      updateStore,
      deleteStore,
      refreshData: fetchData
    }
  };
};

const AdminDashboard = () => {
  const { stats, users, stores, loading, error, actions } = useAdminData();
  
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showStoreDetailsModal, setShowStoreDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  
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

  // Search and filter states
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [storeSearchTerm, setStoreSearchTerm] = useState('');

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesFilter = !userFilter || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter stores based on search
  const filteredStores = stores.filter(store => 
    store.name?.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
    store.address?.toLowerCase().includes(storeSearchTerm.toLowerCase())
  );

  // Handle form submissions
  const validateUserForm = (userData) => {
    const errors = [];
    
    if (!userData.name || userData.name.length < 20 || userData.name.length > 60) {
      errors.push('Name must be 20-60 characters long');
    }
    
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Valid email is required');
    }
    
    if (!userData.password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/.test(userData.password)) {
      errors.push('Password must be 8-16 characters with uppercase, lowercase, number, and special character (@$!%*?&)');
    }
    
    if (!userData.address || userData.address.length > 400) {
      errors.push('Address is required and must be less than 400 characters');
    }
    
    return errors;
  };

  const validateStoreForm = (storeData) => {
    const errors = [];
    
    if (!storeData.name || storeData.name.length < 1 || storeData.name.length > 100) {
      errors.push('Store name must be 1-100 characters');
    }
    
    if (!storeData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeData.email)) {
      errors.push('Valid email is required');
    }
    
    if (!storeData.address || storeData.address.length > 400) {
      errors.push('Address is required and must be less than 400 characters');
    }
    
    if (!storeData.city || storeData.city.length < 1 || storeData.city.length > 50) {
      errors.push('City must be 1-50 characters');
    }
    
    if (!storeData.state || storeData.state.length < 1 || storeData.state.length > 50) {
      errors.push('State must be 1-50 characters');
    }
    
    if (!storeData.zip_code || storeData.zip_code.length < 1 || storeData.zip_code.length > 10) {
      errors.push('ZIP code must be 1-10 characters');
    }
    
    if (!storeData.ownerName || storeData.ownerName.length < 20 || storeData.ownerName.length > 60) {
      errors.push('Owner name must be 20-60 characters');
    }
    
    if (!storeData.ownerPassword || !/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/.test(storeData.ownerPassword)) {
      errors.push('Owner password must be 8-16 characters with uppercase and special character');
    }
    
    return errors;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateUserForm(userForm);
    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }
    
    const success = await actions.addUser(userForm);
    if (success) {
      setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
      setShowAddUserModal(false);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateStoreForm(storeForm);
    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }
    
    const success = await actions.addStore(storeForm);
    if (success) {
      setStoreForm({ name: '', email: '', address: '', city: '', state: '', zip_code: '', ownerName: '', ownerPassword: '' });
      setShowAddStoreModal(false);
    }
  };

  // Handle user actions
  const handleToggleUserStatus = async (userId, currentStatus) => {
    await actions.updateUserStatus(userId, !currentStatus);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleUserUpdate = (updatedUser) => {
    setSelectedUser(updatedUser);
    // The user list will be updated by the modal's onUserUpdate callback
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await actions.deleteUser(userId);
    }
  };

  const handleViewStore = (store) => {
    setSelectedStore(store);
    setShowStoreDetailsModal(true);
  };

  const handleStoreUpdate = (updatedStore) => {
    setSelectedStore(updatedStore);
    // The store list will be updated by the modal's onStoreUpdate callback
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      await actions.deleteStore(storeId);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">System overview and management</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner className="h-8 w-8" />
              <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-8">
              <Card className="border-destructive">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error loading dashboard data</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{error}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && !error && (
            <>
              {/* Stats Cards */}
              <DashboardStats stats={stats} loading={loading} />

              {/* Management Tabs */}
              <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users">User Management</TabsTrigger>
                  <TabsTrigger value="stores">Store Management</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">User Management</h2>
                      <Button onClick={() => setShowAddUserModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                    <UsersTab 
                      users={filteredUsers}
                      searchTerm={userSearchTerm}
                      setSearchTerm={setUserSearchTerm}
                      userFilter={userFilter}
                      setUserFilter={setUserFilter}
                      onViewUser={handleViewUser}
                      onToggleStatus={handleToggleUserStatus}
                      onDeleteUser={handleDeleteUser}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="stores">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Store Management</h2>
                      <Button onClick={() => setShowAddStoreModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Store
                      </Button>
                    </div>
                    <StoresTab 
                      stores={filteredStores}
                      searchTerm={storeSearchTerm}
                      setSearchTerm={setStoreSearchTerm}
                      onViewStore={handleViewStore}
                      onDeleteStore={handleDeleteStore}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        userForm={userForm}
        setUserForm={setUserForm}
        onSubmit={handleAddUser}
      />

      <AddStoreModal
        isOpen={showAddStoreModal}
        onClose={() => setShowAddStoreModal(false)}
        storeForm={storeForm}
        setStoreForm={setStoreForm}
        onSubmit={handleAddStore}
      />

      <UserDetailsModal
        isOpen={showUserDetailsModal}
        onClose={() => setShowUserDetailsModal(false)}
        user={selectedUser}
        onUserUpdate={handleUserUpdate}
      />

      <StoreDetailsModal
        isOpen={showStoreDetailsModal}
        onClose={() => setShowStoreDetailsModal(false)}
        store={selectedStore}
        onStoreUpdate={handleStoreUpdate}
      />
    </ProtectedRoute>
  );
};

export default AdminDashboard;
