import { colors } from '../../../theme/tokens';

interface CTAGroupProps {
  onInfo?: () => void;
  infoLabel?: string;
  onPrimary?: () => void;
  primaryLabel: string;
  gp?: number;
}

export function CTAGroup({
  onInfo,
  infoLabel = 'Mer info',
  onPrimary,
  primaryLabel,
  gp,
}: CTAGroupProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2">
        {onInfo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInfo();
            }}
            className="flex-1 px-4 h-10 rounded-xl font-medium text-sm transition-colors"
            style={{
              backgroundColor: colors.primary.green,
              color: colors.text.onGreen,
            }}
          >
            {infoLabel}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrimary?.();
          }}
          className="flex-1 px-4 h-10 rounded-xl font-medium text-sm transition-colors"
          style={{
            backgroundColor: colors.primary.black,
            color: colors.primary.white,
          }}
        >
          {primaryLabel}
        </button>
      </div>
      {gp !== undefined && (
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-lg">⭐</span>
          <span className="text-xs font-medium text-gray-700">{gp} gp</span>
        </div>
      )}
    </div>
  );
}
