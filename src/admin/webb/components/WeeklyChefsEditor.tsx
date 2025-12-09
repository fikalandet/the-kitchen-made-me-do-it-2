import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';

interface WeeklyChefsSettings {
  backgroundColor?: string;
  heading?: string;
  headingFont?: string;
  headingBold?: boolean;
  headingAlignment?: 'left' | 'center';
  headingColor?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleColor?: string;
  featuredChefs?: Array<{ chefId: string; comment: string }>;
  cardsPerRow?: number;
  chefImageSize?: number;
  chefImageShape?: 'round' | 'square';
  chefImagePlacement?: 'left' | 'center' | 'right';
}

interface WeeklyChefsEditorProps {
  settings: WeeklyChefsSettings;
  onSettingsChange: (settings: WeeklyChefsSettings) => void;
}

interface Chef {
  id: string;
  display_name: string;
  avatar_url?: string;
  city?: string;
  kitchen_open_status?: string;
}

export default function WeeklyChefsEditor({ settings, onSettingsChange }: WeeklyChefsEditorProps) {
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const updateSetting = (key: keyof WeeklyChefsSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  useEffect(() => {
    fetchChefs();
  }, []);

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

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, city, kitchen_open_status')
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

  const toggleChef = (chefId: string) => {
    const featuredChefs = settings.featuredChefs || [];
    const existingIndex = featuredChefs.findIndex(fc => fc.chefId === chefId);

    if (existingIndex >= 0) {
      updateSetting('featuredChefs', featuredChefs.filter((_, i) => i !== existingIndex));
    } else {
      updateSetting('featuredChefs', [...featuredChefs, { chefId, comment: '' }]);
    }
  };

  const updateChefComment = (chefId: string, comment: string) => {
    const featuredChefs = settings.featuredChefs || [];
    const updated = featuredChefs.map(fc =>
      fc.chefId === chefId ? { ...fc, comment } : fc
    );
    updateSetting('featuredChefs', updated);
  };

  const isChefSelected = (chefId: string) => {
    return (settings.featuredChefs || []).some(fc => fc.chefId === chefId);
  };

  const getChefComment = (chefId: string) => {
    return (settings.featuredChefs || []).find(fc => fc.chefId === chefId)?.comment || '';
  };

  const filteredChefs = chefs.filter(chef =>
    chef.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chef.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChefs = chefs.filter(chef => isChefSelected(chef.id));

  const subtitleTexts = settings.subtitleTexts || [''];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Veckans kockar</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Veckans kockar-sektionen</p>
        </div>
      </div>

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <ColorPicker
          label="Bakgrundsfärg för hela sektionen"
          value={settings.backgroundColor || '#ffffff'}
          onChange={(color) => updateSetting('backgroundColor', color)}
        />
      </CollapsibleCard>

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
              placeholder="Veckans kockar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

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

      <CollapsibleCard title="Kockkort – färger" defaultExpanded={true}>
        <div className="space-y-4">
          <ColorPicker
            label="Bakgrundsfärg för kockkort"
            value={settings.cardBackgroundColor || '#ffffff'}
            onChange={(color) => updateSetting('cardBackgroundColor', color)}
          />

          <ColorPicker
            label="Textfärg – kockens namn"
            value={settings.cardNameColor || '#111827'}
            onChange={(color) => updateSetting('cardNameColor', color)}
          />

          <ColorPicker
            label="Textfärg – Kitchen-kommentar"
            value={settings.cardCommentColor || '#4b5563'}
            onChange={(color) => updateSetting('cardCommentColor', color)}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Kockbild – inställningar" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storlek på kockbild (px)
            </label>
            <input
              type="range"
              min="64"
              max="200"
              step="8"
              value={settings.chefImageSize || 112}
              onChange={(e) => updateSetting('chefImageSize', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>64px</span>
              <span className="font-medium text-gray-700">{settings.chefImageSize || 112}px</span>
              <span>200px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form på kockbild
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('chefImageShape', 'round')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  (settings.chefImageShape === 'round' || !settings.chefImageShape)
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Rund
              </button>
              <button
                onClick={() => updateSetting('chefImageShape', 'square')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.chefImageShape === 'square'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Fyrkantig
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering av kockbild
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('chefImagePlacement', 'left')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.chefImagePlacement === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('chefImagePlacement', 'center')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  (settings.chefImagePlacement === 'center' || !settings.chefImagePlacement)
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mitten
              </button>
              <button
                onClick={() => updateSetting('chefImagePlacement', 'right')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.chefImagePlacement === 'right'
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

      <CollapsibleCard title="Välj kockar" defaultExpanded={true}>
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
                      type="checkbox"
                      checked={isChefSelected(chef.id)}
                      onChange={() => toggleChef(chef.id)}
                      className="w-4 h-4 rounded"
                    />
                    {chef.avatar_url && (
                      <img src={chef.avatar_url} alt={chef.display_name} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{chef.display_name}</p>
                      {chef.city && <p className="text-sm text-gray-500">{chef.city}</p>}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">Inga kockar hittades</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antal kort per rad
            </label>
            <input
              type="number"
              min="1"
              max="6"
              value={settings.cardsPerRow || 3}
              onChange={(e) => updateSetting('cardsPerRow', parseInt(e.target.value) || 3)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>
        </div>
      </CollapsibleCard>

      {selectedChefs.length > 0 && (
        <CollapsibleCard title="Kitchen-kommentarer" defaultExpanded={true}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Lägg till en Kitchen-kommentar för varje vald kock</p>
            {selectedChefs.map(chef => (
              <div key={chef.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {chef.avatar_url && (
                  <img src={chef.avatar_url} alt={chef.display_name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">{chef.display_name}</p>
                  <input
                    type="text"
                    placeholder="Kitchen-kommentar..."
                    value={getChefComment(chef.id)}
                    onChange={(e) => updateChefComment(chef.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

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
                  } ${settings.headingBold ? 'font-bold' : ''}`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.heading || 'Veckans kockar'}
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
              <div>
                <h2
                  className={`text-3xl ${
                    settings.headingFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.headingBold ? 'font-bold' : ''}`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.heading || 'Veckans kockar'}
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

          {selectedChefs.length > 0 ? (
            <div className={`grid gap-6 grid-cols-${Math.min(settings.cardsPerRow || 3, selectedChefs.length)}`}>
              {selectedChefs.slice(0, 3).map((chef) => {
                const imageSize = settings.chefImageSize || 112;
                const imageShape = settings.chefImageShape || 'round';
                const imagePlacement = settings.chefImagePlacement || 'center';
                const alignmentClass =
                  imagePlacement === 'left' ? 'items-start' :
                  imagePlacement === 'right' ? 'items-end' :
                  'items-center';

                return (
                  <div
                    key={chef.id}
                    className="rounded-lg p-4 shadow"
                    style={{ backgroundColor: settings.cardBackgroundColor || '#ffffff' }}
                  >
                    <div className={`flex flex-col ${alignmentClass} h-full`}>
                      {chef.avatar_url && (
                        <img
                          src={chef.avatar_url}
                          alt={chef.display_name}
                          className={`object-cover ${imageShape === 'round' ? 'rounded-full' : 'rounded-xl'} mb-3`}
                          style={{
                            width: `${imageSize}px`,
                            height: `${imageSize}px`
                          }}
                        />
                      )}
                      <div className="text-center flex-grow">
                        <p
                          className="font-semibold mb-1"
                          style={{ color: settings.cardNameColor || '#111827' }}
                        >
                          {chef.display_name || 'Okänd kock'}
                        </p>
                        {getChefComment(chef.id) && (
                          <div className="text-sm mt-2">
                            <p className="font-medium" style={{ color: settings.cardCommentColor || '#4b5563' }}>
                              Kitchen-kommentar:
                            </p>
                            <p className="italic" style={{ color: settings.cardCommentColor || '#4b5563' }}>
                              {getChefComment(chef.id)}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        className="w-full h-10 rounded-xl font-medium text-sm transition-colors mt-4"
                        style={{
                          backgroundColor: '#000000',
                          color: '#ffffff',
                        }}
                      >
                        Till kockens kök
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">Inga kockar valda</p>
          )}
        </div>
      </CollapsibleCard>
    </div>
  );
}
