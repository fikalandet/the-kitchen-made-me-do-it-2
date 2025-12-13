import { HeroContent, TextStyle, CTAButton } from '../../../../lib/types/landingPage';
import TypographyEditor from '../../components/TypographyEditor';
import CTAButtonEditor from '../../components/CTAButtonEditor';

interface HeroSectionEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  text: '',
  font: 'Poppins',
  style: 'normal',
  size: 'm',
  alignment: 'center',
  color: '#000000'
};

const DEFAULT_CTA: CTAButton = {
  text: 'Kom igång',
  link: '/login',
  color: '#56c5c5',
  text_color: '#ffffff'
};

export default function HeroSectionEditor({ content, onChange }: HeroSectionEditorProps) {
  const updateHeading = (heading: TextStyle) => {
    onChange({ ...content, heading });
  };

  const updateIntro = (intro: TextStyle) => {
    onChange({ ...content, intro });
  };

  const updateCTA = (cta: CTAButton) => {
    onChange({ ...content, cta });
  };

  // Ensure defaults
  const heading = content.heading || { ...DEFAULT_TEXT_STYLE, text: '', size: 'xl', font: 'Lobster' };
  const intro = content.intro || { ...DEFAULT_TEXT_STYLE, text: '' };
  const cta = content.cta || DEFAULT_CTA;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Hero-sektion med rubrik, ingress och call-to-action-knapp
      </div>

      <TypographyEditor
        label="Rubrik"
        value={heading}
        onChange={updateHeading}
      />

      <TypographyEditor
        label="Ingress"
        value={intro}
        onChange={updateIntro}
        multiline
      />

      <CTAButtonEditor
        label="Call-to-Action Knapp"
        value={cta}
        onChange={updateCTA}
      />
    </div>
  );
}
