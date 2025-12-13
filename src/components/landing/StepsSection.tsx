import { StepsContent } from '../../lib/types/landingPage';
import { getTextStyleClasses, getTextStyleInline } from '../../lib/utils/textStyles';
import * as Icons from 'lucide-react';

interface StepsSectionProps {
  content: StepsContent;
  backgroundColor?: string;
}

export function StepsSection({ content, backgroundColor }: StepsSectionProps) {
  return (
    <section
      id={content.section_id}
      className="py-16 px-4"
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          className={getTextStyleClasses(content.heading)}
          style={getTextStyleInline(content.heading)}
        >
          {content.heading.text}
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.steps.map((step, index) => {
            const IconComponent = (Icons as any)[step.icon] || Icons.Circle;

            return (
              <div key={index} className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-[#a1c798] flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#56c5c5] flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-lobster text-xl text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
