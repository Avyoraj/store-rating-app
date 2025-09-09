import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { reviewAPI } from "../services/api"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { StarRating } from "./ui/star-rating"
import { Alert, AlertDescription } from "./ui/alert"
import { LoadingSpinner } from "./ui/loading-spinner"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ReviewFormProps {
  storeId: number
  onReviewSubmitted?: () => void
}

export function ReviewForm({ storeId, onReviewSubmitted }: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Load existing review when component mounts
  useEffect(() => {
    if (isAuthenticated && storeId) {
      loadExistingReview()
    }
  }, [isAuthenticated, storeId])

  const loadExistingReview = async () => {
    try {
      setIsLoading(true)
      const response = await reviewAPI.getUserStoreReview(storeId)
      if (response.success && response.data.userRating) {
        const review = response.data.userRating
        setExistingReview(review)
        setRating(review.rating)
        setComment(review.comment || "")
      }
    } catch (error) {
      // User doesn't have a review yet, which is fine
      setExistingReview(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!rating) {
      setError("Please select a rating")
      return
    }

    if (comment.length > 500) {
      setError("Comment must be less than 500 characters")
      return
    }

    setIsSubmitting(true)

    try {
      // Submit review to backend API
      const reviewData = {
        rating,
        comment: comment.trim() || undefined // Only send comment if it's not empty
      };

      let response;
      if (existingReview) {
        // Update existing review
        response = await reviewAPI.updateReview(existingReview.id, reviewData);
      } else {
        // Create new review
        response = await reviewAPI.createReview(storeId, reviewData);
      }
      
      if (response.success) {
        setSuccess(true)
        setIsEditing(false)
        onReviewSubmitted?.()

        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)

        // Reload the existing review data
        await loadExistingReview()
      } else {
        setError(response.message || "Failed to submit review")
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <LoadingSpinner size="sm" className="mx-auto mb-2" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Sign in to leave a review</p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? (isEditing ? "Update Your Review" : "Your Review") : "Write a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {existingReview && !isEditing ? (
          // Show existing review with edit button
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Rating</label>
              <StarRating rating={existingReview.rating} readonly size="lg" />
            </div>
            
            {existingReview.comment && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Comment</label>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {existingReview.comment}
                </p>
              </div>
            )}
            
            <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
              Edit Review
            </Button>
          </div>
        ) : (
          // Show review form
          <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Review submitted successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comment (optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">{comment.length}/500 characters</p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !rating} className="flex-1">
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {existingReview ? "Updating..." : "Submitting..."}
                </>
              ) : (
                existingReview ? "Update Review" : "Submit Review"
              )}
            </Button>
            {existingReview && isEditing && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  setRating(existingReview.rating)
                  setComment(existingReview.comment || "")
                  setError("")
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
        )}
      </CardContent>
    </Card>
  )
}
