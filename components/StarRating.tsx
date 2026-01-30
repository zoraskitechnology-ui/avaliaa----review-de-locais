
import React from 'react';
import { StarIconSolid, StarIconOutline } from './icons';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, readOnly = false }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <div className="flex items-center justify-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className={!readOnly ? 'cursor-pointer transform transition-transform hover:scale-125' : ''}
          onClick={() => !readOnly && setRating && setRating(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
        >
          {(hoverRating || rating) >= star ? (
            <StarIconSolid className="text-yellow-400 w-6 h-6"/>
          ) : (
            <StarIconOutline className="text-gray-500 w-6 h-6"/>
          )}
        </div>
      ))}
    </div>
  );
};

export default StarRating;
