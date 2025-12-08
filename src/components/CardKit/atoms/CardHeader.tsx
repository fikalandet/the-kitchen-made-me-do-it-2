import { Heart, Share2, Image } from 'lucide-react';
import { Chef } from '../../../lib/types/card';
import { colors } from '../../../theme/tokens';

interface CardHeaderProps {
  imageUrl: string;
  hasGallery?: boolean;
  onShare?: () => void;
  onFavToggle?: () => void;
  isFaved?: boolean;
  chef: Chef;
  badge?: React.ReactNode;
}

export function CardHeader({
  imageUrl,
  hasGallery,
  onShare,
  onFavToggle,
  isFaved,
  chef,
  badge,
}: CardHeaderProps) {
  const statusColors = {
    open: colors.status.open,
    soon: colors.status.soon,
    closed: colors.status.closed,
  };

  const ringColor = statusColors[chef.openStatus];

  return (
    <div className="relative w-full aspect-video overflow-hidden">
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover"
      />

      {badge && (
        <div className="absolute top-3 left-3">
          {badge}
        </div>
      )}

      <div className="absolute top-3 right-3 flex gap-2">
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Dela"
          >
            <Share2 size={16} className="text-gray-700" />
          </button>
        )}
        {onFavToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavToggle();
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
            aria-label={isFaved ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
          >
            <Heart
              size={16}
              className={isFaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}
            />
          </button>
        )}
      </div>

      {hasGallery && (
        <button
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Visa fler bilder"
        >
          <Image size={16} className="text-gray-700" />
        </button>
      )}

      <div
        className="absolute bottom-2 left-2 w-16 h-16 rounded-full p-[3px]"
        style={{ backgroundColor: ringColor }}
      >
        <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
          <img
            src={chef.avatarUrl}
            alt={chef.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
