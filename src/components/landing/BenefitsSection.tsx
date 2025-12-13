import { BenefitsContent } from '../../lib/types/landingPage';
import { getTextStyleClasses, getTextStyleInline } from '../../lib/utils/textStyles';
import * as Icons from 'lucide-react';
import { renderText } from '../../utils/text';

interface BenefitsSectionProps {
  content: BenefitsContent;
  backgroundColor?: string;
}

export function BenefitsSection({ content, backgroundColor }: BenefitsSectionProps) {
  return (
    <section
      id={content.section_id}
      className="py-16 px-4"
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className={getTextStyleClasses(content.heading)}
          style={getTextStyleInline(content.heading)}
        >
          {content.heading.text}
        </h2>

        {content.intro && (
          <p
            className={`mt-4 max-w-3xl mx-auto ${getTextStyleClasses(content.intro)}`}
            style={getTextStyleInline(content.intro)}
          >
            {content.intro.text}
          </p>
        )}

        <div className="mt-12 space-y-12">
          {content.categories?.map((category, catIndex) => (
            <div
              key={catIndex}
              className="rounded-3xl p-8"
              style={{ backgroundColor: category.background_color || '#f6f2e0' }}
            >
              <h3
                className={getTextStyleClasses(category.name)}
                style={getTextStyleInline(category.name)}
              >
                {renderText(category.name)}
              </h3>

              {category.intro && category.intro.text && (
                <p
                  className={`mt-3 ${getTextStyleClasses(category.intro)}`}
                  style={getTextStyleInline(category.intro)}
                >
                  {renderText(category.intro)}
                </p>
              )}

              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {category.cards.map((card, cardIndex) => {
                  const IconComponent = card.icon ? (Icons as any)[card.icon] || Icons.Circle : Icons.Circle;

                  return (
                    <div
                      key={cardIndex}
                      className="rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center"
                      style={{
                        backgroundColor: card.background_color || '#ffffff',
                        color: card.text_color || '#000000'
                      }}
                    >
                      {card.image ? (
                        <img
                          src={card.image}
                          alt={renderText(card.title)}
                          className="w-12 h-12 mx-auto mb-3 object-contain"
                        />
                      ) : (
                        <IconComponent
                          className="w-12 h-12 mx-auto mb-3"
                          style={{ color: card.text_color || 'currentColor' }}
                        />
                      )}
                      <h4
                        className={`mb-2 ${getTextStyleClasses(card.title)}`}
                        style={getTextStyleInline(card.title)}
                      >
                        {renderText(card.title)}
                      </h4>
                      <p
                        className={getTextStyleClasses(card.text)}
                        style={getTextStyleInline(card.text)}
                      >
                        {renderText(card.text)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
