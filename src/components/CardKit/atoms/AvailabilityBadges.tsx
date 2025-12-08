import { colors } from '../../../theme/tokens';

interface AvailabilityBadgesProps {
  frozenCount?: number;
  preOrder?: boolean;
  subscribeAvailable?: boolean;
}

export function AvailabilityBadges({
  frozenCount,
  preOrder,
  subscribeAvailable,
}: AvailabilityBadgesProps) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-start justify-center gap-2">
        {frozenCount !== undefined && frozenCount > 0 && (
          <div className="flex flex-col items-center gap-1 min-w-0 flex-shrink-0">
            <span
              className="px-2 py-1 rounded-xl text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: colors.primary.cyan }}
            >
              I frysen
            </span>
            <span className="text-xs text-gray-600 whitespace-nowrap">{frozenCount} st port kvar</span>
          </div>
        )}
        {preOrder && (
          <div className="flex flex-col items-center gap-1 min-w-0 flex-shrink-0">
            <span
              className="px-2 py-1 rounded-xl text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: colors.background.lightGreen,
                color: colors.text.onGreen,
              }}
            >
              Förbeställ
            </span>
            <span className="text-xs text-gray-600 invisible">-</span>
          </div>
        )}
        {subscribeAvailable && (
          <div className="flex flex-col items-center gap-1 min-w-0 flex-shrink-0">
            <span
              className="px-2 py-1 rounded-xl text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: colors.primary.black }}
            >
              Prenumerera
            </span>
            <span className="text-xs text-gray-600 invisible">-</span>
          </div>
        )}
      </div>
    </div>
  );
}
