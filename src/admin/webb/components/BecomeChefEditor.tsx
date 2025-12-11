import { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import EmojiPicker from './EmojiPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface BecomeChefCard {
  id: string;
  title: string;
  body: string;
  icon: string;
  title_font?: string;
  title_bold?: boolean;
  title_size?: number;
  body_font?: string;
  body_bold?: boolean;
  body_size?: number;
}

interface BecomeChefCTA {
  id: string;
  label: string;
  href: string;
  font?: string;
  bold?: boolean;
  italic?: boolean;
  uppercase?: boolean;
  size?: number;
  bg_color?: string;
  text_color?: string;
  opacity?: number;
  icon?: string;
}

interface BecomeChefSettings {
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
  become_chef_main_image?: string;
  become_chef_image_position?: 'left' | 'right' | 'top' | 'none';
  become_chef_image_opacity?: number;
  become_chef_emojis?: string;
  become_chef_cards?: BecomeChefCard[];
  become_chef_ctas?: BecomeChefCTA[];
}

interface BecomeChefEditorProps {
  settings: BecomeChefSettings;
  onSettingsChange: (settings: BecomeChefSettings) => void;
}

export default function BecomeChefEditor({ settings, onSettingsChange }: BecomeChefEditorProps) {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);

  const updateSetting = (key: keyof BecomeChefSettings, value: any) => {
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

  const handleImageUpload = async (file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `become-chef-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/become-chef/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateSetting('become_chef_main_image', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const addCard = () => {
    const cards = settings.become_chef_cards || [];
    const newCard: BecomeChefCard = {
      id: `card-${Date.now()}`,
      title: '',
      body: '',
      icon: '',
      title_size: 20,
      body_size: 16
    };
    updateSetting('become_chef_cards', [...cards, newCard]);
  };

  const removeCard = (id: string) => {
    const cards = settings.become_chef_cards || [];
    updateSetting('become_chef_cards', cards.filter(c => c.id !== id));
  };

  const updateCard = (id: string, key: keyof BecomeChefCard, value: any) => {
    const cards = settings.become_chef_cards || [];
    const newCards = cards.map(c => c.id === id ? { ...c, [key]: value } : c);
    updateSetting('become_chef_cards', newCards);
  };

  const addCTA = () => {
    const ctas = settings.become_chef_ctas || [];
    const newCTA: BecomeChefCTA = {
      id: `cta-${Date.now()}`,
      label: '',
      href: '',
      size: 16,
      bg_color: '#56c5c5',
      text_color: '#ffffff',
      opacity: 100
    };
    updateSetting('become_chef_ctas', [...ctas, newCTA]);
  };

  const removeCTA = (id: string) => {
    const ctas = settings.become_chef_ctas || [];
    updateSetting('become_chef_ctas', ctas.filter(c => c.id !== id));
  };

  const updateCTA = (id: string, key: keyof BecomeChefCTA, value: any) => {
    const ctas = settings.become_chef_ctas || [];
    const newCTAs = ctas.map(c => c.id === id ? { ...c, [key]: value } : c);
    updateSetting('become_chef_ctas', newCTAs);
  };

  const subtitleTexts = settings.subtitleTexts || [''];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bli en kitchen-kock</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Bli en kitchen-kock-sektionen</p>
        </div>
      </div>

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <ColorPicker
          label="Bakgrundsfärg för hela sektionen"
          value={settings.backgroundColor || '#f6f2e0'}
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
              placeholder="Bli en Kitchen-kock"
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

      <CollapsibleCard title="Bild & layout" defaultExpanded={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Huvudbild
            </label>
            <input
              type="file"
              id="become-chef-image-upload"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
            <div className="flex gap-2">
              <label
                htmlFor="become-chef-image-upload"
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  uploadingImage ? 'opacity-50' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                {uploadingImage ? 'Laddar upp...' : 'Ladda upp bild'}
              </label>
              {settings.become_chef_main_image && (
                <button
                  onClick={() => updateSetting('become_chef_main_image', '')}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Ta bort
                </button>
              )}
            </div>
            {settings.become_chef_main_image && (
              <div className="mt-2">
                <img
                  src={settings.become_chef_main_image}
                  alt="Preview"
                  className="w-full max-w-xs rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering av bilden
            </label>
            <select
              value={settings.become_chef_image_position || 'right'}
              onChange={(e) => updateSetting('become_chef_image_position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value="left">Vänster</option>
              <option value="right">Höger</option>
              <option value="top">Överst</option>
              <option value="none">Ingen bild</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacity på bild ({settings.become_chef_image_opacity || 100}%)
            </label>
            <input
              type="range"
              value={settings.become_chef_image_opacity || 100}
              onChange={(e) => updateSetting('become_chef_image_opacity', parseInt(e.target.value))}
              min="0"
              max="100"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emojis/ikoner (separerade med komma)
            </label>
            <input
              type="text"
              value={settings.become_chef_emojis || ''}
              onChange={(e) => updateSetting('become_chef_emojis', e.target.value)}
              placeholder="🍳,👨‍🍳,💰"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Innehållskort (USP)" defaultExpanded={false}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              USP-kort
            </label>
            <button
              onClick={addCard}
              className="flex items-center gap-1 px-3 py-1 bg-[#56c5c5] text-white text-sm rounded-lg hover:bg-[#45b4b4] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Lägg till kort
            </button>
          </div>

          {(settings.become_chef_cards || []).map((card, index) => (
            <div key={card.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Kort {index + 1}</h4>
                <button
                  onClick={() => removeCard(card.id)}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rubrik</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                  placeholder="T.ex. Tjäna pengar"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                <textarea
                  value={card.body}
                  onChange={(e) => updateCard(card.id, 'body', e.target.value)}
                  placeholder="Beskrivning..."
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Emoji/ikon</label>
                <input
                  type="text"
                  value={card.icon}
                  onChange={(e) => updateCard(card.id, 'icon', e.target.value)}
                  placeholder="💰"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Knappar (CTA)" defaultExpanded={false}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Call-to-action knappar
            </label>
            <button
              onClick={addCTA}
              className="flex items-center gap-1 px-3 py-1 bg-[#56c5c5] text-white text-sm rounded-lg hover:bg-[#45b4b4] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Lägg till knapp
            </button>
          </div>

          {(settings.become_chef_ctas || []).map((cta, index) => (
            <div key={cta.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Knapp {index + 1}</h4>
                <button
                  onClick={() => removeCTA(cta.id)}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Knapptext</label>
                  <input
                    type="text"
                    value={cta.label}
                    onChange={(e) => updateCTA(cta.id, 'label', e.target.value)}
                    placeholder="Ansök nu"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Länk</label>
                  <input
                    type="text"
                    value={cta.href}
                    onChange={(e) => updateCTA(cta.id, 'href', e.target.value)}
                    placeholder="/bli-kock"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ColorPicker
                  label="Bakgrundsfärg"
                  value={cta.bg_color || '#56c5c5'}
                  onChange={(color) => updateCTA(cta.id, 'bg_color', color)}
                />

                <ColorPicker
                  label="Textfärg"
                  value={cta.text_color || '#ffffff'}
                  onChange={(color) => updateCTA(cta.id, 'text_color', color)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Emoji/ikon i knapp</label>
                <input
                  type="text"
                  value={cta.icon || ''}
                  onChange={(e) => updateCTA(cta.id, 'icon', e.target.value)}
                  placeholder="🚀"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
}
