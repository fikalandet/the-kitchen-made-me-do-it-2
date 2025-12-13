import { BenefitsContent } from '../../lib/types/landingPage';
import { getTextStyleClasses, getTextStyleInline } from '../../lib/utils/textStyles';
import * as Icons from 'lucide-react';

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
      <div className="max-w-6xl mx-auto">
        <h2
          className={getTextStyleClasses(content.heading)}
          style={getTextStyleInline(content.heading)}
        >
          {content.heading.text}
        </h2>

        {content.intro && (
          <p
            className={`mt-4 max-w-2xl mx-auto ${getTextStyleClasses(content.intro)}`}
            style={getTextStyleInline(content.intro)}
          >
            {content.intro.text}
          </p>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.cards.map((card, index) => {
            const IconComponent = (Icons as any)[card.icon] || Icons.Circle;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <IconComponent className="w-12 h-12 text-[#a1c798] mb-4" />
                <h3 className="font-lobster text-2xl text-gray-800 mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-600">{card.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
