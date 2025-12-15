import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard, AdminButton } from '../../components';
import { ArrowLeft, Save, Eye, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ImageUpload } from '../../components/ImageUpload';
import CollapsibleCard from '../components/CollapsibleCard';
import ColorPicker from '../components/ColorPicker';

interface AboutPageData {
  id?: string;
  background_type: string;
  background_color: string;
  background_image: string | null;
  title_text: string;
  title_font: string;
  title_weight: string;
  title_size: string;
  title_color: string;
  title_align: string;
  tagline_text: string | null;
  ingress_text: string | null;
  hero_image: string | null;
  hero_image_position: string;
  container_mode: string;
}

interface AboutPageRow {
  id?: string;
  row_order: number;
  row_title: string;
  row_text: string;
  row_image: string | null;
  image_shape: string;
  image_border: boolean;
  image_border_color: string;
  row_layout: string;
}

interface SectionSettings {
  id?: string;
  section_key: string;
  section_title: string;
  section_tagline: string | null;
  section_ingress: string | null;
  show_section: boolean;
  title_font: string;
  title_size: string;
  title_color: string;
  title_align: string;
}

interface HeroCard {
  id?: string;
  card_order: number;
  settings: any;
}

export default function AboutUsEditor() {
  const [aboutPage, setAboutPage] = useState<AboutPageData>({
    background_type: 'color',
    background_color: '#f6f2e0',
    background_image: null,
    title_text: 'Om oss',
    title_font: 'lobster',
    title_weight: 'bold',
    title_size: '2xl',
    title_color: '#000000',
    title_align: 'center',
    tagline_text: null,
    ingress_text: null,
    hero_image: null,
    hero_image_position: 'below_title',
    container_mode: 'contained'
  });

  const [rows, setRows] = useState<AboutPageRow[]>([]);
  const [valuesSettings, setValuesSettings] = useState<SectionSettings>({
    section_key: 'values',
    section_title: 'Våra värderingar',
    section_tagline: null,
    section_ingress: null,
    show_section: true,
    title_font: 'lobster',
    title_size: 'xl',
    title_color: '#000000',
    title_align: 'center'
  });
  const [valuesCards, setValuesCards] = useState<HeroCard[]>([]);
  const [discoverSettings, setDiscoverSettings] = useState<SectionSettings>({
    section_key: 'discover',
    section_title: 'Upptäck The Kitchen',
    section_tagline: null,
    section_ingress: null,
    show_section: true,
    title_font: 'lobster',
    title_size: 'xl',
    title_color: '#000000',
    title_align: 'center'
  });
  const [discoverCards, setDiscoverCards] = useState<HeroCard[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [expandedValuesCard, setExpandedValuesCard] = useState<number | null>(null);
  const [expandedDiscoverCard, setExpandedDiscoverCard] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aboutRes, rowsRes, valuesSettingsRes, valuesCardsRes, discoverSettingsRes, discoverCardsRes] = await Promise.all([
        supabase.from('about_page').select('*').maybeSingle(),
        supabase.from('about_page_rows').select('*').order('row_order'),
        supabase.from('about_page_sections_settings').select('*').eq('section_key', 'values').maybeSingle(),
        supabase.from('about_page_values_cards').select('*').order('card_order'),
        supabase.from('about_page_sections_settings').select('*').eq('section_key', 'discover').maybeSingle(),
        supabase.from('about_page_discover_cards').select('*').order('card_order')
      ]);

      if (aboutRes.data) setAboutPage(aboutRes.data);
      if (rowsRes.data) setRows(rowsRes.data);
      if (valuesSettingsRes.data) setValuesSettings(valuesSettingsRes.data);
      if (valuesCardsRes.data) setValuesCards(valuesCardsRes.data);
      if (discoverSettingsRes.data) setDiscoverSettings(discoverSettingsRes.data);
      if (discoverCardsRes.data) setDiscoverCards(discoverCardsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (aboutPage.id) {
        await supabase.from('about_page').update(aboutPage).eq('id', aboutPage.id);
      } else {
        await supabase.from('about_page').insert([aboutPage]);
      }

      for (const row of rows) {
        if (row.id) {
          await supabase.from('about_page_rows').update(row).eq('id', row.id);
        } else {
          await supabase.from('about_page_rows').insert([row]);
        }
      }

      if (valuesSettings.id) {
        await supabase.from('about_page_sections_settings').update(valuesSettings).eq('id', valuesSettings.id);
      } else {
        await supabase.from('about_page_sections_settings').insert([valuesSettings]);
      }

      for (const card of valuesCards) {
        if (card.id) {
          await supabase.from('about_page_values_cards').update(card).eq('id', card.id);
        } else {
          await supabase.from('about_page_values_cards').insert([card]);
        }
      }

      if (discoverSettings.id) {
        await supabase.from('about_page_sections_settings').update(discoverSettings).eq('id', discoverSettings.id);
      } else {
        await supabase.from('about_page_sections_settings').insert([discoverSettings]);
      }

      for (const card of discoverCards) {
        if (card.id) {
          await supabase.from('about_page_discover_cards').update(card).eq('id', card.id);
        } else {
          await supabase.from('about_page_discover_cards').insert([card]);
        }
      }

      alert('Ändringar sparade!');
      await fetchData();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Ett fel uppstod när sidan skulle sparas');
    } finally {
      setSaving(false);
    }
  };

  const addValuesCard = () => {
    const newCard: HeroCard = {
      card_order: valuesCards.length + 1,
      settings: {
        id: `values-${Date.now()}`,
        heading: '',
        text: '',
        imageUrl: '',
        imageAlt: '',
        cardBackgroundColor: '#ffffff',
        headingStyle: { fontFamily: 'lobster', fontSize: 'lg', bold: true, textColor: '#000000', textAlign: 'center' },
        textStyle: { fontFamily: 'poppins', fontSize: 'md', textColor: '#000000', textAlign: 'center' },
        horizontalPosition: 'center',
        verticalPosition: 'center'
      }
    };
    setValuesCards([...valuesCards, newCard]);
  };

  const deleteValuesCard = async (cardOrder: number) => {
    const card = valuesCards.find(c => c.card_order === cardOrder);
    if (card?.id) {
      await supabase.from('about_page_values_cards').delete().eq('id', card.id);
    }
    setValuesCards(valuesCards.filter(c => c.card_order !== cardOrder).map((c, idx) => ({ ...c, card_order: idx + 1 })));
  };

  const addDiscoverCard = () => {
    const newCard: HeroCard = {
      card_order: discoverCards.length + 1,
      settings: {
        id: `discover-${Date.now()}`,
        heading: '',
        text: '',
        imageUrl: '',
        imageAlt: '',
        cardBackgroundColor: '#ffffff',
        headingStyle: { fontFamily: 'lobster', fontSize: 'lg', bold: true, textColor: '#000000', textAlign: 'center' },
        textStyle: { fontFamily: 'poppins', fontSize: 'md', textColor: '#000000', textAlign: 'center' },
        ctaLabel: '',
        ctaUrl: '',
        ctaLinkType: 'internal',
        horizontalPosition: 'center',
        verticalPosition: 'center'
      }
    };
    setDiscoverCards([...discoverCards, newCard]);
  };

  const deleteDiscoverCard = async (cardOrder: number) => {
    const card = discoverCards.find(c => c.card_order === cardOrder);
    if (card?.id) {
      await supabase.from('about_page_discover_cards').delete().eq('id', card.id);
    }
    setDiscoverCards(discoverCards.filter(c => c.card_order !== cardOrder).map((c, idx) => ({ ...c, card_order: idx + 1 })));
  };

  if (loading) {
    return <div>Laddar...</div>;
  }

  return (
    <div>
      <Link
        to="/admin/webb/sidor"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Tillbaka till sidor
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Redigera: Om oss</h2>
          <p className="text-gray-600 text-sm">Slug: /om-oss</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/om-oss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Förhandsgranska
          </a>
          <AdminButton onClick={handleSave} disabled={saving} icon={<Save className="w-4 h-4" />}>
            {saving ? 'Sparar...' : 'Spara'}
          </AdminButton>
        </div>
      </div>

      <div className="space-y-6">
        <AdminCard title="Toppsektion">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bakgrundstyp</label>
              <select
                value={aboutPage.background_type}
                onChange={(e) => setAboutPage({ ...aboutPage, background_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="color">Färg</option>
                <option value="image">Bild</option>
              </select>
            </div>

            {aboutPage.background_type === 'color' ? (
              <ColorPicker
                label="Bakgrundsfärg"
                value={aboutPage.background_color}
                onChange={(color) => setAboutPage({ ...aboutPage, background_color: color })}
              />
            ) : (
              <ImageUpload
                label="Bakgrundsbild"
                value={aboutPage.background_image}
                onChange={(url) => setAboutPage({ ...aboutPage, background_image: url })}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
              <input
                type="text"
                value={aboutPage.title_text}
                onChange={(e) => setAboutPage({ ...aboutPage, title_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={aboutPage.title_font}
                  onChange={(e) => setAboutPage({ ...aboutPage, title_font: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="lobster">Lobster</option>
                  <option value="poppins">Poppins</option>
                  <option value="roboto">Roboto</option>
                  <option value="playfair">Playfair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                <select
                  value={aboutPage.title_size}
                  onChange={(e) => setAboutPage({ ...aboutPage, title_size: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="sm">S</option>
                  <option value="md">M</option>
                  <option value="lg">L</option>
                  <option value="xl">XL</option>
                  <option value="2xl">2XL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Textfärg"
                value={aboutPage.title_color}
                onChange={(color) => setAboutPage({ ...aboutPage, title_color: color })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                <select
                  value={aboutPage.title_align}
                  onChange={(e) => setAboutPage({ ...aboutPage, title_align: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Vänster</option>
                  <option value="center">Centrerad</option>
                  <option value="right">Höger</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Textrad</label>
              <input
                type="text"
                value={aboutPage.tagline_text || ''}
                onChange={(e) => setAboutPage({ ...aboutPage, tagline_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingress</label>
              <textarea
                value={aboutPage.ingress_text || ''}
                onChange={(e) => setAboutPage({ ...aboutPage, ingress_text: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <ImageUpload
              label="Hero-bild"
              value={aboutPage.hero_image}
              onChange={(url) => setAboutPage({ ...aboutPage, hero_image: url })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bildplacering</label>
              <select
                value={aboutPage.hero_image_position}
                onChange={(e) => setAboutPage({ ...aboutPage, hero_image_position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="above_title">Över rubrik</option>
                <option value="below_title">Under rubrik</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Container-läge</label>
              <select
                value={aboutPage.container_mode}
                onChange={(e) => setAboutPage({ ...aboutPage, container_mode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="contained">Contained</option>
                <option value="full-width">Full bredd</option>
              </select>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="2-kolumnersblock (3 rader)">
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.row_order} className="border border-gray-200 rounded-lg p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === row.row_order ? null : row.row_order)}
                >
                  <h3 className="font-medium text-gray-900">Rad {row.row_order}</h3>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedRow === row.row_order ? 'rotate-180' : ''}`} />
                </div>

                {expandedRow === row.row_order && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                      <input
                        type="text"
                        value={row.row_title}
                        onChange={(e) => {
                          const updated = rows.map(r => r.row_order === row.row_order ? { ...r, row_title: e.target.value } : r);
                          setRows(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                      <textarea
                        value={row.row_text}
                        onChange={(e) => {
                          const updated = rows.map(r => r.row_order === row.row_order ? { ...r, row_text: e.target.value } : r);
                          setRows(updated);
                        }}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <ImageUpload
                      label="Bild"
                      value={row.row_image}
                      onChange={(url) => {
                        const updated = rows.map(r => r.row_order === row.row_order ? { ...r, row_image: url } : r);
                        setRows(updated);
                      }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bildform</label>
                        <select
                          value={row.image_shape}
                          onChange={(e) => {
                            const updated = rows.map(r => r.row_order === row.row_order ? { ...r, image_shape: e.target.value } : r);
                            setRows(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="rounded">Rundade hörn</option>
                          <option value="circle">Rund</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 mt-8">
                          <input
                            type="checkbox"
                            checked={row.image_border}
                            onChange={(e) => {
                              const updated = rows.map(r => r.row_order === row.row_order ? { ...r, image_border: e.target.checked } : r);
                              setRows(updated);
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-medium text-gray-700">Visa ram</span>
                        </label>
                      </div>
                    </div>

                    {row.image_border && (
                      <ColorPicker
                        label="Ramfärg"
                        value={row.image_border_color}
                        onChange={(color) => {
                          const updated = rows.map(r => r.row_order === row.row_order ? { ...r, image_border_color: color } : r);
                          setRows(updated);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title='Sektion: "Våra värderingar"'>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={valuesSettings.show_section}
                onChange={(e) => setValuesSettings({ ...valuesSettings, show_section: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Visa sektion</span>
            </label>

            {valuesSettings.show_section && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sektionsrubrik</label>
                  <input
                    type="text"
                    value={valuesSettings.section_title}
                    onChange={(e) => setValuesSettings({ ...valuesSettings, section_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Textrad</label>
                  <input
                    type="text"
                    value={valuesSettings.section_tagline || ''}
                    onChange={(e) => setValuesSettings({ ...valuesSettings, section_tagline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingress</label>
                  <textarea
                    value={valuesSettings.section_ingress || ''}
                    onChange={(e) => setValuesSettings({ ...valuesSettings, section_ingress: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Hero-kort ({valuesCards.length})</h3>
                    <button
                      onClick={addValuesCard}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Lägg till kort
                    </button>
                  </div>

                  <div className="space-y-4">
                    {valuesCards.map((card) => (
                      <div key={card.card_order} className="border border-gray-200 rounded-lg p-4">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedValuesCard(expandedValuesCard === card.card_order ? null : card.card_order)}
                        >
                          <h4 className="font-medium text-gray-900">Kort {card.card_order}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteValuesCard(card.card_order);
                              }}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronDown className={`w-5 h-5 transition-transform ${expandedValuesCard === card.card_order ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {expandedValuesCard === card.card_order && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                              <input
                                type="text"
                                value={card.settings.heading || ''}
                                onChange={(e) => {
                                  const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, heading: e.target.value } } : c);
                                  setValuesCards(updated);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                              <textarea
                                value={card.settings.text || ''}
                                onChange={(e) => {
                                  const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, text: e.target.value } } : c);
                                  setValuesCards(updated);
                                }}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>

                            <ImageUpload
                              label="Bild"
                              value={card.settings.imageUrl}
                              onChange={(url) => {
                                const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, imageUrl: url } } : c);
                                setValuesCards(updated);
                              }}
                            />

                            <ColorPicker
                              label="Bakgrundsfärg"
                              value={card.settings.cardBackgroundColor || '#ffffff'}
                              onChange={(color) => {
                                const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, cardBackgroundColor: color } } : c);
                                setValuesCards(updated);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </AdminCard>

        <AdminCard title='Sektion: "Upptäck The Kitchen"'>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={discoverSettings.show_section}
                onChange={(e) => setDiscoverSettings({ ...discoverSettings, show_section: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Visa sektion</span>
            </label>

            {discoverSettings.show_section && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sektionsrubrik</label>
                  <input
                    type="text"
                    value={discoverSettings.section_title}
                    onChange={(e) => setDiscoverSettings({ ...discoverSettings, section_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Textrad</label>
                  <input
                    type="text"
                    value={discoverSettings.section_tagline || ''}
                    onChange={(e) => setDiscoverSettings({ ...discoverSettings, section_tagline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingress</label>
                  <textarea
                    value={discoverSettings.section_ingress || ''}
                    onChange={(e) => setDiscoverSettings({ ...discoverSettings, section_ingress: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Hero-kort ({discoverCards.length})</h3>
                    <button
                      onClick={addDiscoverCard}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Lägg till kort
                    </button>
                  </div>

                  <div className="space-y-4">
                    {discoverCards.map((card) => (
                      <div key={card.card_order} className="border border-gray-200 rounded-lg p-4">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedDiscoverCard(expandedDiscoverCard === card.card_order ? null : card.card_order)}
                        >
                          <h4 className="font-medium text-gray-900">Kort {card.card_order}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDiscoverCard(card.card_order);
                              }}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronDown className={`w-5 h-5 transition-transform ${expandedDiscoverCard === card.card_order ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {expandedDiscoverCard === card.card_order && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                              <input
                                type="text"
                                value={card.settings.heading || ''}
                                onChange={(e) => {
                                  const updated = discoverCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, heading: e.target.value } } : c);
                                  setDiscoverCards(updated);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                              <textarea
                                value={card.settings.text || ''}
                                onChange={(e) => {
                                  const updated = discoverCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, text: e.target.value } } : c);
                                  setDiscoverCards(updated);
                                }}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>

                            <ImageUpload
                              label="Bild"
                              value={card.settings.imageUrl}
                              onChange={(url) => {
                                const updated = discoverCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, imageUrl: url } } : c);
                                setDiscoverCards(updated);
                              }}
                            />

                            <ColorPicker
                              label="Bakgrundsfärg"
                              value={card.settings.cardBackgroundColor || '#ffffff'}
                              onChange={(color) => {
                                const updated = discoverCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, cardBackgroundColor: color } } : c);
                                setDiscoverCards(updated);
                              }}
                            />

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CTA-knapptext</label>
                              <input
                                type="text"
                                value={card.settings.ctaLabel || ''}
                                onChange={(e) => {
                                  const updated = discoverCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, ctaLabel: e.target.value } } : c);
                                  setDiscoverCards(updated);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CTA-länk</label>
                              <input
                                type="text"
                                value={card.settings.ctaUrl || ''}
                                onChange={(e) => {
                                  const updated = discoverCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, ctaUrl: e.target.value } } : c);
                                  setDiscoverCards(updated);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="/hitta-kak"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
