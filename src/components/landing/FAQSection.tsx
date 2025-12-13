import { useState } from 'react';
import { FAQContent } from '../../lib/types/landingPage';
import { getTextStyleClasses, getTextStyleInline } from '../../lib/utils/textStyles';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQSectionProps {
  content: FAQContent;
  backgroundColor?: string;
}

export function FAQSection({ content, backgroundColor }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="py-16 px-4"
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      <div className="max-w-4xl mx-auto">
        <h2
          className={getTextStyleClasses(content.heading)}
          style={getTextStyleInline(content.heading)}
        >
          {content.heading.text}
        </h2>

        <div className="mt-12 space-y-4">
          {content.questions.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-700">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {content.link_text && content.link_url && (
          <div className="mt-8 text-center">
            <Link
              to={content.link_url}
              className="text-[#a1c798] hover:underline font-medium"
            >
              {content.link_text}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
