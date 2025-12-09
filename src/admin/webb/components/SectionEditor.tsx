import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AdminCard } from '../../components';
import ColorPicker from './ColorPicker';
import BildspelEditor from './BildspelEditor';
import HeroEditor from './HeroEditor';
import { Save, Loader } from 'lucide-react';

interface SectionEditorProps {
  slug: string;
  displayName: string;
}

interface SectionSettings {
  heading?: string;
  subheading?: string;
  description?: string;
  limit?: number;
  layoutType?: 'grid' | 'carousel' | 'hero';
  [key: string]: any;
}

interface SectionDesign {
  backgroundColor?: string;
  cardBackgroundColor?: string;
  headingColor?: string;
  textColor?: string;
  linkColor?: string;
}

interface SectionData {
  id: string;
  name: string;
  slug: string;
  settings: SectionSettings;
  design: SectionDesign;
  visible: boolean;
  visible_from: string | null;
  visible_to: string | null;
}

interface SectionConfig {
  supportsStandardContent: boolean;
  customPanels: React.ComponentType<any>[];
}

const sectionConfigs: Record<string, SectionConfig> = {
  bildspel: {
    supportsStandardContent: false,
    customPanels: [BildspelEditor],
  },
  hero: {
    supportsStandardContent: false,
    customPanels: [HeroEditor],
  },
}

export default function SectionEditor({ slug, displayName }: SectionEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [section, setSection] = useState<SectionData | null>(null);

  const [settings, setSettings] = useState<SectionSettings>({});
  const [design, setDesign] = useState<SectionDesign>({});
  const [visible, setVisible] = useState(true);
  const [visibleFrom, setVisibleFrom] = useState<string>('');
  const [visibleTo, setVisibleTo] = useState<string>('');

  const config = sectionConfigs[slug] || { supportsStandardContent: true, customPanels: [] };

  useEffect(() => {
    fetchSection();
  }, [slug]);

  const fetchSection = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_sections')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        console.log('SectionEditor loaded', slug, data);
        setSection(data);
        setSettings(data.settings || {});
        setDesign(data.design || {});
        setVisible(data.visible);
        setVisibleFrom(data.visible_from || '');
        setVisibleTo(data.visible_to || '');
      } else {
        setError('Sektionen hittades inte i databasen.');
      }
    } catch (err) {
      console.error('Error fetching section:', err);
      setError('Kunde inte hämta sektionsdata.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!section) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const updates = {
        settings,
        design,
        visible,
        visible_from: visibleFrom || null,
        visible_to: visibleTo || null,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('site_sections')
        .update(updates)
        .eq('id', section.id);

      if (updateError) throw updateError;

      if (slug === 'bildspel') {
        console.log('Bildspel settings', settings);
      }

      setSuccessMessage('Sektionen har sparats!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving section:', err);
      setError('Kunde inte spara sektionen. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (key: keyof SectionSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateDesign = (key: keyof SectionDesign, value: any) => {
    setDesign((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminCard>
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-[#a1c798]" />
          <span className="ml-3 text-gray-600">Laddar sektion...</span>
        </div>
      </AdminCard>
    );
  }

  if (error && !section) {
    return (
      <AdminCard>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
          <p className="text-gray-600">
            Sektion-editor enligt webeditor.md (första versionen)
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm font-medium text-gray-700">
            Visa sektion på startsidan
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#a1c798] transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {config.customPanels.length > 0 && config.customPanels.map((CustomPanel, idx) => (
        <CustomPanel
          key={idx}
          settings={settings}
          onSettingsChange={setSettings}
        />
      ))}

      {config.supportsStandardContent && (
        <AdminCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Innehållsinställningar
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rubrik
              </label>
              <input
                type="text"
                value={settings.heading || ''}
                onChange={(e) => updateSettings('heading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                placeholder="T.ex. Välkommen till The Kitchen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Underrubrik
              </label>
              <input
                type="text"
                value={settings.subheading || ''}
                onChange={(e) => updateSettings('subheading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                placeholder="Valfri underrubrik"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beskrivning
              </label>
              <textarea
                value={settings.description || ''}
                onChange={(e) => updateSettings('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                placeholder="Beskrivning av sektionen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Antal objekt
              </label>
              <input
                type="number"
                value={settings.limit || 0}
                onChange={(e) => updateSettings('limit', parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout-typ
              </label>
              <select
                value={settings.layoutType || 'grid'}
                onChange={(e) => updateSettings('layoutType', e.target.value as 'grid' | 'carousel' | 'hero')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
                <option value="hero">Hero</option>
              </select>
            </div>
          </div>
        </AdminCard>
      )}

      {slug !== 'bildspel' && (
        <AdminCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Design & färger
          </h3>
          <div className="space-y-6">
            <ColorPicker
              label="Bakgrundsfärg"
              value={design.backgroundColor}
              onChange={(color) => updateDesign('backgroundColor', color)}
            />

            <ColorPicker
              label="Kort-bakgrundsfärg"
              value={design.cardBackgroundColor}
              onChange={(color) => updateDesign('cardBackgroundColor', color)}
            />

            <ColorPicker
              label="Rubrikfärg"
              value={design.headingColor}
              onChange={(color) => updateDesign('headingColor', color)}
            />

            <ColorPicker
              label="Textfärg"
              value={design.textColor}
              onChange={(color) => updateDesign('textColor', color)}
            />

            <ColorPicker
              label="Länkfärg"
              value={design.linkColor}
              onChange={(color) => updateDesign('linkColor', color)}
            />
          </div>
        </AdminCard>
      )}

      <AdminCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Synlighet & planering
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Synlig från (valfritt)
            </label>
            <input
              type="datetime-local"
              value={visibleFrom}
              onChange={(e) => setVisibleFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Synlig till (valfritt)
            </label>
            <input
              type="datetime-local"
              value={visibleTo}
              onChange={(e) => setVisibleTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>
        </div>
      </AdminCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#56c5c5] text-white rounded-lg hover:bg-[#45b4b4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Sparar...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Spara sektion
            </>
          )}
        </button>
      </div>
    </div>
  );
}
