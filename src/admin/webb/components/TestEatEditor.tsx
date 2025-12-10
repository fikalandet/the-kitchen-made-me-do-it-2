import { useState } from 'react';
import { Upload } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface TestEatSettings {
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingColor?: string;
  headingBold?: boolean;
  headingItalic?: boolean;
  subtitle?: string;
  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  textPosition?: 'top' | 'center' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
  backgroundType?: 'color' | 'image' | 'image-overlay';
  backgroundColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textBackgroundColor?: string;
  textBackgroundOpacity?: number;
  textBackgroundEnabled?: boolean;
}

interface TestEatEditorProps {
  settings: TestEatSettings;
  onSettingsChange: (settings: TestEatSettings) => void;
}

export default function TestEatEditor({ settings, onSettingsChange }: TestEatEditorProps) {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);

  const updateSetting = (key: keyof TestEatSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleImageUpload = async (file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `testeat-bg-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/testeat/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateSetting('backgroundImage', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Testkäka & Tyck till</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Testkäka & Tyck till-sektionen</p>
        </div>
      </div>

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
              placeholder="Testkäka & Tyck till"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storlek (px)
              </label>
              <input
                type="number"
                min="12"
                max="72"
                value={settings.headingFontSize || 32}
                onChange={(e) => updateSetting('headingFontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <ColorPicker
            label="Textfärg"
            value={settings.headingColor || '#374151'}
            onChange={(color) => updateSetting('headingColor', color)}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.headingBold || false}
                onChange={(e) => updateSetting('headingBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.headingItalic || false}
                onChange={(e) => updateSetting('headingItalic', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kursiv</span>
            </label>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Text under rubrik" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text
            </label>
            <textarea
              value={settings.subtitle || ''}
              onChange={(e) => updateSetting('subtitle', e.target.value)}
              placeholder="Beskriv sektionen..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typsnitt
              </label>
              <select
                value={settings.subtitleFont || 'sans'}
                onChange={(e) => updateSetting('subtitleFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              >
                <option value="lobster">Lobster</option>
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storlek (px)
              </label>
              <input
                type="number"
                min="12"
                max="48"
                value={settings.subtitleFontSize || 16}
                onChange={(e) => updateSetting('subtitleFontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <ColorPicker
            label="Textfärg"
            value={settings.subtitleColor || '#6b7280'}
            onChange={(color) => updateSetting('subtitleColor', color)}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.subtitleBold || false}
                onChange={(e) => updateSetting('subtitleBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.subtitleItalic || false}
                onChange={(e) => updateSetting('subtitleItalic', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kursiv</span>
            </label>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Placering av text" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vertikal placering
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('textPosition', 'top')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  (settings.textPosition || 'top') === 'top'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Överst
              </button>
              <button
                onClick={() => updateSetting('textPosition', 'center')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.textPosition === 'center'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mitten
              </button>
              <button
                onClick={() => updateSetting('textPosition', 'bottom')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.textPosition === 'bottom'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Nederst
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horisontell placering
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('textAlign', 'left')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  (settings.textAlign || 'center') === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('textAlign', 'center')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  (settings.textAlign || 'center') === 'center'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Centrerad
              </button>
              <button
                onClick={() => updateSetting('textAlign', 'right')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.textAlign === 'right'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Höger
              </button>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bakgrundstyp
            </label>
            <select
              value={settings.backgroundType || 'color'}
              onChange={(e) => updateSetting('backgroundType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value="color">Endast färg</option>
              <option value="image">Bild</option>
              <option value="image-overlay">Bild med färg-overlay</option>
            </select>
          </div>

          {(settings.backgroundType === 'color' || settings.backgroundType === 'image-overlay' || !settings.backgroundType) && (
            <ColorPicker
              label="Bakgrundsfärg"
              value={settings.backgroundColor || '#ffffff'}
              onChange={(color) => updateSetting('backgroundColor', color)}
            />
          )}

          {(settings.backgroundType === 'image' || settings.backgroundType === 'image-overlay') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bakgrundsbild
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="testeat-bg-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="testeat-bg-upload"
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      uploadingImage ? 'opacity-50' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Laddar upp...' : 'Ladda upp bild'}
                  </label>
                  {settings.backgroundImage && (
                    <button
                      onClick={() => updateSetting('backgroundImage', '')}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={settings.backgroundImage || ''}
                  onChange={(e) => updateSetting('backgroundImage', e.target.value)}
                  placeholder="Eller ange bild-URL..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent mt-2"
                />
              </div>

              {settings.backgroundType === 'image-overlay' && (
                <>
                  <ColorPicker
                    label="Overlay-färg"
                    value={settings.overlayColor || '#000000'}
                    onChange={(color) => updateSetting('overlayColor', color)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overlay-opacitet: {settings.overlayOpacity || 30}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.overlayOpacity || 30}
                      onChange={(e) => updateSetting('overlayOpacity', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Bakgrund bakom text" defaultExpanded={true}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.textBackgroundEnabled || false}
              onChange={(e) => updateSetting('textBackgroundEnabled', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Aktivera bakgrund bakom text</span>
          </label>

          {settings.textBackgroundEnabled && (
            <>
              <ColorPicker
                label="Bakgrundsfärg"
                value={settings.textBackgroundColor || '#ffffff'}
                onChange={(color) => updateSetting('textBackgroundColor', color)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opacitet: {settings.textBackgroundOpacity || 80}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.textBackgroundOpacity || 80}
                  onChange={(e) => updateSetting('textBackgroundOpacity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={true}>
        <div
          className="relative min-h-[400px] rounded-lg overflow-hidden"
          style={{
            backgroundColor: settings.backgroundColor || '#ffffff',
            backgroundImage: (settings.backgroundType === 'image' || settings.backgroundType === 'image-overlay') && settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {settings.backgroundType === 'image-overlay' && settings.backgroundImage && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: settings.overlayColor || '#000000',
                opacity: (settings.overlayOpacity || 30) / 100
              }}
            />
          )}

          <div
            className={`relative z-10 h-full flex ${
              settings.textPosition === 'top' ? 'items-start' :
              settings.textPosition === 'bottom' ? 'items-end' :
              'items-center'
            } ${
              settings.textAlign === 'left' ? 'justify-start' :
              settings.textAlign === 'right' ? 'justify-end' :
              'justify-center'
            } p-8`}
          >
            <div
              className={`${settings.textBackgroundEnabled ? 'p-6 rounded-lg' : ''}`}
              style={{
                backgroundColor: settings.textBackgroundEnabled ? settings.textBackgroundColor || '#ffffff' : 'transparent',
                opacity: settings.textBackgroundEnabled ? (settings.textBackgroundOpacity || 80) / 100 : 1
              }}
            >
              <h2
                className={`${settings.headingFont === 'lobster' ? 'font-lobster' : ''} ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${settings.headingFontSize || 32}px`,
                  color: settings.headingColor || '#374151',
                  textAlign: settings.textAlign || 'center'
                }}
              >
                {settings.heading || 'Testkäka & Tyck till'}
              </h2>
              {settings.subtitle && (
                <p
                  className={`mt-2 ${settings.subtitleFont === 'lobster' ? 'font-lobster' : ''} ${settings.subtitleBold ? 'font-bold' : ''} ${settings.subtitleItalic ? 'italic' : ''}`}
                  style={{
                    fontFamily: settings.subtitleFont === 'serif' ? 'serif' : settings.subtitleFont === 'sans' ? 'sans-serif' : undefined,
                    fontSize: `${settings.subtitleFontSize || 16}px`,
                    color: settings.subtitleColor || '#6b7280',
                    textAlign: settings.textAlign || 'center'
                  }}
                >
                  {settings.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
