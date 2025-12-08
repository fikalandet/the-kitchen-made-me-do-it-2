import React from 'react';
import { Heart, Share2 } from 'lucide-react';

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  image_url?: string;
  author?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  excerpt,
  image_url,
  author,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white flex-shrink-0 w-80 cursor-pointer">
      <div className="relative h-48">
        {image_url ? (
          <img src={image_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{excerpt}</p>
        {author && (
          <p className="text-xs text-gray-500 mb-3">av {author}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            className="px-4 py-2 rounded-full font-medium text-white transition-all hover:opacity-90 text-sm"
            style={{ backgroundColor: '#56c5c5' }}
          >
            Läs mer
          </button>
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
