import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import EmojiPicker from './EmojiPicker';

interface ContestsSettings {
  backgroundColor?: string;
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingBold?: boolean;
  headingAlignment?: 'left' | 'center';
  headingColor?: string;
  headingEmojiStart?: string;
  headingEmojiEnd?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleColor?: string;
  descriptionText?: string;
  descriptionFont?: string;
  descriptionFontSize?: number;
  descriptionBold?: boolean;
  descriptionItalic?: boolean;
  descriptionAlignment?: 'left' | 'center' | 'right';
  descriptionColor?: string;
  descriptionBackgroundColor?: string;
  descriptionBackgroundOpacity?: number;
  descriptionSpaceTop?: number;
  descriptionSpaceBottom?: number;
  cardsPerRow?: number;
  layout?: 'cards-only' | 'image-third' | 'image-half';
  featuredImage?: string;
  featuredImageText?: string;
  featuredImageTextColor?: string;
  featuredImageTextHAlign?: 'left' | 'center' | 'right';
  featuredImageTextVAlign?: 'top' | 'center' | 'bottom';
}

interface ContestsEditorProps {
  settings: ContestsSettings;
  onSettingsChange: (settings: ContestsSettings) => void;
}

export default function ContestsEditor({ settings, onSettingsChange }: ContestsEditorProps) {
  const { user } = useAuth();
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const updateSetting = (key: keyof ContestsSettings, value: any) => {
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

  const handleImageUpload = async (file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `contests-featured-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/contests/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateSetting('featuredImage', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const subtitleTexts = settings.subtitleTexts || [''];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tävlingar</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Tävlingar-sektionen</p>
        </div>
      </div>

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <ColorPicker
          label="Bakgrundsfärg för hela sektionen"
          value={settings.backgroundColor || '#ffffff'}
          onChange={(color) => updateSetting('backgroundColor', color)}
        />
      </CollapsibleCard>

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
              placeholder="Tävlingar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <EmojiPicker
              value={settings.headingEmojiStart || ''}
              onChange={(emoji) => updateSetting('headingEmojiStart', emoji)}
              label="Emoji före rubrik"
            />

            <EmojiPicker
              value={settings.headingEmojiEnd || ''}
              onChange={(emoji) => updateSetting('headingEmojiEnd', emoji)}
              label="Emoji efter rubrik"
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

      <CollapsibleCard title="Beskrivande text" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivande text
            </label>
            <textarea
              value={settings.descriptionText || ''}
              onChange={(e) => updateSetting('descriptionText', e.target.value)}
              placeholder="Skriv en beskrivande text för sektionen..."
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
                value={settings.descriptionFont || 'sans'}
                onChange={(e) => updateSetting('descriptionFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              >
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="lobster">Lobster</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storlek (px)
              </label>
              <input
                type="number"
                value={settings.descriptionFontSize || 16}
                onChange={(e) => updateSetting('descriptionFontSize', parseInt(e.target.value))}
                min="12"
                max="48"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.descriptionBold || false}
                  onChange={(e) => updateSetting('descriptionBold', e.target.checked)}
                  className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
                />
                <span className="text-sm font-medium text-gray-700">Fet stil</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.descriptionItalic || false}
                  onChange={(e) => updateSetting('descriptionItalic', e.target.checked)}
                  className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
                />
                <span className="text-sm font-medium text-gray-700">Kursiv stil</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('descriptionAlignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.descriptionAlignment === 'left' || !settings.descriptionAlignment
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('descriptionAlignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.descriptionAlignment === 'center'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Centrerad
              </button>
              <button
                onClick={() => updateSetting('descriptionAlignment', 'right')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.descriptionAlignment === 'right'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Höger
              </button>
            </div>
          </div>

          <ColorPicker
            label="Textfärg"
            value={settings.descriptionColor || '#374151'}
            onChange={(color) => updateSetting('descriptionColor', color)}
          />

          <div>
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.descriptionBackgroundColor}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateSetting('descriptionBackgroundColor', '#f3f4f6');
                  } else {
                    updateSetting('descriptionBackgroundColor', '');
                  }
                }}
                className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
              />
              <span className="text-sm font-medium text-gray-700">Bakgrundsfärg bakom text</span>
            </label>

            {settings.descriptionBackgroundColor && (
              <>
                <ColorPicker
                  label="Bakgrundsfärg"
                  value={settings.descriptionBackgroundColor}
                  onChange={(color) => updateSetting('descriptionBackgroundColor', color)}
                />

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.descriptionBackgroundOpacity ?? 100}
                    onChange={(e) => updateSetting('descriptionBackgroundOpacity', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right text-sm text-gray-600 mt-1">
                    {settings.descriptionBackgroundOpacity ?? 100}%
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Space till huvudrubrik (px)
              </label>
              <input
                type="number"
                value={settings.descriptionSpaceTop ?? 16}
                onChange={(e) => updateSetting('descriptionSpaceTop', parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Space till produktkort (px)
              </label>
              <input
                type="number"
                value={settings.descriptionSpaceBottom ?? 24}
                onChange={(e) => updateSetting('descriptionSpaceBottom', parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Layout för sektionen" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Välj layout
            </label>
            <select
              value={settings.layout || 'cards-only'}
              onChange={(e) => updateSetting('layout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value="cards-only">Endast tävlingskort</option>
              <option value="image-third">Stor bild = 1/3 av sektionen, kort = 2/3</option>
              <option value="image-half">Stor bild = 1/2 av sektionen, kort = 1/2</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Välj hur innehållet ska visas på sidan
            </p>
          </div>

          {settings.layout !== 'cards-only' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured bild
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="contests-featured-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="contests-featured-upload"
                  className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    uploadingImage ? 'opacity-50' : ''
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  {uploadingImage ? 'Laddar upp...' : 'Ladda upp bild'}
                </label>
                {settings.featuredImage && (
                  <button
                    onClick={() => updateSetting('featuredImage', '')}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ladda upp eller ange URL till bilden som visas i sektionen
              </p>
              <input
                type="text"
                value={settings.featuredImage || ''}
                onChange={(e) => updateSetting('featuredImage', e.target.value)}
                placeholder="Eller ange bild-URL..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent mt-2"
              />
              {settings.featuredImage && (
                <div className="mt-3">
                  <img
                    src={settings.featuredImage}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {settings.layout !== 'cards-only' && settings.featuredImage && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text på stora bilden
                </label>
                <input
                  type="text"
                  value={settings.featuredImageText || ''}
                  onChange={(e) => updateSetting('featuredImageText', e.target.value)}
                  placeholder="Ange text som visas på bilden..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                />
              </div>

              <ColorPicker
                label="Textfärg på stora bilden"
                value={settings.featuredImageTextColor || '#ffffff'}
                onChange={(color) => updateSetting('featuredImageTextColor', color)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horisontell placering av text
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('featuredImageTextHAlign', 'left')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      (settings.featuredImageTextHAlign || 'left') === 'left'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Vänster
                  </button>
                  <button
                    onClick={() => updateSetting('featuredImageTextHAlign', 'center')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.featuredImageTextHAlign === 'center'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Centrerad
                  </button>
                  <button
                    onClick={() => updateSetting('featuredImageTextHAlign', 'right')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.featuredImageTextHAlign === 'right'
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
                  Vertikal placering av text
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('featuredImageTextVAlign', 'top')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      (settings.featuredImageTextVAlign || 'center') === 'top'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Uppe
                  </button>
                  <button
                    onClick={() => updateSetting('featuredImageTextVAlign', 'center')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      (settings.featuredImageTextVAlign || 'center') === 'center'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Mitten
                  </button>
                  <button
                    onClick={() => updateSetting('featuredImageTextVAlign', 'bottom')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.featuredImageTextVAlign === 'bottom'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Nere
                  </button>
                </div>
              </div>
            </>
          )}
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
                  } ${settings.headingBold ? 'font-bold' : ''} flex items-center gap-2`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    fontSize: `${settings.headingFontSize || 32}px`,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.headingEmojiStart && (
                    <span className={settings.headingEmojiStart === '⭐' || settings.headingEmojiStart === '✨' || settings.headingEmojiStart === '🌟' ? 'animate-pulse' : ''}>
                      {settings.headingEmojiStart}
                    </span>
                  )}
                  {settings.heading || 'Tävlingar'}
                  {settings.headingEmojiEnd && (
                    <span className={settings.headingEmojiEnd === '⭐' || settings.headingEmojiEnd === '✨' || settings.headingEmojiEnd === '🌟' ? 'animate-pulse' : ''}>
                      {settings.headingEmojiEnd}
                    </span>
                  )}
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
              <div className={settings.headingAlignment === 'center' ? 'flex flex-col items-center' : ''}>
                <h2
                  className={`text-3xl ${
                    settings.headingFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.headingBold ? 'font-bold' : ''} flex items-center gap-2`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    fontSize: `${settings.headingFontSize || 32}px`,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.headingEmojiStart && (
                    <span className={settings.headingEmojiStart === '⭐' || settings.headingEmojiStart === '✨' || settings.headingEmojiStart === '🌟' ? 'animate-pulse' : ''}>
                      {settings.headingEmojiStart}
                    </span>
                  )}
                  {settings.heading || 'Tävlingar'}
                  {settings.headingEmojiEnd && (
                    <span className={settings.headingEmojiEnd === '⭐' || settings.headingEmojiEnd === '✨' || settings.headingEmojiEnd === '🌟' ? 'animate-pulse' : ''}>
                      {settings.headingEmojiEnd}
                    </span>
                  )}
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

          {settings.descriptionText && (
            <div
              className={`${settings.descriptionAlignment === 'center' ? 'text-center' : settings.descriptionAlignment === 'right' ? 'text-right' : 'text-left'}`}
              style={{
                marginTop: `${settings.descriptionSpaceTop ?? 16}px`,
                marginBottom: `${settings.descriptionSpaceBottom ?? 24}px`
              }}
            >
              <p
                className={`${
                  settings.descriptionFont === 'lobster' ? 'font-lobster' : ''
                } ${settings.descriptionBold ? 'font-bold' : ''} ${settings.descriptionItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: settings.descriptionFont === 'serif' ? 'serif' : settings.descriptionFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${settings.descriptionFontSize || 16}px`,
                  color: settings.descriptionColor || '#374151',
                  backgroundColor: settings.descriptionBackgroundColor || 'transparent',
                  opacity: settings.descriptionBackgroundColor ? (settings.descriptionBackgroundOpacity ?? 100) / 100 : 1,
                  padding: settings.descriptionBackgroundColor ? '12px 16px' : '0',
                  borderRadius: settings.descriptionBackgroundColor ? '8px' : '0',
                  display: 'inline-block',
                  maxWidth: '100%'
                }}
              >
                {settings.descriptionText}
              </p>
            </div>
          )}

          {settings.layout === 'cards-only' || !settings.featuredImage ? (
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${settings.cardsPerRow || 4}, 1fr)` }}>
              {[1, 2, 3, 4].slice(0, settings.cardsPerRow || 4).map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow">
                  <div className="h-32 bg-gray-200 rounded mb-2"></div>
                  <p className="text-sm text-gray-600">Tävlingskort {i}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col lg:flex-row gap-6 ${settings.layout === 'image-third' ? 'lg:gap-8' : ''}`}>
              <div
                className={`rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative ${
                  settings.layout === 'image-third' ? 'lg:w-1/3' : 'lg:w-1/2'
                }`}
                style={{ minHeight: '300px' }}
              >
                {settings.featuredImage ? (
                  <img
                    src={settings.featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Featured bild
                  </div>
                )}
                {settings.featuredImageText && (
                  <div
                    className={`absolute inset-0 flex ${
                      settings.featuredImageTextHAlign === 'center' ? 'justify-center' :
                      settings.featuredImageTextHAlign === 'right' ? 'justify-end' :
                      'justify-start'
                    } ${
                      settings.featuredImageTextVAlign === 'top' ? 'items-start' :
                      settings.featuredImageTextVAlign === 'bottom' ? 'items-end' :
                      'items-center'
                    } p-6`}
                  >
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: settings.featuredImageTextColor || '#ffffff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {settings.featuredImageText}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))'
                  }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow">
                      <div className="h-32 bg-gray-200 rounded mb-2"></div>
                      <p className="text-sm text-gray-600">Tävlingskort {i}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleCard>
    </div>
  );
}
