import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Search } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface ChefSpotlightSettings {
  backgroundColor?: string;
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingBold?: boolean;
  headingItalic?: boolean;
  headingAlignment?: 'left' | 'center';
  headingColor?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleColor?: string;
  featuredChefId?: string;
  mainImageUrl?: string;
  mainImageWidth?: 'full' | 'large' | 'medium';
  smallImageUrl?: string;
  smallImagePosition?: 'left' | 'right';
  imageShape?: 'rounded' | 'wavy-top' | 'wavy-bottom' | 'diagonal' | 'wavy-diagonal';
  curiosaItems?: Array<{ question: string; answer: string }>;
  curiosaFont?: string;
  curiosaBold?: boolean;
  curiosaItalic?: boolean;
  curiosaBgColor?: string;
  curiosaBorderColor?: string;
  curiosaBorderWidth?: number;
  curiosaOpacity?: number;
  curiosaShape?: 'rounded' | 'wavy' | 'diagonal';
  articleTitle?: string;
  articleIngress?: string;
  articleBody?: string;
  articleFont?: string;
  articleFontSize?: number;
  articleBold?: boolean;
  articleItalic?: boolean;
  articleAlignment?: 'left' | 'center' | 'right';
  quoteText?: string;
  quoteFont?: string;
  quoteFontSize?: number;
  quoteBold?: boolean;
  quoteItalic?: boolean;
  quoteColor?: string;
  quoteAlignment?: 'left' | 'center' | 'right';
  ctaText?: string;
  ctaColor?: string;
  ctaTextColor?: string;
  ctaFont?: string;
  ctaBold?: boolean;
  ctaSize?: 'small' | 'medium' | 'large';
  ctaAlignment?: 'left' | 'center' | 'right';
  ctaOpacity?: number;
}

interface ChefSpotlightEditorProps {
  settings: ChefSpotlightSettings;
  onSettingsChange: (settings: ChefSpotlightSettings) => void;
}

interface Chef {
  id: string;
  display_name: string;
  avatar_url?: string;
  city?: string;
  membership_level?: string;
  bio?: string;
}

export default function ChefSpotlightEditor({ settings, onSettingsChange }: ChefSpotlightEditorProps) {
  const { user } = useAuth();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingSmall, setUploadingSmall] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);

  const updateSetting = (key: keyof ChefSpotlightSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  useEffect(() => {
    if (settings.featuredChefId && chefs.length > 0) {
      const chef = chefs.find(c => c.id === settings.featuredChefId);
      setSelectedChef(chef || null);
    }
  }, [settings.featuredChefId, chefs]);

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

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, city, membership_level, bio')
        .eq('role', 'chef')
        .order('display_name');

      if (error) throw error;
      if (data) setChefs(data);
    } catch (err) {
      console.error('Error fetching chefs:', err);
    } finally {
      setLoading(false);
    }
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

  const addCuriosaItem = () => {
    const curiosaItems = settings.curiosaItems || [];
    updateSetting('curiosaItems', [...curiosaItems, { question: '', answer: '' }]);
  };

  const removeCuriosaItem = (index: number) => {
    const curiosaItems = settings.curiosaItems || [];
    updateSetting('curiosaItems', curiosaItems.filter((_, i) => i !== index));
  };

  const updateCuriosaItem = (index: number, field: 'question' | 'answer', value: string) => {
    const curiosaItems = settings.curiosaItems || [];
    const newItems = [...curiosaItems];
    newItems[index] = { ...newItems[index], [field]: value };
    updateSetting('curiosaItems', newItems);
  };

  const handleImageUpload = async (file: File, type: 'main' | 'small') => {
    if (!user) return;

    const setUploading = type === 'main' ? setUploadingMain : setUploadingSmall;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `chef-spotlight-${type}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/chef-spotlight/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (type === 'main') {
        updateSetting('mainImageUrl', data.publicUrl);
      } else {
        updateSetting('smallImageUrl', data.publicUrl);
      }
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Kunde inte ladda upp. Försök igen.');
    } finally {
      setUploading(false);
    }
  };

  const filteredChefs = chefs.filter(chef =>
    chef.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chef.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtitleTexts = settings.subtitleTexts || [''];
  const curiosaItems = settings.curiosaItems || [
    { question: 'Favoritmat', answer: '' },
    { question: 'Vad är riktigt äckligt?', answer: '' },
    { question: 'Hemlig talang', answer: '' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Kock i fokus</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Kock i fokus-sektionen</p>
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
              placeholder="Kock i fokus"
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
                min="16"
                max="72"
                value={settings.headingFontSize || 36}
                onChange={(e) => updateSetting('headingFontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.headingBold || false}
                onChange={(e) => updateSetting('headingBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet stil</span>
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

          <ColorPicker
            label="Rubrik – textfärg"
            value={settings.headingColor || '#374151'}
            onChange={(color) => updateSetting('headingColor', color)}
          />
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

      <CollapsibleCard title="Kocken" defaultExpanded={true}>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sök kockar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Laddar kockar...</div>
            ) : filteredChefs.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredChefs.map(chef => (
                  <label key={chef.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="featured-chef"
                      checked={settings.featuredChefId === chef.id}
                      onChange={() => updateSetting('featuredChefId', chef.id)}
                      className="w-4 h-4 rounded"
                    />
                    {chef.avatar_url && (
                      <img src={chef.avatar_url} alt={chef.display_name} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{chef.display_name}</p>
                      <p className="text-sm text-gray-500">
                        {chef.city && `${chef.city} • `}
                        {chef.membership_level && `${chef.membership_level}`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">Inga kockar hittades</div>
            )}
          </div>

          {selectedChef && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <strong>Vald kock:</strong> {selectedChef.display_name}
              </p>
              <p className="text-xs text-green-700">
                Kockens profilbild kommer automatiskt att visas i sektionens nedre vänstra hörn.
              </p>
            </div>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Bilder" defaultExpanded={true}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Huvudbild (stor)
            </label>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  id="main-image-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'main');
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="main-image-upload"
                  className={`flex items-center justify-center gap-2 px-4 py-3 bg-[#56c5c5] text-white rounded-lg cursor-pointer hover:bg-[#45b4b4] transition-colors ${
                    uploadingMain ? 'opacity-50' : ''
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  {uploadingMain ? 'Laddar upp...' : 'Ladda upp huvudbild'}
                </label>
              </div>
              {settings.mainImageUrl && (
                <div className="relative">
                  <img
                    src={settings.mainImageUrl}
                    alt="Huvudbild"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => updateSetting('mainImageUrl', '')}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bildbredd
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('mainImageWidth', 'medium')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.mainImageWidth === 'medium' || !settings.mainImageWidth
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => updateSetting('mainImageWidth', 'large')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.mainImageWidth === 'large'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Stor
                  </button>
                  <button
                    onClick={() => updateSetting('mainImageWidth', 'full')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.mainImageWidth === 'full'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Full bredd
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Liten bild (omlott)
            </label>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  id="small-image-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'small');
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="small-image-upload"
                  className={`flex items-center justify-center gap-2 px-4 py-3 bg-[#56c5c5] text-white rounded-lg cursor-pointer hover:bg-[#45b4b4] transition-colors ${
                    uploadingSmall ? 'opacity-50' : ''
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  {uploadingSmall ? 'Laddar upp...' : 'Ladda upp liten bild'}
                </label>
              </div>
              {settings.smallImageUrl && (
                <div className="relative">
                  <img
                    src={settings.smallImageUrl}
                    alt="Liten bild"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => updateSetting('smallImageUrl', '')}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placering av liten bild
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('smallImagePosition', 'left')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.smallImagePosition === 'left' || !settings.smallImagePosition
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Vänster
                  </button>
                  <button
                    onClick={() => updateSetting('smallImagePosition', 'right')}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      settings.smallImagePosition === 'right'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Höger
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bildform / Clip-path
            </label>
            <select
              value={settings.imageShape || 'rounded'}
              onChange={(e) => updateSetting('imageShape', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="rounded">Rundade hörn</option>
              <option value="wavy-top">Vågformad topp</option>
              <option value="wavy-bottom">Vågformad botten</option>
              <option value="diagonal">Diagonalt snitt</option>
              <option value="wavy-diagonal">Vågformat diagonalt</option>
            </select>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Kuriosa" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Frågor och svar
              </label>
              <button
                onClick={addCuriosaItem}
                className="flex items-center gap-1 px-3 py-1 bg-[#56c5c5] text-white text-sm rounded-lg hover:bg-[#45b4b4] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Lägg till
              </button>
            </div>

            <div className="space-y-3">
              {curiosaItems.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Fråga {index + 1}</span>
                    {curiosaItems.length > 1 && (
                      <button
                        onClick={() => removeCuriosaItem(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateCuriosaItem(index, 'question', e.target.value)}
                    placeholder="Fråga, t.ex. Favoritmat"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                  <input
                    type="text"
                    value={item.answer}
                    onChange={(e) => updateCuriosaItem(index, 'answer', e.target.value)}
                    placeholder="Svar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typsnitt
            </label>
            <select
              value={settings.curiosaFont || 'sans'}
              onChange={(e) => updateSetting('curiosaFont', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="lobster">Lobster</option>
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.curiosaBold || false}
                onChange={(e) => updateSetting('curiosaBold', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Fet</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.curiosaItalic || false}
                onChange={(e) => updateSetting('curiosaItalic', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Kursiv</span>
            </label>
          </div>

          <ColorPicker
            label="Bakgrundsfärg"
            value={settings.curiosaBgColor || '#f6f2e0'}
            onChange={(color) => updateSetting('curiosaBgColor', color)}
          />

          <ColorPicker
            label="Ramfärg"
            value={settings.curiosaBorderColor || '#a1c798'}
            onChange={(color) => updateSetting('curiosaBorderColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ramtjocklek (px)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={settings.curiosaBorderWidth || 2}
              onChange={(e) => updateSetting('curiosaBorderWidth', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacity: {settings.curiosaOpacity || 100}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.curiosaOpacity || 100}
              onChange={(e) => updateSetting('curiosaOpacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form
            </label>
            <select
              value={settings.curiosaShape || 'rounded'}
              onChange={(e) => updateSetting('curiosaShape', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="rounded">Rundad</option>
              <option value="wavy">Vågig</option>
              <option value="diagonal">Diagonal</option>
            </select>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Artikel" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubrik
            </label>
            <input
              type="text"
              value={settings.articleTitle || ''}
              onChange={(e) => updateSetting('articleTitle', e.target.value)}
              placeholder="Artikelrubrik"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingress
            </label>
            <textarea
              value={settings.articleIngress || ''}
              onChange={(e) => updateSetting('articleIngress', e.target.value)}
              placeholder="Kort inledning..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brödtext
            </label>
            <textarea
              value={settings.articleBody || ''}
              onChange={(e) => updateSetting('articleBody', e.target.value)}
              placeholder="Huvudtext..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typsnitt
              </label>
              <select
                value={settings.articleFont || 'sans'}
                onChange={(e) => updateSetting('articleFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                max="32"
                value={settings.articleFontSize || 16}
                onChange={(e) => updateSetting('articleFontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.articleBold || false}
                onChange={(e) => updateSetting('articleBold', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Fet</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.articleItalic || false}
                onChange={(e) => updateSetting('articleItalic', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Kursiv</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Textjustering
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('articleAlignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.articleAlignment === 'left' || !settings.articleAlignment
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('articleAlignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.articleAlignment === 'center'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Centrerad
              </button>
              <button
                onClick={() => updateSetting('articleAlignment', 'right')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.articleAlignment === 'right'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Höger
              </button>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Citat" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citattext
            </label>
            <textarea
              value={settings.quoteText || ''}
              onChange={(e) => updateSetting('quoteText', e.target.value)}
              placeholder="Ett inspirerande citat från kocken..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typsnitt
              </label>
              <select
                value={settings.quoteFont || 'serif'}
                onChange={(e) => updateSetting('quoteFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                min="16"
                max="48"
                value={settings.quoteFontSize || 24}
                onChange={(e) => updateSetting('quoteFontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.quoteBold || false}
                onChange={(e) => updateSetting('quoteBold', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Fet</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.quoteItalic || true}
                onChange={(e) => updateSetting('quoteItalic', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Kursiv</span>
            </label>
          </div>

          <ColorPicker
            label="Textfärg"
            value={settings.quoteColor || '#4b5563'}
            onChange={(color) => updateSetting('quoteColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('quoteAlignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.quoteAlignment === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('quoteAlignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.quoteAlignment === 'center' || !settings.quoteAlignment
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Centrerad
              </button>
              <button
                onClick={() => updateSetting('quoteAlignment', 'right')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.quoteAlignment === 'right'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Höger
              </button>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Knapp (CTA)" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Knapptext
            </label>
            <input
              type="text"
              value={settings.ctaText || ''}
              onChange={(e) => updateSetting('ctaText', e.target.value)}
              placeholder="Till kockens kök"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <ColorPicker
            label="Bakgrundsfärg"
            value={settings.ctaColor || '#56c5c5'}
            onChange={(color) => updateSetting('ctaColor', color)}
          />

          <ColorPicker
            label="Textfärg"
            value={settings.ctaTextColor || '#ffffff'}
            onChange={(color) => updateSetting('ctaTextColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typsnitt
            </label>
            <select
              value={settings.ctaFont || 'sans'}
              onChange={(e) => updateSetting('ctaFont', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="lobster">Lobster</option>
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.ctaBold || false}
              onChange={(e) => updateSetting('ctaBold', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Fet stil</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storlek
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('ctaSize', 'small')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.ctaSize === 'small'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Liten
              </button>
              <button
                onClick={() => updateSetting('ctaSize', 'medium')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.ctaSize === 'medium' || !settings.ctaSize
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => updateSetting('ctaSize', 'large')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.ctaSize === 'large'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Stor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('ctaAlignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.ctaAlignment === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('ctaAlignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.ctaAlignment === 'center' || !settings.ctaAlignment
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Centrerad
              </button>
              <button
                onClick={() => updateSetting('ctaAlignment', 'right')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.ctaAlignment === 'right'
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
              Opacity: {settings.ctaOpacity || 100}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.ctaOpacity || 100}
              onChange={(e) => updateSetting('ctaOpacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={false}>
        <div
          className="p-8 rounded-lg min-h-[600px]"
          style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}
        >
          <div className="max-w-6xl mx-auto">
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
                    className={`${
                      settings.headingFont === 'lobster' ? 'font-lobster' : ''
                    } ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                    style={{
                      fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                      fontSize: `${settings.headingFontSize || 36}px`,
                      color: settings.headingColor || '#374151'
                    }}
                  >
                    {settings.heading || 'Kock i fokus'}
                  </h2>
                  {subtitleTexts.length > 0 && subtitleTexts[0] && (
                    <>
                      <span className="text-gray-400 text-2xl">|</span>
                      <p
                        className="transition-opacity duration-300"
                        style={{
                          opacity: fadeIn ? 1 : 0,
                          color: settings.subtitleColor || '#374151'
                        }}
                      >
                        {subtitleTexts[currentSubtitleIndex]}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <h2
                    className={`${
                      settings.headingFont === 'lobster' ? 'font-lobster' : ''
                    } ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                    style={{
                      fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                      fontSize: `${settings.headingFontSize || 36}px`,
                      color: settings.headingColor || '#374151'
                    }}
                  >
                    {settings.heading || 'Kock i fokus'}
                  </h2>
                  {subtitleTexts.length > 0 && subtitleTexts[0] && (
                    <p
                      className="transition-opacity duration-300 mt-2"
                      style={{
                        opacity: fadeIn ? 1 : 0,
                        color: settings.subtitleColor || '#374151'
                      }}
                    >
                      {subtitleTexts[currentSubtitleIndex]}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
              <div className="relative">
                {settings.mainImageUrl ? (
                  <div className="relative">
                    <img
                      src={settings.mainImageUrl}
                      alt="Huvudbild"
                      className={`w-full h-96 object-cover ${
                        settings.imageShape === 'rounded' ? 'rounded-2xl' : ''
                      }`}
                    />
                    {settings.smallImageUrl && (
                      <img
                        src={settings.smallImageUrl}
                        alt="Liten bild"
                        className={`absolute ${
                          settings.smallImagePosition === 'right' ? 'right-4' : 'left-4'
                        } top-4 w-32 h-32 object-cover rounded-xl shadow-lg`}
                      />
                    )}
                    {selectedChef?.avatar_url && (
                      <img
                        src={selectedChef.avatar_url}
                        alt={selectedChef.display_name}
                        className="absolute bottom-4 left-4 w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                    Ingen huvudbild uppladdad
                  </div>
                )}
              </div>

              <div>
                {settings.articleTitle && (
                  <h3
                    className={`mb-4 ${
                      settings.articleFont === 'lobster' ? 'font-lobster' : ''
                    } ${settings.articleBold ? 'font-bold' : ''} ${settings.articleItalic ? 'italic' : ''}`}
                    style={{
                      fontFamily: settings.articleFont === 'serif' ? 'serif' : settings.articleFont === 'sans' ? 'sans-serif' : undefined,
                      fontSize: `${(settings.articleFontSize || 16) * 1.5}px`,
                      textAlign: settings.articleAlignment || 'left'
                    }}
                  >
                    {settings.articleTitle}
                  </h3>
                )}
                {settings.articleIngress && (
                  <p
                    className={`mb-4 ${
                      settings.articleFont === 'lobster' ? 'font-lobster' : ''
                    } ${settings.articleBold ? 'font-bold' : ''} ${settings.articleItalic ? 'italic' : ''}`}
                    style={{
                      fontFamily: settings.articleFont === 'serif' ? 'serif' : settings.articleFont === 'sans' ? 'sans-serif' : undefined,
                      fontSize: `${(settings.articleFontSize || 16) * 1.1}px`,
                      textAlign: settings.articleAlignment || 'left'
                    }}
                  >
                    {settings.articleIngress}
                  </p>
                )}
                {settings.articleBody && (
                  <p
                    className={`text-gray-600 ${
                      settings.articleFont === 'lobster' ? 'font-lobster' : ''
                    } ${settings.articleBold ? 'font-bold' : ''} ${settings.articleItalic ? 'italic' : ''}`}
                    style={{
                      fontFamily: settings.articleFont === 'serif' ? 'serif' : settings.articleFont === 'sans' ? 'sans-serif' : undefined,
                      fontSize: `${settings.articleFontSize || 16}px`,
                      textAlign: settings.articleAlignment || 'left'
                    }}
                  >
                    {settings.articleBody}
                  </p>
                )}
              </div>
            </div>

            {curiosaItems.length > 0 && curiosaItems[0].question && (
              <div
                className="p-6 rounded-xl mb-8"
                style={{
                  backgroundColor: settings.curiosaBgColor || '#f6f2e0',
                  borderColor: settings.curiosaBorderColor || '#a1c798',
                  borderWidth: `${settings.curiosaBorderWidth || 2}px`,
                  borderStyle: 'solid',
                  opacity: (settings.curiosaOpacity || 100) / 100
                }}
              >
                <h4 className="text-xl font-bold text-gray-800 mb-4">Kuriosa</h4>
                <div className="space-y-3">
                  {curiosaItems.map((item, index) => (
                    item.question && (
                      <div key={index}>
                        <p
                          className={`font-semibold text-gray-700 ${
                            settings.curiosaBold ? 'font-bold' : ''
                          } ${settings.curiosaItalic ? 'italic' : ''}`}
                          style={{
                            fontFamily: settings.curiosaFont === 'lobster' ? 'Lobster' : settings.curiosaFont === 'serif' ? 'serif' : 'sans-serif'
                          }}
                        >
                          {item.question}:
                        </p>
                        <p className="text-gray-600">{item.answer || '(Inget svar)'}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {settings.quoteText && (
              <blockquote
                className={`mb-8 py-6 ${
                  settings.quoteFont === 'lobster' ? 'font-lobster' : ''
                } ${settings.quoteBold ? 'font-bold' : ''} ${settings.quoteItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: settings.quoteFont === 'serif' ? 'serif' : settings.quoteFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${settings.quoteFontSize || 24}px`,
                  color: settings.quoteColor || '#4b5563',
                  textAlign: settings.quoteAlignment || 'center'
                }}
              >
                "{settings.quoteText}"
              </blockquote>
            )}

            {settings.ctaText && (
              <div
                className="flex"
                style={{
                  justifyContent:
                    settings.ctaAlignment === 'left' ? 'flex-start' :
                    settings.ctaAlignment === 'right' ? 'flex-end' :
                    'center'
                }}
              >
                <button
                  className={`rounded-xl font-medium transition-all hover:shadow-lg ${
                    settings.ctaSize === 'small' ? 'px-4 py-2 text-sm' :
                    settings.ctaSize === 'large' ? 'px-8 py-4 text-lg' :
                    'px-6 py-3 text-base'
                  } ${settings.ctaFont === 'lobster' ? 'font-lobster' : ''} ${
                    settings.ctaBold ? 'font-bold' : ''
                  }`}
                  style={{
                    backgroundColor: settings.ctaColor || '#56c5c5',
                    color: settings.ctaTextColor || '#ffffff',
                    opacity: (settings.ctaOpacity || 100) / 100,
                    fontFamily: settings.ctaFont === 'serif' ? 'serif' : settings.ctaFont === 'sans' ? 'sans-serif' : undefined
                  }}
                >
                  {settings.ctaText}
                </button>
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
