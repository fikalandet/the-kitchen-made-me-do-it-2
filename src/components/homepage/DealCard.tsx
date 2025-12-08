import React, { useState, useEffect } from 'react';
import { Heart, Share2, Clock } from 'lucide-react';

interface DealCardProps {
  id: string;
  title: string;
  description: string;
  discount: number;
  ends_at: string;
  image_url?: string;
}

export const DealCard: React.FC<DealCardProps> = ({
  title,
  description,
  discount,
  ends_at,
  image_url,
}) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(ends_at).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Utgången');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [ends_at]);

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white">
      <div className="relative h-48">
        {image_url ? (
          <img src={image_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
            <span className="text-white text-6xl font-bold">{discount}%</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          -{discount}%
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex items-center gap-1 text-red-600 mb-3">
          <Clock size={14} />
          <span className="text-sm font-medium">{timeLeft}</span>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="px-4 py-2 rounded-full font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#56c5c5' }}
          >
            Se deal
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
