import { EventCardProps } from '../../../lib/types/card';
import { Heart, Share2, MessageCircle } from 'lucide-react';
import { colors, shadows, transitions, typography } from '../../../theme/tokens';

export function EventCard(props: EventCardProps) {
  const statusColors = {
    open: colors.status.open,
    soon: colors.status.soon,
    closed: colors.status.closed,
  };

  const ringColor = statusColors[props.chef.openStatus];

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: shadows.card,
        transition: `transform ${transitions.fast}, box-shadow ${transitions.fast}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = shadows.cardHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = shadows.card;
      }}
    >
      <div className="relative w-full aspect-[21/9] overflow-hidden">
        <img
          src={props.imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />

        <div
          className="absolute bottom-2 left-2 w-16 h-16 rounded-full p-[3px]"
          style={{ backgroundColor: ringColor }}
        >
          <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
            <img
              src={props.chef.avatarUrl}
              alt={props.chef.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3
          className="font-bold text-xl"
          style={{ fontFamily: typography.fonts.display }}
        >
          {props.title}
        </h3>

        {props.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{props.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          {props.price && (
            <div>
              <span className="text-gray-500">Pris:</span>
              <p className="font-semibold">{props.price.price} kr</p>
            </div>
          )}
          {props.seats && (
            <div>
              <span className="text-gray-500">Platser:</span>
              <p className="font-semibold">{props.seats} st</p>
            </div>
          )}
          {props.city && (
            <div>
              <span className="text-gray-500">Ort:</span>
              <p className="font-semibold">{props.city}</p>
            </div>
          )}
          {props.venue && (
            <div>
              <span className="text-gray-500">Lokal:</span>
              <p className="font-semibold">{props.venue}</p>
            </div>
          )}
          {props.address && (
            <div className="col-span-2">
              <span className="text-gray-500">Adress:</span>
              <p className="font-semibold">{props.address}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Datum:</span>
            <p className="font-semibold">{props.date}</p>
          </div>
          <div>
            <span className="text-gray-500">Tid:</span>
            <p className="font-semibold">{props.time}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onShare?.();
            }}
            className="w-10 h-10 border-2 border-black rounded-xl transition-colors hover:bg-black hover:text-white flex items-center justify-center"
            aria-label="Dela"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onFavToggle?.();
            }}
            className={`w-10 h-10 border-2 rounded-xl transition-colors flex items-center justify-center ${
              props.isFaved
                ? 'bg-black text-white border-black'
                : 'border-black hover:bg-black hover:text-white'
            }`}
            aria-label={props.isFaved ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
          >
            <Heart
              size={18}
              className={props.isFaved ? 'fill-current' : ''}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onComment?.();
            }}
            className="w-10 h-10 border-2 border-black rounded-xl transition-colors hover:bg-black hover:text-white flex items-center justify-center"
            aria-label="Kommentera"
          >
            <MessageCircle size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onAttending?.(props.attendingStatus === 'yes' ? null : 'yes');
            }}
            className={`h-10 px-3 border-2 rounded-xl transition-colors flex items-center gap-2 ${
              props.attendingStatus === 'yes'
                ? 'bg-black text-white border-black'
                : 'border-black hover:bg-black hover:text-white'
            }`}
            aria-pressed={props.attendingStatus === 'yes'}
          >
            <span className="text-lg">✓</span>
            {props.attendingCounts && props.attendingCounts.yes > 0 && (
              <span className="text-sm font-medium">{props.attendingCounts.yes}</span>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onAttending?.(props.attendingStatus === 'maybe' ? null : 'maybe');
            }}
            className={`h-10 px-3 border-2 rounded-xl transition-colors flex items-center gap-2 ${
              props.attendingStatus === 'maybe'
                ? 'bg-black text-white border-black'
                : 'border-black hover:bg-black hover:text-white'
            }`}
            aria-pressed={props.attendingStatus === 'maybe'}
          >
            <span className="text-lg">?</span>
            {props.attendingCounts && props.attendingCounts.maybe > 0 && (
              <span className="text-sm font-medium">{props.attendingCounts.maybe}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
