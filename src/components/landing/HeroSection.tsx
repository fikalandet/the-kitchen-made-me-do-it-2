import { HeroContent } from '../../lib/types/landingPage';
import { getTextStyleClasses, getTextStyleInline } from '../../lib/utils/textStyles';

interface HeroSectionProps {
  content: HeroContent;
  backgroundColor?: string;
}

export function HeroSection({ content, backgroundColor }: HeroSectionProps) {
  const layout = content.layout || 'fullwidth';
  const height = content.height || 'medium';

  const heightClasses = {
    low: 'min-h-[400px]',
    medium: 'min-h-[500px]',
    high: 'min-h-[700px]'
  };

  if (!content.image || layout === 'fullwidth') {
    return (
      <section
        className={`py-16 px-4 relative ${content.image ? heightClasses[height] : ''}`}
        style={{ backgroundColor: backgroundColor || 'transparent' }}
      >
        {content.image && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${content.image})` }}
            />
            {content.overlay_color && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: content.overlay_color,
                  opacity: content.overlay_opacity || 0.3
                }}
              />
            )}
          </>
        )}
        <div className="max-w-4xl mx-auto relative z-10 flex items-center" style={{ minHeight: 'inherit' }}>
          <div className="w-full text-center">
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
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 px-4"
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      <div className={`max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${layout === 'image_right' ? 'md:grid-flow-dense' : ''}`}>
        <div className={layout === 'image_right' ? 'md:col-start-2' : ''}>
          <img
            src={content.image}
            alt={content.heading.text}
            className="w-full h-full object-cover rounded-2xl shadow-xl"
            style={{ minHeight: '400px', maxHeight: '600px' }}
          />
        </div>
        <div className={layout === 'image_right' ? 'md:col-start-1 md:row-start-1' : ''}>
          <h1
            className={getTextStyleClasses(content.heading)}
            style={getTextStyleInline(content.heading)}
          >
            {content.heading.text}
          </h1>

          <p
            className={`mt-6 ${getTextStyleClasses(content.intro)}`}
            style={getTextStyleInline(content.intro)}
          >
            {content.intro.text}
          </p>

          <div className="mt-8">
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
      </div>
    </section>
  );
}
