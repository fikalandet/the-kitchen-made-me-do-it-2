import ColorPicker from './ColorPicker';
import { HeroCardData } from './HeroEditor';

interface HeroCardTextProps {
  card: HeroCardData;
  onCardUpdate: (updates: Partial<HeroCardData>) => void;
}

const FONT_OPTIONS = [
  { value: 'default', label: 'Standard' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'lobster', label: 'Lobster' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'open_sans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'handwritten', label: 'Handskriven' },
];

const PRESET_COLORS = [
  { value: '#a1c798', label: 'Grön' },
  { value: '#f6f2e0', label: 'Beige' },
  { value: '#56c5c5', label: 'Turkos' },
  { value: '#ffffff', label: 'Vit' },
  { value: '#000000', label: 'Svart' },
  { value: 'transparent', label: 'Transparent' },
];

export default function HeroCardText({ card, onCardUpdate }: HeroCardTextProps) {
  const headingStyle = card.headingStyle || {};
  const textStyle = card.textStyle || {};

  const updateHeadingStyle = (key: string, value: any) => {
    onCardUpdate({
      headingStyle: { ...headingStyle, [key]: value }
    });
  };

  const updateTextStyle = (key: string, value: any) => {
    onCardUpdate({
      textStyle: { ...textStyle, [key]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Rubrik-inställningar</h4>
        <div className="space-y-4">
          <ColorPicker
            label="Färg"
            value={headingStyle.textColor}
            onChange={(color) => updateHeadingStyle('textColor', color)}
            presets={PRESET_COLORS}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typsnitt
            </label>
            <select
              value={headingStyle.fontFamily || 'default'}
              onChange={(e) => updateHeadingStyle('fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              {FONT_OPTIONS.map(font => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Textstorlek
            </label>
            <select
              value={headingStyle.fontSize || 'lg'}
              onChange={(e) => updateHeadingStyle('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="sm">Liten</option>
              <option value="md">Normal</option>
              <option value="lg">Stor</option>
              <option value="xl">Extra stor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radavstånd
            </label>
            <select
              value={headingStyle.lineHeight || '1.5'}
              onChange={(e) => updateHeadingStyle('lineHeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="1.2">Tight</option>
              <option value="1.5">Normal</option>
              <option value="1.8">Relaxed</option>
              <option value="2">Loose</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justering
            </label>
            <select
              value={headingStyle.textAlign || 'left'}
              onChange={(e) => updateHeadingStyle('textAlign', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="left">Vänster</option>
              <option value="center">Centrerad</option>
              <option value="right">Höger</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Vid centrerad text radbryter texten endast om du lägger in radbrytning själv
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`no-bg-heading-${card.id}`}
              checked={headingStyle.backgroundColor === 'transparent'}
              onChange={(e) => updateHeadingStyle('backgroundColor', e.target.checked ? 'transparent' : '#ffffff')}
              className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
            />
            <label htmlFor={`no-bg-heading-${card.id}`} className="text-sm font-medium text-gray-700">
              Ingen bakgrundsfärg bakom rubriken
            </label>
          </div>

          {headingStyle.backgroundColor !== 'transparent' && (
            <ColorPicker
              label="Bakgrundsfärg bakom rubriken"
              value={headingStyle.backgroundColor}
              onChange={(color) => updateHeadingStyle('backgroundColor', color)}
              presets={PRESET_COLORS}
            />
          )}
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Brödtext-inställningar</h4>
        <div className="space-y-4">
          <ColorPicker
            label="Färg"
            value={textStyle.textColor}
            onChange={(color) => updateTextStyle('textColor', color)}
            presets={PRESET_COLORS}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typsnitt
            </label>
            <select
              value={textStyle.fontFamily || 'default'}
              onChange={(e) => updateTextStyle('fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              {FONT_OPTIONS.map(font => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Textstorlek
            </label>
            <select
              value={textStyle.fontSize || 'md'}
              onChange={(e) => updateTextStyle('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="sm">Liten</option>
              <option value="md">Normal</option>
              <option value="lg">Stor</option>
              <option value="xl">Extra stor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radavstånd
            </label>
            <select
              value={textStyle.lineHeight || '1.5'}
              onChange={(e) => updateTextStyle('lineHeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="1.2">Tight</option>
              <option value="1.5">Normal</option>
              <option value="1.8">Relaxed</option>
              <option value="2">Loose</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justering
            </label>
            <select
              value={textStyle.textAlign || 'left'}
              onChange={(e) => updateTextStyle('textAlign', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="left">Vänster</option>
              <option value="center">Centrerad</option>
              <option value="right">Höger</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Vid centrerad text radbryter texten endast om du lägger in radbrytning själv
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`no-bg-text-${card.id}`}
              checked={textStyle.backgroundColor === 'transparent'}
              onChange={(e) => updateTextStyle('backgroundColor', e.target.checked ? 'transparent' : '#ffffff')}
              className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
            />
            <label htmlFor={`no-bg-text-${card.id}`} className="text-sm font-medium text-gray-700">
              Ingen bakgrundsfärg bakom brödtexten
            </label>
          </div>

          {textStyle.backgroundColor !== 'transparent' && (
            <ColorPicker
              label="Bakgrundsfärg bakom brödtexten"
              value={textStyle.backgroundColor}
              onChange={(color) => updateTextStyle('backgroundColor', color)}
              presets={PRESET_COLORS}
            />
          )}
        </div>
      </div>
    </div>
  );
}
