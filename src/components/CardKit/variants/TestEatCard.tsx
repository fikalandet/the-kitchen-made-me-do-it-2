import { TestEatProps } from '../../../lib/types/card';
import { shadows, transitions } from '../../../theme/tokens';
import { CardHeader } from '../atoms/CardHeader';
import { TitlePriceRow } from '../atoms/TitlePriceRow';
import { CTAGroup } from '../atoms/CTAGroup';

interface ExtendedTestEatProps extends TestEatProps {
  testPrice?: number;
  totalSpots?: number;
  spotsRemaining?: number;
  description?: string;
}

export function TestEatCard(props: ExtendedTestEatProps) {
  if (!props || !props.chef) {
    return null;
  }

  const testPrice = props.testPrice || props.price;
  const totalSpots = props.totalSpots || props.testPortions || 10;
  const spotsRemaining = props.spotsRemaining || props.testPortions || 10;

  const spotsPercentage = (spotsRemaining / totalSpots) * 100;
  const urgency = spotsPercentage < 30 ? 'high' : spotsPercentage < 60 ? 'medium' : 'low';

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full relative"
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
      <div className="absolute top-4 left-4 bg-[#a1c798] text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
        TEST-KÄKA
      </div>

      <CardHeader
        imageUrl={props.imageUrl}
        hasGallery={props.hasGallery}
        onShare={props.onShare}
        onFavToggle={props.onFavToggle}
        isFaved={props.isFaved}
        chef={props.chef}
      />

      <div className="flex flex-col flex-grow p-4">
        <TitlePriceRow title={props.title} price={testPrice} discountedPrice={props.discountedPrice} />

        {props.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{props.description}</p>
        )}

        <div className="mt-4 mb-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Platser kvar</span>
            <span className={`font-semibold ${
              urgency === 'high' ? 'text-red-600' :
              urgency === 'medium' ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {spotsRemaining} / {totalSpots}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                urgency === 'high' ? 'bg-red-500' :
                urgency === 'medium' ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{ width: `${spotsPercentage}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-4">
          <CTAGroup
            onInfo={props.onInfo}
            infoLabel="Mer info"
            onPrimary={props.onPrimary}
            primaryLabel="Tjinga plats"
            gp={props.gp || 10}
          />
        </div>
      </div>
    </div>
  );
}
