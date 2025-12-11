import { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface HoroscopeSection {
  title: string;
  text: string;
}

interface HoroscopeCard {
  id: string;
  key: string;
  name: string;
  date_range: string;
  front_image_url?: string;
  front_icon?: string;
  front_bg_color?: string;
  card_shape?: 'rectangle' | 'rounded' | 'circle' | 'wavy' | 'diagonal';
  back_mode?: 'single' | 'three_sections';
  back_text?: string;
  back_sections?: HoroscopeSection[];
}

interface HoroscopeSettings {
  backgroundColor?: string;
  heading?: string;
  headingFont?: string;
  headingBold?: boolean;
  headingAlignment?: 'left' | 'center';
  headingColor?: string;
  subtitleTexts?: string[];
  subtitlePlacement?: 'inline' | 'below';
  subtitleColor?: string;
  horoscope_cards?: HoroscopeCard[];
}

interface HoroscopeEditorProps {
  settings: HoroscopeSettings;
  onSettingsChange: (settings: HoroscopeSettings) => void;
}

const DEFAULT_HOROSCOPES: HoroscopeCard[] = [
  { id: 'aries', key: 'aries', name: 'Väduren', date_range: '21 mars - 19 april', front_icon: '♈', front_bg_color: '#ff6b6b', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'taurus', key: 'taurus', name: 'Oxen', date_range: '20 april - 20 maj', front_icon: '♉', front_bg_color: '#51cf66', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'gemini', key: 'gemini', name: 'Tvillingarna', date_range: '21 maj - 20 juni', front_icon: '♊', front_bg_color: '#ffd43b', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'cancer', key: 'cancer', name: 'Kräftan', date_range: '21 juni - 22 juli', front_icon: '♋', front_bg_color: '#c0eb75', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'leo', key: 'leo', name: 'Lejonet', date_range: '23 juli - 22 augusti', front_icon: '♌', front_bg_color: '#ffa94d', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'virgo', key: 'virgo', name: 'Jungfrun', date_range: '23 augusti - 22 september', front_icon: '♍', front_bg_color: '#99d98c', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'libra', key: 'libra', name: 'Vågen', date_range: '23 september - 22 oktober', front_icon: '♎', front_bg_color: '#74c0fc', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'scorpio', key: 'scorpio', name: 'Skorpionen', date_range: '23 oktober - 21 november', front_icon: '♏', front_bg_color: '#f06595', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'sagittarius', key: 'sagittarius', name: 'Skytten', date_range: '22 november - 21 december', front_icon: '♐', front_bg_color: '#b197fc', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'capricorn', key: 'capricorn', name: 'Stenbocken', date_range: '22 december - 19 januari', front_icon: '♑', front_bg_color: '#8ce99a', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'aquarius', key: 'aquarius', name: 'Vattumannen', date_range: '20 januari - 18 februari', front_icon: '♒', front_bg_color: '#4dabf7', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] },
  { id: 'pisces', key: 'pisces', name: 'Fiskarna', date_range: '19 februari - 20 mars', front_icon: '♓', front_bg_color: '#da77f2', card_shape: 'rounded', back_mode: 'single', back_text: '', back_sections: [] }
];

export default function HoroscopeEditor({ settings, onSettingsChange }: HoroscopeEditorProps) {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  if (!settings.horoscope_cards || settings.horoscope_cards.length === 0) {
    updateSetting('horoscope_cards', DEFAULT_HOROSCOPES);
  }

  const updateSetting = (key: keyof HoroscopeSettings, value: any) => {
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

  const updateHoroscopeCard = (id: string, key: keyof HoroscopeCard, value: any) => {
    const cards = settings.horoscope_cards || [];
    const newCards = cards.map(c => c.id === id ? { ...c, [key]: value } : c);
    updateSetting('horoscope_cards', newCards);
  };

  const updateHoroscopeSection = (cardId: string, sectionIndex: number, key: keyof HoroscopeSection, value: string) => {
    const cards = settings.horoscope_cards || [];
    const newCards = cards.map(c => {
      if (c.id === cardId) {
        const sections = c.back_sections || [];
        const newSections = [...sections];
        if (newSections[sectionIndex]) {
          newSections[sectionIndex] = { ...newSections[sectionIndex], [key]: value };
        }
        return { ...c, back_sections: newSections };
      }
      return c;
    });
    updateSetting('horoscope_cards', newCards);
  };

  const handleImageUpload = async (file: File, cardId: string) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingImage(cardId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `horoscope-${cardId}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/horoscope/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateHoroscopeCard(cardId, 'front_image_url', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingImage(null);
    }
  };

  const initializeSections = (cardId: string) => {
    const card = (settings.horoscope_cards || []).find(c => c.id === cardId);
    if (card && (!card.back_sections || card.back_sections.length === 0)) {
      updateHoroscopeCard(cardId, 'back_sections', [
        { title: 'Kärlek', text: '' },
        { title: 'Karriär', text: '' },
        { title: 'Energi', text: '' }
      ]);
    }
  };

  const subtitleTexts = settings.subtitleTexts || [''];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Horoskop</h3>
        <p className="text-sm text-gray-600">Anpassa inställningar för Horoskop-sektionen</p>
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
              placeholder="Horoskop"
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
              <label className="block text-sm font-medium text-gray-700">Textrader</label>
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

          <ColorPicker
            label="Textrad – textfärg"
            value={settings.subtitleColor || '#6b7280'}
            onChange={(color) => updateSetting('subtitleColor', color)}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Stjärntecken (12 st)" defaultExpanded={false}>
        <div className="space-y-6">
          {(settings.horoscope_cards || []).map((card) => (
            <div key={card.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                {card.front_icon} {card.name}
              </h4>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={card.front_icon || ''}
                    onChange={(e) => updateHoroscopeCard(card.id, 'front_icon', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>

                <ColorPicker
                  label="Färg"
                  value={card.front_bg_color || '#a1c798'}
                  onChange={(color) => updateHoroscopeCard(card.id, 'front_bg_color', color)}
                />

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Form</label>
                  <select
                    value={card.card_shape || 'rounded'}
                    onChange={(e) => updateHoroscopeCard(card.id, 'card_shape', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="rectangle">Rektangel</option>
                    <option value="rounded">Rundad</option>
                    <option value="circle">Cirkel</option>
                    <option value="wavy">Vågig</option>
                    <option value="diagonal">Diagonal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bild (valfritt)</label>
                <input
                  type="file"
                  id={`horoscope-image-${card.id}`}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, card.id);
                  }}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <label
                    htmlFor={`horoscope-image-${card.id}`}
                    className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-3 h-3" />
                    {uploadingImage === card.id ? 'Laddar...' : 'Ladda upp'}
                  </label>
                  {card.front_image_url && (
                    <button
                      onClick={() => updateHoroscopeCard(card.id, 'front_image_url', '')}
                      className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Baksida – Läge</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateHoroscopeCard(card.id, 'back_mode', 'single')}
                    className={`px-3 py-1 text-xs rounded border-2 ${
                      card.back_mode === 'single' || !card.back_mode
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Enkel text
                  </button>
                  <button
                    onClick={() => {
                      updateHoroscopeCard(card.id, 'back_mode', 'three_sections');
                      initializeSections(card.id);
                    }}
                    className={`px-3 py-1 text-xs rounded border-2 ${
                      card.back_mode === 'three_sections'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    Tre sektioner
                  </button>
                </div>
              </div>

              {(card.back_mode === 'single' || !card.back_mode) && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Horoskoptext</label>
                  <textarea
                    value={card.back_text || ''}
                    onChange={(e) => updateHoroscopeCard(card.id, 'back_text', e.target.value)}
                    rows={3}
                    placeholder="Din prognos för dagen..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              )}

              {card.back_mode === 'three_sections' && (
                <div className="space-y-2 pl-4 border-l-2 border-gray-300">
                  {(card.back_sections || []).map((section, idx) => (
                    <div key={idx} className="space-y-1">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateHoroscopeSection(card.id, idx, 'title', e.target.value)}
                        placeholder={`Sektion ${idx + 1} rubrik`}
                        className="w-full px-2 py-1 text-xs font-medium border border-gray-300 rounded"
                      />
                      <textarea
                        value={section.text}
                        onChange={(e) => updateHoroscopeSection(card.id, idx, 'text', e.target.value)}
                        placeholder="Text..."
                        rows={2}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
}
