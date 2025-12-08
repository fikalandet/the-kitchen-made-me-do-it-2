import React from 'react';
import { Heart, Share2, Calendar, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  start_time: string;
  location: string;
  price: number;
  image_url?: string;
  attending_count?: number;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  description,
  start_time,
  location,
  price,
  image_url,
  attending_count = 0,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white">
      <div className="relative h-48">
        {image_url ? (
          <img src={image_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <Calendar size={48} className="text-white" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>{formatDate(start_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} />
            <span>{attending_count} deltar</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold" style={{ color: '#56c5c5' }}>
            {price} kr
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded-full font-medium text-xs transition-all hover:opacity-90"
              style={{ backgroundColor: '#56c5c5', color: 'white' }}
            >
              Kommer
            </button>
            <button className="px-3 py-1 rounded-full font-medium text-xs border border-gray-300 text-gray-600 hover:bg-gray-50">
              Kanske
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart size={16} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
