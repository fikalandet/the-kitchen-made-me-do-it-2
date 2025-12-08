import { RushDishProps } from '../../../lib/types/card';
import { colors, shadows, transitions } from '../../../theme/tokens';
import { CardHeader } from '../atoms/CardHeader';
import { RatingRow } from '../atoms/RatingRow';
import { TitlePriceRow } from '../atoms/TitlePriceRow';
import { PackagePriceSubrow } from '../atoms/PackagePriceSubrow';
import { CenteredSectionLabel } from '../atoms/CenteredSectionLabel';
import { AvailabilityBadges } from '../atoms/AvailabilityBadges';
import { LogisticsRow } from '../atoms/LogisticsRow';
import { CTAGroup } from '../atoms/CTAGroup';

export function RushCard(props: RushDishProps) {
  const shortDateBadge = props.shortDate ? (
    <span
      className="px-3 py-1 rounded-xl text-xs font-medium text-white"
      style={{ backgroundColor: colors.primary.cyan }}
    >
      Kort datum
    </span>
  ) : undefined;

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
      <CardHeader
        imageUrl={props.imageUrl}
        hasGallery={props.hasGallery}
        onShare={props.onShare}
        onFavToggle={props.onFavToggle}
        isFaved={props.isFaved}
        chef={props.chef}
        badge={shortDateBadge}
      />

      {props.rating && <RatingRow value={props.rating.value} count={props.rating.count} />}

      <TitlePriceRow title={props.title} price={props.price} />

      {props.packageLabel && <PackagePriceSubrow packageLabel={props.packageLabel} />}

      <CenteredSectionLabel label="Tillgänglig" />

      <AvailabilityBadges
        frozenCount={props.availability.frozenCount}
        preOrder={props.availability.preOrder}
      />

      <LogisticsRow logistics={props.logistics} />

      <CTAGroup
        onInfo={props.onInfo}
        infoLabel="Mer info"
        onPrimary={props.onPrimary}
        primaryLabel="Köp/beställ"
        gp={props.gp || 30}
      />
    </div>
  );
}
