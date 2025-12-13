import { NavigationCardsContent } from '../../lib/types/landingPage';
import * as Icons from 'lucide-react';
import { renderText } from '../../utils/text';

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
            const IconComponent = (Icons as any)[card.icon] || Icons.Circle;

            return (
              <button
                key={index}
                onClick={() => scrollToSection(card.target_section)}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <IconComponent className="w-10 h-10 mx-auto mb-4 text-[#a1c798] group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg text-gray-900">{renderText(card.title)}</h3>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
