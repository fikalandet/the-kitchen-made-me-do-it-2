import ColorPicker from './ColorPicker';
import { SlideData } from './BildspelEditor';

interface BildspelButtonsProps {
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

const INTERNAL_PAGES = [
  { value: '/', label: 'Startsida' },
  { value: '/marketplace', label: 'Marketplace/Alla kockar' },
  { value: '/bli-kock', label: 'Bli kitchen-kock' },
  { value: '/guldskeden', label: 'Guldskeden' },
  { value: '/membership', label: 'Medlemskap' },
];

export default function BildspelButtons({ slide, slideNumber, onSlideUpdate }: BildspelButtonsProps) {
  const ctaStyle = slide.ctaStyle || {};

  const updateCtaStyle = (key: string, value: any) => {
    onSlideUpdate({
      ctaStyle: { ...ctaStyle, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text på knapp
          </label>
          <input
            type="text"
            value={slide.ctaLabel || ''}
            onChange={(e) => onSlideUpdate({ ctaLabel: e.target.value })}
            placeholder="T.ex. Beställ nu"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Typsnitt
          </label>
          <select
            value={ctaStyle.fontFamily || 'default'}
            onChange={(e) => updateCtaStyle('fontFamily', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          >
            {FONT_OPTIONS.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        <ColorPicker
          label="Färg på typsnitt"
          value={ctaStyle.textColor}
          onChange={(color) => updateCtaStyle('textColor', color)}
          presets={PRESET_COLORS}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Textstorlek
          </label>
          <select
            value={ctaStyle.fontSize || 'md'}
            onChange={(e) => updateCtaStyle('fontSize', e.target.value)}
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
            id="cta-bold"
            checked={ctaStyle.bold || false}
            onChange={(e) => updateCtaStyle('bold', e.target.checked)}
            className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
          />
          <label htmlFor="cta-bold" className="text-sm font-medium text-gray-700">
            Fet stil
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placering av knapp
          </label>
          <select
            value={ctaStyle.position || 'bottom-right'}
            onChange={(e) => updateCtaStyle('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          >
            <option value="top-left">Vänster uppe</option>
            <option value="top-center">Centrerad uppe</option>
            <option value="top-right">Höger uppe</option>
            <option value="center-left">Vänster mitt</option>
            <option value="center-center">Centrerad mitt</option>
            <option value="center-right">Höger mitt</option>
            <option value="bottom-left">Vänster nere</option>
            <option value="bottom-center">Centrerad nere</option>
            <option value="bottom-right">Höger nere</option>
          </select>
        </div>

        <ColorPicker
          label="Bakgrundsfärg på knapp"
          value={ctaStyle.backgroundColor}
          onChange={(color) => updateCtaStyle('backgroundColor', color)}
          presets={PRESET_COLORS}
        />

        {ctaStyle.backgroundColor && ctaStyle.backgroundColor !== 'transparent' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genomskinlighet på bakgrund: {ctaStyle.backgroundOpacity ?? 100}%
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={ctaStyle.backgroundOpacity ?? 100}
                onChange={(e) => updateCtaStyle('backgroundOpacity', parseInt(e.target.value))}
                className="w-full accent-[#56c5c5]"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Genomskinlig</span>
                <span>Ogenomskinlig</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Knappstorlek
          </label>
          <select
            value={ctaStyle.size || 'md'}
            onChange={(e) => updateCtaStyle('size', e.target.value)}
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
            Länktyp
          </label>
          <select
            value={slide.ctaLinkType || 'internal'}
            onChange={(e) => {
              onSlideUpdate({ ctaLinkType: e.target.value as 'internal' | 'external', ctaUrl: '' });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          >
            <option value="internal">Intern sida</option>
            <option value="external">Extern URL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {slide.ctaLinkType === 'internal' ? 'Sida' : 'URL'}
          </label>
          {slide.ctaLinkType === 'internal' ? (
            <select
              value={slide.ctaUrl || ''}
              onChange={(e) => onSlideUpdate({ ctaUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="">Välj sida...</option>
              {INTERNAL_PAGES.map(page => (
                <option key={page.value} value={page.value}>{page.label}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={slide.ctaUrl || ''}
              onChange={(e) => onSlideUpdate({ ctaUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            />
          )}
          <p className="text-xs text-gray-500 mt-1">
            {slide.ctaLinkType === 'internal'
              ? 'För interna sidor väljer du bara sida i listan.'
              : 'För externa sidor, skriv full URL, t.ex. https://instagram.com/dittkonto'}
          </p>
        </div>
    </div>
  );
}
