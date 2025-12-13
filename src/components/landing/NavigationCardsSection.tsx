import { NavigationCardsContent } from '../../lib/types/landingPage';
import * as Icons from 'lucide-react';
import { renderText } from '../../utils/text';
import { getTextStyleClasses, getTextStyleInline } from '../../lib/utils/textStyles';

interface NavigationCardsSectionProps {
  content: NavigationCardsContent;
  backgroundColor?: string;
}

export function NavigationCardsSection({ content, backgroundColor }: NavigationCardsSectionProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      className="py-12 px-4"
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.cards.map((card, index) => {
            const IconComponent = card.icon ? (Icons as any)[card.icon] || Icons.Circle : Icons.Circle;
            const cardBg = card.background_color || '#ffffff';
            const cardTextColor = card.text_color || '#000000';

            return (
              <button
                key={index}
                onClick={() => scrollToSection(card.target_section)}
                className="rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                style={{
                  backgroundColor: card.use_image_cover ? 'transparent' : cardBg,
                  color: cardTextColor
                }}
              >
                {card.use_image_cover && card.cover_image && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${card.cover_image})` }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: card.overlay_color || '#000000',
                        opacity: card.overlay_opacity || 0.3
                      }}
                    />
                  </>
                )}
                <div className="relative z-10">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={renderText(card.title)}
                      className="w-10 h-10 mx-auto mb-4 object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <IconComponent
                      className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform"
                      style={{ color: card.text_color || 'currentColor' }}
                    />
                  )}
                  <h3
                    className={`font-semibold ${getTextStyleClasses(card.title)}`}
                    style={getTextStyleInline(card.title)}
                  >
                    {renderText(card.title)}
                  </h3>
                  {card.subtitle && (
                    <p
                      className={`mt-2 opacity-80 ${getTextStyleClasses(card.subtitle)}`}
                      style={getTextStyleInline(card.subtitle)}
                    >
                      {renderText(card.subtitle)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
