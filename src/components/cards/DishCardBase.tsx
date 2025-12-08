import React, { ReactNode } from 'react';
import { Heart, Share2, Star } from 'lucide-react';

interface DishCardBaseProps {
  image_url?: string;
  title: string;
  price: number;
  chef_name?: string;
  chef_avatar?: string;
  rating?: number;
  badges?: ReactNode;
  subscriptionPill?: ReactNode;
  availabilitySection?: ReactNode;
  deliverySection?: ReactNode;
  buttonSection?: ReactNode;
  onLike?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
}

export const DishCardBase: React.FC<DishCardBaseProps> = ({
  image_url,
  title,
  price,
  chef_name,
  chef_avatar,
  rating = 4.5,
  badges,
  subscriptionPill,
  availabilitySection,
  deliverySection,
  buttonSection,
  onLike,
  onShare,
  onFavorite,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white">
      <div className="relative h-48">
        {image_url ? (
          <img src={image_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        {badges}
        {chef_avatar && (
          <div className="absolute bottom-2 left-2">
            <img
              src={chef_avatar}
              alt={chef_name}
              className="w-16 h-16 rounded-full border-2 border-white object-cover"
            />
          </div>
        )}
      </div>

      <div className="p-4">
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">{rating}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-800 flex-1">{title}</h3>
          <span className="text-xl font-bold ml-2" style={{ color: '#56c5c5' }}>
            {price} kr
          </span>
        </div>

        {chef_name && (
          <p className="text-sm text-gray-600 mb-2">av {chef_name}</p>
        )}

        {subscriptionPill}

        {availabilitySection}

        {deliverySection}

        {buttonSection}

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={onShare}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Dela"
            aria-label="Dela"
          >
            <Share2 size={18} className="text-gray-600" />
          </button>
          <button
            onClick={onFavorite}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Favorit"
            aria-label="Favorit"
          >
            <Heart size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
