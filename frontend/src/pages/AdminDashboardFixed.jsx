import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { AlertCircle, Shield } from 'lucide-react';
import { toast } from '../components/ui/use-toast';
import { adminAPI } from '../services/api';

// Import modular components
import DashboardStats from '../components/admin/DashboardStats';
import { OverviewTab, UsersTab, StoresTab } from '../components/admin';

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
      const response = await adminAPI.createUser(userData);
      if (response.success) {
        setUsers([response.data, ...users]);
        await refreshStats();
        toast({ title: "Success", description: "User created successfully" });
        return true;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.error?.message || "Failed to create user",
        variant: "destructive" 
      });
      return false;
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, { is_active: isActive });
      if (response.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: isActive } : u));
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
        setUsers(users.filter(u => u.id !== userId));
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
      const response = await adminAPI.createStore(storeData);
      if (response.success) {
        setStores([response.data, ...stores]);
        await refreshStats();
        toast({ title: "Success", description: "Store created successfully" });
        return true;
      }
    } catch (error) {
      console.error("Error creating store:", error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.error?.message || "Failed to create store",
        variant: "destructive" 
      });
      return false;
    }
  };

  const deleteStore = async (storeId) => {
    try {
      const response = await adminAPI.deleteStore(storeId);
      if (response.success) {
        setStores(stores.filter(s => s.id !== storeId));
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
      updateUserStatus,
      deleteUser,
      addStore,
      deleteStore,
      refreshData: fetchData
    }
  };
};

const AdminDashboard = () => {
  const { stats, users, stores, loading, error, actions } = useAdminData();

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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="users">User Management</TabsTrigger>
                  <TabsTrigger value="stores">Store Management</TabsTrigger>
                  <TabsTrigger value="overview">System Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                  <UsersTab 
                    users={users} 
                    onAddUser={actions.addUser}
                    onUpdateUserStatus={actions.updateUserStatus}
                    onDeleteUser={actions.deleteUser}
                  />
                </TabsContent>

                <TabsContent value="stores">
                  <StoresTab 
                    stores={stores} 
                    onAddStore={actions.addStore}
                    onDeleteStore={actions.deleteStore}
                  />
                </TabsContent>

                <TabsContent value="overview">
                  <OverviewTab stats={stats} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
