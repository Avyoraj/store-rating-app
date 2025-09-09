import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { StarRating } from '../components/ui/star-rating';
import { ReviewForm } from '../components/review-form';
import { ReviewCard } from '../components/review-card';
import { storeAPI, reviewAPI } from '../services/api';
import { MapPin, Phone, Globe, Mail, ArrowLeft, MessageSquare, Calendar, Filter, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { LoadingSpinner } from '../components/ui/loading-spinner';

const StoreDetailPage = () => {
  const { storeId } = useParams();
  const storeIdNum = Number.parseInt(storeId);
  const [reviewSort, setReviewSort] = useState("newest");
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch store and reviews data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch store details and reviews in parallel
        const [storeResponse, reviewsResponse] = await Promise.all([
          storeAPI.getStore(storeIdNum),
          reviewAPI.getStoreReviews(storeIdNum, { limit: 1000 }) // Get all reviews for rating breakdown
        ]);

        if (storeResponse.success) {
          setStore(storeResponse.data.store);
        } else {
          setError('Store not found');
        }

        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data?.reviews || []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        setError('Failed to load store details');
      } finally {
        setLoading(false);
      }
    };

    if (storeIdNum) {
      fetchData();
    }
  }, [storeIdNum]);

  const sortedReviews = useMemo(() => {
    const reviewList = [...reviews];
    switch (reviewSort) {
      case "newest":
        return reviewList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "oldest":
        return reviewList.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "highest":
        return reviewList.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return reviewList.sort((a, b) => a.rating - b.rating);
      default:
        return reviewList;
    }
  }, [reviews, reviewSort]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading store details...</p>
        </div>
      </div>
    );
  }

  // Handle error or store not found
  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-4">The store you're looking for doesn't exist.</p>
          <Link to="/stores">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stores
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/stores">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stores
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Store Header */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 w-full">
                  <img
                    src={store.image || "/placeholder.svg?height=300&width=600&query=store"}
                    alt={store.name}
                    className="object-cover rounded-t-lg w-full h-full"
                  />
                  {store.category && (
                    <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">{store.category}</Badge>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{store.name}</h1>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <StarRating rating={store.average_rating} readonly />
                          <span className="text-lg font-medium">{store.average_rating}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {store.total_reviews} reviews
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground leading-relaxed">{store.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Reviews ({reviews.length})</h2>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={reviewSort} onValueChange={setReviewSort}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Review Form */}
              <ReviewForm 
                storeId={storeIdNum} 
                onReviewSubmitted={() => {
                  // Refresh reviews when a new one is submitted
                  reviewAPI.getStoreReviews(storeIdNum, { limit: 1000 }).then(response => {
                    if (response.success) {
                      setReviews(response.data?.reviews || []);
                    }
                  });
                }}
              />

              {/* Reviews List */}
              <div className="space-y-4">
                {sortedReviews.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
                        <p className="text-muted-foreground">Be the first to leave a review for this store!</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  sortedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {store.address}
                      <br />
                      {store.city}, {store.state} {store.zip_code}
                    </p>
                  </div>
                </div>

                {store.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${store.phone}`} className="text-sm text-accent hover:underline">
                        {store.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${store.email}`} className="text-sm text-accent hover:underline">
                      {store.email}
                    </a>
                  </div>
                </div>

                {store.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:underline"
                      >
                        {store.website.replace("https://", "")}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(store.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.filter((r) => r.rating === rating).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-12">
                          <span className="text-sm">{rating}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StoreDetailPage;
