import { BildspelSettings as Settings } from './BildspelEditor';

interface BildspelSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export default function BildspelSettings({ settings, onSettingsChange }: BildspelSettingsProps) {
  const autoplaySpeedSeconds = settings.autoplaySpeedMs ? settings.autoplaySpeedMs / 1000 : 4;

  const updateSetting = (key: keyof Settings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Autoplay-inställning
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="autoplay-on"
                name="autoplay"
                checked={settings.autoplay === true}
                onChange={() => updateSetting('autoplay', true)}
                className="w-4 h-4 text-[#56c5c5] border-gray-300 focus:ring-[#56c5c5]"
              />
              <label htmlFor="autoplay-on" className="text-sm text-gray-700">
                Rulla automatiskt
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="autoplay-off"
                name="autoplay"
                checked={settings.autoplay === false}
                onChange={() => updateSetting('autoplay', false)}
                className="w-4 h-4 text-[#56c5c5] border-gray-300 focus:ring-[#56c5c5]"
              />
              <label htmlFor="autoplay-off" className="text-sm text-gray-700">
                Stilla – användaren bläddrar själv med pilarna
              </label>
            </div>
          </div>
        </div>

        {settings.autoplay && (
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Autoplay-hastighet (sekunder)
          </label>
          <input
            type="number"
            value={autoplaySpeedSeconds}
            onChange={(e) => {
              const seconds = Math.max(1, Math.min(20, parseInt(e.target.value) || 4));
              updateSetting('autoplaySpeedMs', seconds * 1000);
            }}
            min="1"
            max="20"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Min: 1 sekund, Max: 20 sekunder</p>
        </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Höjd på bildspel (pixlar)
          </label>
          <input
            type="number"
            value={settings.height || 400}
            onChange={(e) => {
              const height = Math.max(200, Math.min(800, parseInt(e.target.value) || 400));
              updateSetting('height', height);
            }}
            min="200"
            max="800"
            step="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Min: 200px, Max: 800px</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Navigeringstyp
          </label>
          <select
            value={settings.navigationType || 'arrows_and_dots'}
            onChange={(e) => updateSetting('navigationType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          >
            <option value="arrows">Pilar</option>
            <option value="dots">Punkter</option>
            <option value="arrows_and_dots">Båda</option>
            <option value="none">Ingen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Antal bilder som visas samtidigt
          </label>
          <select
            value={settings.slidesPerView || 1}
            onChange={(e) => updateSetting('slidesPerView', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
    </div>
  );
}
