import { HeroContent, TextStyle, CTAButton, TextLines } from '../../../../lib/types/landingPage';
import TypographyEditor from '../../components/TypographyEditor';
import CTAButtonEditor from '../../components/CTAButtonEditor';
import TextLinesEditor from '../../components/TextLinesEditor';

interface HeroSectionEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
}

const COLOR_PRESETS = [
  { value: '#a1c798', label: 'Mintgrön' },
  { value: '#f6f2e0', label: 'Beige' },
  { value: '#56c5c5', label: 'Turkos' },
  { value: '#000000', label: 'Svart' },
  { value: '#ffffff', label: 'Vit' }
];

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

const DEFAULT_TEXT_LINES: TextLines = {
  lines: [],
  rotate: false,
  interval_seconds: 10,
  placement: 'after_heading'
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

  const updateTextLines = (text_lines: TextLines) => {
    onChange({ ...content, text_lines });
  };

  const updateField = (field: keyof HeroContent, value: any) => {
    onChange({ ...content, [field]: value });
  };

  const heading = content.heading || { ...DEFAULT_TEXT_STYLE, text: '', size: 'xl', font: 'Lobster' };
  const intro = content.intro || { ...DEFAULT_TEXT_STYLE, text: '' };
  const cta = content.cta || DEFAULT_CTA;
  const textLines = content.text_lines || DEFAULT_TEXT_LINES;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Intro-sektion med rubrik, ingress, textrader, bild och call-to-action-knapp
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

      <TextLinesEditor
        label="Textrader (valfritt)"
        value={textLines}
        onChange={updateTextLines}
      />

      <CTAButtonEditor
        label="Call-to-Action Knapp"
        value={cta}
        onChange={updateCTA}
      />

      {/* Image Section */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Bild (valfritt)</label>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bild-URL</label>
            <input
              type="text"
              value={content.image || ''}
              onChange={(e) => updateField('image', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
            />
            {content.image && (
              <img
                src={content.image}
                alt="Preview"
                className="mt-2 w-full max-h-48 object-cover rounded-lg border-2 border-gray-200"
              />
            )}
          </div>

          {content.image && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Layout</label>
                <select
                  value={content.layout || 'fullwidth'}
                  onChange={(e) => updateField('layout', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] text-sm"
                >
                  <option value="fullwidth">Fullbredd</option>
                  <option value="image_left">Bild vänster / Text höger</option>
                  <option value="image_right">Bild höger / Text vänster</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Höjd</label>
                <select
                  value={content.height || 'medium'}
                  onChange={(e) => updateField('height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] text-sm"
                >
                  <option value="low">Låg</option>
                  <option value="medium">Medium</option>
                  <option value="high">Hög</option>
                </select>
              </div>

              {content.layout === 'fullwidth' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Overlay-färg (valfritt)</label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => updateField('overlay_color', preset.value)}
                          className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                            content.overlay_color === preset.value ? 'border-gray-900 ring-2 ring-gray-400' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: preset.value }}
                          title={preset.label}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={content.overlay_color || '#000000'}
                      onChange={(e) => updateField('overlay_color', e.target.value)}
                      className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Overlay-opacitet ({Math.round((content.overlay_opacity || 0.3) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={content.overlay_opacity || 0.3}
                      onChange={(e) => updateField('overlay_opacity', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
