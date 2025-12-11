import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import IconPicker from './IconPicker';
import PreviewCard from './PreviewCard';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface MoodCard {
  id: string;
  name: string;
  description: string;
  icon_key?: string;
  icon_url?: string;
  front_bg_color: string;
  front_shape: 'rectangle' | 'rounded' | 'bubble' | 'wavy';
  back_title: string;
  back_text: string;
  back_bg_color?: string;
  back_title_font?: string;
  back_title_bold?: boolean;
  back_title_size?: number;
  back_title_alignment?: 'left' | 'center' | 'right';
  back_title_color?: string;
  back_text_font?: string;
  back_text_bold?: boolean;
  back_text_size?: number;
  back_text_alignment?: 'left' | 'center' | 'right';
  back_text_color?: string;
}

interface MoodMeal {
  mood_id: string;
  recipe_ids: string[];
}

interface MoodDishesSettings {
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
  mood_cards_count?: number;
  mood_cards?: MoodCard[];
  mood_meals?: MoodMeal[];
}

interface MoodDishesEditorProps {
  settings: MoodDishesSettings;
  onSettingsChange: (settings: MoodDishesSettings) => void;
}

export default function MoodDishesEditor({ settings, onSettingsChange }: MoodDishesEditorProps) {
  const { user } = useAuth();
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const updateSetting = (key: keyof MoodDishesSettings, value: any) => {
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

  const updateMoodCardsCount = (count: number) => {
    const currentCards = settings.mood_cards || [];
    const currentCount = currentCards.length;

    if (count > currentCount) {
      const newCards = [...currentCards];
      for (let i = currentCount; i < count; i++) {
        newCards.push({
          id: `mood-${Date.now()}-${i}`,
          name: '',
          description: '',
          icon_key: '',
          front_bg_color: '#a1c798',
          front_shape: 'rounded',
          back_title: '',
          back_text: '',
          back_bg_color: '#ffffff'
        });
      }
      updateSetting('mood_cards', newCards);
    } else if (count < currentCount) {
      updateSetting('mood_cards', currentCards.slice(0, count));
    }
    updateSetting('mood_cards_count', count);
  };

  const handleIconUpload = async (cardId: string, file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingIcon(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `mood-icon-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/mood-icons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateMoodCard(cardId, 'icon_url', data.publicUrl);
      updateMoodCard(cardId, 'icon_key', '');
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingIcon(false);
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  const updateMoodCard = (id: string, key: keyof MoodCard, value: any) => {
    const cards = settings.mood_cards || [];
    const newCards = cards.map(c => c.id === id ? { ...c, [key]: value } : c);
    updateSetting('mood_cards', newCards);
  };

  const updateMoodMeal = (moodId: string, recipeIds: string) => {
    const meals = settings.mood_meals || [];
    const existingMealIndex = meals.findIndex(m => m.mood_id === moodId);
    const recipeIdsArray = recipeIds.split(',').map(id => id.trim()).filter(Boolean);

    if (existingMealIndex >= 0) {
      const newMeals = [...meals];
      newMeals[existingMealIndex] = { mood_id: moodId, recipe_ids: recipeIdsArray };
      updateSetting('mood_meals', newMeals);
    } else {
      updateSetting('mood_meals', [...meals, { mood_id: moodId, recipe_ids: recipeIdsArray }]);
    }
  };

  const getMoodMeal = (moodId: string): string => {
    const meals = settings.mood_meals || [];
    const meal = meals.find(m => m.mood_id === moodId);
    return meal?.recipe_ids.join(', ') || '';
  };

  const subtitleTexts = settings.subtitleTexts || [''];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Humörkäk</h3>
        <p className="text-sm text-gray-600">Anpassa inställningar för Humörkäk-sektionen</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Rubriktext</label>
            <input
              type="text"
              value={settings.heading || ''}
              onChange={(e) => updateSetting('heading', e.target.value)}
              placeholder="Humörkäk"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
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
            value={settings.subtitleColor || '#6b7280'}
            onChange={(color) => updateSetting('subtitleColor', color)}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Humörkort" defaultExpanded={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antal humörkort
            </label>
            <select
              value={settings.mood_cards_count || (settings.mood_cards || []).length || 0}
              onChange={(e) => updateMoodCardsCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {(settings.mood_cards || []).length > 0 && (
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Översikt – Alla humörkort</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {(settings.mood_cards || []).map((card, index) => (
                  <button
                    key={card.id}
                    onClick={() => toggleCardExpansion(card.id)}
                    className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-center p-2 shadow-sm cursor-pointer transition-all ${
                      expandedCardId === card.id ? 'ring-2 ring-[#56c5c5]' : ''
                    }`}
                    style={{ backgroundColor: card.front_bg_color || '#a1c798' }}
                  >
                    {card.icon_url ? (
                      <img src={card.icon_url} alt="" className="w-8 h-8 object-contain mb-1" />
                    ) : (
                      <div className="text-2xl mb-1">{card.icon_key || '?'}</div>
                    )}
                    <div className="text-xs font-medium text-gray-800 line-clamp-2">
                      {card.name || `Humör ${index + 1}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {expandedCardId && (settings.mood_cards || []).map((card, index) =>
            card.id === expandedCardId ? (
              <div key={card.id} className="p-6 border-2 border-[#56c5c5] rounded-lg bg-[#56c5c5]/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Redigera Humör {index + 1}</h4>
                  <button
                    onClick={() => setExpandedCardId(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 p-4 bg-white rounded-lg">
                  <h5 className="font-medium text-gray-900">Framsida</h5>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Humörnamn</label>
                    <input
                      type="text"
                      value={card.name}
                      onChange={(e) => updateMoodCard(card.id, 'name', e.target.value)}
                      placeholder="Trött som ett as"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Beskrivning</label>
                    <input
                      type="text"
                      value={card.description}
                      onChange={(e) => updateMoodCard(card.id, 'description', e.target.value)}
                      placeholder="När du behöver energi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Ikon/Symbol</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateMoodCard(card.id, 'icon_url', '');
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          !card.icon_url ? 'border-[#56c5c5] bg-[#56c5c5] text-white' : 'border-gray-300'
                        }`}
                      >
                        Använd ikon
                      </button>
                      <label
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all text-center cursor-pointer ${
                          card.icon_url ? 'border-[#56c5c5] bg-[#56c5c5] text-white' : 'border-gray-300'
                        }`}
                      >
                        Ladda upp bild
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleIconUpload(card.id, file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {!card.icon_url && (
                      <IconPicker
                        label=""
                        value={card.icon_key || ''}
                        onChange={(iconKey) => updateMoodCard(card.id, 'icon_key', iconKey)}
                      />
                    )}

                    {card.icon_url && (
                      <div className="flex gap-2 items-center">
                        <img src={card.icon_url} alt="Uppladdad ikon" className="w-16 h-16 object-contain border rounded" />
                        <button
                          onClick={() => updateMoodCard(card.id, 'icon_url', '')}
                          className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          Ta bort bild
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label="Bakgrundsfärg"
                      value={card.front_bg_color}
                      onChange={(color) => updateMoodCard(card.id, 'front_bg_color', color)}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Form</label>
                      <select
                        value={card.front_shape}
                        onChange={(e) => updateMoodCard(card.id, 'front_shape', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="rectangle">Rektangel</option>
                        <option value="rounded">Rundad</option>
                        <option value="bubble">Bubblig</option>
                        <option value="wavy">Vågig</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-white rounded-lg">
                  <h5 className="font-medium text-gray-900">Baksida</h5>

                  <ColorPicker
                    label="Bakgrundsfärg"
                    value={card.back_bg_color || '#ffffff'}
                    onChange={(color) => updateMoodCard(card.id, 'back_bg_color', color)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                    <input
                      type="text"
                      value={card.back_title}
                      onChange={(e) => updateMoodCard(card.id, 'back_title', e.target.value)}
                      placeholder="Rekommenderade rätter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik – Typsnitt</label>
                      <select
                        value={card.back_title_font || 'sans'}
                        onChange={(e) => updateMoodCard(card.id, 'back_title_font', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="lobster">Lobster</option>
                        <option value="sans">Sans Serif</option>
                        <option value="serif">Serif</option>
                        <option value="poppins">Poppins</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storlek (px)</label>
                      <input
                        type="number"
                        min="12"
                        max="32"
                        value={card.back_title_size || 20}
                        onChange={(e) => updateMoodCard(card.id, 'back_title_size', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <ColorPicker
                      label="Färg"
                      value={card.back_title_color || '#000000'}
                      onChange={(color) => updateMoodCard(card.id, 'back_title_color', color)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.back_title_bold || false}
                        onChange={(e) => updateMoodCard(card.id, 'back_title_bold', e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Fet stil</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik – Placering</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateMoodCard(card.id, 'back_title_alignment', 'left')}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          card.back_title_alignment === 'left' || !card.back_title_alignment
                            ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        Vänster
                      </button>
                      <button
                        onClick={() => updateMoodCard(card.id, 'back_title_alignment', 'center')}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          card.back_title_alignment === 'center'
                            ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        Centrerad
                      </button>
                      <button
                        onClick={() => updateMoodCard(card.id, 'back_title_alignment', 'right')}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          card.back_title_alignment === 'right'
                            ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        Höger
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                    <textarea
                      value={card.back_text}
                      onChange={(e) => updateMoodCard(card.id, 'back_text', e.target.value)}
                      placeholder="När du känner dig så här..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text – Typsnitt</label>
                      <select
                        value={card.back_text_font || 'sans'}
                        onChange={(e) => updateMoodCard(card.id, 'back_text_font', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="lobster">Lobster</option>
                        <option value="sans">Sans Serif</option>
                        <option value="serif">Serif</option>
                        <option value="poppins">Poppins</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storlek (px)</label>
                      <input
                        type="number"
                        min="12"
                        max="24"
                        value={card.back_text_size || 14}
                        onChange={(e) => updateMoodCard(card.id, 'back_text_size', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <ColorPicker
                      label="Färg"
                      value={card.back_text_color || '#666666'}
                      onChange={(color) => updateMoodCard(card.id, 'back_text_color', color)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.back_text_bold || false}
                        onChange={(e) => updateMoodCard(card.id, 'back_text_bold', e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Fet stil</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text – Placering</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateMoodCard(card.id, 'back_text_alignment', 'left')}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          card.back_text_alignment === 'left' || !card.back_text_alignment
                            ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        Vänster
                      </button>
                      <button
                        onClick={() => updateMoodCard(card.id, 'back_text_alignment', 'center')}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          card.back_text_alignment === 'center'
                            ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        Centrerad
                      </button>
                      <button
                        onClick={() => updateMoodCard(card.id, 'back_text_alignment', 'right')}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          card.back_text_alignment === 'right'
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
            ) : null
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Resultatflöde (koppla rätter)" defaultExpanded={false}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Koppla produkt-ID:n till varje humör (separera med komma)
          </p>

          {(settings.mood_cards || []).map((card) => (
            <div key={card.id} className="p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {card.icon} {card.name || 'Namnlöst humör'}
              </label>
              <input
                type="text"
                value={getMoodMeal(card.id)}
                onChange={(e) => updateMoodMeal(card.id, e.target.value)}
                placeholder="product-id-1, product-id-2, product-id-3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </CollapsibleCard>

      <PreviewCard title="Preview" defaultExpanded={true}>
        <div
          className="p-8"
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
                  {settings.heading || 'Humörkäk'}
                </h2>
                {subtitleTexts.length > 0 && subtitleTexts[0] && (
                  <>
                    <span className="text-gray-400 text-2xl">|</span>
                    <div className="min-h-[24px] flex items-center">
                      <p
                        className="transition-opacity duration-300"
                        style={{
                          opacity: fadeIn ? 1 : 0,
                          color: settings.subtitleColor || '#6b7280'
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
                  {settings.heading || 'Humörkäk'}
                </h2>
                {subtitleTexts.length > 0 && subtitleTexts[0] && (
                  <div className="min-h-[24px] flex items-center mt-2">
                    <p
                      className="transition-opacity duration-300"
                      style={{
                        opacity: fadeIn ? 1 : 0,
                        color: settings.subtitleColor || '#6b7280'
                      }}
                    >
                      {subtitleTexts[activeSubtitleIndex] || subtitleTexts[0]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {(settings.mood_cards || []).length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {(settings.mood_cards || []).map((card) => (
                <div
                  key={card.id}
                  className="flex-shrink-0 w-48 h-48 rounded-xl flex flex-col items-center justify-center text-center p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  style={{ backgroundColor: card.front_bg_color || '#a1c798' }}
                >
                  <div className="text-5xl mb-2">{card.icon || '😊'}</div>
                  <div className="text-base font-semibold text-gray-800 mb-1">
                    {card.name || 'Namnlöst'}
                  </div>
                  <div className="text-xs text-gray-700">
                    {card.description || 'Ingen beskrivning'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PreviewCard>
    </div>
  );
}
