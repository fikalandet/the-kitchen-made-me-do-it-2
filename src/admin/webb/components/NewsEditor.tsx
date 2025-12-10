import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Eye, EyeOff, MoveUp, MoveDown, Edit2 } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import EmojiPicker from './EmojiPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface NewsSettings {
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingColor?: string;
  headingBold?: boolean;
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
  backgroundColor?: string;
  displayMode?: 'standard' | 'hero' | 'three-cards';
  newsToShow?: number;
  layoutForm?: 'grid' | 'horizontal';
  featuredCardLarger?: boolean;
  featuredCardSize?: '1.5x' | '2x';
  ctaButtons?: Array<{
    text: string;
    link: string;
    color: string;
    size: string;
    font: string;
    placement: 'left' | 'center' | 'right';
  }>;
  sectionPaddingTop?: number;
  sectionPaddingBottom?: number;
}

interface NewsEditorProps {
  settings: NewsSettings;
  onSettingsChange: (settings: NewsSettings) => void;
}

interface NewsArticle {
  id: string;
  title: string;
  ingress?: string;
  main_image_url?: string;
  full_text?: string;
  link_url?: string;
  category_tag?: string;
  is_featured: boolean;
  is_hidden: boolean;
  display_order: number;
  created_at: string;
}

export default function NewsEditor({ settings, onSettingsChange }: NewsEditorProps) {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    ingress: '',
    main_image_url: '',
    full_text: '',
    link_url: '',
    category_tag: '',
    is_featured: false
  });

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

  const addCtaButton = () => {
    const ctaButtons = settings.ctaButtons || [];
    updateSetting('ctaButtons', [
      ...ctaButtons,
      {
        text: 'Läs mer',
        link: '',
        color: '#a1c798',
        size: 'medium',
        font: 'sans',
        placement: 'center'
      }
    ]);
  };

  const removeCtaButton = (index: number) => {
    const ctaButtons = settings.ctaButtons || [];
    updateSetting('ctaButtons', ctaButtons.filter((_, i) => i !== index));
  };

  const updateCtaButton = (index: number, field: string, value: any) => {
    const ctaButtons = settings.ctaButtons || [];
    const newButtons = [...ctaButtons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    updateSetting('ctaButtons', newButtons);
  };

  useEffect(() => {
    fetchArticles();
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

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

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

      setFormData({ ...formData, main_image_url: data.publicUrl });
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!user || !formData.title.trim()) {
      alert('Titel krävs');
      return;
    }

    try {
      if (editingArticle) {
        const { error } = await supabase
          .from('news_articles')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingArticle.id);

        if (error) throw error;
      } else {
        const maxOrder = articles.length > 0 ? Math.max(...articles.map(a => a.display_order)) : 0;
        const { error } = await supabase
          .from('news_articles')
          .insert({
            ...formData,
            display_order: maxOrder + 1,
            created_by: user.id
          });

        if (error) throw error;
      }

      setFormData({
        title: '',
        ingress: '',
        main_image_url: '',
        full_text: '',
        link_url: '',
        category_tag: '',
        is_featured: false
      });
      setEditingArticle(null);
      setShowArticleForm(false);
      fetchArticles();
    } catch (err) {
      console.error('Error saving article:', err);
      alert('Kunde inte spara artikel. Försök igen.');
    }
  };

  const handleEditArticle = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      ingress: article.ingress || '',
      main_image_url: article.main_image_url || '',
      full_text: article.full_text || '',
      link_url: article.link_url || '',
      category_tag: article.category_tag || '',
      is_featured: article.is_featured
    });
    setShowArticleForm(true);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna artikel?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchArticles();
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Kunde inte ta bort artikel. Försök igen.');
    }
  };

  const handleToggleHidden = async (article: NewsArticle) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({
          is_hidden: !article.is_hidden,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (error) throw error;
      fetchArticles();
    } catch (err) {
      console.error('Error toggling hidden:', err);
      alert('Kunde inte uppdatera synlighet. Försök igen.');
    }
  };

  const handleToggleFeatured = async (article: NewsArticle) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({
          is_featured: !article.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (error) throw error;
      fetchArticles();
    } catch (err) {
      console.error('Error toggling featured:', err);
      alert('Kunde inte uppdatera featured. Försök igen.');
    }
  };

  const handleMoveArticle = async (article: NewsArticle, direction: 'up' | 'down') => {
    const currentIndex = articles.findIndex(a => a.id === article.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === articles.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetArticle = articles[targetIndex];

    try {
      const updates = [
        supabase
          .from('news_articles')
          .update({ display_order: targetArticle.display_order })
          .eq('id', article.id),
        supabase
          .from('news_articles')
          .update({ display_order: article.display_order })
          .eq('id', targetArticle.id)
      ];

      await Promise.all(updates);
      fetchArticles();
    } catch (err) {
      console.error('Error moving article:', err);
      alert('Kunde inte flytta artikel. Försök igen.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nyheter</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Nyheter-sektionen</p>
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
              placeholder="Nyheter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <EmojiPicker
              label="Emoji före rubrik"
              value={settings.headingEmojiPrefix || ''}
              onChange={(emoji) => updateSetting('headingEmojiPrefix', emoji)}
            />
            <EmojiPicker
              label="Emoji efter rubrik"
              value={settings.headingEmojiSuffix || ''}
              onChange={(emoji) => updateSetting('headingEmojiSuffix', emoji)}
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

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <div className="space-y-4">
          <ColorPicker
            label="Bakgrundsfärg för sektionen"
            value={settings.backgroundColor || '#ffffff'}
            onChange={(color) => updateSetting('backgroundColor', color)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding Top (py)
              </label>
              <input
                type="number"
                min="0"
                max="32"
                value={settings.sectionPaddingTop || 12}
                onChange={(e) => updateSetting('sectionPaddingTop', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding Bottom (py)
              </label>
              <input
                type="number"
                min="0"
                max="32"
                value={settings.sectionPaddingBottom || 12}
                onChange={(e) => updateSetting('sectionPaddingBottom', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Innehåll (Nyhetsartiklar)" defaultExpanded={true}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Totalt {articles.filter(a => !a.is_hidden).length} synliga artiklar
            </p>
            <button
              onClick={() => {
                setShowArticleForm(!showArticleForm);
                setEditingArticle(null);
                setFormData({
                  title: '',
                  ingress: '',
                  main_image_url: '',
                  full_text: '',
                  link_url: '',
                  category_tag: '',
                  is_featured: false
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#56c5c5] text-white rounded-lg hover:bg-[#45b4b4] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Skapa ny artikel
            </button>
          </div>

          {showArticleForm && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-900">
                {editingArticle ? 'Redigera artikel' : 'Ny artikel'}
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel (rubrik)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ange artikelrubrik"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingress (kort undertext)
                </label>
                <textarea
                  value={formData.ingress}
                  onChange={(e) => setFormData({ ...formData, ingress: e.target.value })}
                  placeholder="Kort sammanfattning"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Huvudbild
                </label>
                <div className="flex gap-2">
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
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      uploadingImage ? 'opacity-50' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Laddar upp...' : 'Ladda upp bild'}
                  </label>
                  {formData.main_image_url && (
                    <button
                      onClick={() => setFormData({ ...formData, main_image_url: '' })}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.main_image_url}
                  onChange={(e) => setFormData({ ...formData, main_image_url: e.target.value })}
                  placeholder="Eller ange bild-URL..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent mt-2"
                />
                {formData.main_image_url && (
                  <img
                    src={formData.main_image_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fulltext (brödtext)
                </label>
                <textarea
                  value={formData.full_text}
                  onChange={(e) => setFormData({ ...formData, full_text: e.target.value })}
                  placeholder="Hela artikeltexten"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Länk (intern eller extern)
                </label>
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori-tag
                </label>
                <select
                  value={formData.category_tag}
                  onChange={(e) => setFormData({ ...formData, category_tag: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                >
                  <option value="">Ingen kategori</option>
                  <option value="Plattformen">Plattformen</option>
                  <option value="Event">Event</option>
                  <option value="Mattrend">Mattrend</option>
                  <option value="Recept">Recept</option>
                  <option value="Tips">Tips</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured (större kort)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveArticle}
                  className="px-4 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors"
                >
                  {editingArticle ? 'Uppdatera' : 'Skapa'}
                </button>
                <button
                  onClick={() => {
                    setShowArticleForm(false);
                    setEditingArticle(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {articles.map((article, index) => (
              <div
                key={article.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  article.is_hidden
                    ? 'border-gray-200 bg-gray-50 opacity-60'
                    : article.is_featured
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {article.main_image_url && (
                  <img
                    src={article.main_image_url}
                    alt={article.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{article.title}</p>
                  {article.category_tag && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded mt-1">
                      {article.category_tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveArticle(article, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Flytta upp"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveArticle(article, 'down')}
                    disabled={index === articles.length - 1}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Flytta ner"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(article)}
                    className={`p-1.5 rounded transition-colors ${
                      article.is_featured
                        ? 'bg-yellow-400 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={article.is_featured ? 'Ta bort featured' : 'Markera som featured'}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleToggleHidden(article)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                    title={article.is_hidden ? 'Visa' : 'Dölj'}
                  >
                    {article.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditArticle(article)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Redigera"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Ta bort"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {articles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Inga artiklar skapade ännu
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Visningsläge" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visningsläge
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => updateSetting('displayMode', 'standard')}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                  settings.displayMode === 'standard' || !settings.displayMode
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Standard (featured + lista)
              </button>
              <button
                onClick={() => updateSetting('displayMode', 'hero')}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                  settings.displayMode === 'hero'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Hero (endast 1)
              </button>
              <button
                onClick={() => updateSetting('displayMode', 'three-cards')}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                  settings.displayMode === 'three-cards'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Tre lika kort
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antal nyheter att visa
            </label>
            <select
              value={settings.newsToShow || 6}
              onChange={(e) => updateSetting('newsToShow', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {settings.displayMode !== 'hero' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layoutform
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('layoutForm', 'grid')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.layoutForm === 'grid' || !settings.layoutForm
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => updateSetting('layoutForm', 'horizontal')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.layoutForm === 'horizontal'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Horisontellt flöde
                  </button>
                </div>
              </div>

              {settings.displayMode === 'standard' && (
                <>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.featuredCardLarger !== false}
                        onChange={(e) => updateSetting('featuredCardLarger', e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured-kort ska vara större</span>
                    </label>
                  </div>

                  {settings.featuredCardLarger !== false && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storlek på featured-kort
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateSetting('featuredCardSize', '1.5x')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            settings.featuredCardSize === '1.5x' || !settings.featuredCardSize
                              ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          1.5x höjd
                        </button>
                        <button
                          onClick={() => updateSetting('featuredCardSize', '2x')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            settings.featuredCardSize === '2x'
                              ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          2x bredd
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Knappar (CTA)" defaultExpanded={true}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              CTA-knappar
            </label>
            <button
              onClick={addCtaButton}
              className="flex items-center gap-1 px-3 py-1 bg-[#56c5c5] text-white text-sm rounded-lg hover:bg-[#45b4b4] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Lägg till knapp
            </button>
          </div>

          {(settings.ctaButtons || []).map((button, index) => (
            <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Knapp {index + 1}</span>
                <button
                  onClick={() => removeCtaButton(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={button.text}
                onChange={(e) => updateCtaButton(index, 'text', e.target.value)}
                placeholder="Knapptext"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />

              <input
                type="text"
                value={button.link}
                onChange={(e) => updateCtaButton(index, 'link', e.target.value)}
                placeholder="Länk"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Färg</label>
                  <input
                    type="color"
                    value={button.color}
                    onChange={(e) => updateCtaButton(index, 'color', e.target.value)}
                    className="w-full h-8 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Storlek</label>
                  <select
                    value={button.size}
                    onChange={(e) => updateCtaButton(index, 'size', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="small">Liten</option>
                    <option value="medium">Mellan</option>
                    <option value="large">Stor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Typsnitt</label>
                  <select
                    value={button.font}
                    onChange={(e) => updateCtaButton(index, 'font', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="sans">Sans</option>
                    <option value="serif">Serif</option>
                    <option value="lobster">Lobster</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Placering</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateCtaButton(index, 'placement', 'left')}
                    className={`px-2 py-1 text-xs rounded border-2 transition-all ${
                      button.placement === 'left'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Vänster
                  </button>
                  <button
                    onClick={() => updateCtaButton(index, 'placement', 'center')}
                    className={`px-2 py-1 text-xs rounded border-2 transition-all ${
                      button.placement === 'center'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    onClick={() => updateCtaButton(index, 'placement', 'right')}
                    className={`px-2 py-1 text-xs rounded border-2 transition-all ${
                      button.placement === 'right'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Höger
                  </button>
                </div>
              </div>
            </div>
          ))}

          {(settings.ctaButtons || []).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Inga knappar tillagda
            </p>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={true}>
        <div
          className="relative min-h-[500px] rounded-lg overflow-hidden"
          style={{
            backgroundColor: settings.backgroundColor || '#ffffff',
            paddingTop: `${settings.sectionPaddingTop || 12}rem`,
            paddingBottom: `${settings.sectionPaddingBottom || 12}rem`,
            paddingLeft: '2rem',
            paddingRight: '2rem'
          }}
        >
          <div className="relative z-10 max-w-7xl mx-auto">
            <div
              className={`mb-8 ${
                settings.headingAlignment === 'center' || !settings.headingAlignment
                  ? 'text-center'
                  : 'text-left'
              }`}
            >
              {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
                <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
                  {settings.headingEmojiPrefix && (
                    <span className="text-3xl">{settings.headingEmojiPrefix}</span>
                  )}
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
                    {settings.heading || 'Nyheter'}
                  </h2>
                  {settings.headingEmojiSuffix && (
                    <span className="text-3xl">{settings.headingEmojiSuffix}</span>
                  )}
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
                  <div className="flex items-center gap-3 justify-center">
                    {settings.headingEmojiPrefix && (
                      <span className="text-3xl">{settings.headingEmojiPrefix}</span>
                    )}
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
                      {settings.heading || 'Nyheter'}
                    </h2>
                    {settings.headingEmojiSuffix && (
                      <span className="text-3xl">{settings.headingEmojiSuffix}</span>
                    )}
                  </div>
                  {(settings.subtitleTexts || []).length > 0 && (settings.subtitleTexts || [''])[currentSubtitleIndex] && (
                    <div className="min-h-[24px] flex items-center mt-2 justify-center">
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

            <div className="text-center text-gray-500 py-12">
              Preview kommer att visa nyhetsartiklar här baserat på vald visningsläge
            </div>

            {(settings.ctaButtons || []).length > 0 && (
              <div className="mt-8 flex gap-4 justify-center">
                {settings.ctaButtons.map((button, index) => (
                  <button
                    key={index}
                    className="px-6 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: button.color,
                      color: '#ffffff',
                      fontSize: button.size === 'small' ? '14px' : button.size === 'large' ? '18px' : '16px',
                      fontFamily: button.font === 'serif' ? 'serif' : button.font === 'lobster' ? 'Lobster' : 'sans-serif'
                    }}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
