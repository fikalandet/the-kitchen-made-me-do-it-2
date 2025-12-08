import { SubscriptionProps } from '../../../lib/types/card';
import { Heart, Share2, Image } from 'lucide-react';
import { colors, shadows, transitions, typography } from '../../../theme/tokens';
import { LogisticsRow } from '../atoms/LogisticsRow';
import { CTAGroup } from '../atoms/CTAGroup';

export function SubscriptionCard(props: SubscriptionProps) {
  if (props.chef.membership !== 'gold') {
    return null;
  }

  const hasDiscount = props.price.originalPrice !== undefined;

  const statusColors = {
    open: colors.status.open,
    soon: colors.status.soon,
    closed: colors.status.closed,
  };

  const ringColor = statusColors[props.chef.openStatus];

  const planTypeLabels = {
    dish: 'Enskild maträtt',
    bundle: 'Matlådekasse',
    diy: 'Laga-själv-kit',
  };

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
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-1/2 aspect-[2/1] md:aspect-auto overflow-hidden">
          <img
            src={props.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 right-3 flex gap-2">
            {props.onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onShare();
                }}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Dela"
              >
                <Share2 size={16} className="text-gray-700" />
              </button>
            )}
            {props.onFavToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onFavToggle();
                }}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                aria-label={props.isFaved ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
              >
                <Heart
                  size={16}
                  className={props.isFaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}
                />
              </button>
            )}
          </div>

          {props.hasGallery && (
            <button
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Visa fler bilder"
            >
              <Image size={16} className="text-gray-700" />
            </button>
          )}

          <div
            className="absolute bottom-2 left-2 w-10 h-10 rounded-full p-[3px]"
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

        <div className="md:w-1/2 flex flex-col justify-between p-4">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3
                className="font-bold text-lg flex-1 min-w-0"
                style={{ fontFamily: typography.fonts.display }}
              >
                {props.title}
              </h3>
              <div className="flex flex-col items-end">
                {hasDiscount && (
                  <span
                    className="text-sm line-through"
                    style={{ color: colors.originalPrice }}
                  >
                    {props.price.originalPrice} kr
                  </span>
                )}
                <span
                  className="font-bold text-lg whitespace-nowrap"
                  style={{
                    color: hasDiscount ? colors.discount : colors.text.primary,
                    fontWeight: hasDiscount ? 700 : 600,
                  }}
                >
                  {props.price.price} kr
                </span>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600">{planTypeLabels[props.planType]}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Tillgängliga dagar:</p>
              <div className="flex flex-wrap gap-1">
                {props.availabilityDays.map((day, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: colors.background.lightGreen,
                      color: colors.text.onGreen,
                    }}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <LogisticsRow logistics={props.logistics} />
          </div>

          <CTAGroup
            onInfo={props.onInfo}
            infoLabel="Mer info"
            onPrimary={props.onPrimary}
            primaryLabel="Prenumerera"
            gp={props.gp || 100}
          />
        </div>
      </div>
    </div>
  );
}
