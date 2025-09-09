import React from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { StarRating } from "./ui/star-rating"
import { useAuth } from "../context/AuthContext"
import { mockReviews } from "../lib/mock-data"
import type { Store } from "../lib/mock-data"
import { MapPin, Phone, Globe, MessageSquare, Star, Edit } from "lucide-react"

interface StoreCardProps {
  store: Store
}

export function StoreCard({ store }: StoreCardProps) {
  const { user, isAuthenticated } = useAuth()

  const userReview = isAuthenticated
    ? mockReviews.find((review) => review.store_id === store.id && review.user_id === user?.id)
    : null

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={store.image || "/placeholder.svg"}
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {store.category && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{store.category}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Link to={`/store/${store.id}`}>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-accent transition-colors cursor-pointer">
                {store.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2">{store.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StarRating rating={store.average_rating} readonly size="sm" />
              <span className="text-sm font-medium">{Number(store.average_rating).toFixed(1)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4 mr-1" />
              {store.total_reviews} reviews
            </div>
          </div>

          {isAuthenticated && userReview && (
            <div className="bg-accent/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Your Rating:</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/store/${store.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Modify
                  </Link>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <StarRating rating={userReview.rating} readonly size="sm" />
                <span className="text-sm text-muted-foreground">
                  Rated {new Date(userReview.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {isAuthenticated && !userReview && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rate this store</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/store/${store.id}`}>
                    <Star className="h-3 w-3 mr-1" />
                    Submit Rating
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {store.address}, {store.city}, {store.state}
              </span>
            </div>

            {store.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{store.phone}</span>
              </div>
            )}

            {store.website && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate text-accent hover:underline">{store.website.replace("https://", "")}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
