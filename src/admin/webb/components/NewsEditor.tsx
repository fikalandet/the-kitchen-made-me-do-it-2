import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, MoveUp, MoveDown, Edit2, Star } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import EmojiPicker from './EmojiPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface NewsSettings {
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
  displayMode?: 'big-image-text' | 'card-flow';
  imageBlockPlacement?: 'left' | 'right';
  imageLayout?: 'layered' | 'grid';
  textSectionHeading?: string;
  textSectionIngress?: string;
  textSectionBody?: string;
  textSectionCtaText?: string;
  textSectionCtaLink?: string;
  textSectionCtaColor?: string;
  cardType?: 'product' | 'editorial';
  cardLayout?: 'horizontal' | 'grid';
  cardSize?: 'small' | 'normal' | 'large';
  cardsVisible?: number;
  [key: string]: any;
}

interface NewsEditorProps {
  settings: NewsSettings;
  onSettingsChange: (settings: NewsSettings) => void;
}

interface ImageItem {
  id: string;
  image_url: string;
  display_order: number;
  z_index: number;
  position_preset: string;
  offset_x: number;
  offset_y: number;
  rotation: number;
  scale: number;
  shape: string;
}

interface EditorialCard {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
  background_color: string;
  opacity: number;
  border_radius: number;
  padding: number;
  is_hero: boolean;
  display_order: number;
}

export default function NewsEditor({ settings, onSettingsChange }: NewsEditorProps) {
  const { user } = useAuth();
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [editorialCards, setEditorialCards] = useState<EditorialCard[]>([]);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [editingCard, setEditingCard] = useState<EditorialCard | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const updateSetting = (key: keyof NewsSettings, value: any) => {
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
    fetchData();
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

  const fetchData = async () => {
    try {
      const [imagesRes, cardsRes] = await Promise.all([
        supabase
          .from('news_image_items')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('news_editorial_cards')
          .select('*')
          .order('display_order', { ascending: true })
      ]);

      if (imagesRes.data) setImageItems(imagesRes.data);
      if (cardsRes.data) setEditorialCards(cardsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `news-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const maxOrder = imageItems.length > 0 ? Math.max(...imageItems.map(i => i.display_order)) : 0;

      const { error } = await supabase
        .from('news_image_items')
        .insert({
          image_url: data.publicUrl,
          display_order: maxOrder + 1,
          z_index: maxOrder + 1
        });

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Kunde inte ladda upp. Försök igen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Ta bort bild?')) return;

    try {
      const { error } = await supabase
        .from('news_image_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSaveImage = async (image: ImageItem) => {
    try {
      const { error } = await supabase
        .from('news_image_items')
        .update({
          z_index: image.z_index,
          position_preset: image.position_preset,
          offset_x: image.offset_x,
          offset_y: image.offset_y,
          rotation: image.rotation,
          scale: image.scale,
          shape: image.shape,
          updated_at: new Date().toISOString()
        })
        .eq('id', image.id);

      if (error) throw error;
      setEditingImage(null);
      fetchData();
    } catch (err) {
      console.error('Error:', err);
      alert('Kunde inte spara. Försök igen.');
    }
  };

  const handleMoveImage = async (image: ImageItem, direction: 'up' | 'down') => {
    const currentIndex = imageItems.findIndex(i => i.id === image.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === imageItems.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetImage = imageItems[targetIndex];

    try {
      await Promise.all([
        supabase
          .from('news_image_items')
          .update({ display_order: targetImage.display_order })
          .eq('id', image.id),
        supabase
          .from('news_image_items')
          .update({ display_order: image.display_order })
          .eq('id', targetImage.id)
      ]);

      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSaveCard = async (card: Partial<EditorialCard>) => {
    try {
      if (editingCard) {
        const { error } = await supabase
          .from('news_editorial_cards')
          .update({
            ...card,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCard.id);

        if (error) throw error;
      } else {
        const maxOrder = editorialCards.length > 0 ? Math.max(...editorialCards.map(c => c.display_order)) : 0;
        const { error } = await supabase
          .from('news_editorial_cards')
          .insert({
            ...card,
            display_order: maxOrder + 1
          });

        if (error) throw error;
      }

      setEditingCard(null);
      fetchData();
    } catch (err) {
      console.error('Error:', err);
      alert('Kunde inte spara. Försök igen.');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Ta bort kort?')) return;

    try {
      const { error } = await supabase
        .from('news_editorial_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleToggleHero = async (card: EditorialCard) => {
    try {
      const { error } = await supabase
        .from('news_editorial_cards')
        .update({
          is_hero: !card.is_hero,
          updated_at: new Date().toISOString()
        })
        .eq('id', card.id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nyheter</h3>
          <p className="text-sm text-gray-600">Avancerad nyhetslayout med bildcollage eller kortflöde</p>
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
              placeholder="Nyheter"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rotationsintervall
            </label>
            <select
              value={settings.subtitleRotationInterval || 10000}
              onChange={(e) => updateSetting('subtitleRotationInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={10000}>10 sekunder</option>
              <option value={60000}>1 minut</option>
              <option value={3600000}>1 timme</option>
            </select>
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

      <CollapsibleCard title="Visningsläge" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Välj visningsläge</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateSetting('displayMode', 'big-image-text')}
                className={`px-4 py-3 rounded-lg border-2 text-sm ${
                  settings.displayMode === 'big-image-text' || !settings.displayMode
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Stor bild & text
              </button>
              <button
                onClick={() => updateSetting('displayMode', 'card-flow')}
                className={`px-4 py-3 rounded-lg border-2 text-sm ${
                  settings.displayMode === 'card-flow'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Kortflöde
              </button>
            </div>
          </div>

          {(settings.displayMode === 'big-image-text' || !settings.displayMode) && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Inställningar: Stor bild & text</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bildblockets placering
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('imageBlockPlacement', 'left')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.imageBlockPlacement === 'left' || !settings.imageBlockPlacement
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Vänster
                  </button>
                  <button
                    onClick={() => updateSetting('imageBlockPlacement', 'right')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.imageBlockPlacement === 'right'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Höger
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bildlayout
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('imageLayout', 'layered')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.imageLayout === 'layered' || !settings.imageLayout
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Omlott-lager
                  </button>
                  <button
                    onClick={() => updateSetting('imageLayout', 'grid')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.imageLayout === 'grid'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Grid 2x2
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Textsektionens rubrik
                </label>
                <input
                  type="text"
                  value={settings.textSectionHeading || ''}
                  onChange={(e) => updateSetting('textSectionHeading', e.target.value)}
                  placeholder="T.ex. Senaste nytt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingress
                </label>
                <textarea
                  value={settings.textSectionIngress || ''}
                  onChange={(e) => updateSetting('textSectionIngress', e.target.value)}
                  placeholder="Kort intro"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brödtext
                </label>
                <textarea
                  value={settings.textSectionBody || ''}
                  onChange={(e) => updateSetting('textSectionBody', e.target.value)}
                  placeholder="Huvudtext"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA-text
                  </label>
                  <input
                    type="text"
                    value={settings.textSectionCtaText || ''}
                    onChange={(e) => updateSetting('textSectionCtaText', e.target.value)}
                    placeholder="Läs mer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA-länk
                  </label>
                  <input
                    type="text"
                    value={settings.textSectionCtaLink || ''}
                    onChange={(e) => updateSetting('textSectionCtaLink', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <ColorPicker
                label="CTA-färg"
                value={settings.textSectionCtaColor || '#a1c798'}
                onChange={(color) => updateSetting('textSectionCtaColor', color)}
              />
            </div>
          )}

          {settings.displayMode === 'card-flow' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Inställningar: Kortflöde</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Korttyp</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('cardType', 'product')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.cardType === 'product' || !settings.cardType
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Produktkort
                  </button>
                  <button
                    onClick={() => updateSetting('cardType', 'editorial')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.cardType === 'editorial'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Redaktionella kort
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('cardLayout', 'grid')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.cardLayout === 'grid' || !settings.cardLayout
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => updateSetting('cardLayout', 'horizontal')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.cardLayout === 'horizontal'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Horisontellt
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kortstorlek</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSetting('cardSize', 'small')}
                    className={`px-3 py-2 rounded-lg border-2 text-sm ${
                      settings.cardSize === 'small'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Små
                  </button>
                  <button
                    onClick={() => updateSetting('cardSize', 'normal')}
                    className={`px-3 py-2 rounded-lg border-2 text-sm ${
                      settings.cardSize === 'normal' || !settings.cardSize
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => updateSetting('cardSize', 'large')}
                    className={`px-3 py-2 rounded-lg border-2 text-sm ${
                      settings.cardSize === 'large'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Stora
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antal kort som syns
                </label>
                <select
                  value={settings.cardsVisible || 6}
                  onChange={(e) => updateSetting('cardsVisible', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Innehåll" defaultExpanded={true}>
        <div className="space-y-4">
          {(settings.displayMode === 'big-image-text' || !settings.displayMode) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Bildlista ({imageItems.length} bilder)</h4>
                <div>
                  <input
                    type="file"
                    id="news-image-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="news-image-upload"
                    className={`flex items-center gap-2 px-4 py-2 bg-[#56c5c5] text-white rounded-lg cursor-pointer ${
                      uploadingImage ? 'opacity-50' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Laddar...' : 'Ladda upp bild'}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                {imageItems.map((image, index) => (
                  <div key={image.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                    {editingImage?.id === image.id ? (
                      <div className="space-y-3">
                        <img
                          src={image.image_url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600">Position</label>
                            <select
                              value={editingImage.position_preset}
                              onChange={(e) => setEditingImage({ ...editingImage, position_preset: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                            >
                              <option value="top-left">Uppe vänster</option>
                              <option value="top-right">Uppe höger</option>
                              <option value="bottom-left">Nere vänster</option>
                              <option value="bottom-right">Nere höger</option>
                              <option value="center">Center</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-gray-600">Form</label>
                            <select
                              value={editingImage.shape}
                              onChange={(e) => setEditingImage({ ...editingImage, shape: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                            >
                              <option value="rectangular">Rektangulär</option>
                              <option value="rounded">Rundade hörn</option>
                              <option value="circle">Helrund</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-600">Rotation: {editingImage.rotation}°</label>
                          <input
                            type="range"
                            min="-45"
                            max="45"
                            value={editingImage.rotation}
                            onChange={(e) => setEditingImage({ ...editingImage, rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-600">Skala: {editingImage.scale}x</label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={editingImage.scale}
                            onChange={(e) => setEditingImage({ ...editingImage, scale: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveImage(editingImage)}
                            className="px-3 py-1 bg-[#a1c798] text-white text-sm rounded"
                          >
                            Spara
                          </button>
                          <button
                            onClick={() => setEditingImage(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                          >
                            Avbryt
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <img
                          src={image.image_url}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 text-sm text-gray-600">
                          Lager {image.z_index} • {image.position_preset}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleMoveImage(image, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveImage(image, 'down')}
                            disabled={index === imageItems.length - 1}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingImage(image)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {imageItems.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Inga bilder uppladdade ännu</p>
                )}
              </div>
            </div>
          )}

          {settings.displayMode === 'card-flow' && settings.cardType === 'editorial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Redaktionella kort ({editorialCards.length})
                </h4>
                <button
                  onClick={() => setEditingCard({ id: '', title: '', background_color: '#ffffff', opacity: 100, border_radius: 12, padding: 16, is_hero: false, display_order: 0 } as EditorialCard)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#56c5c5] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Skapa kort
                </button>
              </div>

              {editingCard && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <h5 className="font-medium">{editingCard.id ? 'Redigera' : 'Nytt'} kort</h5>

                  <input
                    type="text"
                    value={editingCard.title}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    placeholder="Rubrik"
                    className="w-full px-3 py-2 border rounded"
                  />

                  <input
                    type="text"
                    value={editingCard.subtitle || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, subtitle: e.target.value })}
                    placeholder="Undertext"
                    className="w-full px-3 py-2 border rounded"
                  />

                  <input
                    type="text"
                    value={editingCard.image_url || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, image_url: e.target.value })}
                    placeholder="Bild-URL"
                    className="w-full px-3 py-2 border rounded"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editingCard.cta_text || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, cta_text: e.target.value })}
                      placeholder="CTA-text"
                      className="w-full px-3 py-2 border rounded"
                    />

                    <input
                      type="text"
                      value={editingCard.cta_link || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, cta_link: e.target.value })}
                      placeholder="CTA-länk"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveCard(editingCard)}
                      className="px-4 py-2 bg-[#a1c798] text-white rounded"
                    >
                      Spara
                    </button>
                    <button
                      onClick={() => setEditingCard(null)}
                      className="px-4 py-2 bg-gray-200 rounded"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {editorialCards.map(card => (
                  <div
                    key={card.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                      card.is_hero
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {card.image_url && (
                      <img src={card.image_url} alt={card.title} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{card.title}</p>
                      {card.subtitle && <p className="text-sm text-gray-600">{card.subtitle}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleHero(card)}
                        className={`p-1.5 rounded ${
                          card.is_hero
                            ? 'bg-yellow-400 text-white'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title="Hero"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCard(card)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {editorialCards.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Inga kort skapade ännu</p>
                )}
              </div>
            </div>
          )}

          {settings.displayMode === 'card-flow' && settings.cardType === 'product' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Produktkort hämtas automatiskt från produktdatabasen. Använd filtrering och sortering för att välja vilka produkter som ska visas.
              </p>
            </div>
          )}
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
              {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
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
                    {settings.heading || 'Nyheter'}
                  </h2>
                  {settings.headingEmojiSuffix && <span className="text-3xl">{settings.headingEmojiSuffix}</span>}
                  {(settings.subtitleTexts || []).length > 0 && (settings.subtitleTexts || [''])[0] && (
                    <>
                      <span className="text-gray-400 text-2xl">|</span>
                      <div className="min-h-[24px] flex items-center">
                        <p
                          className={`transition-opacity duration-300 ${
                            settings.subtitleFont === 'lobster' ? 'font-lobster' : ''
                          }`}
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
                    </>
                  )}
                </div>
              ) : (
                <div>
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
                      {settings.heading || 'Nyheter'}
                    </h2>
                    {settings.headingEmojiSuffix && <span className="text-3xl">{settings.headingEmojiSuffix}</span>}
                  </div>
                  {(settings.subtitleTexts || []).length > 0 && (settings.subtitleTexts || [''])[currentSubtitleIndex] && (
                    <div className={`min-h-[24px] flex items-center mt-2 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
                      <p
                        className={`transition-opacity duration-300 ${
                          settings.subtitleFont === 'lobster' ? 'font-lobster' : ''
                        }`}
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
              )}
            </div>

            <div className="text-center text-gray-500 py-12">
              Preview visar rubrik och textrader. Innehåll renderas på frontend.
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
