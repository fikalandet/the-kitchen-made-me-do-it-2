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
  headingAlignment?: 'left' | 'center';
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  mainImagePosition?: 'left' | 'right';
  mainImageType?: 'image' | 'color';
  mainImageUrl?: string;
  mainImageBackgroundColor?: string;
  mainImageTitle?: string;
  mainImageTitleFont?: string;
  mainImageTitleSize?: number;
  mainImageTitleColor?: string;
  mainImageTitleBold?: boolean;
  mainImageTitleItalic?: boolean;
  mainImageText?: string;
  mainImageTextFont?: string;
  mainImageTextSize?: number;
  mainImageTextColor?: string;
  mainImageTextBold?: boolean;
  mainImageTextItalic?: boolean;
  mainImageTextPosition?: 'top' | 'center' | 'bottom';
  mainImageTextAlign?: 'left' | 'center' | 'right';
  mainImageTextBackgroundEnabled?: boolean;
  mainImageTextBackgroundColor?: string;
  mainImageTextBackgroundOpacity?: number;
  mainImageButtonText?: string;
  mainImageButtonBackgroundColor?: string;
  mainImageButtonTextColor?: string;
  inputFieldWidth?: 'short' | 'medium' | 'long';
  customerCardsLayout?: 'grid' | 'list';
  customerCardsMaxCount?: number;
  backgroundColor?: string;
}

interface WishFoodEditorProps {
  settings: WishFoodSettings;
  onSettingsChange: (settings: WishFoodSettings) => void;
}

export default function WishFoodEditor({ settings, onSettingsChange }: WishFoodEditorProps) {
  const { user } = useAuth();
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
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

  const handleMainImageUpload = async (file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingMainImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `wishfood-main-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/wishfood/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateSetting('mainImageUrl', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingMainImage(false);
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

      <CollapsibleCard title="Huvudrubrik" defaultExpanded={true}>
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
                  settings.headingAlignment === 'center' || !settings.headingAlignment
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

      <CollapsibleCard title="Textrader" defaultExpanded={true}>
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
                Efter huvudrubrik
              </button>
              <button
                onClick={() => updateSetting('subtitlePlacement', 'below')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.subtitlePlacement === 'below'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Under huvudrubrik
              </button>
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

      <CollapsibleCard title="Sektion: Huvudbild" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering av bildhalvan
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('mainImagePosition', 'left')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImagePosition === 'left' || !settings.mainImagePosition
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('mainImagePosition', 'right')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImagePosition === 'right'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Höger
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bakgrund för bildhalvan
            </label>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => updateSetting('mainImageType', 'image')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImageType === 'image' || !settings.mainImageType
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Bild
              </button>
              <button
                onClick={() => updateSetting('mainImageType', 'color')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImageType === 'color'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Enfärgad
              </button>
            </div>

            {settings.mainImageType === 'image' || !settings.mainImageType ? (
              <>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="wishfood-main-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMainImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="wishfood-main-upload"
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      uploadingMainImage ? 'opacity-50' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingMainImage ? 'Laddar upp...' : 'Ladda upp bild'}
                  </label>
                  {settings.mainImageUrl && (
                    <button
                      onClick={() => updateSetting('mainImageUrl', '')}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={settings.mainImageUrl || ''}
                  onChange={(e) => updateSetting('mainImageUrl', e.target.value)}
                  placeholder="Eller ange bild-URL..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent mt-2"
                />
                {settings.mainImageUrl && (
                  <div className="mt-2">
                    <img
                      src={settings.mainImageUrl}
                      alt="Huvudbild"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </>
            ) : (
              <ColorPicker
                label="Bakgrundsfärg"
                value={settings.mainImageBackgroundColor || '#a1c798'}
                onChange={(color) => updateSetting('mainImageBackgroundColor', color)}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubrik på bilden/bakgrunden
            </label>
            <input
              type="text"
              value={settings.mainImageTitle || ''}
              onChange={(e) => updateSetting('mainImageTitle', e.target.value)}
              placeholder="T.ex. Vad vill du äta?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typsnitt (rubrik)
              </label>
              <select
                value={settings.mainImageTitleFont || 'lobster'}
                onChange={(e) => updateSetting('mainImageTitleFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              >
                <option value="lobster">Lobster</option>
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storlek (rubrik, px)
              </label>
              <input
                type="number"
                min="12"
                max="72"
                value={settings.mainImageTitleSize || 24}
                onChange={(e) => updateSetting('mainImageTitleSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <ColorPicker
            label="Textfärg (rubrik)"
            value={settings.mainImageTitleColor || '#ffffff'}
            onChange={(color) => updateSetting('mainImageTitleColor', color)}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mainImageTitleBold || false}
                onChange={(e) => updateSetting('mainImageTitleBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet (rubrik)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mainImageTitleItalic || false}
                onChange={(e) => updateSetting('mainImageTitleItalic', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kursiv (rubrik)</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brödtext/ingress
            </label>
            <textarea
              value={settings.mainImageText || ''}
              onChange={(e) => updateSetting('mainImageText', e.target.value)}
              placeholder="Beskriv vad användaren ska göra..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typsnitt (brödtext)
              </label>
              <select
                value={settings.mainImageTextFont || 'sans'}
                onChange={(e) => updateSetting('mainImageTextFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              >
                <option value="lobster">Lobster</option>
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storlek (brödtext, px)
              </label>
              <input
                type="number"
                min="12"
                max="48"
                value={settings.mainImageTextSize || 16}
                onChange={(e) => updateSetting('mainImageTextSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <ColorPicker
            label="Textfärg (brödtext)"
            value={settings.mainImageTextColor || '#ffffff'}
            onChange={(color) => updateSetting('mainImageTextColor', color)}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mainImageTextBold || false}
                onChange={(e) => updateSetting('mainImageTextBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet (brödtext)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mainImageTextItalic || false}
                onChange={(e) => updateSetting('mainImageTextItalic', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kursiv (brödtext)</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering av textblock
            </label>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <button
                onClick={() => updateSetting('mainImageTextPosition', 'top')}
                className={`px-3 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImageTextPosition === 'top' || !settings.mainImageTextPosition
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Överst
              </button>
              <button
                onClick={() => updateSetting('mainImageTextPosition', 'center')}
                className={`px-3 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImageTextPosition === 'center'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mitten
              </button>
              <button
                onClick={() => updateSetting('mainImageTextPosition', 'bottom')}
                className={`px-3 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImageTextPosition === 'bottom'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Nederst
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => updateSetting('mainImageTextAlign', 'left')}
                className={`px-3 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImageTextAlign === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('mainImageTextAlign', 'center')}
                className={`px-3 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImageTextAlign === 'center' || !settings.mainImageTextAlign
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Centrerad
              </button>
              <button
                onClick={() => updateSetting('mainImageTextAlign', 'right')}
                className={`px-3 py-2 rounded-lg border-2 transition-all ${
                  settings.mainImageTextAlign === 'right'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Höger
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mainImageTextBackgroundEnabled || false}
                onChange={(e) => updateSetting('mainImageTextBackgroundEnabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Aktivera bakgrund bakom text</span>
            </label>
          </div>

          {settings.mainImageTextBackgroundEnabled && (
            <>
              <ColorPicker
                label="Bakgrundsfärg bakom text"
                value={settings.mainImageTextBackgroundColor || '#ffffff'}
                onChange={(color) => updateSetting('mainImageTextBackgroundColor', color)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opacitet: {settings.mainImageTextBackgroundOpacity || 80}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.mainImageTextBackgroundOpacity || 80}
                  onChange={(e) => updateSetting('mainImageTextBackgroundOpacity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Knapptext
            </label>
            <input
              type="text"
              value={settings.mainImageButtonText || ''}
              onChange={(e) => updateSetting('mainImageButtonText', e.target.value)}
              placeholder="Skicka önskning"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <ColorPicker
            label="Knapp - bakgrundsfärg"
            value={settings.mainImageButtonBackgroundColor || '#a1c798'}
            onChange={(color) => updateSetting('mainImageButtonBackgroundColor', color)}
          />

          <ColorPicker
            label="Knapp - textfärg"
            value={settings.mainImageButtonTextColor || '#ffffff'}
            onChange={(color) => updateSetting('mainImageButtonTextColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bredd på önskemålsfält
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('inputFieldWidth', 'short')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.inputFieldWidth === 'short'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Kort
              </button>
              <button
                onClick={() => updateSetting('inputFieldWidth', 'medium')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.inputFieldWidth === 'medium' || !settings.inputFieldWidth
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mellan
              </button>
              <button
                onClick={() => updateSetting('inputFieldWidth', 'long')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.inputFieldWidth === 'long'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Lång
              </button>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Sektion: kundkort/önskekort" defaultExpanded={true}>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Kundkorten placeras automatiskt på motsatt sida från huvudbilden.
              {settings.mainImagePosition === 'right' ? ' Placering: Vänster' : ' Placering: Höger'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout för kundkort
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('customerCardsLayout', 'grid')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.customerCardsLayout === 'grid' || !settings.customerCardsLayout
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => updateSetting('customerCardsLayout', 'list')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.customerCardsLayout === 'list'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Lista
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maxantal önskningar att visa
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.customerCardsMaxCount || 10}
              onChange={(e) => updateSetting('customerCardsMaxCount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 font-medium mb-2">Kundkorten visar:</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Kundens önskemålstext</li>
              <li>"Önskat av" + kundens namn</li>
              <li>Gilla-ikon med antal gillningar</li>
              <li>Kommentar-ikon</li>
              <li>Kockarnas svarsbubblor</li>
            </ul>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={true}>
        <div
          className="relative min-h-[600px] rounded-lg overflow-hidden p-8"
          style={{
            backgroundColor: settings.backgroundColor || '#ffffff'
          }}
        >
          <div className="relative z-10">
            <div
              className={`mb-8 ${
                settings.headingAlignment === 'center' || !settings.headingAlignment
                  ? 'text-center'
                  : 'text-left'
              }`}
            >
              {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
                <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
                  <h2
                    className={`text-3xl ${
                      settings.headingFont === 'lobster' ? 'font-lobster' : ''
                    } ${settings.headingBold ? 'font-bold' : ''}`}
                    style={{
                      fontFamily:
                        settings.headingFont === 'serif'
                          ? 'serif'
                          : settings.headingFont === 'sans'
                          ? 'sans-serif'
                          : undefined,
                      color: settings.headingColor || '#374151'
                    }}
                  >
                    {settings.heading || 'Önska käk'}
                  </h2>
                  {(settings.subtitleTexts || []).length > 0 && (settings.subtitleTexts || [''])[0] && (
                    <>
                      <span className="text-gray-400 text-2xl">|</span>
                      <div className="min-h-[24px] flex items-center">
                        <p
                          className={`transition-opacity duration-300 ${
                            settings.subtitleFont === 'lobster' ? 'font-lobster' : ''
                          } ${settings.subtitleBold ? 'font-bold' : ''} ${
                            settings.subtitleItalic ? 'italic' : ''
                          }`}
                          style={{
                            opacity: fadeIn ? 1 : 0,
                            fontFamily:
                              settings.subtitleFont === 'serif'
                                ? 'serif'
                                : settings.subtitleFont === 'sans'
                                ? 'sans-serif'
                                : undefined,
                            fontSize: `${settings.subtitleFontSize || 16}px`,
                            color: settings.subtitleColor || '#6b7280'
                          }}
                        >
                          {(settings.subtitleTexts || [''])[currentSubtitleIndex]}
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
                      fontFamily:
                        settings.headingFont === 'serif'
                          ? 'serif'
                          : settings.headingFont === 'sans'
                          ? 'sans-serif'
                          : undefined,
                      color: settings.headingColor || '#374151'
                    }}
                  >
                    {settings.heading || 'Önska käk'}
                  </h2>
                  {(settings.subtitleTexts || []).length > 0 && (settings.subtitleTexts || [''])[currentSubtitleIndex] && (
                    <div className="min-h-[24px] flex items-center mt-2">
                      <p
                        className={`transition-opacity duration-300 ${
                          settings.subtitleFont === 'lobster' ? 'font-lobster' : ''
                        } ${settings.subtitleBold ? 'font-bold' : ''} ${
                          settings.subtitleItalic ? 'italic' : ''
                        }`}
                        style={{
                          opacity: fadeIn ? 1 : 0,
                          fontFamily:
                            settings.subtitleFont === 'serif'
                              ? 'serif'
                              : settings.subtitleFont === 'sans'
                              ? 'sans-serif'
                              : undefined,
                          fontSize: `${settings.subtitleFontSize || 16}px`,
                          color: settings.subtitleColor || '#6b7280'
                        }}
                      >
                        {(settings.subtitleTexts || [''])[currentSubtitleIndex]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div
                className={`relative rounded-lg overflow-hidden min-h-[400px] flex ${
                  settings.mainImagePosition === 'right' ? 'order-2' : ''
                }`}
                style={{
                  backgroundImage:
                    settings.mainImageType === 'image' || !settings.mainImageType
                      ? settings.mainImageUrl
                        ? `url(${settings.mainImageUrl})`
                        : 'linear-gradient(135deg, #a1c798 0%, #8fb386 100%)'
                      : 'none',
                  backgroundColor:
                    settings.mainImageType === 'color'
                      ? settings.mainImageBackgroundColor || '#a1c798'
                      : 'transparent',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div
                  className={`w-full flex ${
                    settings.mainImageTextPosition === 'top' || !settings.mainImageTextPosition
                      ? 'items-start'
                      : settings.mainImageTextPosition === 'bottom'
                      ? 'items-end'
                      : 'items-center'
                  } ${
                    settings.mainImageTextAlign === 'left'
                      ? 'justify-start'
                      : settings.mainImageTextAlign === 'right'
                      ? 'justify-end'
                      : 'justify-center'
                  } p-6`}
                >
                  <div
                    className={`w-full ${
                      settings.mainImageTextBackgroundEnabled ? 'p-4 rounded-lg' : ''
                    }`}
                    style={{
                      backgroundColor: settings.mainImageTextBackgroundEnabled
                        ? settings.mainImageTextBackgroundColor || '#ffffff'
                        : 'transparent',
                      opacity: settings.mainImageTextBackgroundEnabled
                        ? (settings.mainImageTextBackgroundOpacity || 80) / 100
                        : 1
                    }}
                  >
                    <div className="space-y-3">
                      {settings.mainImageTitle && (
                        <h3
                          className={`${
                            settings.mainImageTitleFont === 'lobster' ? 'font-lobster' : ''
                          } ${settings.mainImageTitleBold ? 'font-bold' : ''} ${
                            settings.mainImageTitleItalic ? 'italic' : ''
                          }`}
                          style={{
                            fontFamily:
                              settings.mainImageTitleFont === 'serif'
                                ? 'serif'
                                : settings.mainImageTitleFont === 'sans'
                                ? 'sans-serif'
                                : undefined,
                            fontSize: `${settings.mainImageTitleSize || 24}px`,
                            color: settings.mainImageTitleColor || '#ffffff'
                          }}
                        >
                          {settings.mainImageTitle}
                        </h3>
                      )}
                      {settings.mainImageText && (
                        <p
                          className={`${
                            settings.mainImageTextFont === 'lobster' ? 'font-lobster' : ''
                          } ${settings.mainImageTextBold ? 'font-bold' : ''} ${
                            settings.mainImageTextItalic ? 'italic' : ''
                          }`}
                          style={{
                            fontFamily:
                              settings.mainImageTextFont === 'serif'
                                ? 'serif'
                                : settings.mainImageTextFont === 'sans'
                                ? 'sans-serif'
                                : undefined,
                            fontSize: `${settings.mainImageTextSize || 16}px`,
                            color: settings.mainImageTextColor || '#ffffff'
                          }}
                        >
                          {settings.mainImageText}
                        </p>
                      )}
                      <input
                        type="text"
                        placeholder="Skriv in ditt önskemål"
                        className={`px-3 py-2 border border-gray-300 rounded-lg text-sm ${
                          settings.inputFieldWidth === 'short'
                            ? 'w-1/2'
                            : settings.inputFieldWidth === 'long'
                            ? 'w-full'
                            : 'w-3/4'
                        }`}
                        readOnly
                      />
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: settings.mainImageButtonBackgroundColor || '#a1c798',
                          color: settings.mainImageButtonTextColor || '#ffffff'
                        }}
                      >
                        {settings.mainImageButtonText || 'Skicka önskning'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex flex-col space-y-3 max-h-[400px] overflow-y-auto pr-2 ${
                  settings.mainImagePosition === 'right' ? 'order-1' : ''
                }`}
              >
                <div className="aspect-square bg-white rounded-lg shadow p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-800 mb-2">Jag önskar mig thailändsk massaman-curry!</p>
                    <p className="text-xs text-gray-500">Önskat av Anna</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>💛 5</span>
                    <span>💬 2</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Kock: Låter gott!</span>
                  </div>
                </div>
                <div className="aspect-square bg-white rounded-lg shadow p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-800 mb-2">Vegetarisk lasagne</p>
                    <p className="text-xs text-gray-500">Önskat av Erik</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>💛 3</span>
                    <span>💬 1</span>
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
