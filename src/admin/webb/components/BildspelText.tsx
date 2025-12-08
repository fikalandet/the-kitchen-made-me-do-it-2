import ColorPicker from './ColorPicker';
import { SlideData } from './BildspelEditor';

interface BildspelTextProps {
  slide: SlideData;
  slideNumber: number;
  onSlideUpdate: (updates: Partial<SlideData>) => void;
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

export default function BildspelText({ slide, slideNumber, onSlideUpdate }: BildspelTextProps) {
  const textStyle = slide.textStyle || {};

  const updateTextStyle = (key: string, value: any) => {
    onSlideUpdate({
      textStyle: { ...textStyle, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text direkt på bild/video
          </label>
          <textarea
            value={slide.text || ''}
            onChange={(e) => onSlideUpdate({ text: e.target.value })}
            placeholder="Skriv text som visas på bilden"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          />
        </div>

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

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="text-bold"
            checked={textStyle.bold || false}
            onChange={(e) => updateTextStyle('bold', e.target.checked)}
            className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
          />
          <label htmlFor="text-bold" className="text-sm font-medium text-gray-700">
            Fet stil
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vertikal position
          </label>
          <select
            value={textStyle.verticalAlign || 'bottom'}
            onChange={(e) => updateTextStyle('verticalAlign', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          >
            <option value="top">Uppe</option>
            <option value="center">Mitten</option>
            <option value="bottom">Nere</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horisontell position
          </label>
          <select
            value={textStyle.horizontalAlign || 'left'}
            onChange={(e) => updateTextStyle('horizontalAlign', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          >
            <option value="left">Vänster</option>
            <option value="center">Centrerad</option>
            <option value="right">Höger</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Textjustering
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
          <p className="text-xs text-gray-500 mt-1">Hur texten justeras inuti textboxen</p>
        </div>

        <ColorPicker
          label="Textfärg"
          value={textStyle.textColor}
          onChange={(color) => updateTextStyle('textColor', color)}
          presets={PRESET_COLORS}
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="no-background"
            checked={textStyle.backgroundColor === 'transparent'}
            onChange={(e) => updateTextStyle('backgroundColor', e.target.checked ? 'transparent' : '#ffffff')}
            className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
          />
          <label htmlFor="no-background" className="text-sm font-medium text-gray-700">
            Ingen bakgrund
          </label>
        </div>

        {textStyle.backgroundColor !== 'transparent' && (
          <>
            <ColorPicker
              label="Bakgrundsfärg bakom texten"
              value={textStyle.backgroundColor}
              onChange={(color) => updateTextStyle('backgroundColor', color)}
              presets={PRESET_COLORS}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opacity på bakgrundsfärg: {textStyle.backgroundOpacity !== undefined ? textStyle.backgroundOpacity : 100}%
              </label>
              <input
                type="range"
                value={textStyle.backgroundOpacity !== undefined ? textStyle.backgroundOpacity : 100}
                onChange={(e) => {
                  const opacity = parseInt(e.target.value);
                  updateTextStyle('backgroundOpacity', opacity);
                }}
                min="0"
                max="100"
                step="5"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#56c5c5]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Genomskinlig</span>
                <span>Ogenomskinlig</span>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
