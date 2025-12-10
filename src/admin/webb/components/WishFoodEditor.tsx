import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface WishFoodSettings {
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
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
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
  leftColumnImage?: string;
}

interface WishFoodEditorProps {
  settings: WishFoodSettings;
  onSettingsChange: (settings: WishFoodSettings) => void;
}

export default function WishFoodEditor({ settings, onSettingsChange }: WishFoodEditorProps) {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLeftImage, setUploadingLeftImage] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const updateSetting = (key: keyof WishFoodSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
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

  useEffect(() => {
    const subtitleTexts = settings.subtitleTexts || [];
    if (subtitleTexts.length <= 1) return;

    const rotationInterval = settings.subtitleRotationInterval || 10000;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSubtitleIndex((prev) => (prev + 1) % subtitleTexts.length);
        setFadeIn(true);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [settings.subtitleTexts, settings.subtitleRotationInterval]);

  const handleImageUpload = async (file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `wishfood-bg-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/wishfood/${fileName}`;

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

  const handleLeftImageUpload = async (file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingLeftImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `wishfood-left-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/wishfood/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateSetting('leftColumnImage', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingLeftImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Önska käk</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Önska käk-sektionen</p>
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
              placeholder="Önska käk"
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

      <CollapsibleCard title="Roterande textrader (under rubrik)" defaultExpanded={true}>
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
              {(settings.subtitleTexts || ['']).map((text, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => updateSubtitleText(index, e.target.value)}
                    placeholder={`Textrad ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                  />
                  {(settings.subtitleTexts?.length || 0) > 1 && (
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

      <CollapsibleCard title="Vänster kolumn - Bakgrundsbild" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bakgrundsbild för vänster kolumn
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                id="wishfood-left-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLeftImageUpload(file);
                }}
                className="hidden"
              />
              <label
                htmlFor="wishfood-left-upload"
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  uploadingLeftImage ? 'opacity-50' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                {uploadingLeftImage ? 'Laddar upp...' : 'Ladda upp bild'}
              </label>
              {settings.leftColumnImage && (
                <button
                  onClick={() => updateSetting('leftColumnImage', '')}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Ta bort
                </button>
              )}
            </div>
            <input
              type="text"
              value={settings.leftColumnImage || ''}
              onChange={(e) => updateSetting('leftColumnImage', e.target.value)}
              placeholder="Eller ange bild-URL..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent mt-2"
            />
            {settings.leftColumnImage && (
              <div className="mt-2">
                <img
                  src={settings.leftColumnImage}
                  alt="Vänster kolumn bakgrund"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
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
                    id="wishfood-bg-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="wishfood-bg-upload"
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
          className="relative min-h-[600px] rounded-lg overflow-hidden p-8"
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

          <div className="relative z-10">
            <div className="mb-8 text-center">
              <h2
                className={`${settings.headingFont === 'lobster' ? 'font-lobster' : ''} ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${settings.headingFontSize || 32}px`,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Önska käk'}
              </h2>
              {(settings.subtitleTexts || []).length > 0 && (settings.subtitleTexts || [''])[0] && (
                <div className="min-h-[24px] flex items-center justify-center mt-2">
                  <p
                    className={`transition-opacity duration-300 ${settings.subtitleFont === 'lobster' ? 'font-lobster' : ''} ${settings.subtitleBold ? 'font-bold' : ''} ${settings.subtitleItalic ? 'italic' : ''}`}
                    style={{
                      opacity: fadeIn ? 1 : 0,
                      fontFamily: settings.subtitleFont === 'serif' ? 'serif' : settings.subtitleFont === 'sans' ? 'sans-serif' : undefined,
                      fontSize: `${settings.subtitleFontSize || 16}px`,
                      color: settings.subtitleColor || '#6b7280'
                    }}
                  >
                    {(settings.subtitleTexts || [''])[currentSubtitleIndex]}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div
                className="relative rounded-lg overflow-hidden min-h-[400px] flex"
                style={{
                  backgroundImage: settings.leftColumnImage ? `url(${settings.leftColumnImage})` : 'linear-gradient(135deg, #a1c798 0%, #8fb386 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div
                  className={`w-full flex ${
                    settings.textPosition === 'top' ? 'items-start' :
                    settings.textPosition === 'bottom' ? 'items-end' :
                    'items-center'
                  } ${
                    settings.textAlign === 'left' ? 'justify-start' :
                    settings.textAlign === 'right' ? 'justify-end' :
                    'justify-center'
                  } p-6`}
                >
                  <div
                    className={`w-full ${settings.textBackgroundEnabled ? 'p-4 rounded-lg' : ''}`}
                    style={{
                      backgroundColor: settings.textBackgroundEnabled ? settings.textBackgroundColor || '#ffffff' : 'transparent',
                      opacity: settings.textBackgroundEnabled ? (settings.textBackgroundOpacity || 80) / 100 : 1
                    }}
                  >
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Skriv in ditt önskemål"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        readOnly
                      />
                      <textarea
                        placeholder="Eventuell kommentar (valfritt)"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        readOnly
                      />
                      <button className="w-full px-4 py-2 bg-[#a1c798] text-white rounded-lg text-sm">
                        Skicka önskning
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 max-h-[400px] overflow-y-auto pr-2">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold text-sm mb-1">Önskad rätt</h3>
                  <p className="text-xs text-gray-600 mb-2">Beskrivning av önskan...</p>
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Kockarnas kommentarer: Kommer snart...
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold text-sm mb-1">Önskad rätt 2</h3>
                  <p className="text-xs text-gray-600 mb-2">Beskrivning av önskan...</p>
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Kockarnas kommentarer: Kommer snart...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
