import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, LoadingSpinner, Button } from '../components/UI';
import StarRating from '../components/StarRating';
import api from '../services/api';
import { 
  Store, 
  TrendingUp, 
  MessageSquare, 
  Star, 
  Edit3,
  Eye,
  Clock,
  User,
  BarChart3
} from 'lucide-react';

const StoreDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === 'owner') {
      fetchDashboardData();
    } else if (user && user.role !== 'owner') {
      setError('Access denied. Only store owners can access this page.');
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // First, fetch store profile to get the current user's store
      const storeResponse = await api.get('/store/profile');
      const store = storeResponse.data.data;
      setStoreInfo(store);
      // Then fetch dashboard stats using the store ID from the profile
      const dashboardResponse = await api.get(`/store/${store.id}`);
      setDashboardStats(dashboardResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 404 || error.response?.status === 400) {
        setError('No store found for your account. Please contact admin to set up your store.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You are not authorized to access this store dashboard.');
      } else {
        setError(error.response?.data?.error?.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading your store dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Store className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard Access Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          {!error.includes('Access denied') && (
            <Button onClick={fetchDashboardData}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Store className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">No Store Found</h1>
          <p className="text-muted-foreground mb-6">
            No store is associated with your account. Please contact the administrator to set up your store.
          </p>
        </div>
      </div>
    );
  }

  const stats = dashboardStats?.stats || {};
  const recentReviews = dashboardStats?.recentReviews || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Store Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Welcome back, manage your store performance</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  navigate(`/store/${storeInfo.id}`);
                }}
              >
                <Eye className="h-4 w-4" />
                View Store Page
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => navigate('/store/edit')}
              >
                <Edit3 className="h-4 w-4" />
                Edit Store
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Info Card */}
        <Card className="mb-8 bg-card text-card-foreground">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-accent rounded-full p-3">
                  <Store className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{storeInfo.name}</h2>
                  <p className="text-muted-foreground">{storeInfo.address}</p>
                  <p className="text-sm text-muted-foreground">{storeInfo.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <StarRating value={storeInfo.averageRating || 0} readonly size="lg" />
                  <span className="text-2xl font-bold text-foreground">
                    {(storeInfo.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {storeInfo.reviewCount || 0} total reviews
                </p>
              </div>
            </div>
          </div>
        </Card>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card text-card-foreground">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-full p-2">
                  <MessageSquare className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReviews || 0}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-card text-card-foreground">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-full p-2">
                  <Star className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(stats.averageRating || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-card text-card-foreground">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-full p-2">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Reviews</p>
                  <p className="text-2xl font-bold text-foreground">{stats.recentReviews || 0}</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-card text-card-foreground">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-full p-2">
                  <BarChart3 className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Store Views</p>
                  <p className="text-2xl font-bold text-foreground">N/A</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        {/* Recent Reviews */}
        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-card text-card-foreground">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Recent Reviews</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigate(`/store/${storeInfo.id}`);
                  }}
                >
                  View All Reviews
                </Button>
              </div>
              {recentReviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">No reviews yet</h4>
                  <p className="text-muted-foreground">Your store hasn't received any reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-foreground">
                              {review.user_name || 'Anonymous User'}
                            </p>
                            <div className="flex items-center gap-1">
                              <StarRating value={review.rating} readonly size="sm" />
                              <span className="text-sm text-muted-foreground">
                                ({review.rating})
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground text-sm mb-2">{review.comment}</p>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
