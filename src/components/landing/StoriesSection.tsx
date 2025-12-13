import { StoriesContent } from '../../lib/types/landingPage';
import { getTextStyleClasses, getTextStyleInline } from '../../lib/utils/textStyles';
import { Quote } from 'lucide-react';

interface StoriesSectionProps {
  content: StoriesContent;
  backgroundColor?: string;
}

export function StoriesSection({ content, backgroundColor }: StoriesSectionProps) {
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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.stories.map((story, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg relative"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-[#a1c798] opacity-20" />
              <div className="relative">
                {story.image && (
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                )}
                <h3 className="font-lobster text-2xl text-gray-800 mb-1">
                  {story.name}
                </h3>
                <p className="text-sm text-[#a1c798] mb-4">{story.description}</p>
                <p className="text-gray-700 italic">{story.story}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
