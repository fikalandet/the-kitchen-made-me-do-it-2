import { Upload } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { HeroSettings as Settings } from './HeroEditor';
import ColorPicker from './ColorPicker';

interface HeroSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const PRESET_COLORS = [
  { value: '#a1c798', label: 'Grön' },
  { value: '#f6f2e0', label: 'Beige' },
  { value: '#56c5c5', label: 'Turkos' },
  { value: '#ffffff', label: 'Vit' },
  { value: '#000000', label: 'Svart' },
];

export default function HeroSettings({ settings, onSettingsChange }: HeroSettingsProps) {
  const { user } = useAuth();
  const [uploadingBg, setUploadingBg] = useState(false);

  const updateSetting = (key: keyof Settings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleBgImageUpload = async (file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingBg(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-bg-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateSetting('backgroundImageUrl', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingBg(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rubrik ovanför alla kort
        </label>
        <input
          type="text"
          value={settings.sectionHeading || ''}
          onChange={(e) => updateSetting('sectionHeading', e.target.value)}
          placeholder="T.ex. Utforska våra menyer"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rubrikstorlek
        </label>
        <select
          value={settings.sectionHeadingSize || 'lg'}
          onChange={(e) => updateSetting('sectionHeadingSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
        >
          <option value="sm">S (1.5rem / 24px)</option>
          <option value="md">M (2rem / 32px)</option>
          <option value="lg">L (2.5rem / 40px)</option>
          <option value="xl">XL (3rem / 48px)</option>
          <option value="2xl">XXL (4rem / 64px)</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.hero_title_rotate_enabled || false}
            onChange={(e) => updateSetting('hero_title_rotate_enabled', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Aktivera roterande rubrik</span>
        </label>
      </div>

      {settings.hero_title_rotate_enabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animationsstil för rubrik
            </label>
            <select
              value={settings.hero_title_animation_style || 'fade'}
              onChange={(e) => updateSetting('hero_title_animation_style', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            >
              <option value="none">Ingen</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="typewriter">Typewriter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alternativa rubriker att rotera mellan
            </label>
            <div className="space-y-2">
              {(settings.hero_alternate_titles || ['']).map((title: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      const newTitles = [...(settings.hero_alternate_titles || [''])];
                      newTitles[index] = e.target.value;
                      updateSetting('hero_alternate_titles', newTitles);
                    }}
                    placeholder={`Alternativ rubrik ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
                  />
                  {(settings.hero_alternate_titles?.length || 0) > 1 && (
                    <button
                      onClick={() => {
                        const newTitles = (settings.hero_alternate_titles || ['']).filter((_: any, i: number) => i !== index);
                        updateSetting('hero_alternate_titles', newTitles);
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newTitles = [...(settings.hero_alternate_titles || ['']), ''];
                  updateSetting('hero_alternate_titles', newTitles);
                }}
                className="px-3 py-2 text-sm bg-[#56c5c5] text-white rounded-lg hover:shadow-lg transition-all"
              >
                + Lägg till alternativ rubrik
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tid mellan rubrikbyten (sekunder)
            </label>
            <input
              type="number"
              value={settings.hero_title_rotation_interval_seconds || 3}
              onChange={(e) => updateSetting('hero_title_rotation_interval_seconds', parseInt(e.target.value) || 3)}
              min="1"
              max="30"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Rekommenderat: 3-5 sekunder</p>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brödtext ovanför alla kort
        </label>
        <textarea
          value={settings.sectionSubheading || ''}
          onChange={(e) => updateSetting('sectionSubheading', e.target.value)}
          placeholder="Valfri beskrivande text"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Antal hero-kort totalt
        </label>
        <input
          type="number"
          value={settings.totalCards || 3}
          onChange={(e) => {
            const count = Math.max(1, Math.min(12, parseInt(e.target.value) || 3));
            updateSetting('totalCards', count);
          }}
          min="1"
          max="12"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Min: 1, Max: 12</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Antal kort som visas i bredd
        </label>
        <select
          value={settings.cardsPerRow || 3}
          onChange={(e) => updateSetting('cardsPerRow', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ColorPicker
          label="Bakgrundsfärg för hela sektionen"
          value={settings.backgroundColor}
          onChange={(color) => updateSetting('backgroundColor', color)}
          presets={PRESET_COLORS}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eller bakgrundsbild
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              id="hero-bg-upload"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBgImageUpload(file);
              }}
              className="hidden"
            />
            <label
              htmlFor="hero-bg-upload"
              className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                uploadingBg ? 'opacity-50' : ''
              }`}
            >
              <Upload className="w-4 h-4" />
              {uploadingBg ? 'Laddar upp...' : 'Ladda upp'}
            </label>
            {settings.backgroundImageUrl && (
              <button
                onClick={() => updateSetting('backgroundImageUrl', '')}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Ta bort
              </button>
            )}
          </div>
          {settings.backgroundImageUrl && (
            <div className="mt-2">
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600 truncate">
                {settings.backgroundImageUrl}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Padding ovanför (px)
        </label>
        <input
          type="number"
          value={parseInt(settings.paddingTop || '40')}
          onChange={(e) => {
            const val = Math.max(0, Math.min(200, parseInt(e.target.value) || 40));
            updateSetting('paddingTop', `${val}px`);
          }}
          min="0"
          max="200"
          step="10"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Padding nedanför (px)
        </label>
        <input
          type="number"
          value={parseInt(settings.paddingBottom || '40')}
          onChange={(e) => {
            const val = Math.max(0, Math.min(200, parseInt(e.target.value) || 40));
            updateSetting('paddingBottom', `${val}px`);
          }}
          min="0"
          max="200"
          step="10"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5] focus:border-transparent"
        />
      </div>
    </div>
  );
}
