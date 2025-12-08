import { OnStoveNowProps } from '../../../lib/types/card';
import { shadows, transitions } from '../../../theme/tokens';
import { CardHeader } from '../atoms/CardHeader';
import { RatingRow } from '../atoms/RatingRow';
import { TitlePriceRow } from '../atoms/TitlePriceRow';
import { PackagePriceSubrow } from '../atoms/PackagePriceSubrow';
import { CenteredSectionLabel } from '../atoms/CenteredSectionLabel';
import { LogisticsRow } from '../atoms/LogisticsRow';
import { CTAGroup } from '../atoms/CTAGroup';

export function OnStoveNowCard(props: OnStoveNowProps) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full"
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
      />

      <div className="flex flex-col flex-grow">
        {props.rating && <RatingRow value={props.rating.value} count={props.rating.count} />}

        <TitlePriceRow title={props.title} price={props.price} />

        {props.packageLabel && <PackagePriceSubrow packageLabel={props.packageLabel} />}

        <CenteredSectionLabel label="Tillagas på spisen" />

        <div className="px-4 py-2">
          <p className="text-sm text-center text-gray-700">
            {props.schedule.dateLabel}, {props.schedule.timeRange}
          </p>
          <p className="text-xs text-center text-gray-600 mt-1">
            {props.portions.planned} tillagas – {props.portions.booked} bokade
          </p>
        </div>

        <LogisticsRow logistics={props.logistics} />

        <div className="mt-auto">
          <CTAGroup
            onInfo={props.onInfo}
            infoLabel="Mer info"
            onPrimary={props.onPrimary}
            primaryLabel="Köp"
            gp={props.gp || 20}
          />
        </div>
      </div>
    </div>
  );
}
