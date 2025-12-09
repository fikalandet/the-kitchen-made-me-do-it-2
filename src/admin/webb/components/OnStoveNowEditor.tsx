import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import { colors } from '../../../theme/tokens';

interface OnStoveNowSettings {
  backgroundColor?: string;
  heading?: string;
  headingFont?: string;
  headingBold?: boolean;
  headingAlignment?: 'left' | 'center';
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  cardsPerRow?: number;
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

  const updateSetting = (key: keyof OnStoveNowSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

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
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
              Intervall för textrad-rotation (sekunder)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.subtitleRotationInterval || 5}
              onChange={(e) => updateSetting('subtitleRotationInterval', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>
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
            <div className="flex items-center gap-3 mb-2">
              <h2
                className={`text-3xl text-gray-800 ${
                  settings.headingFont === 'lobster' ? 'font-lobster' : ''
                } ${settings.headingBold ? 'font-bold' : ''}`}
                style={{
                  fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined
                }}
              >
                {settings.heading || 'På spisen nu'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[0] && (
                <>
                  <span className="text-gray-400 text-2xl">|</span>
                  <p className="text-gray-700">
                    {subtitleTexts[activeSubtitleIndex] || subtitleTexts[0]}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">Visar max en vecka framåt</p>
            <div className="flex flex-wrap gap-2">
              {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((day, index) => (
                <button
                  key={day}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    index === 0 ? 'text-white' : ''
                  }`}
                  style={
                    index === 0
                      ? { backgroundColor: dayButtons.activeColor || '#56c5c5' }
                      : { backgroundColor: dayButtons.defaultColor || '#ffffff' }
                  }
                  onMouseEnter={(e) => {
                    if (index !== 0) {
                      e.currentTarget.style.backgroundColor = dayButtons.hoverColor || '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== 0) {
                      e.currentTarget.style.backgroundColor = dayButtons.defaultColor || '#ffffff';
                    }
                  }}
                >
                  {day}
                </button>
              ))}
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
