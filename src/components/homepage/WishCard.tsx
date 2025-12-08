import React from 'react';
import { Heart, MessageCircle, ThumbsUp } from 'lucide-react';

interface WishCardProps {
  id: string;
  dish_name: string;
  description: string;
  customer_name: string;
  likes_count: number;
  comments_count: number;
}

export const WishCard: React.FC<WishCardProps> = ({
  dish_name,
  description,
  customer_name,
  likes_count,
  comments_count,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">{dish_name}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <p className="text-xs text-gray-500">Önskad av {customer_name}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-gray-600">
            <ThumbsUp size={16} />
            <span className="text-sm">{likes_count}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <MessageCircle size={16} />
            <span className="text-sm">{comments_count}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Heart size={18} className="text-gray-600" />
          </button>
          <button
            className="px-4 py-2 rounded-full font-medium text-white transition-all hover:opacity-90 text-sm"
            style={{ backgroundColor: '#56c5c5' }}
          >
            Kommentera
          </button>
        </div>
      </div>
    </div>
  );
};
