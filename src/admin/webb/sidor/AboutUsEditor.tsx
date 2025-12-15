import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard, AdminButton } from '../../components';
import { ArrowLeft, Save, Eye, Plus, Trash2, ChevronDown, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ImageUpload } from '../../components/ImageUpload';
import ColorPicker from '../components/ColorPicker';

interface GalleryImage {
  url: string;
  rotation: number;
}

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
  tagline_font: string;
  tagline_weight: string;
  tagline_size: string;
  tagline_color: string;
  tagline_align: string;
  ingress_text: string | null;
  ingress_font: string;
  ingress_weight: string;
  ingress_size: string;
  ingress_color: string;
  ingress_align: string;
  hero_gallery_images?: GalleryImage[];
  hero_gallery_border_color?: string;
  hero_gallery_style?: string;
  hero_gallery_max_images?: number;
  hero_gallery_spacing?: number;
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
  title_font?: string;
  title_weight?: string;
  title_size?: string;
  title_color?: string;
  title_align?: string;
  text_font?: string;
  text_size?: string;
  text_color?: string;
  text_align?: string;
}

interface SectionSettings {
  id?: string;
  section_key: string;
  section_title: string;
  section_tagline: string | null;
  section_ingress: string | null;
  show_section: boolean;
  title_font: string;
  title_weight: string;
  title_size: string;
  title_color: string;
  title_align: string;
  tagline_font: string;
  tagline_size: string;
  tagline_color: string;
  tagline_align: string;
  ingress_font: string;
  ingress_size: string;
  ingress_color: string;
  ingress_align: string;
  cta_text: string | null;
  cta_link: string | null;
  cta_style: string;
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
    tagline_font: 'poppins',
    tagline_weight: 'normal',
    tagline_size: 'xl',
    tagline_color: '#000000',
    tagline_align: 'center',
    ingress_text: null,
    ingress_font: 'poppins',
    ingress_weight: 'normal',
    ingress_size: 'lg',
    ingress_color: '#374151',
    ingress_align: 'center',
    hero_gallery_images: [],
    hero_gallery_border_color: '#a1c798',
    hero_gallery_style: 'overlap',
    hero_gallery_max_images: 3,
    hero_gallery_spacing: 16,
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
    title_weight: 'bold',
    title_size: 'xl',
    title_color: '#000000',
    title_align: 'center',
    tagline_font: 'inter',
    tagline_size: 'lg',
    tagline_color: '#000000',
    tagline_align: 'center',
    ingress_font: 'inter',
    ingress_size: 'base',
    ingress_color: '#000000',
    ingress_align: 'center',
    cta_text: null,
    cta_link: null,
    cta_style: 'primary'
  });
  const [valuesCards, setValuesCards] = useState<HeroCard[]>([]);
  const [discoverSettings, setDiscoverSettings] = useState<SectionSettings>({
    section_key: 'discover',
    section_title: 'Upptäck The Kitchen',
    section_tagline: null,
    section_ingress: null,
    show_section: true,
    title_font: 'lobster',
    title_weight: 'bold',
    title_size: 'xl',
    title_color: '#000000',
    title_align: 'center',
    tagline_font: 'inter',
    tagline_size: 'lg',
    tagline_color: '#000000',
    tagline_align: 'center',
    ingress_font: 'inter',
    ingress_size: 'base',
    ingress_color: '#000000',
    ingress_align: 'center',
    cta_text: null,
    cta_link: null,
    cta_style: 'primary'
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

      if (aboutRes.data) {
        const normalizedImages = (aboutRes.data.hero_gallery_images || []).map((img: any) =>
          typeof img === 'string' ? { url: img, rotation: 0 } : img
        );
        setAboutPage({ ...aboutRes.data, hero_gallery_images: normalizedImages });
      }
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

  const addRow = () => {
    const newOrder = rows.length + 1;
    const newRow: AboutPageRow = {
      row_order: newOrder,
      row_title: '',
      row_text: '',
      row_image: null,
      image_shape: 'rounded',
      image_border: false,
      image_border_color: '#a1c798',
      row_layout: newOrder % 2 === 1 ? 'text-image' : 'image-text',
      title_font: 'poppins',
      title_weight: 'bold',
      title_size: 'xl',
      title_color: '#000000',
      title_align: 'left',
      text_font: 'poppins',
      text_size: 'md',
      text_color: '#000000',
      text_align: 'left'
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = async (rowOrder: number) => {
    if (!confirm(`Är du säker på att du vill ta bort Rad ${rowOrder}?`)) return;

    const row = rows.find(r => r.row_order === rowOrder);
    if (row?.id) {
      await supabase.from('about_page_rows').delete().eq('id', row.id);
    }

    const filteredRows = rows.filter(r => r.row_order !== rowOrder);
    const reorderedRows = filteredRows.map((r, idx) => ({ ...r, row_order: idx + 1 }));
    setRows(reorderedRows);
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

  const addGalleryImage = (url: string) => {
    const currentImages = aboutPage.hero_gallery_images || [];
    const maxImages = aboutPage.hero_gallery_max_images || 3;
    if (currentImages.length < maxImages) {
      setAboutPage({ ...aboutPage, hero_gallery_images: [...currentImages, { url, rotation: 0 }] });
    }
  };

  const removeGalleryImage = (index: number) => {
    const currentImages = aboutPage.hero_gallery_images || [];
    setAboutPage({ ...aboutPage, hero_gallery_images: currentImages.filter((_, i) => i !== index) });
  };

  const updateImageRotation = (index: number, rotation: number) => {
    const currentImages = aboutPage.hero_gallery_images || [];
    const updated = currentImages.map((img, idx) => idx === index ? { ...img, rotation } : img);
    setAboutPage({ ...aboutPage, hero_gallery_images: updated });
  };

  if (loading) {
    return <div>Laddar...</div>;
  }

  const galleryImages = aboutPage.hero_gallery_images || [];
  const maxImages = aboutPage.hero_gallery_max_images || 3;

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
        <AdminCard title="INTRO - Hero-sektion">
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

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bildgalleri (visas ovanför rubriken)</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antal bilder (3-8)</label>
                  <select
                    value={maxImages}
                    onChange={(e) => setAboutPage({ ...aboutPage, hero_gallery_max_images: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="3">3 bilder</option>
                    <option value="4">4 bilder</option>
                    <option value="5">5 bilder</option>
                    <option value="6">6 bilder</option>
                    <option value="7">7 bilder</option>
                    <option value="8">8 bilder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avstånd mellan bilder (px)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="48"
                      step="4"
                      value={aboutPage.hero_gallery_spacing || 16}
                      onChange={(e) => setAboutPage({ ...aboutPage, hero_gallery_spacing: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-12">{aboutPage.hero_gallery_spacing || 16}px</span>
                  </div>
                </div>
              </div>

              <ColorPicker
                label="Ramfärg för bilder"
                value={aboutPage.hero_gallery_border_color || '#a1c798'}
                onChange={(color) => setAboutPage({ ...aboutPage, hero_gallery_border_color: color })}
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bilder ({galleryImages.length}/{maxImages})
                </label>

                {galleryImages.length < maxImages && (
                  <ImageUpload
                    label={`Lägg till bild ${galleryImages.length + 1}`}
                    value=""
                    onChange={(url) => addGalleryImage(url)}
                  />
                )}

                {galleryImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="relative mb-3">
                          <img
                            src={img.url}
                            alt={`Galleri ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                            style={{ transform: `rotate(${img.rotation}deg)` }}
                          />
                          <button
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Bild {idx + 1} - Rotation</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-15"
                            max="15"
                            step="1"
                            value={img.rotation}
                            onChange={(e) => updateImageRotation(idx, parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-xs font-medium text-gray-700 w-10">{img.rotation}°</span>
                          {img.rotation !== 0 && (
                            <button
                              onClick={() => updateImageRotation(idx, 0)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Nollställ
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {galleryImages.length < 3 && (
                  <p className="text-sm text-orange-600 mt-2">OBS: Minst 3 bilder rekommenderas för bästa resultat</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
              <input
                type="text"
                value={aboutPage.title_text}
                onChange={(e) => setAboutPage({ ...aboutPage, title_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={aboutPage.title_font}
                  onChange={(e) => setAboutPage({ ...aboutPage, title_font: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="poppins">Poppins</option>
                  <option value="lobster">Lobster</option>
                  <option value="inter">Inter</option>
                  <option value="merriweather">Merriweather</option>
                  <option value="roboto">Roboto</option>
                  <option value="playfair">Playfair</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="lato">Lato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                <select
                  value={aboutPage.title_weight}
                  onChange={(e) => setAboutPage({ ...aboutPage, title_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Fet</option>
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={aboutPage.tagline_font}
                  onChange={(e) => setAboutPage({ ...aboutPage, tagline_font: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="poppins">Poppins</option>
                  <option value="lobster">Lobster</option>
                  <option value="inter">Inter</option>
                  <option value="merriweather">Merriweather</option>
                  <option value="roboto">Roboto</option>
                  <option value="playfair">Playfair</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="lato">Lato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                <select
                  value={aboutPage.tagline_weight}
                  onChange={(e) => setAboutPage({ ...aboutPage, tagline_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Fet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                <select
                  value={aboutPage.tagline_size}
                  onChange={(e) => setAboutPage({ ...aboutPage, tagline_size: e.target.value })}
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
                value={aboutPage.tagline_color}
                onChange={(color) => setAboutPage({ ...aboutPage, tagline_color: color })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                <select
                  value={aboutPage.tagline_align}
                  onChange={(e) => setAboutPage({ ...aboutPage, tagline_align: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Vänster</option>
                  <option value="center">Centrerad</option>
                  <option value="right">Höger</option>
                </select>
              </div>
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={aboutPage.ingress_font}
                  onChange={(e) => setAboutPage({ ...aboutPage, ingress_font: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="poppins">Poppins</option>
                  <option value="lobster">Lobster</option>
                  <option value="inter">Inter</option>
                  <option value="merriweather">Merriweather</option>
                  <option value="roboto">Roboto</option>
                  <option value="playfair">Playfair</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="lato">Lato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                <select
                  value={aboutPage.ingress_weight}
                  onChange={(e) => setAboutPage({ ...aboutPage, ingress_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Fet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                <select
                  value={aboutPage.ingress_size}
                  onChange={(e) => setAboutPage({ ...aboutPage, ingress_size: e.target.value })}
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
                value={aboutPage.ingress_color}
                onChange={(color) => setAboutPage({ ...aboutPage, ingress_color: color })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                <select
                  value={aboutPage.ingress_align}
                  onChange={(e) => setAboutPage({ ...aboutPage, ingress_align: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Vänster</option>
                  <option value="center">Centrerad</option>
                  <option value="right">Höger</option>
                </select>
              </div>
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

        <AdminCard title={`TVÅ KOLUMNER - Innehållsrader (${rows.length})`}>
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.row_order} className="border border-gray-200 rounded-lg p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === row.row_order ? null : row.row_order)}
                >
                  <h3 className="font-medium text-gray-900">Rad {row.row_order}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRow(row.row_order);
                      }}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedRow === row.row_order ? 'rotate-180' : ''}`} />
                  </div>
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

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik typsnitt</label>
                        <select
                          value={row.title_font || 'poppins'}
                          onChange={(e) => {
                            const updated = rows.map(r => r.row_order === row.row_order ? { ...r, title_font: e.target.value } : r);
                            setRows(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="poppins">Poppins</option>
                          <option value="lobster">Lobster</option>
                          <option value="inter">Inter</option>
                          <option value="merriweather">Merriweather</option>
                          <option value="roboto">Roboto</option>
                          <option value="playfair">Playfair</option>
                          <option value="montserrat">Montserrat</option>
                          <option value="lato">Lato</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                        <select
                          value={row.title_size || 'xl'}
                          onChange={(e) => {
                            const updated = rows.map(r => r.row_order === row.row_order ? { ...r, title_size: e.target.value } : r);
                            setRows(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="sm">S</option>
                          <option value="md">M</option>
                          <option value="lg">L</option>
                          <option value="xl">XL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                        <select
                          value={row.title_weight || 'bold'}
                          onChange={(e) => {
                            const updated = rows.map(r => r.row_order === row.row_order ? { ...r, title_weight: e.target.value } : r);
                            setRows(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Fet</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Rubrik färg"
                        value={row.title_color || '#000000'}
                        onChange={(color) => {
                          const updated = rows.map(r => r.row_order === row.row_order ? { ...r, title_color: color } : r);
                          setRows(updated);
                        }}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                        <select
                          value={row.title_align || 'left'}
                          onChange={(e) => {
                            const updated = rows.map(r => r.row_order === row.row_order ? { ...r, title_align: e.target.value } : r);
                            setRows(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="left">Vänster</option>
                          <option value="center">Centrerad</option>
                          <option value="right">Höger</option>
                        </select>
                      </div>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text typsnitt</label>
                        <select
                          value={row.text_font || 'poppins'}
                          onChange={(e) => {
                            const updated = rows.map(r => r.row_order === row.row_order ? { ...r, text_font: e.target.value } : r);
                            setRows(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="poppins">Poppins</option>
                          <option value="lobster">Lobster</option>
                          <option value="inter">Inter</option>
                          <option value="merriweather">Merriweather</option>
                          <option value="roboto">Roboto</option>
                          <option value="playfair">Playfair</option>
                          <option value="montserrat">Montserrat</option>
                          <option value="lato">Lato</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text storlek</label>
                        <select
                          value={row.text_size || 'md'}
                          onChange={(e) => {
                            const updated = rows.map(r => r.row_order === row.row_order ? { ...r, text_size: e.target.value } : r);
                            setRows(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="sm">S</option>
                          <option value="md">M</option>
                          <option value="lg">L</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Text färg"
                        value={row.text_color || '#000000'}
                        onChange={(color) => {
                          const updated = rows.map(r => r.row_order === row.row_order ? { ...r, text_color: color } : r);
                          setRows(updated);
                        }}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text placering</label>
                        <select
                          value={row.text_align || 'left'}
                          onChange={(e) => {
                            const updated = rows.map(r => r.row_order === row.row_order ? { ...r, text_align: e.target.value } : r);
                            setRows(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="left">Vänster</option>
                          <option value="center">Centrerad</option>
                          <option value="right">Höger</option>
                        </select>
                      </div>
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

            <button
              onClick={addRow}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#a1c798] hover:text-[#a1c798] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Lägg till ny rad
            </button>
          </div>
        </AdminCard>

        <AdminCard title='SEKTION - Våra värderingar'>
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
                  <h3 className="font-medium text-gray-900 mb-4">Typografi - Rubrik</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                      <select
                        value={valuesSettings.title_font}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, title_font: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="poppins">Poppins</option>
                        <option value="lobster">Lobster</option>
                        <option value="inter">Inter</option>
                        <option value="merriweather">Merriweather</option>
                        <option value="roboto">Roboto</option>
                        <option value="playfair">Playfair</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="lato">Lato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                      <select
                        value={valuesSettings.title_weight}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, title_weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Fet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                      <select
                        value={valuesSettings.title_size}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, title_size: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="lg">Liten</option>
                        <option value="xl">Medium</option>
                        <option value="2xl">Stor</option>
                        <option value="3xl">Större</option>
                        <option value="4xl">Störst</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                      <select
                        value={valuesSettings.title_align}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, title_align: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="left">Vänster</option>
                        <option value="center">Centrerad</option>
                        <option value="right">Höger</option>
                      </select>
                    </div>
                  </div>
                  <ColorPicker
                    label="Färg - Rubrik"
                    value={valuesSettings.title_color}
                    onChange={(color) => setValuesSettings({ ...valuesSettings, title_color: color })}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-4">Typografi - Textrad</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                      <select
                        value={valuesSettings.tagline_font}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, tagline_font: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="poppins">Poppins</option>
                        <option value="lobster">Lobster</option>
                        <option value="inter">Inter</option>
                        <option value="merriweather">Merriweather</option>
                        <option value="roboto">Roboto</option>
                        <option value="playfair">Playfair</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="lato">Lato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                      <select
                        value={valuesSettings.tagline_size}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, tagline_size: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="sm">Liten</option>
                        <option value="base">Medium</option>
                        <option value="lg">Stor</option>
                        <option value="xl">Större</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                      <select
                        value={valuesSettings.tagline_align}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, tagline_align: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="left">Vänster</option>
                        <option value="center">Centrerad</option>
                        <option value="right">Höger</option>
                      </select>
                    </div>
                  </div>
                  <ColorPicker
                    label="Färg - Textrad"
                    value={valuesSettings.tagline_color}
                    onChange={(color) => setValuesSettings({ ...valuesSettings, tagline_color: color })}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-4">Typografi - Ingress</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                      <select
                        value={valuesSettings.ingress_font}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, ingress_font: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="poppins">Poppins</option>
                        <option value="lobster">Lobster</option>
                        <option value="inter">Inter</option>
                        <option value="merriweather">Merriweather</option>
                        <option value="roboto">Roboto</option>
                        <option value="playfair">Playfair</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="lato">Lato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                      <select
                        value={valuesSettings.ingress_size}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, ingress_size: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="sm">Liten</option>
                        <option value="base">Medium</option>
                        <option value="lg">Stor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                      <select
                        value={valuesSettings.ingress_align}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, ingress_align: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="left">Vänster</option>
                        <option value="center">Centrerad</option>
                        <option value="right">Höger</option>
                      </select>
                    </div>
                  </div>
                  <ColorPicker
                    label="Färg - Ingress"
                    value={valuesSettings.ingress_color}
                    onChange={(color) => setValuesSettings({ ...valuesSettings, ingress_color: color })}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-4">CTA-knapp</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Knapptext</label>
                      <input
                        type="text"
                        value={valuesSettings.cta_text || ''}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, cta_text: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="t.ex. Läs mer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Länk</label>
                      <input
                        type="text"
                        value={valuesSettings.cta_link || ''}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, cta_link: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="/kontakt"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                      <select
                        value={valuesSettings.cta_style}
                        onChange={(e) => setValuesSettings({ ...valuesSettings, cta_style: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="primary">Primär (Grön)</option>
                        <option value="secondary">Sekundär (Beige)</option>
                        <option value="outline">Kontur</option>
                      </select>
                    </div>
                  </div>
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

                            <div className="border-t pt-4 mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Typografi - Rubrik</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Typsnitt</label>
                                  <select
                                    value={card.settings.heading_font || 'inter'}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, heading_font: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  >
                                    <option value="lobster">Lobster</option>
                                    <option value="inter">Inter</option>
                                    <option value="merriweather">Merriweather</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Stil</label>
                                  <select
                                    value={card.settings.heading_weight || 'bold'}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, heading_weight: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  >
                                    <option value="normal">Normal</option>
                                    <option value="medium">Medium</option>
                                    <option value="semibold">Semibold</option>
                                    <option value="bold">Bold</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Storlek</label>
                                  <select
                                    value={card.settings.heading_size || 'lg'}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, heading_size: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  >
                                    <option value="sm">Liten</option>
                                    <option value="base">Medium</option>
                                    <option value="lg">Stor</option>
                                    <option value="xl">Större</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Placering</label>
                                  <select
                                    value={card.settings.heading_align || 'center'}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, heading_align: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  >
                                    <option value="left">Vänster</option>
                                    <option value="center">Centrerad</option>
                                    <option value="right">Höger</option>
                                  </select>
                                </div>
                              </div>
                              <div className="mt-3">
                                <ColorPicker
                                  label="Färg - Rubrik"
                                  value={card.settings.heading_color || '#000000'}
                                  onChange={(color) => {
                                    const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, heading_color: color } } : c);
                                    setValuesCards(updated);
                                  }}
                                />
                              </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Typografi - Text</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Typsnitt</label>
                                  <select
                                    value={card.settings.text_font || 'inter'}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, text_font: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  >
                                    <option value="lobster">Lobster</option>
                                    <option value="inter">Inter</option>
                                    <option value="merriweather">Merriweather</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Storlek</label>
                                  <select
                                    value={card.settings.text_size || 'base'}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, text_size: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  >
                                    <option value="xs">Liten</option>
                                    <option value="sm">Mindre</option>
                                    <option value="base">Medium</option>
                                    <option value="lg">Stor</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Placering</label>
                                  <select
                                    value={card.settings.text_align || 'center'}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, text_align: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  >
                                    <option value="left">Vänster</option>
                                    <option value="center">Centrerad</option>
                                    <option value="right">Höger</option>
                                  </select>
                                </div>
                              </div>
                              <div className="mt-3">
                                <ColorPicker
                                  label="Färg - Text"
                                  value={card.settings.text_color || '#000000'}
                                  onChange={(color) => {
                                    const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, text_color: color } } : c);
                                    setValuesCards(updated);
                                  }}
                                />
                              </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">CTA-knapp</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Knapptext</label>
                                  <input
                                    type="text"
                                    value={card.settings.cta_text || ''}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, cta_text: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    placeholder="t.ex. Läs mer"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Länk</label>
                                  <input
                                    type="text"
                                    value={card.settings.cta_link || ''}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, cta_link: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    placeholder="/kontakt"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Stil</label>
                                  <select
                                    value={card.settings.cta_style || 'primary'}
                                    onChange={(e) => {
                                      const updated = valuesCards.map(c => c.card_order === card.card_order ? { ...c, settings: { ...c.settings, cta_style: e.target.value } } : c);
                                      setValuesCards(updated);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                  >
                                    <option value="primary">Primär (Grön)</option>
                                    <option value="secondary">Sekundär (Beige)</option>
                                    <option value="outline">Kontur</option>
                                  </select>
                                </div>
                              </div>
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

        <AdminCard title='SEKTION - Upptäck The Kitchen'>
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
                  <h3 className="font-medium text-gray-900 mb-4">Typografi - Rubrik</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                      <select
                        value={discoverSettings.title_font}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, title_font: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="poppins">Poppins</option>
                        <option value="lobster">Lobster</option>
                        <option value="inter">Inter</option>
                        <option value="merriweather">Merriweather</option>
                        <option value="roboto">Roboto</option>
                        <option value="playfair">Playfair</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="lato">Lato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                      <select
                        value={discoverSettings.title_weight}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, title_weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Fet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                      <select
                        value={discoverSettings.title_size}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, title_size: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="lg">L</option>
                        <option value="xl">XL</option>
                        <option value="2xl">2XL</option>
                        <option value="3xl">3XL</option>
                        <option value="4xl">4XL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                      <select
                        value={discoverSettings.title_align}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, title_align: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="left">Vänster</option>
                        <option value="center">Centrerad</option>
                        <option value="right">Höger</option>
                      </select>
                    </div>
                  </div>
                  <ColorPicker
                    label="Färg - Rubrik"
                    value={discoverSettings.title_color}
                    onChange={(color) => setDiscoverSettings({ ...discoverSettings, title_color: color })}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-4">Typografi - Textrad</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                      <select
                        value={discoverSettings.tagline_font}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, tagline_font: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="poppins">Poppins</option>
                        <option value="lobster">Lobster</option>
                        <option value="inter">Inter</option>
                        <option value="merriweather">Merriweather</option>
                        <option value="roboto">Roboto</option>
                        <option value="playfair">Playfair</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="lato">Lato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                      <select
                        value={discoverSettings.tagline_size}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, tagline_size: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="sm">S</option>
                        <option value="md">M</option>
                        <option value="lg">L</option>
                        <option value="xl">XL</option>
                        <option value="2xl">2XL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                      <select
                        value={discoverSettings.tagline_align}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, tagline_align: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="left">Vänster</option>
                        <option value="center">Centrerad</option>
                        <option value="right">Höger</option>
                      </select>
                    </div>
                  </div>
                  <ColorPicker
                    label="Färg - Textrad"
                    value={discoverSettings.tagline_color}
                    onChange={(color) => setDiscoverSettings({ ...discoverSettings, tagline_color: color })}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-4">Typografi - Ingress</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                      <select
                        value={discoverSettings.ingress_font}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, ingress_font: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="poppins">Poppins</option>
                        <option value="lobster">Lobster</option>
                        <option value="inter">Inter</option>
                        <option value="merriweather">Merriweather</option>
                        <option value="roboto">Roboto</option>
                        <option value="playfair">Playfair</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="lato">Lato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                      <select
                        value={discoverSettings.ingress_size}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, ingress_size: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="xs">XS</option>
                        <option value="sm">S</option>
                        <option value="base">M</option>
                        <option value="lg">L</option>
                        <option value="xl">XL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                      <select
                        value={discoverSettings.ingress_align}
                        onChange={(e) => setDiscoverSettings({ ...discoverSettings, ingress_align: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="left">Vänster</option>
                        <option value="center">Centrerad</option>
                        <option value="right">Höger</option>
                      </select>
                    </div>
                  </div>
                  <ColorPicker
                    label="Färg - Ingress"
                    value={discoverSettings.ingress_color}
                    onChange={(color) => setDiscoverSettings({ ...discoverSettings, ingress_color: color })}
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
