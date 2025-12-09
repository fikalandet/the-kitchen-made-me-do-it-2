import ColorPicker from './ColorPicker';
import { HeroCardData } from './HeroEditor';

interface HeroCardButtonProps {
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

const INTERNAL_PAGES = [
  { value: '/', label: 'Startsida' },
  { value: '/marketplace', label: 'Marketplace/Alla kockar' },
  { value: '/bli-kock', label: 'Bli kitchen-kock' },
  { value: '/guldskeden', label: 'Guldskeden' },
  { value: '/membership', label: 'Medlemskap' },
];

export default function HeroCardButton({ card, onCardUpdate }: HeroCardButtonProps) {
  const ctaStyle = card.ctaStyle || {};

  const updateCtaStyle = (key: string, value: any) => {
    onCardUpdate({
      ctaStyle: { ...ctaStyle, [key]: value }
    });
  };

  const hasButton = card.ctaLabel && card.ctaLabel.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={`no-button-${card.id}`}
          checked={!hasButton}
          onChange={(e) => {
            if (e.target.checked) {
              onCardUpdate({ ctaLabel: '' });
            } else {
              onCardUpdate({ ctaLabel: 'Läs mer' });
            }
          }}
          className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
        />
        <label htmlFor={`no-button-${card.id}`} className="text-sm font-medium text-gray-700">
          Ingen knapp
        </label>
      </div>

      {hasButton && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CTA-text
            </label>
            <input
              type="text"
              value={card.ctaLabel || ''}
              onChange={(e) => onCardUpdate({ ctaLabel: e.target.value })}
              placeholder="T.ex. Beställ nu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Länktyp
            </label>
            <select
              value={card.ctaLinkType || 'internal'}
              onChange={(e) => {
                onCardUpdate({ ctaLinkType: e.target.value as 'internal' | 'external', ctaUrl: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="internal">Intern sida</option>
              <option value="external">Extern URL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {card.ctaLinkType === 'internal' ? 'Sida' : 'URL'}
            </label>
            {card.ctaLinkType === 'internal' ? (
              <select
                value={card.ctaUrl || ''}
                onChange={(e) => onCardUpdate({ ctaUrl: e.target.value })}
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
                value={card.ctaUrl || ''}
                onChange={(e) => onCardUpdate({ ctaUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
              />
            )}
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

          <ColorPicker
            label="Färg"
            value={ctaStyle.textColor}
            onChange={(color) => updateCtaStyle('textColor', color)}
            presets={PRESET_COLORS}
          />

          <ColorPicker
            label="Bakgrundsfärg"
            value={ctaStyle.backgroundColor}
            onChange={(color) => updateCtaStyle('backgroundColor', color)}
            presets={PRESET_COLORS}
          />

          <ColorPicker
            label="Hover-färg"
            value={ctaStyle.hoverBackgroundColor}
            onChange={(color) => updateCtaStyle('hoverBackgroundColor', color)}
            presets={PRESET_COLORS}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form (border-radius)
            </label>
            <select
              value={ctaStyle.borderRadius || '8px'}
              onChange={(e) => updateCtaStyle('borderRadius', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="0">Ingen (0px)</option>
              <option value="4px">Lite (4px)</option>
              <option value="8px">Normal (8px)</option>
              <option value="12px">Stor (12px)</option>
              <option value="999px">Pill (999px)</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
