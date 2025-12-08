import { Price } from '../../../lib/types/card';
import { colors, typography } from '../../../theme/tokens';

interface TitlePriceRowProps {
  title: string;
  price: Price;
}

export function TitlePriceRow({ title, price }: TitlePriceRowProps) {
  const hasDiscount = price.originalPrice !== undefined;

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2">
      <h3
        className="font-bold text-lg flex-1 min-w-0"
        style={{ fontFamily: typography.fonts.display }}
      >
        {title}
      </h3>
      <div className="flex flex-col items-end">
        {hasDiscount && (
          <span
            className="text-sm line-through"
            style={{ color: colors.originalPrice }}
          >
            {price.originalPrice} kr
          </span>
        )}
        <span
          className="font-bold text-lg whitespace-nowrap"
          style={{
            color: hasDiscount ? colors.discount : colors.text.primary,
            fontWeight: hasDiscount ? 700 : 600,
          }}
        >
          {price.price} kr
        </span>
      </div>
    </div>
  );
}
