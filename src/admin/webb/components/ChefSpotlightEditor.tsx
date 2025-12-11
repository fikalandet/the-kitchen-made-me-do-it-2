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
  mainImageWaveStyle?: 'none' | 'wave1' | 'wave2' | 'wave3';
  smallImageUrl?: string;
  smallImagePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  smallImageBorderColor?: string;
  smallImageBorderWidth?: number;
  imageShape?: 'rounded';
  curiosaItems?: Array<{ question: string; answer: string }>;
  curiosaLayout?: 'single' | 'double';
  curiosaItemLayout?: 'inline' | 'stacked';
  curiosaColumn1?: Array<{ question: string; answer: string }>;
  curiosaColumn2?: Array<{ question: string; answer: string }>;
  curiosaTitle?: string;
  curiosaTitleFont?: string;
  curiosaTitleSize?: number;
  curiosaTitleBold?: boolean;
  curiosaTitleItalic?: boolean;
  curiosaTitleAlignment?: 'left' | 'center' | 'right';
  curiosaTitleColor?: string;
  curiosaFont?: string;
  curiosaFontSize?: number;
  curiosaBold?: boolean;
  curiosaItalic?: boolean;
  curiosaBgColor?: string;
  curiosaBorderColor?: string;
  curiosaBorderWidth?: number;
  curiosaOpacity?: number;
  curiosaWidth?: number;
  curiosaHeight?: number;
  curiosaPlacement?: 'below-image' | 'beside-article';
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
  quotePosition?: 'after-article' | 'after-curiosa' | 'before-cta';
  cta1Text?: string;
  cta1Color?: string;
  cta1TextColor?: string;
  cta1Font?: string;
  cta1Bold?: boolean;
  cta1Size?: 'small' | 'medium' | 'large';
  cta1Alignment?: 'left' | 'center' | 'right';
  cta1Opacity?: number;
  cta1Link?: string;
  cta1LinkType?: 'chef' | 'internal' | 'external';
  cta2Text?: string;
  cta2Color?: string;
  cta2TextColor?: string;
  cta2Font?: string;
  cta2Bold?: boolean;
  cta2Size?: 'small' | 'medium' | 'large';
  cta2Alignment?: 'left' | 'center' | 'right';
  cta2Opacity?: number;
  cta2Link?: string;
  cta2LinkType?: 'chef' | 'internal' | 'external';
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

      const mockChefs = [
        {
          id: 'mock-chef-1',
          display_name: 'Sofia Andersson',
          avatar_url: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=200',
          city: 'Stockholm',
          membership_level: 'Gold',
          bio: 'Passionerad kock med kärlek för italiensk matlagning'
        },
        {
          id: 'mock-chef-2',
          display_name: 'Marcus Berg',
          avatar_url: 'https://images.pexels.com/photos/3748221/pexels-photo-3748221.jpeg?auto=compress&cs=tinysrgb&w=200',
          city: 'Göteborg',
          membership_level: 'Silver',
          bio: 'Mästerkock med asiatisk specialitet'
        },
        {
          id: 'mock-chef-3',
          display_name: 'Emma Nilsson',
          avatar_url: 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=200',
          city: 'Malmö',
          membership_level: 'Free',
          bio: 'Vegansk matlagning med smak'
        }
      ];

      if (error) throw error;
      const allChefs = data && data.length > 0 ? [...data, ...mockChefs] : mockChefs;
      setChefs(allChefs);
    } catch (err) {
      console.error('Error fetching chefs:', err);
      const mockChefs = [
        {
          id: 'mock-chef-1',
          display_name: 'Sofia Andersson',
          avatar_url: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=200',
          city: 'Stockholm',
          membership_level: 'Gold',
          bio: 'Passionerad kock med kärlek för italiensk matlagning'
        },
        {
          id: 'mock-chef-2',
          display_name: 'Marcus Berg',
          avatar_url: 'https://images.pexels.com/photos/3748221/pexels-photo-3748221.jpeg?auto=compress&cs=tinysrgb&w=200',
          city: 'Göteborg',
          membership_level: 'Silver',
          bio: 'Mästerkock med asiatisk specialitet'
        },
        {
          id: 'mock-chef-3',
          display_name: 'Emma Nilsson',
          avatar_url: 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=200',
          city: 'Malmö',
          membership_level: 'Free',
          bio: 'Vegansk matlagning med smak'
        }
      ];
      setChefs(mockChefs);
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
                <option value="poppins">Poppins</option>
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
                      className="w-4 h-4"
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
          <div className="grid grid-cols-2 gap-4">
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
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
                      uploadingMain ? 'opacity-50' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingMain ? 'Laddar upp...' : 'Ladda upp'}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Böljande form
                  </label>
                  <div className="flex gap-3">
                    {['none', 'wave1', 'wave2', 'wave3'].map((wave) => (
                      <button
                        key={wave}
                        onClick={() => updateSetting('mainImageWaveStyle', wave)}
                        className={`px-4 py-2 rounded-lg border-2 ${
                          (settings.mainImageWaveStyle || 'none') === wave
                            ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {wave === 'none' ? 'Ingen' : `Våg ${wave.replace('wave', '')}`}
                      </button>
                    ))}
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
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
                      uploadingSmall ? 'opacity-50' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingSmall ? 'Laddar upp...' : 'Ladda upp'}
                  </label>
                </div>
                {settings.smallImageUrl && (
                  <div className="relative">
                    <img
                      src={settings.smallImageUrl}
                      alt="Liten bild"
                      className="w-full h-48 object-cover rounded-lg"
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
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateSetting('smallImagePosition', 'top-left')}
                      className={`px-3 py-2 rounded-lg border-2 text-sm ${
                        settings.smallImagePosition === 'top-left' || !settings.smallImagePosition
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Uppe vänster
                    </button>
                    <button
                      onClick={() => updateSetting('smallImagePosition', 'top-right')}
                      className={`px-3 py-2 rounded-lg border-2 text-sm ${
                        settings.smallImagePosition === 'top-right'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Uppe höger
                    </button>
                    <button
                      onClick={() => updateSetting('smallImagePosition', 'center')}
                      className={`px-3 py-2 rounded-lg border-2 text-sm ${
                        settings.smallImagePosition === 'center'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Center
                    </button>
                    <button
                      onClick={() => updateSetting('smallImagePosition', 'bottom-left')}
                      className={`px-3 py-2 rounded-lg border-2 text-sm ${
                        settings.smallImagePosition === 'bottom-left'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Nere vänster
                    </button>
                    <button
                      onClick={() => updateSetting('smallImagePosition', 'bottom-right')}
                      className={`px-3 py-2 rounded-lg border-2 text-sm ${
                        settings.smallImagePosition === 'bottom-right'
                          ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      Nere höger
                    </button>
                  </div>
                </div>

                <ColorPicker
                  label="Ramfärg för liten bild"
                  value={settings.smallImageBorderColor || '#ffffff'}
                  onChange={(color) => updateSetting('smallImageBorderColor', color)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ramtjocklek (px): {settings.smallImageBorderWidth || 4}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={settings.smallImageBorderWidth || 4}
                    onChange={(e) => updateSetting('smallImageBorderWidth', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bildstorlek (px): {settings.smallImageSize || 96}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={settings.smallImageSize || 96}
                    onChange={(e) => updateSetting('smallImageSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation (grader): {settings.smallImageRotation || 0}°
                  </label>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={settings.smallImageRotation || 0}
                    onChange={(e) => updateSetting('smallImageRotation', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Kuriosa" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('curiosaLayout', 'single')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  (settings.curiosaLayout || 'single') === 'single'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                En kolumn
              </button>
              <button
                onClick={() => updateSetting('curiosaLayout', 'double')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.curiosaLayout === 'double'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Två kolumner
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubrik
            </label>
            <input
              type="text"
              value={settings.curiosaTitle || 'Kuriosa'}
              onChange={(e) => updateSetting('curiosaTitle', e.target.value)}
              placeholder="Rubrik"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rubriktypsnitt
              </label>
              <select
                value={settings.curiosaTitleFont || 'sans'}
                onChange={(e) => updateSetting('curiosaTitleFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="poppins">Poppins</option>
                <option value="lobster">Lobster</option>
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rubrikstorlek (px): {settings.curiosaTitleSize || 20}
              </label>
              <input
                type="range"
                min="14"
                max="32"
                value={settings.curiosaTitleSize || 20}
                onChange={(e) => updateSetting('curiosaTitleSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.curiosaTitleBold || false}
                  onChange={(e) => updateSetting('curiosaTitleBold', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Fetstil rubrik</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.curiosaTitleItalic || false}
                  onChange={(e) => updateSetting('curiosaTitleItalic', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Kursiv rubrik</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rubrikplacering
              </label>
              <select
                value={settings.curiosaTitleAlignment || 'left'}
                onChange={(e) => updateSetting('curiosaTitleAlignment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="left">Vänster</option>
                <option value="center">Centrerad</option>
                <option value="right">Höger</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubrikfärg
            </label>
            <ColorPicker
              color={settings.curiosaTitleColor || '#1f2937'}
              onChange={(color) => updateSetting('curiosaTitleColor', color)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fråga och svar-layout
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('curiosaItemLayout', 'inline')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  (settings.curiosaItemLayout || 'inline') === 'inline'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Fråga + Svar på samma rad
              </button>
              <button
                onClick={() => updateSetting('curiosaItemLayout', 'stacked')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.curiosaItemLayout === 'stacked'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Fråga över, Svar under
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {settings.curiosaLayout === 'double' ? 'Kolumn 1 - Frågor och svar' : 'Frågor och svar'}
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
              Placering av kuriosa-rutan
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('curiosaPlacement', 'below-image')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.curiosaPlacement === 'below-image' || !settings.curiosaPlacement
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Under huvudbilden
              </button>
              <button
                onClick={() => updateSetting('curiosaPlacement', 'beside-article')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.curiosaPlacement === 'beside-article'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Bredvid artikeln
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bredd (%): {settings.curiosaWidth || 100}
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={settings.curiosaWidth || 100}
                onChange={(e) => updateSetting('curiosaWidth', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Höjd (px): {settings.curiosaHeight || 200}
              </label>
              <input
                type="range"
                min="100"
                max="400"
                step="20"
                value={settings.curiosaHeight || 200}
                onChange={(e) => updateSetting('curiosaHeight', parseInt(e.target.value))}
                className="w-full"
              />
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
              <option value="poppins">Poppins</option>
              <option value="lobster">Lobster</option>
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Textstorlek (px)
            </label>
            <input
              type="number"
              min="12"
              max="24"
              value={settings.curiosaFontSize || 14}
              onChange={(e) => updateSetting('curiosaFontSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.curiosaBold || false}
              onChange={(e) => updateSetting('curiosaBold', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Fet stil (endast frågan)</span>
          </label>

          <ColorPicker
            label="Textfärg"
            value={settings.curiosaTextColor || '#374151'}
            onChange={(color) => updateSetting('curiosaTextColor', color)}
          />

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
            <div className="grid grid-cols-4 gap-2 mt-2">
              <select
                value={settings.articleTitleFont || 'poppins'}
                onChange={(e) => updateSetting('articleTitleFont', e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="poppins">Poppins</option>
                <option value="lobster">Lobster</option>
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
              </select>
              <select
                value={settings.articleTitleAlign || 'left'}
                onChange={(e) => updateSetting('articleTitleAlign', e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="left">Vänster</option>
                <option value="center">Center</option>
                <option value="right">Höger</option>
              </select>
              <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded">
                <input
                  type="checkbox"
                  checked={settings.articleTitleBold || false}
                  onChange={(e) => updateSetting('articleTitleBold', e.target.checked)}
                  className="w-3 h-3"
                />
                Fet
              </label>
              <input
                type="number"
                min="14"
                max="48"
                value={settings.articleTitleSize || 24}
                onChange={(e) => updateSetting('articleTitleSize', parseInt(e.target.value))}
                placeholder="px"
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
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
            <div className="grid grid-cols-4 gap-2 mt-2">
              <select
                value={settings.articleIngressFont || 'poppins'}
                onChange={(e) => updateSetting('articleIngressFont', e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="poppins">Poppins</option>
                <option value="lobster">Lobster</option>
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
              </select>
              <select
                value={settings.articleIngressAlign || 'left'}
                onChange={(e) => updateSetting('articleIngressAlign', e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="left">Vänster</option>
                <option value="center">Center</option>
                <option value="right">Höger</option>
              </select>
              <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded">
                <input
                  type="checkbox"
                  checked={settings.articleIngressBold || false}
                  onChange={(e) => updateSetting('articleIngressBold', e.target.checked)}
                  className="w-3 h-3"
                />
                Fet
              </label>
              <input
                type="number"
                min="12"
                max="24"
                value={settings.articleIngressSize || 16}
                onChange={(e) => updateSetting('articleIngressSize', parseInt(e.target.value))}
                placeholder="px"
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
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
            <div className="grid grid-cols-3 gap-2 mt-2">
              <select
                value={settings.articleBodyFont || 'poppins'}
                onChange={(e) => updateSetting('articleBodyFont', e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="poppins">Poppins</option>
                <option value="lobster">Lobster</option>
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
              </select>
              <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded">
                <input
                  type="checkbox"
                  checked={settings.articleBodyBold || false}
                  onChange={(e) => updateSetting('articleBodyBold', e.target.checked)}
                  className="w-3 h-3"
                />
                Fet
              </label>
              <input
                type="number"
                min="12"
                max="24"
                value={settings.articleBodySize || 14}
                onChange={(e) => updateSetting('articleBodySize', parseInt(e.target.value))}
                placeholder="px"
                className="px-2 py-1 text-sm border border-gray-300 rounded"
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
                <option value="poppins">Poppins</option>
                <option value="poppins-light">Poppins Light</option>
                <option value="poppins-medium">Poppins Medium</option>
                <option value="poppins-semibold">Poppins SemiBold</option>
                <option value="poppins-bold">Poppins Bold</option>
                <option value="lobster">Lobster</option>
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="georgia">Georgia</option>
                <option value="playfair">Playfair Display</option>
                <option value="dancing-script">Dancing Script (handskriven)</option>
                <option value="pacifico">Pacifico (handskriven)</option>
                <option value="great-vibes">Great Vibes (skrivstil)</option>
                <option value="allura">Allura (skrivstil)</option>
                <option value="satisfy">Satisfy (handskriven)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storlek (px)
              </label>
              <input
                type="number"
                min="16"
                max="64"
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
                checked={settings.quoteItalic !== false}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position i flödet
            </label>
            <select
              value={settings.quotePosition || 'after-article'}
              onChange={(e) => updateSetting('quotePosition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="on-image-top">På bild, överst</option>
              <option value="on-image-middle">På bild, mitten</option>
              <option value="on-image-bottom">På bild, underst</option>
              <option value="above-article">Över artikeln</option>
              <option value="after-article">Efter artikeln</option>
              <option value="after-curiosa">Efter kuriosa</option>
              <option value="before-cta">Precis före knappen</option>
            </select>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Knapp 1" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Knapptext
            </label>
            <input
              type="text"
              value={settings.cta1Text || ''}
              onChange={(e) => updateSetting('cta1Text', e.target.value)}
              placeholder="Till kockens kök"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Länktyp
            </label>
            <select
              value={settings.cta1LinkType || 'chef'}
              onChange={(e) => updateSetting('cta1LinkType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="chef">Till kockens sida</option>
              <option value="internal">Intern sida</option>
              <option value="external">Extern länk</option>
            </select>
          </div>

          {settings.cta1LinkType === 'internal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intern sida (t.ex. /marketplace, /membership)
              </label>
              <input
                type="text"
                value={settings.cta1Link || ''}
                onChange={(e) => updateSetting('cta1Link', e.target.value)}
                placeholder="/marketplace"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {settings.cta1LinkType === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extern URL
              </label>
              <input
                type="text"
                value={settings.cta1Link || ''}
                onChange={(e) => updateSetting('cta1Link', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <ColorPicker
            label="Bakgrundsfärg"
            value={settings.cta1Color || '#56c5c5'}
            onChange={(color) => updateSetting('cta1Color', color)}
          />

          <ColorPicker
            label="Textfärg"
            value={settings.cta1TextColor || '#ffffff'}
            onChange={(color) => updateSetting('cta1TextColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typsnitt
            </label>
            <select
              value={settings.cta1Font || 'sans'}
              onChange={(e) => updateSetting('cta1Font', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="poppins">Poppins</option>
              <option value="lobster">Lobster</option>
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.cta1Bold || false}
              onChange={(e) => updateSetting('cta1Bold', e.target.checked)}
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
                onClick={() => updateSetting('cta1Size', 'small')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta1Size === 'small'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Liten
              </button>
              <button
                onClick={() => updateSetting('cta1Size', 'medium')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta1Size === 'medium' || !settings.cta1Size
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => updateSetting('cta1Size', 'large')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta1Size === 'large'
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
                onClick={() => updateSetting('cta1Alignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta1Alignment === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('cta1Alignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta1Alignment === 'center' || !settings.cta1Alignment
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Centrerad
              </button>
              <button
                onClick={() => updateSetting('cta1Alignment', 'right')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta1Alignment === 'right'
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
              Opacity: {settings.cta1Opacity || 100}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.cta1Opacity || 100}
              onChange={(e) => updateSetting('cta1Opacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Knapp 2" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Knapptext
            </label>
            <input
              type="text"
              value={settings.cta2Text || ''}
              onChange={(e) => updateSetting('cta2Text', e.target.value)}
              placeholder="Se mer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Länktyp
            </label>
            <select
              value={settings.cta2LinkType || 'chef'}
              onChange={(e) => updateSetting('cta2LinkType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="chef">Till kockens sida</option>
              <option value="internal">Intern sida</option>
              <option value="external">Extern länk</option>
            </select>
          </div>

          {settings.cta2LinkType === 'internal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intern sida (t.ex. /marketplace, /membership)
              </label>
              <input
                type="text"
                value={settings.cta2Link || ''}
                onChange={(e) => updateSetting('cta2Link', e.target.value)}
                placeholder="/marketplace"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {settings.cta2LinkType === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extern URL
              </label>
              <input
                type="text"
                value={settings.cta2Link || ''}
                onChange={(e) => updateSetting('cta2Link', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <ColorPicker
            label="Bakgrundsfärg"
            value={settings.cta2Color || '#a1c798'}
            onChange={(color) => updateSetting('cta2Color', color)}
          />

          <ColorPicker
            label="Textfärg"
            value={settings.cta2TextColor || '#ffffff'}
            onChange={(color) => updateSetting('cta2TextColor', color)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typsnitt
            </label>
            <select
              value={settings.cta2Font || 'sans'}
              onChange={(e) => updateSetting('cta2Font', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="poppins">Poppins</option>
              <option value="lobster">Lobster</option>
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.cta2Bold || false}
              onChange={(e) => updateSetting('cta2Bold', e.target.checked)}
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
                onClick={() => updateSetting('cta2Size', 'small')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta2Size === 'small'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Liten
              </button>
              <button
                onClick={() => updateSetting('cta2Size', 'medium')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta2Size === 'medium' || !settings.cta2Size
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => updateSetting('cta2Size', 'large')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta2Size === 'large'
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
                onClick={() => updateSetting('cta2Alignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta2Alignment === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('cta2Alignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta2Alignment === 'center' || !settings.cta2Alignment
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300'
                }`}
              >
                Centrerad
              </button>
              <button
                onClick={() => updateSetting('cta2Alignment', 'right')}
                className={`px-4 py-2 rounded-lg border-2 ${
                  settings.cta2Alignment === 'right'
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
              Opacity: {settings.cta2Opacity || 100}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.cta2Opacity || 100}
              onChange={(e) => updateSetting('cta2Opacity', parseInt(e.target.value))}
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
                      fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : settings.headingFont === 'poppins' ? 'Poppins' : undefined,
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
                      fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : settings.headingFont === 'poppins' ? 'Poppins' : undefined,
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

            <div className={`mb-8 ${settings.curiosaPlacement === 'beside-article' ? 'grid md:grid-cols-2 gap-8' : ''}`}>
              <div className="relative">
                {settings.mainImageUrl ? (
                  <div className="relative">
                    <img
                      src={settings.mainImageUrl}
                      alt="Huvudbild"
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    {settings.smallImageUrl && (
                      <img
                        src={settings.smallImageUrl}
                        alt="Liten bild"
                        className="absolute object-cover rounded-xl shadow-lg"
                        style={{
                          width: `${settings.smallImageSize || 96}px`,
                          height: `${settings.smallImageSize || 96}px`,
                          top: settings.smallImagePosition === 'top-left' || settings.smallImagePosition === 'top-right' ? '1rem' : settings.smallImagePosition === 'center' ? '50%' : 'auto',
                          bottom: settings.smallImagePosition === 'bottom-left' || settings.smallImagePosition === 'bottom-right' ? '1rem' : 'auto',
                          left: settings.smallImagePosition === 'top-left' || settings.smallImagePosition === 'bottom-left' ? '1rem' : settings.smallImagePosition === 'center' ? '50%' : 'auto',
                          right: settings.smallImagePosition === 'top-right' || settings.smallImagePosition === 'bottom-right' ? '1rem' : 'auto',
                          transform: `${settings.smallImagePosition === 'center' ? 'translate(-50%, -50%)' : ''} rotate(${settings.smallImageRotation || 0}deg)`,
                          border: `${settings.smallImageBorderWidth || 4}px solid ${settings.smallImageBorderColor || '#ffffff'}`
                        }}
                      />
                    )}
                    {(settings.quotePosition === 'on-image-top' || settings.quotePosition === 'on-image-middle' || settings.quotePosition === 'on-image-bottom') && settings.quoteText && (
                      <div
                        className="absolute left-0 right-0 px-4"
                        style={{
                          top: settings.quotePosition === 'on-image-top' ? '1rem' : settings.quotePosition === 'on-image-middle' ? '50%' : 'auto',
                          bottom: settings.quotePosition === 'on-image-bottom' ? '1rem' : 'auto',
                          transform: settings.quotePosition === 'on-image-middle' ? 'translateY(-50%)' : undefined,
                          textAlign: settings.quoteAlignment || 'center'
                        }}
                      >
                        <p
                          className={`text-white ${settings.quoteBold ? 'font-bold' : ''} ${settings.quoteItalic !== false ? 'italic' : ''}`}
                          style={{
                            fontSize: `${settings.quoteFontSize || 24}px`,
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}
                        >
                          "{settings.quoteText}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                    Ingen bild uppladdad
                  </div>
                )}

                {settings.curiosaPlacement === 'below-image' && curiosaItems.length > 0 && curiosaItems.some(item => item.question) && (
                  <div
                    className="mt-6 p-4 rounded-xl"
                    style={{
                      backgroundColor: (() => {
                        const hex = settings.curiosaBgColor || '#f6f2e0';
                        const opacity = (settings.curiosaOpacity || 100) / 100;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                      })(),
                      borderColor: settings.curiosaBorderColor || '#a1c798',
                      borderWidth: `${settings.curiosaBorderWidth || 2}px`,
                      borderStyle: 'solid',
                      width: `${settings.curiosaWidth || 100}%`,
                      height: settings.curiosaHeight ? `${settings.curiosaHeight}px` : 'auto',
                      color: settings.curiosaTextColor || '#374151'
                    }}
                  >
                    <h4 className="font-bold text-sm mb-2">Kuriosa</h4>
                    <div className="space-y-2">
                      {curiosaItems.slice(0, 3).map((item, index) => (
                        item.question && (
                          <div key={index} className="text-xs">
                            <p className={`${settings.curiosaBold ? 'font-bold' : 'font-semibold'}`}
                              style={{ fontSize: `${settings.curiosaFontSize || 14}px` }}>
                              {item.question}:
                            </p>
                            <p style={{
                              fontSize: `${settings.curiosaFontSize || 14}px`,
                              opacity: 0.8
                            }}>
                              {item.answer || 'Svar...'}
                            </p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                {settings.quotePosition === 'above-article' && settings.quoteText && (
                  <blockquote
                    className={`mb-4 ${settings.quoteBold ? 'font-bold' : ''} ${settings.quoteItalic !== false ? 'italic' : ''}`}
                    style={{
                      fontSize: `${settings.quoteFontSize || 24}px`,
                      color: settings.quoteColor || '#4b5563',
                      textAlign: settings.quoteAlignment || 'center'
                    }}
                  >
                    "{settings.quoteText}"
                  </blockquote>
                )}
                {settings.articleTitle && (
                  <h3
                    className={`mb-2 ${settings.articleTitleBold ? 'font-bold' : ''}`}
                    style={{
                      fontSize: `${settings.articleTitleSize || 24}px`,
                      textAlign: settings.articleTitleAlign || 'left',
                      fontFamily: settings.articleTitleFont === 'poppins' ? 'Poppins' : settings.articleTitleFont === 'lobster' ? 'Lobster' : settings.articleTitleFont === 'serif' ? 'serif' : 'sans-serif'
                    }}
                  >
                    {settings.articleTitle}
                  </h3>
                )}
                {settings.articleIngress && (
                  <p
                    className={`mb-2 ${settings.articleIngressBold ? 'font-bold' : ''}`}
                    style={{
                      fontSize: `${settings.articleIngressSize || 16}px`,
                      textAlign: settings.articleIngressAlign || 'left',
                      fontFamily: settings.articleIngressFont === 'poppins' ? 'Poppins' : settings.articleIngressFont === 'lobster' ? 'Lobster' : settings.articleIngressFont === 'serif' ? 'serif' : 'sans-serif'
                    }}
                  >
                    {settings.articleIngress}
                  </p>
                )}
                {settings.articleBody && (
                  <p
                    className={`text-sm ${settings.articleBodyBold ? 'font-bold' : ''}`}
                    style={{
                      fontSize: `${settings.articleBodySize || 14}px`,
                      fontFamily: settings.articleBodyFont === 'poppins' ? 'Poppins' : settings.articleBodyFont === 'lobster' ? 'Lobster' : settings.articleBodyFont === 'serif' ? 'serif' : 'sans-serif'
                    }}
                  >
                    {settings.articleBody.substring(0, 200)}...
                  </p>
                )}

                {settings.curiosaPlacement === 'beside-article' && curiosaItems.length > 0 && curiosaItems.some(item => item.question) && (
                  <div
                    className="mt-4 p-4 rounded-xl"
                    style={{
                      backgroundColor: (() => {
                        const hex = settings.curiosaBgColor || '#f6f2e0';
                        const opacity = (settings.curiosaOpacity || 100) / 100;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                      })(),
                      borderColor: settings.curiosaBorderColor || '#a1c798',
                      borderWidth: `${settings.curiosaBorderWidth || 2}px`,
                      borderStyle: 'solid',
                      width: `${settings.curiosaWidth || 100}%`,
                      height: settings.curiosaHeight ? `${settings.curiosaHeight}px` : 'auto',
                      color: settings.curiosaTextColor || '#374151'
                    }}
                  >
                    <h4 className="font-bold text-sm mb-2">Kuriosa</h4>
                    <div className="space-y-2">
                      {curiosaItems.slice(0, 2).map((item, index) => (
                        item.question && (
                          <div key={index} className="text-xs">
                            <p className={`${settings.curiosaBold ? 'font-bold' : 'font-semibold'}`}
                              style={{ fontSize: `${settings.curiosaFontSize || 14}px` }}>
                              {item.question}:
                            </p>
                            <p style={{
                              fontSize: `${settings.curiosaFontSize || 14}px`,
                              opacity: 0.8
                            }}>
                              {item.answer || 'Svar...'}
                            </p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {settings.quotePosition === 'after-article' && settings.quoteText && (
              <blockquote
                className={`mb-6 ${settings.quoteBold ? 'font-bold' : ''} ${settings.quoteItalic !== false ? 'italic' : ''}`}
                style={{
                  fontSize: `${settings.quoteFontSize || 24}px`,
                  color: settings.quoteColor || '#4b5563',
                  textAlign: settings.quoteAlignment || 'center'
                }}
              >
                "{settings.quoteText}"
              </blockquote>
            )}

            {settings.quotePosition === 'after-curiosa' && settings.quoteText && (
              <blockquote
                className={`mb-6 ${settings.quoteBold ? 'font-bold' : ''} ${settings.quoteItalic !== false ? 'italic' : ''}`}
                style={{
                  fontSize: `${settings.quoteFontSize || 24}px`,
                  color: settings.quoteColor || '#4b5563',
                  textAlign: settings.quoteAlignment || 'center'
                }}
              >
                "{settings.quoteText}"
              </blockquote>
            )}

            {settings.quotePosition === 'before-cta' && settings.quoteText && (
              <blockquote
                className={`mb-6 ${settings.quoteBold ? 'font-bold' : ''} ${settings.quoteItalic !== false ? 'italic' : ''}`}
                style={{
                  fontSize: `${settings.quoteFontSize || 24}px`,
                  color: settings.quoteColor || '#4b5563',
                  textAlign: settings.quoteAlignment || 'center'
                }}
              >
                "{settings.quoteText}"
              </blockquote>
            )}

            {settings.ctaText && (
              <div className={`mb-6 ${
                settings.ctaAlignment === 'left' ? 'text-left' :
                settings.ctaAlignment === 'right' ? 'text-right' :
                'text-center'
              }`}>
                <button
                  className="px-6 py-3 rounded-xl text-white"
                  style={{
                    backgroundColor: settings.ctaColor || '#56c5c5',
                    opacity: (settings.ctaOpacity || 100) / 100
                  }}
                >
                  {settings.ctaText}
                </button>
              </div>
            )}

            {selectedChef && (
              <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                {selectedChef.avatar_url && (
                  <img
                    src={selectedChef.avatar_url}
                    alt={selectedChef.display_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{selectedChef.display_name}</p>
                  {selectedChef.bio && <p className="text-sm text-gray-600">{selectedChef.bio}</p>}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 text-center mt-8">
              Preview visar layout och grundläggande styling
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
