import { HeroContent } from '../../lib/types/landingPage';
import { getTextStyleClasses, getTextStyleInline } from '../../lib/utils/textStyles';

interface HeroSectionProps {
  content: HeroContent;
  backgroundColor?: string;
}

export function HeroSection({ content, backgroundColor }: HeroSectionProps) {
  return (
    <section
      className="py-16 px-4"
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={getTextStyleClasses(content.heading)}
          style={getTextStyleInline(content.heading)}
        >
          {content.heading.text}
        </h1>

        <p
          className={`mt-6 max-w-2xl mx-auto ${getTextStyleClasses(content.intro)}`}
          style={getTextStyleInline(content.intro)}
        >
          {content.intro.text}
        </p>

        <div className="mt-8 flex justify-center">
          <a
            href={content.cta.link}
            className="inline-block px-8 py-4 rounded-full font-medium text-white transition-all hover:shadow-lg hover:opacity-90 text-lg"
            style={{
              backgroundColor: content.cta.color,
              color: content.cta.text_color || '#ffffff',
            }}
          >
            {content.cta.text}
          </a>
        </div>
      </div>
    </section>
  );
}
