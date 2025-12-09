import { ChefOfWeekProps } from '../../../lib/types/card';
import { colors, shadows, transitions, typography } from '../../../theme/tokens';

export function ChefOfWeekCard(props: ChefOfWeekProps) {
  const statusColors = {
    open: colors.status.open,
    soon: colors.status.soon,
    closed: colors.status.closed,
  };

  const ringColor = statusColors[props.chef.openStatus];
  const isRound = props.imageShape === 'round' || !props.imageShape;

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer p-6"
      style={{
        backgroundColor: props.cardBackgroundColor || '#ffffff',
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
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`p-1 bg-white ${isRound ? 'rounded-full' : 'rounded-2xl'}`}
          style={{
            boxShadow: `0 0 0 4px ${ringColor}`,
          }}
        >
          <img
            src={props.chef.avatarUrl}
            alt={props.chef.name}
            className={`w-28 h-28 object-cover ${isRound ? 'rounded-full' : 'rounded-xl'}`}
          />
        </div>

        <div className="text-center space-y-2">
          <h3
            className="font-semibold text-lg"
            style={{
              fontFamily: typography.fonts.body,
              color: props.cardNameColor || '#111827'
            }}
          >
            {props.kitchenName}
          </h3>

          <div className="text-sm">
            <p
              className="font-medium"
              style={{ color: props.cardCommentColor || '#4b5563' }}
            >
              Kitchen-kommentar:
            </p>
            <p
              className="italic"
              style={{ color: props.cardCommentColor || '#4b5563' }}
            >
              {props.adminComment}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            props.onVisitKitchen?.();
          }}
          className="w-full h-10 rounded-xl font-medium text-sm transition-colors"
          style={{
            backgroundColor: colors.primary.black,
            color: colors.primary.white,
          }}
        >
          Till kockens kök
        </button>
      </div>
    </div>
  );
}
