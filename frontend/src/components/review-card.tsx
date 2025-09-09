import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/ui/star-rating"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Review } from "@/lib/mock-data"
import { formatDistanceToNow } from "date-fns"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.created_at), { addSuffix: true })

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-accent text-accent-foreground">
              {review.user_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{review.user_name}</p>
                <p className="text-sm text-muted-foreground">{timeAgo}</p>
              </div>
              <StarRating rating={review.rating} readonly size="sm" />
            </div>
            {review.comment && <p className="text-foreground leading-relaxed">{review.comment}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
