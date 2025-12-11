import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Star } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import EmojiPicker from './EmojiPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface TestimonialsSettings {
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
  introHeading?: string;
  introHeadingFont?: string;
  introHeadingSize?: number;
  introHeadingBold?: boolean;
  introHeadingItalic?: boolean;
  introHeadingAlign?: 'left' | 'center' | 'right';
  introText?: string;
  introTextFont?: string;
  introTextSize?: number;
  introTextBold?: boolean;
  introTextItalic?: boolean;
  introTextAlign?: 'left' | 'center' | 'right';
  testimonialsPerRow?: number;
  testimonialStarSize?: number;
  testimonialStarColor?: string;
  testimonialQuoteFont?: string;
  testimonials?: Array<{
    id?: string;
    name: string;
    location?: string;
    rating: number;
    comment: string;
    image_url?: string;
  }>;
  [key: string]: any;
}

interface TestimonialsEditorProps {
  settings: TestimonialsSettings;
  onSettingsChange: (settings: TestimonialsSettings) => void;
}

export default function TestimonialsEditor({ settings, onSettingsChange }: TestimonialsEditorProps) {
  const { user } = useAuth();
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const updateSetting = (key: keyof TestimonialsSettings, value: any) => {
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

  const addTestimonial = () => {
    const testimonials = settings.testimonials || [];
    updateSetting('testimonials', [
      ...testimonials,
      {
        id: `temp-${Date.now()}`,
        name: '',
        location: '',
        rating: 5,
        comment: '',
        image_url: ''
      }
    ]);
  };

  const removeTestimonial = (index: number) => {
    const testimonials = settings.testimonials || [];
    updateSetting('testimonials', testimonials.filter((_, i) => i !== index));
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const testimonials = settings.testimonials || [];
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    updateSetting('testimonials', newTestimonials);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp bilder');
      return;
    }

    const file = e.target.files[0];
    setUploadingIndex(index);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateTestimonial(index, 'image_url', publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Kunde inte ladda upp bild. Försök igen.');
    } finally {
      setUploadingIndex(null);
    }
  };

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

  const subtitleTexts = settings.subtitleTexts || [''];
  const testimonials = settings.testimonials || [];

  return (
    <div className="space-y-6">
      <CollapsibleCard title="Bakgrund" defaultExpanded={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bakgrundsfärg
            </label>
            <ColorPicker
              color={settings.backgroundColor || '#ffffff'}
              onChange={(color) => updateSetting('backgroundColor', color)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bakgrund opacitet (%): {settings.backgroundOpacity || 100}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding top (px): {settings.sectionPaddingTop || 48}
            </label>
            <input
              type="range"
              min="0"
              max="120"
              value={settings.sectionPaddingTop || 48}
              onChange={(e) => updateSetting('sectionPaddingTop', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding bottom (px): {settings.sectionPaddingBottom || 48}
            </label>
            <input
              type="range"
              min="0"
              max="120"
              value={settings.sectionPaddingBottom || 48}
              onChange={(e) => updateSetting('sectionPaddingBottom', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Huvudrubrik" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubrik
            </label>
            <input
              type="text"
              value={settings.heading || ''}
              onChange={(e) => updateSetting('heading', e.target.value)}
              placeholder="T.ex. Vad våra kunder säger"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emoji före
              </label>
              <EmojiPicker
                emoji={settings.headingEmojiPrefix || ''}
                onChange={(emoji) => updateSetting('headingEmojiPrefix', emoji)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emoji efter
              </label>
              <EmojiPicker
                emoji={settings.headingEmojiSuffix || ''}
                onChange={(emoji) => updateSetting('headingEmojiSuffix', emoji)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <select
              value={settings.headingFont || 'sans'}
              onChange={(e) => updateSetting('headingFont', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="poppins">Poppins</option>
              <option value="lobster">Lobster</option>
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
            </select>

            <select
              value={settings.headingAlignment || 'center'}
              onChange={(e) => updateSetting('headingAlignment', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="left">Vänster</option>
              <option value="center">Centrerad</option>
            </select>

            <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.headingBold || false}
                onChange={(e) => updateSetting('headingBold', e.target.checked)}
              />
              Fet
            </label>

            <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.headingItalic || false}
                onChange={(e) => updateSetting('headingItalic', e.target.checked)}
              />
              Kursiv
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Textstorlek (px): {settings.headingFontSize || 36}
            </label>
            <input
              type="range"
              min="16"
              max="72"
              value={settings.headingFontSize || 36}
              onChange={(e) => updateSetting('headingFontSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Textfärg
            </label>
            <ColorPicker
              color={settings.headingColor || '#1f2937'}
              onChange={(color) => updateSetting('headingColor', color)}
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Textrader" defaultExpanded={false}>
        <div className="space-y-4">
          {subtitleTexts.map((text, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => updateSubtitleText(index, e.target.value)}
                placeholder="Textrad..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => removeSubtitleText(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={addSubtitleText}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#a1c798] border border-[#a1c798] rounded-lg hover:bg-[#a1c798] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till textrad
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placering
              </label>
              <select
                value={settings.subtitlePlacement || 'inline'}
                onChange={(e) => updateSetting('subtitlePlacement', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="inline">Efter rubrik (inline)</option>
                <option value="below">Under rubrik</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotationsintervall (ms): {settings.subtitleRotationInterval || 10000}
              </label>
              <input
                type="number"
                value={settings.subtitleRotationInterval || 10000}
                onChange={(e) => updateSetting('subtitleRotationInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              value={settings.subtitleFont || 'sans'}
              onChange={(e) => updateSetting('subtitleFont', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="poppins">Poppins</option>
              <option value="lobster">Lobster</option>
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
            </select>

            <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.subtitleBold || false}
                onChange={(e) => updateSetting('subtitleBold', e.target.checked)}
              />
              Fet
            </label>

            <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.subtitleItalic || false}
                onChange={(e) => updateSetting('subtitleItalic', e.target.checked)}
              />
              Kursiv
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Textstorlek (px): {settings.subtitleFontSize || 18}
            </label>
            <input
              type="range"
              min="12"
              max="32"
              value={settings.subtitleFontSize || 18}
              onChange={(e) => updateSetting('subtitleFontSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Textfärg
            </label>
            <ColorPicker
              color={settings.subtitleColor || '#6b7280'}
              onChange={(color) => updateSetting('subtitleColor', color)}
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Inledning" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubrik
            </label>
            <input
              type="text"
              value={settings.introHeading || ''}
              onChange={(e) => updateSetting('introHeading', e.target.value)}
              placeholder="T.ex. Äkta recensioner från äkta matälskare"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <select
              value={settings.introHeadingFont || 'sans'}
              onChange={(e) => updateSetting('introHeadingFont', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="poppins">Poppins</option>
              <option value="lobster">Lobster</option>
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
            </select>

            <select
              value={settings.introHeadingAlign || 'center'}
              onChange={(e) => updateSetting('introHeadingAlign', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="left">Vänster</option>
              <option value="center">Centrerad</option>
              <option value="right">Höger</option>
            </select>

            <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.introHeadingBold || false}
                onChange={(e) => updateSetting('introHeadingBold', e.target.checked)}
              />
              Fet
            </label>

            <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.introHeadingItalic || false}
                onChange={(e) => updateSetting('introHeadingItalic', e.target.checked)}
              />
              Kursiv
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubrik storlek (px): {settings.introHeadingSize || 24}
            </label>
            <input
              type="range"
              min="14"
              max="48"
              value={settings.introHeadingSize || 24}
              onChange={(e) => updateSetting('introHeadingSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text
            </label>
            <textarea
              value={settings.introText || ''}
              onChange={(e) => updateSetting('introText', e.target.value)}
              placeholder="Beskriv vad kunderna tycker..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <select
              value={settings.introTextFont || 'sans'}
              onChange={(e) => updateSetting('introTextFont', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="poppins">Poppins</option>
              <option value="lobster">Lobster</option>
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
            </select>

            <select
              value={settings.introTextAlign || 'center'}
              onChange={(e) => updateSetting('introTextAlign', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="left">Vänster</option>
              <option value="center">Centrerad</option>
              <option value="right">Höger</option>
            </select>

            <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.introTextBold || false}
                onChange={(e) => updateSetting('introTextBold', e.target.checked)}
              />
              Fet
            </label>

            <label className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.introTextItalic || false}
                onChange={(e) => updateSetting('introTextItalic', e.target.checked)}
              />
              Kursiv
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text storlek (px): {settings.introTextSize || 16}
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={settings.introTextSize || 16}
              onChange={(e) => updateSetting('introTextSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Layout & stil" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antal i rad
            </label>
            <select
              value={settings.testimonialsPerRow || 3}
              onChange={(e) => updateSetting('testimonialsPerRow', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={1}>1 per rad</option>
              <option value={2}>2 per rad</option>
              <option value={3}>3 per rad</option>
              <option value={4}>4 per rad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storlek på stjärnor (px): {settings.testimonialStarSize || 20}
            </label>
            <input
              type="range"
              min="12"
              max="36"
              value={settings.testimonialStarSize || 20}
              onChange={(e) => updateSetting('testimonialStarSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Färg på stjärnor
            </label>
            <ColorPicker
              color={settings.testimonialStarColor || '#fbbf24'}
              onChange={(color) => updateSetting('testimonialStarColor', color)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typsnitt för citat
            </label>
            <select
              value={settings.testimonialQuoteFont || 'sans'}
              onChange={(e) => updateSetting('testimonialQuoteFont', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="poppins">Poppins</option>
              <option value="lobster">Lobster</option>
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
            </select>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Kundcitat" defaultExpanded={true}>
        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id || index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Kundcitat #{index + 1}</h4>
                <button
                  onClick={() => removeTestimonial(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kundnamn
                </label>
                <input
                  type="text"
                  value={testimonial.name}
                  onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                  placeholder="T.ex. Anna Andersson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ort / Beskrivning (valfritt)
                </label>
                <input
                  type="text"
                  value={testimonial.location || ''}
                  onChange={(e) => updateTestimonial(index, 'location', e.target.value)}
                  placeholder="T.ex. Stockholm eller Småbarnsförälder"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Betyg (1-5 stjärnor)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => updateTestimonial(index, 'rating', rating)}
                      className={`p-2 rounded ${
                        testimonial.rating >= rating
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 flex items-center">
                    {testimonial.rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kommentar / Citat
                </label>
                <textarea
                  value={testimonial.comment}
                  onChange={(e) => updateTestimonial(index, 'comment', e.target.value)}
                  placeholder="Vad kunden sa..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kundbild (valfritt)
                </label>
                <div className="flex items-center gap-4">
                  {testimonial.image_url && (
                    <img
                      src={testimonial.image_url}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploadingIndex === index ? 'Laddar upp...' : 'Välj bild'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                      className="hidden"
                      disabled={uploadingIndex === index}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addTestimonial}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#a1c798] border border-[#a1c798] rounded-lg hover:bg-[#a1c798] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till kundcitat
          </button>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={true}>
        <div
          className="p-8 rounded-lg"
          style={{
            backgroundColor: (() => {
              const hex = settings.backgroundColor || '#ffffff';
              const opacity = (settings.backgroundOpacity || 100) / 100;
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            })(),
            paddingTop: `${settings.sectionPaddingTop || 48}px`,
            paddingBottom: `${settings.sectionPaddingBottom || 48}px`
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div
              className={`mb-8 ${
                settings.headingAlignment === 'center' || !settings.headingAlignment
                  ? 'text-center'
                  : 'text-left'
              }`}
            >
              <h2
                className={`${settings.headingBold ? 'font-bold' : 'font-semibold'} ${
                  settings.headingItalic ? 'italic' : ''
                } ${settings.headingFont === 'lobster' ? 'font-lobster' : ''}`}
                style={{
                  fontSize: `${settings.headingFontSize || 36}px`,
                  color: settings.headingColor || '#1f2937',
                  fontFamily: settings.headingFont === 'poppins' ? 'Poppins' :
                              settings.headingFont === 'lobster' ? 'Lobster' :
                              settings.headingFont === 'serif' ? 'serif' :
                              'sans-serif'
                }}
              >
                {settings.headingEmojiPrefix && <span className="mr-2">{settings.headingEmojiPrefix}</span>}
                {settings.heading || 'Vad våra kunder säger'}
                {settings.headingEmojiSuffix && <span className="ml-2">{settings.headingEmojiSuffix}</span>}
              </h2>

              {subtitleTexts.length > 0 && subtitleTexts[0] && (
                <p
                  className={`${
                    settings.subtitlePlacement === 'inline' ? 'inline-block ml-2' : 'block mt-2'
                  } ${settings.subtitleBold ? 'font-bold' : ''} ${
                    settings.subtitleItalic ? 'italic' : ''
                  } ${settings.subtitleFont === 'lobster' ? 'font-lobster' : ''} transition-opacity duration-300`}
                  style={{
                    fontSize: `${settings.subtitleFontSize || 18}px`,
                    color: settings.subtitleColor || '#6b7280',
                    opacity: fadeIn ? 1 : 0,
                    fontFamily: settings.subtitleFont === 'poppins' ? 'Poppins' :
                                settings.subtitleFont === 'lobster' ? 'Lobster' :
                                settings.subtitleFont === 'serif' ? 'serif' :
                                'sans-serif'
                  }}
                >
                  {subtitleTexts[currentSubtitleIndex]}
                </p>
              )}
            </div>

            {(settings.introHeading || settings.introText) && (
              <div className="mb-8">
                {settings.introHeading && (
                  <h3
                    className={`mb-4 ${settings.introHeadingBold ? 'font-bold' : 'font-semibold'} ${
                      settings.introHeadingItalic ? 'italic' : ''
                    }`}
                    style={{
                      fontSize: `${settings.introHeadingSize || 24}px`,
                      textAlign: settings.introHeadingAlign || 'center',
                      fontFamily: settings.introHeadingFont === 'poppins' ? 'Poppins' :
                                  settings.introHeadingFont === 'lobster' ? 'Lobster' :
                                  settings.introHeadingFont === 'serif' ? 'serif' :
                                  'sans-serif'
                    }}
                  >
                    {settings.introHeading}
                  </h3>
                )}
                {settings.introText && (
                  <p
                    className={`${settings.introTextBold ? 'font-bold' : ''} ${
                      settings.introTextItalic ? 'italic' : ''
                    }`}
                    style={{
                      fontSize: `${settings.introTextSize || 16}px`,
                      textAlign: settings.introTextAlign || 'center',
                      fontFamily: settings.introTextFont === 'poppins' ? 'Poppins' :
                                  settings.introTextFont === 'lobster' ? 'Lobster' :
                                  settings.introTextFont === 'serif' ? 'serif' :
                                  'sans-serif'
                    }}
                  >
                    {settings.introText}
                  </p>
                )}
              </div>
            )}

            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${settings.testimonialsPerRow || 3}, 1fr)`
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id || index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center gap-4 mb-4">
                    {testimonial.image_url ? (
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      {testimonial.location && (
                        <p className="text-sm text-gray-600">{testimonial.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="fill-current"
                        style={{
                          width: `${settings.testimonialStarSize || 20}px`,
                          height: `${settings.testimonialStarSize || 20}px`,
                          color: i < testimonial.rating ? settings.testimonialStarColor || '#fbbf24' : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>

                  <p
                    className="text-gray-700"
                    style={{
                      fontFamily: settings.testimonialQuoteFont === 'poppins' ? 'Poppins' :
                                  settings.testimonialQuoteFont === 'lobster' ? 'Lobster' :
                                  settings.testimonialQuoteFont === 'serif' ? 'serif' :
                                  'sans-serif'
                    }}
                  >
                    {testimonial.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
