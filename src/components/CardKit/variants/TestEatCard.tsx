import { TestEatProps } from '../../../lib/types/card';
import { shadows, transitions } from '../../../theme/tokens';
import { CardHeader } from '../atoms/CardHeader';
import { TitlePriceRow } from '../atoms/TitlePriceRow';
import { CenteredSectionLabel } from '../atoms/CenteredSectionLabel';
import { CTAGroup } from '../atoms/CTAGroup';

export function TestEatCard(props: TestEatProps) {
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
        <TitlePriceRow title={props.title} price={props.price} discountedPrice={props.discountedPrice} />

        <CenteredSectionLabel label="Tillgänglig" />

        <div className="px-4 py-2">
          <p className="text-sm text-center text-gray-700">
            {props.testPortions} portioner tillgängliga för testare
          </p>
        </div>

        <div className="mt-auto">
          <CTAGroup
            onPrimary={props.onPrimary}
            primaryLabel="Anmäl intresse"
            gp={props.gp || 30}
          />
        </div>
      </div>
    </div>
  );
}
