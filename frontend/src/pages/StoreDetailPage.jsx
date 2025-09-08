import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, MessageSquare, Clock, User, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button, Card, LoadingSpinner } from '../components/UI';
import StarRating from '../components/StarRating';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

// Rating validation schema
const ratingSchema = yup.object({
  rating: yup
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .required('Rating is required'),
  comment: yup
    .string()
    .max(500, 'Comment must be at most 500 characters')
});

const StoreDetailPage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(ratingSchema),
    defaultValues: {
      rating: 0,
      comment: ''
    }
  });

  const watchedRating = watch('rating');

  useEffect(() => {
    const fetchData = async () => {
      if (storeId) {
        await fetchStoreDetails();
        await fetchStoreReviews();
        if (isAuthenticated) {
          await fetchUserReview();
        }
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, isAuthenticated]);

  const fetchStoreDetails = async () => {
    try {
      const response = await api.get(`/stores/${storeId}`);
      console.log('Store details response:', response.data);
      setStore(response.data.data.store);
    } catch (error) {
      console.error('Error fetching store details:', error);
      toast.error('Failed to load store details');
      // Don't navigate away immediately, show error state instead
      setStore(null);
    }
  };

  const fetchStoreReviews = async () => {
    try {
      // Use the correct reviews endpoint structure
      const response = await api.get(`/reviews/stores/${storeId}/reviews`);
      setReviews(response.data.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set empty array if fails
      setReviews([]);
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await api.get('/reviews/my-reviews');
      
      // Handle the actual API response structure
      const userReviews = response.data.data?.reviews || response.data.data || [];
      
      // Ensure userReviews is an array
      if (Array.isArray(userReviews)) {
        const currentStoreReview = userReviews.find(review => review.store_id === parseInt(storeId));
        
        if (currentStoreReview) {
          setUserReview(currentStoreReview);
          reset({
            rating: currentStoreReview.rating,
            comment: currentStoreReview.comment || ''
          });
          setValue('rating', currentStoreReview.rating);
        }
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRating = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate stores');
      return;
    }

    try {
      setSubmittingRating(true);
      
      // Clean the data - remove empty comment field or convert to null
      const cleanData = {
        rating: data.rating,
        ...(data.comment && data.comment.trim() !== '' && { comment: data.comment.trim() })
      };
      
      if (userReview) {
        // Update existing review
        await api.put(`/reviews/${userReview.id}`, cleanData);
        toast.success('Rating updated successfully!');
      } else {
        // Create new review
        await api.post(`/reviews/stores/${storeId}/reviews`, cleanData);
        toast.success('Rating submitted successfully!');
      }

      // Refresh data
      fetchStoreDetails();
      fetchStoreReviews();
      fetchUserReview();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const onDeleteReview = async () => {
    if (!userReview) return;
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingReview(true);
      
      await api.delete(`/reviews/${userReview.id}`);
      toast.success('Review deleted successfully!');
      
      // Reset form and clear user review
      setUserReview(null);
      reset({
        rating: 0,
        comment: ''
      });
      setValue('rating', 0);
      
      // Refresh data
      fetchStoreDetails();
      fetchStoreReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setDeletingReview(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Store not found</h2>
          <Button onClick={() => navigate('/stores')}>
            Back to Stores
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = parseFloat(store.average_rating) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="outline"
            onClick={() => navigate('/stores')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Stores
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{store.address}</span>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-1">
                <StarRating value={averageRating} readonly size="lg" />
                <span className="text-2xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Based on {store.total_reviews || 0} reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Description */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this store</h2>
                <p className="text-gray-600">
                  {store.description || 'Welcome to our store! We pride ourselves on providing excellent service and quality products to our customers.'}
                </p>
              </div>
            </Card>

            {/* Reviews Section */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Be the first to review this store!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {review.user_name || 'Anonymous User'}
                              </p>
                              <div className="flex items-center gap-2">
                                <StarRating value={review.rating} readonly size="sm" />
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <p className="text-gray-700 ml-11">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Rating Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {userReview ? 'Update Your Rating' : 'Rate This Store'}
                </h2>

                {!isAuthenticated ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">Please login to rate this store</p>
                    <Button onClick={() => navigate('/login')}>
                      Login to Rate
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmitRating)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <StarRating
                        value={watchedRating}
                        onChange={(rating) => setValue('rating', rating)}
                        size="lg"
                        showValue
                      />
                      {errors.rating && (
                        <p className="text-red-600 text-sm mt-1">{errors.rating.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review (Optional)
                      </label>
                      <textarea
                        {...register('comment')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Share your experience with this store..."
                      />
                      {errors.comment && (
                        <p className="text-red-600 text-sm mt-1">{errors.comment.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingRating || deletingReview}
                      className="w-full"
                    >
                      {submittingRating ? (
                        <LoadingSpinner size="sm" />
                      ) : userReview ? (
                        'Update Rating'
                      ) : (
                        'Submit Rating'
                      )}
                    </Button>

                    {userReview && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Your current rating:</strong> {userReview.rating}/5 stars
                          </p>
                          {userReview.comment && (
                            <p className="text-sm text-blue-700 mt-1">
                              "{userReview.comment}"
                            </p>
                          )}
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onDeleteReview}
                          disabled={deletingReview || submittingRating}
                          className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                        >
                          {deletingReview ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Review
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;
