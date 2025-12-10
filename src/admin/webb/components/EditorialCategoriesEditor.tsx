import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Edit2, Star, MoveUp, MoveDown } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import EmojiPicker from './EmojiPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface EditorialCategoriesSettings {
  backgroundColor?: string;
  backgroundOpacity?: number;
  sectionPaddingTop?: number;
  sectionPaddingBottom?: number;
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingColor?: string;
  headingBold?: boolean;
  headingItalic?: boolean;
  headingAlignment?: 'left' | 'center';
  headingEmojiPrefix?: string;
  headingEmojiSuffix?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  [key: string]: any;
}

interface EditorialCategoriesEditorProps {
  settings: EditorialCategoriesSettings;
  onSettingsChange: (settings: EditorialCategoriesSettings) => void;
}

interface EditorialCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  cta_text: string;
  is_featured: boolean;
  background_color: string;
  category_type: string;
  display_order: number;
  title_font: string;
  title_bold: boolean;
  title_italic: boolean;
  title_size: number;
  title_alignment: string;
  title_color: string;
  description_font: string;
  description_bold: boolean;
  description_italic: boolean;
  description_size: number;
  description_alignment: string;
  description_color: string;
  cta_bg_color: string;
  cta_text_color: string;
  cta_font: string;
  cta_bold: boolean;
  cta_placement: string;
}

export default function EditorialCategoriesEditor({ settings, onSettingsChange }: EditorialCategoriesEditorProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<EditorialCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<EditorialCategory> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const updateSetting = (key: keyof EditorialCategoriesSettings, value: any) => {
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
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('editorial_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user || !editingCategory) return;
    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `editorial-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/editorial/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setEditingCategory({ ...editingCategory, image_url: data.publicUrl });
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Kunde inte ladda upp. Försök igen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.title || !editingCategory.slug) {
      alert('Titel och slug är obligatoriska');
      return;
    }

    try {
      if (editingCategory.id) {
        const { error } = await supabase
          .from('editorial_categories')
          .update({
            ...editingCategory,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order)) : 0;
        const { error } = await supabase
          .from('editorial_categories')
          .insert({
            ...editingCategory,
            display_order: maxOrder + 1
          });

        if (error) throw error;
      }

      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Kunde inte spara. Försök igen.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Ta bort kategori? Detta tar även bort alla artiklar i kategorin.')) return;

    try {
      const { error } = await supabase
        .from('editorial_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      console.error('Error:', err);
      alert('Kunde inte ta bort.');
    }
  };

  const handleToggleFeatured = async (category: EditorialCategory) => {
    try {
      const { error } = await supabase
        .from('editorial_categories')
        .update({
          is_featured: !category.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleMoveCategory = async (category: EditorialCategory, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categories.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetCategory = categories[targetIndex];

    try {
      await Promise.all([
        supabase
          .from('editorial_categories')
          .update({ display_order: targetCategory.display_order })
          .eq('id', category.id),
        supabase
          .from('editorial_categories')
          .update({ display_order: category.display_order })
          .eq('id', targetCategory.id)
      ]);

      fetchCategories();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Redaktionella kategorier</h3>
          <p className="text-sm text-gray-600">Hantera kategorier och artiklar för redaktionellt innehåll</p>
        </div>
      </div>

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <div className="space-y-4">
          <ColorPicker
            label="Bakgrundsfärg"
            value={settings.backgroundColor || '#ffffff'}
            onChange={(color) => updateSetting('backgroundColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacity: {settings.backgroundOpacity || 100}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.backgroundOpacity || 100}
              onChange={(e) => updateSetting('backgroundOpacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding Top (rem)
              </label>
              <input
                type="number"
                min="0"
                max="32"
                value={settings.sectionPaddingTop || 12}
                onChange={(e) => updateSetting('sectionPaddingTop', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding Bottom (rem)
              </label>
              <input
                type="number"
                min="0"
                max="32"
                value={settings.sectionPaddingBottom || 12}
                onChange={(e) => updateSetting('sectionPaddingBottom', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
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
              placeholder="Upptäck våra teman"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <EmojiPicker
              label="Emoji före"
              value={settings.headingEmojiPrefix || ''}
              onChange={(emoji) => updateSetting('headingEmojiPrefix', emoji)}
            />
            <EmojiPicker
              label="Emoji efter"
              value={settings.headingEmojiSuffix || ''}
              onChange={(emoji) => updateSetting('headingEmojiSuffix', emoji)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
              <select
                value={settings.headingFont || 'lobster'}
                onChange={(e) => updateSetting('headingFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="lobster">Lobster</option>
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storlek (px)</label>
              <input
                type="number"
                min="12"
                max="72"
                value={settings.headingFontSize || 32}
                onChange={(e) => updateSetting('headingFontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <ColorPicker
            label="Textfärg"
            value={settings.headingColor || '#374151'}
            onChange={(color) => updateSetting('headingColor', color)}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.headingBold || false}
                onChange={(e) => updateSetting('headingBold', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Fet</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.headingItalic || false}
                onChange={(e) => updateSetting('headingItalic', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Kursiv</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('headingAlignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.headingAlignment === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('headingAlignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.headingAlignment === 'center' || !settings.headingAlignment
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
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
                className="flex items-center gap-1 px-3 py-1 bg-[#56c5c5] text-white text-sm rounded-lg"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {(settings.subtitleTexts?.length || 0) > 1 && (
                    <button
                      onClick={() => removeSubtitleText(index)}
                      className="px-3 py-2 bg-black text-white rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('subtitlePlacement', 'inline')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Efter huvudrubrik
              </button>
              <button
                onClick={() => updateSetting('subtitlePlacement', 'below')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.subtitlePlacement === 'below'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Under huvudrubrik
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
              <select
                value={settings.subtitleFont || 'sans'}
                onChange={(e) => updateSetting('subtitleFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="lobster">Lobster</option>
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storlek (px)</label>
              <input
                type="number"
                min="12"
                max="48"
                value={settings.subtitleFontSize || 16}
                onChange={(e) => updateSetting('subtitleFontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <ColorPicker
            label="Textfärg"
            value={settings.subtitleColor || '#6b7280'}
            onChange={(color) => updateSetting('subtitleColor', color)}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Kategorier" defaultExpanded={true}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Kategorilista ({categories.length})
            </h4>
            <button
              onClick={() => setEditingCategory({
                title: '',
                slug: '',
                description: '',
                image_url: '',
                cta_text: 'Läs mer',
                is_featured: false,
                background_color: '#ffffff',
                category_type: '',
                title_font: 'sans',
                title_bold: true,
                title_italic: false,
                title_size: 24,
                title_alignment: 'left',
                title_color: '#1f2937',
                description_font: 'sans',
                description_bold: false,
                description_italic: false,
                description_size: 16,
                description_alignment: 'left',
                description_color: '#4b5563',
                cta_bg_color: '#a1c798',
                cta_text_color: '#ffffff',
                cta_font: 'sans',
                cta_bold: true,
                cta_placement: 'left'
              })}
              className="flex items-center gap-2 px-4 py-2 bg-[#56c5c5] text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Ny kategori
            </button>
          </div>

          {editingCategory && (
            <div className="p-6 bg-gray-50 border-2 border-gray-300 rounded-lg space-y-6">
              <h5 className="text-lg font-bold text-gray-900 pb-2 border-b-2 border-gray-300">
                {editingCategory.id ? 'Redigera' : 'Ny'} kategori
              </h5>

              <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                <h6 className="font-semibold text-gray-900">Grundläggande information</h6>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Detta är titeln som syns på kategorikortet på startsidan.</p>
                  <input
                    type="text"
                    value={editingCategory.title || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                    placeholder="t.ex. En sked för mamma"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug / URL-del
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Används i URL:en för kategorisidan, t.ex. 'en-sked-for-mamma'</p>
                  <input
                    type="text"
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    placeholder="en-sked-for-mamma"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bild
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Huvudbild för kategorikortet</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="file"
                      id="category-image-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="category-image-upload"
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        uploadingImage ? 'opacity-50' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Laddar...' : 'Ladda upp'}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editingCategory.image_url || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                    placeholder="Eller ange bild-URL..."
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                  />
                  {editingCategory.image_url && (
                    <img
                      src={editingCategory.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mt-2 border-2 border-gray-200"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori-typ (valfritt)
                  </label>
                  <select
                    value={editingCategory.category_type || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, category_type: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                  >
                    <option value="">Ingen</option>
                    <option value="Mamma">Mamma</option>
                    <option value="Hälsa">Hälsa</option>
                    <option value="Barn & familj">Barn & familj</option>
                    <option value="Budget">Budget</option>
                    <option value="Vegohörna">Vegohörna</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bakgrundsfärg för kort
                  </label>
                  <ColorPicker
                    label=""
                    value={editingCategory.background_color || '#ffffff'}
                    onChange={(color) => setEditingCategory({ ...editingCategory, background_color: color })}
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingCategory.is_featured || false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Featured (större kort på startsidan)</span>
                </label>
              </div>

              <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                <h6 className="font-semibold text-gray-900">Rubrik - typografi</h6>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rubrik - typsnitt</label>
                    <select
                      value={editingCategory.title_font || 'sans'}
                      onChange={(e) => setEditingCategory({ ...editingCategory, title_font: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                    >
                      <option value="lobster">Lobster</option>
                      <option value="sans">Sans Serif</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rubrik - storlek (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="72"
                      value={editingCategory.title_size || 24}
                      onChange={(e) => setEditingCategory({ ...editingCategory, title_size: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rubrik - färg</label>
                  <ColorPicker
                    label=""
                    value={editingCategory.title_color || '#1f2937'}
                    onChange={(color) => setEditingCategory({ ...editingCategory, title_color: color })}
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingCategory.title_bold || false}
                      onChange={(e) => setEditingCategory({ ...editingCategory, title_bold: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Rubrik - fet</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingCategory.title_italic || false}
                      onChange={(e) => setEditingCategory({ ...editingCategory, title_italic: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Rubrik - kursiv</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik - placering</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, title_alignment: 'left' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        editingCategory.title_alignment === 'left'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Vänster
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, title_alignment: 'center' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        editingCategory.title_alignment === 'center'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Centrerad
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                <h6 className="font-semibold text-gray-900">Text - beskrivning</h6>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kort text / beskrivning
                  </label>
                  <p className="text-xs text-gray-500 mb-2">En kort pitch-text som visas under rubriken på kortet.</p>
                  <textarea
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    placeholder="Kort beskrivning av kategorin..."
                    rows={2}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text - typsnitt</label>
                    <select
                      value={editingCategory.description_font || 'sans'}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description_font: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                    >
                      <option value="lobster">Lobster</option>
                      <option value="sans">Sans Serif</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text - storlek (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="32"
                      value={editingCategory.description_size || 16}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description_size: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text - färg</label>
                  <ColorPicker
                    label=""
                    value={editingCategory.description_color || '#4b5563'}
                    onChange={(color) => setEditingCategory({ ...editingCategory, description_color: color })}
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingCategory.description_bold || false}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description_bold: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Text - fet</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingCategory.description_italic || false}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description_italic: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Text - kursiv</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text - placering</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, description_alignment: 'left' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        editingCategory.description_alignment === 'left'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Vänster
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, description_alignment: 'center' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        editingCategory.description_alignment === 'center'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Centrerad
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                <h6 className="font-semibold text-gray-900">Knapp - CTA</h6>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Knapptext
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Texten på knappen, t.ex. 'Läs mer' eller 'Utforska'</p>
                  <input
                    type="text"
                    value={editingCategory.cta_text || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, cta_text: e.target.value })}
                    placeholder="Läs mer"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Knapp - bakgrundsfärg</label>
                    <ColorPicker
                      label=""
                      value={editingCategory.cta_bg_color || '#a1c798'}
                      onChange={(color) => setEditingCategory({ ...editingCategory, cta_bg_color: color })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Knapp - textfärg</label>
                    <ColorPicker
                      label=""
                      value={editingCategory.cta_text_color || '#ffffff'}
                      onChange={(color) => setEditingCategory({ ...editingCategory, cta_text_color: color })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Knapp - typsnitt</label>
                  <select
                    value={editingCategory.cta_font || 'sans'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, cta_font: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#56c5c5] focus:outline-none"
                  >
                    <option value="lobster">Lobster</option>
                    <option value="sans">Sans Serif</option>
                    <option value="serif">Serif</option>
                  </select>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingCategory.cta_bold || false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, cta_bold: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Knapp - fet text</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Knapp - placering</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, cta_placement: 'left' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        editingCategory.cta_placement === 'left'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Vänster
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, cta_placement: 'center' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        editingCategory.cta_placement === 'center'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Centrerad
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, cta_placement: 'right' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        editingCategory.cta_placement === 'right'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Höger
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveCategory}
                  className="px-6 py-2 bg-[#a1c798] text-white rounded-lg font-medium hover:bg-[#8fb386] transition-colors"
                >
                  Spara
                </button>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                  category.is_featured
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {category.image_url && (
                  <img src={category.image_url} alt={category.title} className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{category.title}</p>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveCategory(category, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveCategory(category, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(category)}
                    className={`p-1.5 rounded ${
                      category.is_featured
                        ? 'bg-yellow-400 text-white'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-gray-500 py-8">Inga kategorier skapade ännu</p>
            )}
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={false}>
        <div
          className="relative min-h-[500px] rounded-lg overflow-hidden"
          style={{
            backgroundColor: settings.backgroundColor || '#ffffff',
            opacity: (settings.backgroundOpacity || 100) / 100,
            paddingTop: `${settings.sectionPaddingTop || 12}rem`,
            paddingBottom: `${settings.sectionPaddingBottom || 12}rem`,
            paddingLeft: '2rem',
            paddingRight: '2rem'
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div
              className={`mb-8 ${
                settings.headingAlignment === 'center' || !settings.headingAlignment
                  ? 'text-center'
                  : 'text-left'
              }`}
            >
              <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
                {settings.headingEmojiPrefix && <span className="text-3xl">{settings.headingEmojiPrefix}</span>}
                <h2
                  className={`text-3xl ${
                    settings.headingFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    fontSize: `${settings.headingFontSize || 32}px`,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.heading || 'Upptäck våra teman'}
                </h2>
                {settings.headingEmojiSuffix && <span className="text-3xl">{settings.headingEmojiSuffix}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
                    category.is_featured ? 'md:col-span-2' : ''
                  }`}
                  style={{ backgroundColor: category.background_color }}
                >
                  {category.image_url && (
                    <div className={`relative overflow-hidden ${category.is_featured ? 'h-96' : 'h-48'}`}>
                      <img
                        src={category.image_url}
                        alt={category.title}
                        className="w-full h-full object-cover"
                      />
                      {category.is_featured && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-white rounded-full text-sm font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <h3
                      className={`mb-2 ${category.is_featured ? 'text-2xl' : 'text-xl'} ${category.title_bold ? 'font-bold' : ''} ${category.title_italic ? 'italic' : ''}`}
                      style={{
                        fontFamily: category.title_font === 'serif' ? 'serif' : category.title_font === 'sans' ? 'sans-serif' : category.title_font === 'lobster' ? 'Lobster' : undefined,
                        fontSize: `${category.title_size}px`,
                        color: category.title_color,
                        textAlign: category.title_alignment as any
                      }}
                    >
                      {category.title}
                    </h3>
                    <p
                      className={`mb-4 ${category.description_bold ? 'font-bold' : ''} ${category.description_italic ? 'italic' : ''}`}
                      style={{
                        fontFamily: category.description_font === 'serif' ? 'serif' : category.description_font === 'sans' ? 'sans-serif' : category.description_font === 'lobster' ? 'Lobster' : undefined,
                        fontSize: `${category.description_size}px`,
                        color: category.description_color,
                        textAlign: category.description_alignment as any
                      }}
                    >
                      {category.description}
                    </p>
                    <div style={{ textAlign: category.cta_placement as any }}>
                      <button
                        className={`inline-block px-4 py-2 rounded-lg ${category.cta_bold ? 'font-bold' : ''}`}
                        style={{
                          fontFamily: category.cta_font === 'serif' ? 'serif' : category.cta_font === 'sans' ? 'sans-serif' : category.cta_font === 'lobster' ? 'Lobster' : undefined,
                          backgroundColor: category.cta_bg_color,
                          color: category.cta_text_color
                        }}
                      >
                        {category.cta_text}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
