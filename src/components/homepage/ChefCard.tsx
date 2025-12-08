import React from 'react';
import { MapPin, Star, Crown } from 'lucide-react';

interface ChefCardProps {
  name: string;
  bio?: string;
  city?: string;
  rating?: number;
  membership_level?: string;
  avatar_url?: string;
}

export const ChefCard: React.FC<ChefCardProps> = ({
  name,
  bio,
  city,
  rating = 4.8,
  membership_level = 'free',
  avatar_url,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white p-6 text-center">
      <div className="relative inline-block mb-4">
        {avatar_url ? (
          <img
            src={avatar_url}
            alt={name}
            className="w-24 h-24 rounded-full object-cover mx-auto"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
            <span className="text-2xl text-gray-400">{name[0]}</span>
          </div>
        )}
        {membership_level === 'guld' && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
            <Crown size={16} className="text-white" />
          </div>
        )}
      </div>
      <h3 className="font-lobster text-xl text-gray-800 mb-2">{name}</h3>
      {bio && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bio}</p>}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
        {city && (
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{city}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-500 fill-current" />
          <span>{rating}</span>
        </div>
      </div>
    </div>
  );
};
