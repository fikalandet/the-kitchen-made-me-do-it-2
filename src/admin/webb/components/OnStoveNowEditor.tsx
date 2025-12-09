import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import { colors } from '../../../theme/tokens';

const getTextColorForBackground = (bgColor: string): string => {
  const colorMap: { [key: string]: string } = {
    '#000000': '#ffffff',
    '#f6f2e0': '#000000',
    '#ffffff': '#000000',
    '#56c5c5': '#ffffff',
    '#a1c798': '#000000',
  };

  return colorMap[bgColor.toLowerCase()] || '#000000';
};

interface OnStoveNowSettings {
  backgroundColor?: string;
  heading?: string;
  headingFont?: string;
  headingBold?: boolean;
  headingAlignment?: 'left' | 'center';
  headingColor?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleColor?: string;
  cardsPerRow?: number;
  showWeekAheadText?: boolean;
  dayButtons?: {
    defaultColor?: string;
    hoverColor?: string;
    activeColor?: string;
  };
}

interface OnStoveNowEditorProps {
  settings: OnStoveNowSettings;
  onSettingsChange: (settings: OnStoveNowSettings) => void;
}

export default function OnStoveNowEditor({ settings, onSettingsChange }: OnStoveNowEditorProps) {
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const updateSetting = (key: keyof OnStoveNowSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  useEffect(() => {
    const subtitleTexts = settings.subtitleTexts || [];
    if (subtitleTexts.length <= 1) return;

    const rotationInterval = settings.subtitleRotationInterval || 10000;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setActiveSubtitleIndex((prev) => (prev + 1) % subtitleTexts.length);
        setFadeIn(true);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [settings.subtitleTexts, settings.subtitleRotationInterval]);

  const updateDayButtonColor = (key: 'defaultColor' | 'hoverColor' | 'activeColor', value: string) => {
    onSettingsChange({
      ...settings,
      dayButtons: {
        ...settings.dayButtons,
        [key]: value,
      },
    });
  };

  const addSubtitleText = () => {
    const subtitleTexts = settings.subtitleTexts || [];
    updateSetting('subtitleTexts', [...subtitleTexts, '']);
  };

  const removeSubtitleText = (index: number) => {
    const subtitleTexts = settings.subtitleTexts || [];
    updateSetting('subtitleTexts', subtitleTexts.filter((_, i) => i !== index));
  };

  const updateSubtitleText = (index: number, value: string) => {
    const subtitleTexts = settings.subtitleTexts || [];
    const newTexts = [...subtitleTexts];
    newTexts[index] = value;
    updateSetting('subtitleTexts', newTexts);
  };

  const subtitleTexts = settings.subtitleTexts || [''];
  const dayButtons = settings.dayButtons || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">På spisen nu</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för På spisen nu-sektionen</p>
        </div>
      </div>

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <ColorPicker
          label="Bakgrundsfärg för hela sektionen"
          value={settings.backgroundColor || '#ffffff'}
          onChange={(color) => updateSetting('backgroundColor', color)}
        />
      </CollapsibleCard>

      <CollapsibleCard title="Rubrik" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubriktext
            </label>
            <input
              type="text"
              value={settings.heading || ''}
              onChange={(e) => updateSetting('heading', e.target.value)}
              placeholder="På spisen nu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typsnitt
            </label>
            <select
              value={settings.headingFont || 'lobster'}
              onChange={(e) => updateSetting('headingFont', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value="lobster">Lobster</option>
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.headingBold || false}
                onChange={(e) => updateSetting('headingBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet stil</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('headingAlignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.headingAlignment === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('headingAlignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.headingAlignment === 'center'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Centrerad
              </button>
            </div>
          </div>

          <ColorPicker
            label="Rubrik – textfärg"
            value={settings.headingColor || '#374151'}
            onChange={(color) => updateSetting('headingColor', color)}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Textrad(er) efter rubriken" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Textrader (roterar automatiskt)
              </label>
              <button
                onClick={addSubtitleText}
                className="flex items-center gap-1 px-3 py-1 bg-[#56c5c5] text-white text-sm rounded-lg hover:bg-[#45b4b4] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Lägg till
              </button>
            </div>

            <div className="space-y-2">
              {subtitleTexts.map((text, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => updateSubtitleText(index, e.target.value)}
                    placeholder={`Textrad ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                  />
                  {subtitleTexts.length > 1 && (
                    <button
                      onClick={() => removeSubtitleText(index)}
                      className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervall för textrad-rotation
            </label>
            <select
              value={settings.subtitleRotationInterval || 10000}
              onChange={(e) => updateSetting('subtitleRotationInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value={10000}>10 sekunder</option>
              <option value={60000}>1 minut</option>
              <option value={3600000}>1 timme</option>
              <option value={86400000}>1 dag</option>
              <option value={604800000}>1 vecka</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering av textrad
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('subtitlePlacement', 'inline')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                På samma rad
              </button>
              <button
                onClick={() => updateSetting('subtitlePlacement', 'below')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.subtitlePlacement === 'below'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Under rubriken
              </button>
            </div>
          </div>

          <ColorPicker
            label="Textrad – textfärg"
            value={settings.subtitleColor || '#374151'}
            onChange={(color) => updateSetting('subtitleColor', color)}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Produktkort" defaultExpanded={true}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Antal produktkort synliga i följd
          </label>
          <input
            type="number"
            min="1"
            max="8"
            value={settings.cardsPerRow || 4}
            onChange={(e) => updateSetting('cardsPerRow', parseInt(e.target.value) || 4)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Rekommenderat: 4 för desktop, 1-2 för mobil (responsivt)
          </p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Dag-knappar" defaultExpanded={true}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standardfärg
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { name: 'Vit', color: colors.primary.white },
                { name: 'Svart', color: colors.primary.black },
                { name: 'Kitchen Grön', color: colors.primary.green },
                { name: 'Kitchen Cyan', color: colors.primary.cyan },
                { name: 'Kitchen Beige', color: '#f6f2e0' },
                { name: 'Ljusgrön', color: colors.background.lightGreen },
                { name: 'Ljusgrå', color: colors.background.lightGray },
                { name: 'Gul', color: colors.status.soon }
              ].map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => updateDayButtonColor('defaultColor', preset.color)}
                  className={`w-10 h-10 rounded border-2 transition-all ${
                    dayButtons.defaultColor === preset.color ? 'border-[#56c5c5] scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
            <input
              type="color"
              value={dayButtons.defaultColor || '#ffffff'}
              onChange={(e) => updateDayButtonColor('defaultColor', e.target.value)}
              className="mt-2 w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hover-färg
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { name: 'Vit', color: colors.primary.white },
                { name: 'Svart', color: colors.primary.black },
                { name: 'Kitchen Grön', color: colors.primary.green },
                { name: 'Kitchen Cyan', color: colors.primary.cyan },
                { name: 'Kitchen Beige', color: '#f6f2e0' },
                { name: 'Ljusgrön', color: colors.background.lightGreen },
                { name: 'Ljusgrå', color: colors.background.lightGray },
                { name: 'Gul', color: colors.status.soon }
              ].map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => updateDayButtonColor('hoverColor', preset.color)}
                  className={`w-10 h-10 rounded border-2 transition-all ${
                    dayButtons.hoverColor === preset.color ? 'border-[#56c5c5] scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
            <input
              type="color"
              value={dayButtons.hoverColor || '#f3f4f6'}
              onChange={(e) => updateDayButtonColor('hoverColor', e.target.value)}
              className="mt-2 w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktiv färg
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { name: 'Vit', color: colors.primary.white },
                { name: 'Svart', color: colors.primary.black },
                { name: 'Kitchen Grön', color: colors.primary.green },
                { name: 'Kitchen Cyan', color: colors.primary.cyan },
                { name: 'Kitchen Beige', color: '#f6f2e0' },
                { name: 'Ljusgrön', color: colors.background.lightGreen },
                { name: 'Ljusgrå', color: colors.background.lightGray },
                { name: 'Gul', color: colors.status.soon }
              ].map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => updateDayButtonColor('activeColor', preset.color)}
                  className={`w-10 h-10 rounded border-2 transition-all ${
                    dayButtons.activeColor === preset.color ? 'border-[#56c5c5] scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
            <input
              type="color"
              value={dayButtons.activeColor || '#56c5c5'}
              onChange={(e) => updateDayButtonColor('activeColor', e.target.value)}
              className="mt-2 w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Vecka-information" defaultExpanded={true}>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showWeekAheadText !== false}
              onChange={(e) => updateSetting('showWeekAheadText', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Visa texten "Visar max en vecka framåt"
            </span>
          </label>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={true}>
        <div
          className="p-8 rounded-lg"
          style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}
        >
          <div
            className={`mb-6 ${
              settings.headingAlignment === 'center' ? 'text-center' : 'text-left'
            }`}
          >
            {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
              <div className={`flex items-center gap-3 mb-2 ${settings.headingAlignment === 'center' ? 'justify-center' : ''}`}>
                <h2
                  className={`text-3xl ${
                    settings.headingFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.headingBold ? 'font-bold' : ''}`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.heading || 'På spisen nu'}
                </h2>
                {subtitleTexts.length > 0 && subtitleTexts[0] && (
                  <>
                    <span className="text-gray-400 text-2xl">|</span>
                    <div className="min-h-[24px] flex items-center">
                      <p
                        className="transition-opacity duration-300"
                        style={{
                          opacity: fadeIn ? 1 : 0,
                          color: settings.subtitleColor || '#374151'
                        }}
                      >
                        {subtitleTexts[activeSubtitleIndex] || subtitleTexts[0]}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <h2
                  className={`text-3xl ${
                    settings.headingFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.headingBold ? 'font-bold' : ''}`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.heading || 'På spisen nu'}
                </h2>
                {subtitleTexts.length > 0 && subtitleTexts[0] && (
                  <div className="min-h-[24px] flex items-center mt-2">
                    <p
                      className="transition-opacity duration-300"
                      style={{
                        opacity: fadeIn ? 1 : 0,
                        color: settings.subtitleColor || '#374151'
                      }}
                    >
                      {subtitleTexts[activeSubtitleIndex] || subtitleTexts[0]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            {(settings.showWeekAheadText !== false) && (
              <p className="text-sm text-gray-600 mb-3">Visar max en vecka framåt</p>
            )}
            <div className="flex flex-wrap gap-2">
              {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((day, index) => {
                const hoverBgColor = dayButtons.hoverColor || '#f3f4f6';
                const hoverTextColor = getTextColorForBackground(hoverBgColor);
                const defaultBgColor = dayButtons.defaultColor || '#ffffff';
                const defaultTextColor = getTextColorForBackground(defaultBgColor);

                return (
                  <button
                    key={day}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={
                      index === 0
                        ? { backgroundColor: dayButtons.activeColor || '#56c5c5', color: '#ffffff' }
                        : { backgroundColor: defaultBgColor, color: defaultTextColor }
                    }
                    onMouseEnter={(e) => {
                      if (index !== 0) {
                        e.currentTarget.style.backgroundColor = hoverBgColor;
                        e.currentTarget.style.color = hoverTextColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== 0) {
                        e.currentTarget.style.backgroundColor = defaultBgColor;
                        e.currentTarget.style.color = defaultTextColor;
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${settings.cardsPerRow || 4}, 1fr)` }}>
            {[1, 2, 3, 4].slice(0, settings.cardsPerRow || 4).map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow">
                <div className="h-32 bg-gray-200 rounded mb-2"></div>
                <p className="text-sm text-gray-600">Produktkort {i}</p>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
