import { useState, useEffect } from 'react';
import { Trash2, Zap, Plus } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface TasteTagsSettings {
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
  backgroundColor?: string;
  flowVisibleCount?: number;
  imageShape?: 'round' | 'rounded-square';
  imageBorderEnabled?: boolean;
  imageBorderColor?: string;
  imageBorderWidth?: number;
  labelBackgroundColor?: string;
  labelOpacity?: number;
  labelBorderRadius?: string;
  labelPlacement?: 'horizontal' | 'diagonal-left' | 'diagonal-right';
  labelWidth?: string;
  labelHeight?: string;
  labelAngle?: number;
  labelTextFont?: string;
  labelTextColor?: string;
  labelTextBold?: boolean;
  labelTextItalic?: boolean;
  labelTextSize?: number;
  buttonBackgroundColor?: string;
  buttonOpacity?: number;
  buttonText?: string;
  buttonTextFont?: string;
  buttonTextColor?: string;
  buttonTextBold?: boolean;
  buttonTextItalic?: boolean;
  buttonTextSize?: number;
}

interface TasteTagsEditorProps {
  settings: TasteTagsSettings;
  onSettingsChange: (settings: TasteTagsSettings) => void;
}

interface TasteLabelDish {
  id: string;
  product_id: string;
  taste_label_text: string;
  is_boosted: boolean;
  is_removed_by_admin: boolean;
  created_at: string;
  products?: {
    id: string;
    name: string;
    image_url?: string;
    price?: number;
  };
}

export default function TasteTagsEditor({ settings, onSettingsChange }: TasteTagsEditorProps) {
  const { user } = useAuth();
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [tasteLabelDishes, setTasteLabelDishes] = useState<TasteLabelDish[]>([]);
  const [removingDishId, setRemovingDishId] = useState<string | null>(null);
  const [boostingDishId, setBoostingDishId] = useState<string | null>(null);

  const updateSetting = (key: keyof TasteTagsSettings, value: any) => {
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
    fetchTasteLabelDishes();
  }, []);

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

  const fetchTasteLabelDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('taste_label_dishes')
        .select(`
          *,
          products (
            id,
            name,
            image_url,
            price
          )
        `)
        .eq('is_removed_by_admin', false)
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTasteLabelDishes(data || []);
    } catch (err) {
      console.error('Error fetching taste label dishes:', err);
    }
  };

  const handleRemoveDish = async (dishId: string) => {
    if (!user) {
      alert('Du måste vara inloggad för att ta bort rätter');
      return;
    }

    if (!confirm('Är du säker på att du vill ta bort denna smaketikett från flödet?')) {
      return;
    }

    setRemovingDishId(dishId);

    try {
      const { error } = await supabase
        .from('taste_label_dishes')
        .update({
          is_removed_by_admin: true,
          removed_by_admin_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', dishId);

      if (error) throw error;

      setTasteLabelDishes(tasteLabelDishes.filter(d => d.id !== dishId));
    } catch (err) {
      console.error('Error removing dish:', err);
      alert('Kunde inte ta bort rätten, försök igen.');
    } finally {
      setRemovingDishId(null);
    }
  };

  const handleToggleBoost = async (dishId: string, currentBoostStatus: boolean) => {
    if (!user) {
      alert('Du måste vara inloggad för att boosta rätter');
      return;
    }

    setBoostingDishId(dishId);

    try {
      const { error } = await supabase
        .from('taste_label_dishes')
        .update({
          is_boosted: !currentBoostStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', dishId);

      if (error) throw error;

      setTasteLabelDishes(
        tasteLabelDishes.map(d =>
          d.id === dishId ? { ...d, is_boosted: !currentBoostStatus } : d
        ).sort((a, b) => {
          if (a.is_boosted && !b.is_boosted) return -1;
          if (!a.is_boosted && b.is_boosted) return 1;
          return 0;
        })
      );
    } catch (err) {
      console.error('Error toggling boost:', err);
      alert('Kunde inte uppdatera boost-status, försök igen.');
    } finally {
      setBoostingDishId(null);
    }
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return hex;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Smaketiketter</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Smaketiketter-sektionen</p>
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
              placeholder="Smaketiketter"
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

      <CollapsibleCard title="Sektionens bakgrundsfärg" defaultExpanded={true}>
        <div className="space-y-4">
          <ColorPicker
            label="Bakgrundsfärg för hela sektionen"
            value={settings.backgroundColor || '#ffffff'}
            onChange={(color) => updateSetting('backgroundColor', color)}
          />
          <p className="text-sm text-gray-600">
            Denna färg appliceras bakom hela Smaketiketter-sektionen (rubrik, textrader och flöde).
          </p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Flödet" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antal produktbilder som syns i flödet
            </label>
            <select
              value={settings.flowVisibleCount || 4}
              onChange={(e) => updateSetting('flowVisibleCount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value={3}>3 bilder</option>
              <option value={4}>4 bilder</option>
              <option value={5}>5 bilder</option>
              <option value={6}>6 bilder</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form på produktbilderna
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('imageShape', 'round')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.imageShape === 'round' || !settings.imageShape
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Runda bilder
              </button>
              <button
                onClick={() => updateSetting('imageShape', 'rounded-square')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.imageShape === 'rounded-square'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Fyrkantiga med rundade hörn
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.imageBorderEnabled || false}
                onChange={(e) => updateSetting('imageBorderEnabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Visa ram runt bilderna</span>
            </label>
          </div>

          {settings.imageBorderEnabled && (
            <>
              <ColorPicker
                label="Färg på ramen"
                value={settings.imageBorderColor || '#a1c798'}
                onChange={(color) => updateSetting('imageBorderColor', color)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tjocklek på ramen (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.imageBorderWidth || 2}
                  onChange={(e) => updateSetting('imageBorderWidth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Smaketiketterna" defaultExpanded={true}>
        <div className="space-y-4">
          <ColorPicker
            label="Bakgrundsfärg på etiketterna"
            value={settings.labelBackgroundColor || '#a1c798'}
            onChange={(color) => updateSetting('labelBackgroundColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacity på etiketterna: {settings.labelOpacity || 80}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.labelOpacity || 80}
              onChange={(e) => updateSetting('labelOpacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rundade hörn på etiketterna
            </label>
            <select
              value={settings.labelBorderRadius || 'medium'}
              onChange={(e) => updateSetting('labelBorderRadius', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value="light">Lätta rundningar</option>
              <option value="medium">Medel</option>
              <option value="pill">Helt pillform</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etikettens vinkel (grader)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                min="-90"
                max="90"
                value={settings.labelAngle ?? 0}
                onChange={(e) => updateSetting('labelAngle', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                Ange vinkel i grader (-90 till +90). 0° = horisontell, -45° = vänster, +45° = höger
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting('labelAngle', 0)}
                  className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                >
                  0° (Horisontell)
                </button>
                <button
                  onClick={() => updateSetting('labelAngle', -45)}
                  className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                >
                  -45° (Vänster)
                </button>
                <button
                  onClick={() => updateSetting('labelAngle', 45)}
                  className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                >
                  45° (Höger)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bredd (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={parseInt(settings.labelWidth || '80')}
                onChange={(e) => updateSetting('labelWidth', `${e.target.value}%`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Höjd (px)
              </label>
              <input
                type="number"
                min="20"
                max="80"
                value={parseInt(settings.labelHeight || '32')}
                onChange={(e) => updateSetting('labelHeight', `${e.target.value}px`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Text på etiketterna</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typsnitt
              </label>
              <select
                value={settings.labelTextFont || 'sans'}
                onChange={(e) => updateSetting('labelTextFont', e.target.value)}
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
                min="10"
                max="24"
                value={settings.labelTextSize || 14}
                onChange={(e) => updateSetting('labelTextSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <ColorPicker
            label="Textfärg"
            value={settings.labelTextColor || '#ffffff'}
            onChange={(color) => updateSetting('labelTextColor', color)}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.labelTextBold || false}
                onChange={(e) => updateSetting('labelTextBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.labelTextItalic || false}
                onChange={(e) => updateSetting('labelTextItalic', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kursiv</span>
            </label>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Hantera smaketiketter ({tasteLabelDishes.length})
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Här visas rätter som kockar har flaggat med smaketiketter. Du kan ta bort olämpliga eller boosta specifika rätter.
            </p>

            {tasteLabelDishes.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasteLabelDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      dish.is_boosted
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {dish.products?.image_url && (
                      <img
                        src={dish.products.image_url}
                        alt={dish.products.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {dish.products?.name || 'Okänd rätt'}
                      </p>
                      <p className="text-sm text-gray-600 italic">
                        "{dish.taste_label_text}"
                      </p>
                      {dish.products?.price && (
                        <p className="text-sm text-gray-500">
                          {dish.products.price} kr
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleBoost(dish.id, dish.is_boosted)}
                        disabled={boostingDishId === dish.id}
                        className={`p-2 rounded-lg transition-colors ${
                          dish.is_boosted
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        } disabled:opacity-50`}
                        title={dish.is_boosted ? 'Ta bort boost' : 'Boosta rätt'}
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveDish(dish.id)}
                        disabled={removingDishId === dish.id}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Ta bort från flöde"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Inga smaketiketter att visa ännu
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Knappar" defaultExpanded={true}>
        <div className="space-y-4">
          <ColorPicker
            label="Bakgrundsfärg på knapparna"
            value={settings.buttonBackgroundColor || '#a1c798'}
            onChange={(color) => updateSetting('buttonBackgroundColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacity på knapparna: {settings.buttonOpacity || 100}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.buttonOpacity || 100}
              onChange={(e) => updateSetting('buttonOpacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text på knapparna
            </label>
            <input
              type="text"
              value={settings.buttonText || ''}
              onChange={(e) => updateSetting('buttonText', e.target.value)}
              placeholder="Se mer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typsnitt
              </label>
              <select
                value={settings.buttonTextFont || 'sans'}
                onChange={(e) => updateSetting('buttonTextFont', e.target.value)}
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
                min="10"
                max="24"
                value={settings.buttonTextSize || 14}
                onChange={(e) => updateSetting('buttonTextSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <ColorPicker
            label="Textfärg"
            value={settings.buttonTextColor || '#ffffff'}
            onChange={(color) => updateSetting('buttonTextColor', color)}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.buttonTextBold || false}
                onChange={(e) => updateSetting('buttonTextBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.buttonTextItalic || false}
                onChange={(e) => updateSetting('buttonTextItalic', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kursiv</span>
            </label>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Knapparnas placering är alltid centrerad undertill på produktkortet.
          </p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={true}>
        <div
          className="relative min-h-[500px] rounded-lg overflow-hidden p-8"
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
                      fontSize: `${settings.headingFontSize || 32}px`,
                      color: settings.headingColor || '#374151'
                    }}
                  >
                    {settings.heading || 'Smaketiketter'}
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
                      fontSize: `${settings.headingFontSize || 32}px`,
                      color: settings.headingColor || '#374151'
                    }}
                  >
                    {settings.heading || 'Smaketiketter'}
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

            <div className="flex gap-4 overflow-x-auto pb-4">
              {tasteLabelDishes.slice(0, settings.flowVisibleCount || 4).map((dish) => {
                const borderRadiusMap = {
                  light: '8px',
                  medium: '16px',
                  pill: '9999px'
                };
                const labelBorderRadius = borderRadiusMap[settings.labelBorderRadius as keyof typeof borderRadiusMap] || '16px';

                const imageRadius = settings.imageShape === 'rounded-square' ? '12px' : '50%';

                const labelRotation = settings.labelAngle ?? 0;

                return (
                  <div
                    key={dish.id}
                    className="flex-shrink-0 text-center"
                    style={{ width: '140px' }}
                  >
                    <div className="relative w-32 h-32 mx-auto mb-3 bg-gray-100">
                      <div
                        className="w-full h-full overflow-hidden"
                        style={{
                          borderRadius: imageRadius,
                          border: settings.imageBorderEnabled
                            ? `${settings.imageBorderWidth || 2}px solid ${settings.imageBorderColor || '#a1c798'}`
                            : 'none'
                        }}
                      >
                        {dish.products?.image_url ? (
                          <img
                            src={dish.products.image_url}
                            alt={dish.products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        )}
                      </div>

                      <div
                        className="absolute flex items-center justify-center overflow-hidden"
                        style={{
                          top: '50%',
                          left: '50%',
                          width: settings.labelWidth || '80%',
                          height: settings.labelHeight || '32px',
                          transform: `translate(-50%, -50%) rotate(${labelRotation}deg)`,
                          backgroundColor: hexToRgba(settings.labelBackgroundColor || '#a1c798', (settings.labelOpacity || 80) / 100),
                          borderRadius: labelBorderRadius
                        }}
                      >
                        <p
                          className={`text-xs px-2 truncate ${
                            settings.labelTextFont === 'lobster' ? 'font-lobster' : ''
                          } ${settings.labelTextBold ? 'font-bold' : ''} ${
                            settings.labelTextItalic ? 'italic' : ''
                          }`}
                          style={{
                            fontFamily:
                              settings.labelTextFont === 'serif'
                                ? 'serif'
                                : settings.labelTextFont === 'sans'
                                ? 'sans-serif'
                                : undefined,
                            fontSize: `${settings.labelTextSize || 14}px`,
                            color: settings.labelTextColor || '#ffffff'
                          }}
                        >
                          {dish.taste_label_text}
                        </p>
                      </div>

                      {dish.is_boosted && (
                        <div className="absolute top-1 right-1 bg-yellow-400 rounded-full p-1">
                          <Zap className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <button
                      className="text-xs px-3 py-1 rounded-full transition-colors mx-auto block"
                      style={{
                        backgroundColor: hexToRgba(settings.buttonBackgroundColor || '#a1c798', (settings.buttonOpacity || 100) / 100),
                        color: settings.buttonTextColor || '#ffffff',
                        fontFamily:
                          settings.buttonTextFont === 'serif'
                            ? 'serif'
                            : settings.buttonTextFont === 'sans'
                            ? 'sans-serif'
                            : undefined,
                        fontSize: `${settings.buttonTextSize || 14}px`,
                        fontWeight: settings.buttonTextBold ? 'bold' : 'normal',
                        fontStyle: settings.buttonTextItalic ? 'italic' : 'normal'
                      }}
                    >
                      {settings.buttonText || 'Se mer'}
                    </button>
                  </div>
                );
              })}
              {tasteLabelDishes.length === 0 && (
                <div className="w-full text-center py-8 text-gray-500">
                  Inga rätter att visa i preview
                </div>
              )}
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
