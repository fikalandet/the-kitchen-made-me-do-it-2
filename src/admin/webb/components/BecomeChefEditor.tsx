import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, ChevronUp } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import IconPicker, { ICONS } from './IconPicker';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface BecomeChefBenefit {
  id: string;
  icon_key: string;
  text: string;
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
  contentBox?: {
    bgColor?: string;
    width?: number;
    height?: number;
    opacity?: number;
    borderRadius?: number;
  };
  innerTitle?: string;
  innerTitleFont?: string;
  innerTitleBold?: boolean;
  innerTitleSize?: number;
  innerTitleColor?: string;
  innerTitleAlignment?: 'left' | 'center' | 'right';
  description?: string;
  descriptionFont?: string;
  descriptionBold?: boolean;
  descriptionSize?: number;
  descriptionColor?: string;
  descriptionAlignment?: 'left' | 'center' | 'right';
  titleDescriptionGap?: number;
  image?: {
    url?: string;
    position?: 'none' | 'left' | 'right';
    hasBorder?: boolean;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: 'small' | 'large';
  };
  cta?: {
    label?: string;
    linkType?: 'internal' | 'external';
    internalRoute?: string;
    externalUrl?: string;
    bgColor?: string;
    textColor?: string;
    font?: string;
    bold?: boolean;
    italic?: boolean;
    uppercase?: boolean;
    size?: number;
    centered?: boolean;
  };
  benefits?: BecomeChefBenefit[];
  benefitsPerRow?: number;
}

interface BecomeChefEditorProps {
  settings: BecomeChefSettings;
  onSettingsChange: (settings: BecomeChefSettings) => void;
}

export default function BecomeChefEditor({ settings, onSettingsChange }: BecomeChefEditorProps) {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [expandedBenefitId, setExpandedBenefitId] = useState<string | null>(null);

  const updateSetting = (key: keyof BecomeChefSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateNestedSetting = (parent: 'contentBox' | 'image' | 'cta', key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [parent]: {
        ...(settings[parent] || {}),
        [key]: value
      }
    });
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

      updateNestedSetting('image', 'url', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const addBenefit = () => {
    const benefits = settings.benefits || [];
    if (benefits.length >= 8) return;
    const newBenefit: BecomeChefBenefit = {
      id: `benefit-${Date.now()}`,
      icon_key: '',
      text: ''
    };
    updateSetting('benefits', [...benefits, newBenefit]);
  };

  const removeBenefit = (id: string) => {
    const benefits = settings.benefits || [];
    updateSetting('benefits', benefits.filter(b => b.id !== id));
  };

  const updateBenefit = (id: string, key: keyof BecomeChefBenefit, value: any) => {
    const benefits = settings.benefits || [];
    const newBenefits = benefits.map(b => b.id === id ? { ...b, [key]: value } : b);
    updateSetting('benefits', newBenefits);
  };

  const toggleBenefitExpansion = (benefitId: string) => {
    setExpandedBenefitId(expandedBenefitId === benefitId ? null : benefitId);
  };

  const subtitleTexts = settings.subtitleTexts || [''];
  const contentBox = settings.contentBox || {};
  const image = settings.image || {};
  const cta = settings.cta || {};
  const benefits = settings.benefits || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bli en Kitchen-kock</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Bli en Kitchen-kock-sektionen</p>
        </div>
      </div>

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <ColorPicker
          label="Bakgrundsfärg för hela sektionen"
          value={settings.backgroundColor || '#a1c798'}
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
                Efter rubrik
              </button>
              <button
                onClick={() => updateSetting('subtitlePlacement', 'below')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.subtitlePlacement === 'below'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Under rubrik
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

      <CollapsibleCard title="Innehåll" defaultExpanded={true}>
        <div className="space-y-6">
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Bakgrundskort</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bredd (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={contentBox.width || 100}
                  onChange={(e) => updateNestedSetting('contentBox', 'width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rundade hörn (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={contentBox.borderRadius || 16}
                  onChange={(e) => updateNestedSetting('contentBox', 'borderRadius', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <ColorPicker
              label="Bakgrundsfärg"
              value={contentBox.bgColor || '#f6f2e0'}
              onChange={(color) => updateNestedSetting('contentBox', 'bgColor', color)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacity ({contentBox.opacity || 100}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={contentBox.opacity || 100}
                onChange={(e) => updateNestedSetting('contentBox', 'opacity', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Text</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rubrik i kortet
              </label>
              <input
                type="text"
                value={settings.innerTitle || ''}
                onChange={(e) => updateSetting('innerTitle', e.target.value)}
                placeholder="Bli en del av vår community"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubrik – Typsnitt
                </label>
                <select
                  value={settings.innerTitleFont || 'lobster'}
                  onChange={(e) => updateSetting('innerTitleFont', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="lobster">Lobster</option>
                  <option value="sans">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="poppins">Poppins</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubrik – Storlek (px)
                </label>
                <input
                  type="number"
                  min="18"
                  max="48"
                  value={settings.innerTitleSize || 32}
                  onChange={(e) => updateSetting('innerTitleSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.innerTitleBold || false}
                  onChange={(e) => updateSetting('innerTitleBold', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Rubrik – Fet stil</span>
              </label>
            </div>

            <ColorPicker
              label="Rubrik – Textfärg"
              value={settings.innerTitleColor || '#374151'}
              onChange={(color) => updateSetting('innerTitleColor', color)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rubrik – Placering
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateSetting('innerTitleAlignment', 'left')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    settings.innerTitleAlignment === 'left' || !settings.innerTitleAlignment
                      ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Vänster
                </button>
                <button
                  onClick={() => updateSetting('innerTitleAlignment', 'center')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    settings.innerTitleAlignment === 'center'
                      ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Centrerad
                </button>
                <button
                  onClick={() => updateSetting('innerTitleAlignment', 'right')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    settings.innerTitleAlignment === 'right'
                      ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Höger
                </button>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivningstext
                </label>
                <textarea
                  value={settings.description || ''}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  placeholder="Dela din passion för matlagning och tjäna pengar på det du älskar..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning – Typsnitt
                  </label>
                  <select
                    value={settings.descriptionFont || 'sans'}
                    onChange={(e) => updateSetting('descriptionFont', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="lobster">Lobster</option>
                    <option value="sans">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="poppins">Poppins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning – Storlek (px)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="32"
                    value={settings.descriptionSize || 18}
                    onChange={(e) => updateSetting('descriptionSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.descriptionBold || false}
                    onChange={(e) => updateSetting('descriptionBold', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Beskrivning – Fet stil</span>
                </label>
              </div>

              <ColorPicker
                label="Beskrivning – Textfärg"
                value={settings.descriptionColor || '#374151'}
                onChange={(color) => updateSetting('descriptionColor', color)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivning – Placering
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('descriptionAlignment', 'left')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.descriptionAlignment === 'left' || !settings.descriptionAlignment
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Vänster
                  </button>
                  <button
                    onClick={() => updateSetting('descriptionAlignment', 'center')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.descriptionAlignment === 'center'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Centrerad
                  </button>
                  <button
                    onClick={() => updateSetting('descriptionAlignment', 'right')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.descriptionAlignment === 'right'
                        ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Höger
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avstånd mellan rubrik och text ({settings.titleDescriptionGap || 24}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.titleDescriptionGap || 24}
                  onChange={(e) => updateSetting('titleDescriptionGap', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Bild</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bild
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
                {image.url && (
                  <button
                    onClick={() => updateNestedSetting('image', 'url', '')}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                )}
              </div>
              {image.url && (
                <div className="mt-2">
                  <img
                    src={image.url}
                    alt="Preview"
                    className="w-full max-w-xs rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placering
              </label>
              <select
                value={image.position || 'none'}
                onChange={(e) => updateNestedSetting('image', 'position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="none">Ingen bild</option>
                <option value="left">Bild vänster</option>
                <option value="right">Bild höger</option>
              </select>
            </div>

            {image.position !== 'none' && (
              <>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={image.hasBorder || false}
                      onChange={(e) => updateNestedSetting('image', 'hasBorder', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Visa ram</span>
                  </label>
                </div>

                {image.hasBorder && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ramens rundning
                      </label>
                      <select
                        value={image.borderRadius || 'small'}
                        onChange={(e) => updateNestedSetting('image', 'borderRadius', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="small">Lite rundad</option>
                        <option value="large">Mycket rundad</option>
                      </select>
                    </div>

                    <ColorPicker
                      label="Ramfärg"
                      value={image.borderColor || '#56c5c5'}
                      onChange={(color) => updateNestedSetting('image', 'borderColor', color)}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ramtjocklek (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={image.borderWidth || 4}
                        onChange={(e) => updateNestedSetting('image', 'borderWidth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Knappar" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Knapptext
            </label>
            <input
              type="text"
              value={cta.label || ''}
              onChange={(e) => updateNestedSetting('cta', 'label', e.target.value)}
              placeholder="Ansök nu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Länktyp
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateNestedSetting('cta', 'linkType', 'internal')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  cta.linkType === 'internal' || !cta.linkType
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Intern sida
              </button>
              <button
                onClick={() => updateNestedSetting('cta', 'linkType', 'external')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  cta.linkType === 'external'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Extern länk
              </button>
            </div>
          </div>

          {(cta.linkType === 'internal' || !cta.linkType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intern sida
              </label>
              <select
                value={cta.internalRoute || ''}
                onChange={(e) => updateNestedSetting('cta', 'internalRoute', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Välj sida...</option>
                <option value="/bli-kock">Bli kock</option>
                <option value="/marknadsplats">Marknadsplats</option>
                <option value="/medlemskap">Medlemskap</option>
                <option value="/gyllene-skedar">Gyllene Skedar</option>
              </select>
            </div>
          )}

          {cta.linkType === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extern URL
              </label>
              <input
                type="url"
                value={cta.externalUrl || ''}
                onChange={(e) => updateNestedSetting('cta', 'externalUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cta.centered || false}
                onChange={(e) => updateNestedSetting('cta', 'centered', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Centrera knapp</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              label="Knappfärg"
              value={cta.bgColor || '#56c5c5'}
              onChange={(color) => updateNestedSetting('cta', 'bgColor', color)}
            />

            <ColorPicker
              label="Textfärg"
              value={cta.textColor || '#ffffff'}
              onChange={(color) => updateNestedSetting('cta', 'textColor', color)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typsnitt
              </label>
              <select
                value={cta.font || 'sans'}
                onChange={(e) => updateNestedSetting('cta', 'font', e.target.value)}
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
                max="24"
                value={cta.size || 16}
                onChange={(e) => updateNestedSetting('cta', 'size', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cta.bold || false}
                onChange={(e) => updateNestedSetting('cta', 'bold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet stil</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cta.italic || false}
                onChange={(e) => updateNestedSetting('cta', 'italic', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kursiv</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cta.uppercase || false}
                onChange={(e) => updateNestedSetting('cta', 'uppercase', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Versaler</span>
            </label>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Fördelar" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antal i rad
            </label>
            <select
              value={settings.benefitsPerRow || 3}
              onChange={(e) => updateSetting('benefitsPerRow', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Fördelar (max 8)
              </label>
              <button
                onClick={addBenefit}
                disabled={benefits.length >= 8}
                className={`flex items-center gap-1 px-3 py-1 text-white text-sm rounded-lg transition-colors ${
                  benefits.length >= 8
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#56c5c5] hover:bg-[#45b4b4]'
                }`}
              >
                <Plus className="w-4 h-4" />
                Lägg till fördel
              </button>
            </div>

            {benefits.length > 0 && (
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Översikt – Alla fördelar</h4>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {benefits.map((benefit, index) => {
                    const iconData = ICONS.find(i => i.key === benefit.icon_key);
                    const IconComponent = iconData?.icon;

                    return (
                      <button
                        key={benefit.id}
                        onClick={() => toggleBenefitExpansion(benefit.id)}
                        className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-center p-2 border-2 cursor-pointer transition-all ${
                          expandedBenefitId === benefit.id
                            ? 'border-[#56c5c5] bg-[#56c5c5]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {IconComponent ? (
                          <IconComponent className="w-8 h-8 text-gray-700 mb-1" />
                        ) : (
                          <div className="w-8 h-8 mb-1 flex items-center justify-center text-gray-400">?</div>
                        )}
                        <div className="text-xs font-medium text-gray-800 line-clamp-2">
                          {benefit.text ? benefit.text.substring(0, 20) : `Fördel ${index + 1}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {expandedBenefitId && benefits.map((benefit, index) =>
              benefit.id === expandedBenefitId ? (
                <div key={benefit.id} className="p-6 border-2 border-[#56c5c5] rounded-lg bg-[#56c5c5]/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Redigera Fördel {index + 1}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeBenefit(benefit.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedBenefitId(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-white rounded-lg">
                    <IconPicker
                      label="Ikon"
                      value={benefit.icon_key}
                      onChange={(iconKey) => updateBenefit(benefit.id, 'icon_key', iconKey)}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text
                      </label>
                      <textarea
                        value={benefit.text}
                        onChange={(e) => updateBenefit(benefit.id, 'text', e.target.value)}
                        placeholder="Beskriv fördelen..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={true}>
        <div
          className="p-8 rounded-lg"
          style={{ backgroundColor: settings.backgroundColor || '#a1c798' }}
        >
          <div className={`mb-6 ${settings.headingAlignment === 'center' ? 'text-center' : 'text-left'}`}>
            {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
              <div className={`flex items-center gap-3 mb-4 ${settings.headingAlignment === 'center' ? 'justify-center' : ''}`}>
                <h2
                  className={`text-3xl ${
                    settings.headingFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.headingBold ? 'font-bold' : ''}`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.heading || 'Bli en Kitchen-kock'}
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
                  {settings.heading || 'Bli en Kitchen-kock'}
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

          <div className="mx-auto" style={{ maxWidth: `${contentBox.width || 100}%` }}>
            <div
              className="p-12 shadow-lg"
              style={{
                backgroundColor: contentBox.bgColor || '#f6f2e0',
                opacity: (contentBox.opacity || 100) / 100,
                borderRadius: `${contentBox.borderRadius || 16}px`
              }}
            >
              {settings.innerTitle && (
                <h3
                  className={`mb-6 ${
                    settings.innerTitleFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.innerTitleBold ? 'font-bold' : ''}`}
                  style={{
                    fontSize: `${settings.innerTitleSize || 32}px`,
                    fontFamily: settings.innerTitleFont === 'serif' ? 'serif' : settings.innerTitleFont === 'sans' ? 'sans-serif' : undefined,
                    color: settings.innerTitleColor || '#374151'
                  }}
                >
                  {settings.innerTitle}
                </h3>
              )}

              <div className={image.position !== 'none' && image.url ? 'grid grid-cols-2 gap-8 items-center' : ''}>
                {image.position === 'left' && image.url && (
                  <div>
                    <img
                      src={image.url}
                      alt="Preview"
                      className="w-full"
                      style={{
                        border: image.hasBorder ? `${image.borderWidth || 4}px solid ${image.borderColor || '#56c5c5'}` : 'none',
                        borderRadius: image.hasBorder ? (image.borderRadius === 'large' ? '24px' : '12px') : '0'
                      }}
                    />
                  </div>
                )}

                <div className={image.position === 'none' || !image.url ? 'text-center' : ''}>
                  {settings.description && (
                    <p
                      className="mb-8"
                      style={{
                        fontSize: `${settings.descriptionSize || 18}px`,
                        fontFamily: settings.descriptionFont === 'serif' ? 'serif' : settings.descriptionFont === 'lobster' ? 'Lobster' : 'sans-serif',
                        fontWeight: settings.descriptionBold ? 'bold' : 'normal',
                        color: settings.descriptionColor || '#374151'
                      }}
                    >
                      {settings.description}
                    </p>
                  )}

                  {cta.label && (
                    <button
                      className="px-8 py-3 rounded-full transition-all hover:opacity-90 inline-block"
                      style={{
                        backgroundColor: cta.bgColor || '#56c5c5',
                        color: cta.textColor || '#ffffff',
                        fontSize: `${cta.size || 16}px`,
                        fontFamily: cta.font === 'serif' ? 'serif' : cta.font === 'lobster' ? 'Lobster' : 'sans-serif',
                        fontWeight: cta.bold ? 'bold' : 'normal',
                        fontStyle: cta.italic ? 'italic' : 'normal',
                        textTransform: cta.uppercase ? 'uppercase' : 'none'
                      }}
                    >
                      {cta.label}
                    </button>
                  )}
                </div>

                {image.position === 'right' && image.url && (
                  <div>
                    <img
                      src={image.url}
                      alt="Preview"
                      className="w-full"
                      style={{
                        border: image.hasBorder ? `${image.borderWidth || 4}px solid ${image.borderColor || '#56c5c5'}` : 'none',
                        borderRadius: image.hasBorder ? (image.borderRadius === 'large' ? '24px' : '12px') : '0'
                      }}
                    />
                  </div>
                )}
              </div>

              {benefits.length > 0 && (
                <div
                  className={`grid gap-6 mt-12`}
                  style={{
                    gridTemplateColumns: `repeat(${settings.benefitsPerRow || 3}, 1fr)`
                  }}
                >
                  {benefits.map((benefit) => {
                    const iconData = ICONS.find(i => i.key === benefit.icon_key);
                    const IconComponent = iconData?.icon;

                    return (
                      <div key={benefit.id} className="text-center">
                        {IconComponent ? (
                          <IconComponent className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                        ) : (
                          <div className="w-12 h-12 mx-auto mb-3" />
                        )}
                        <p className="text-sm text-gray-700">{benefit.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
