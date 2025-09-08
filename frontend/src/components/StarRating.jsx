import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  value = 0, 
  onChange, 
  readonly = false, 
  size = 'md',
  showValue = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleStarHover = (rating) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          
          return (
            <Star
              key={star}
              className={`
                ${sizes[size]} 
                ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
              `}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
            />
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm font-medium text-gray-600 ml-1">
          {value > 0 ? value.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;