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
];

export default function HeroCardText({ card, onCardUpdate }: HeroCardTextProps) {
  const textStyle = card.textStyle || {};

  const updateTextStyle = (key: string, value: any) => {
    onCardUpdate({
      textStyle: { ...textStyle, [key]: value }
    });
  };

  return (
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
          id={`no-bg-${card.id}`}
          checked={textStyle.backgroundColor === 'transparent'}
          onChange={(e) => updateTextStyle('backgroundColor', e.target.checked ? 'transparent' : '#ffffff')}
          className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
        />
        <label htmlFor={`no-bg-${card.id}`} className="text-sm font-medium text-gray-700">
          Ingen bakgrundsfärg bakom texten
        </label>
      </div>

      {textStyle.backgroundColor !== 'transparent' && (
        <ColorPicker
          label="Bakgrundsfärg bakom texten"
          value={textStyle.backgroundColor}
          onChange={(color) => updateTextStyle('backgroundColor', color)}
          presets={PRESET_COLORS}
        />
      )}
    </div>
  );
}
