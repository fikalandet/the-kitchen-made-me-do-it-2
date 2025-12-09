import React from 'react';
import { Play, Heart, Share2, Eye } from 'lucide-react';

interface ReelCardProps {
  id: string;
  title: string;
  thumbnail_url?: string;
  chef_name: string;
  views_count: number;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  title,
  thumbnail_url,
  chef_name,
  views_count,
}) => {
  const safeViewsCount = views_count ?? 0;

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white cursor-pointer">
      <div className="relative h-64">
        {thumbnail_url ? (
          <img src={thumbnail_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center">
            <Play size={48} className="text-white" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all">
          <div className="bg-white rounded-full p-4">
            <Play size={32} className="text-gray-800" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">av {chef_name}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-600">
            <Eye size={14} />
            <span className="text-sm">{safeViewsCount.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
