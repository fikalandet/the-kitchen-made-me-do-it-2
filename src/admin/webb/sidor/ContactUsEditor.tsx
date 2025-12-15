import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard, AdminButton } from '../../components';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ImageUpload } from '../../components/ImageUpload';
import ColorPicker from '../components/ColorPicker';
import TextLinesEditor from '../components/TextLinesEditor';
import { TextLines } from '../../../lib/types/landingPage';

interface ContactUsPageData {
  id?: string;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  image_placement: string;
  title_text: string;
  title_font: string;
  title_weight: string;
  title_size: string;
  title_color: string;
  title_align: string;
  text_lines: TextLines;
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
  background_type: string;
  background_color: string;
  background_image: string | null;
  form_background_color: string;
  form_border_radius: string;
  form_padding: string;
}

export default function ContactUsEditor() {
  const [pageData, setPageData] = useState<ContactUsPageData>({
    image_url: null,
    image_url_2: null,
    image_url_3: null,
    image_placement: 'left',
    title_text: 'Kontakta oss',
    title_font: 'lobster',
    title_weight: 'bold',
    title_size: 'xl',
    title_color: '#000000',
    title_align: 'center',
    text_lines: {
      lines: [],
      rotate: false,
      interval_seconds: 10,
      placement: 'after_heading'
    },
    tagline_font: 'poppins',
    tagline_weight: 'normal',
    tagline_size: 'lg',
    tagline_color: '#374151',
    tagline_align: 'center',
    ingress_text: null,
    ingress_font: 'poppins',
    ingress_weight: 'normal',
    ingress_size: 'lg',
    ingress_color: '#374151',
    ingress_align: 'center',
    background_type: 'color',
    background_color: '#f6f2e0',
    background_image: null,
    form_background_color: '#ffffff',
    form_border_radius: 'medium',
    form_padding: 'medium'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_us_page')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPageData(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (pageData.id) {
        await supabase
          .from('contact_us_page')
          .update(pageData)
          .eq('id', pageData.id);
      } else {
        await supabase
          .from('contact_us_page')
          .insert([pageData]);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Redigera: Kontakta oss</h2>
          <p className="text-gray-600 text-sm">Slug: /kontakta-oss</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/kontakta-oss"
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
        <AdminCard title="Bakgrund">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bakgrundstyp</label>
              <select
                value={pageData.background_type}
                onChange={(e) => setPageData({ ...pageData, background_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="color">Färg</option>
                <option value="image">Bild</option>
              </select>
            </div>

            {pageData.background_type === 'color' ? (
              <ColorPicker
                label="Bakgrundsfärg"
                value={pageData.background_color}
                onChange={(color) => setPageData({ ...pageData, background_color: color })}
              />
            ) : (
              <ImageUpload
                label="Bakgrundsbild"
                value={pageData.background_image}
                onChange={(url) => setPageData({ ...pageData, background_image: url })}
              />
            )}
          </div>
        </AdminCard>

        <AdminCard title="Bilder">
          <div className="space-y-4">
            <ImageUpload
              label="Bild 1"
              value={pageData.image_url}
              onChange={(url) => setPageData({ ...pageData, image_url: url })}
            />
            <ImageUpload
              label="Bild 2 (valfritt)"
              value={pageData.image_url_2}
              onChange={(url) => setPageData({ ...pageData, image_url_2: url })}
            />
            <ImageUpload
              label="Bild 3 (valfritt)"
              value={pageData.image_url_3}
              onChange={(url) => setPageData({ ...pageData, image_url_3: url })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bildplacering</label>
              <select
                value={pageData.image_placement}
                onChange={(e) => setPageData({ ...pageData, image_placement: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="left">Vänster</option>
                <option value="right">Höger</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">
                På desktop visas bilderna vertikalt i vänster eller höger kolumn. På mobil visas endast första bilden.
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Rubrik">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
              <input
                type="text"
                value={pageData.title_text}
                onChange={(e) => setPageData({ ...pageData, title_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={pageData.title_font}
                  onChange={(e) => setPageData({ ...pageData, title_font: e.target.value })}
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
                  value={pageData.title_weight}
                  onChange={(e) => setPageData({ ...pageData, title_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Fet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                <select
                  value={pageData.title_size}
                  onChange={(e) => setPageData({ ...pageData, title_size: e.target.value })}
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
                value={pageData.title_color}
                onChange={(color) => setPageData({ ...pageData, title_color: color })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                <select
                  value={pageData.title_align}
                  onChange={(e) => setPageData({ ...pageData, title_align: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Vänster</option>
                  <option value="center">Centrerad</option>
                  <option value="right">Höger</option>
                </select>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Textrader (roterande)">
          <TextLinesEditor
            label="Textrader"
            value={pageData.text_lines}
            onChange={(textLines) => setPageData({ ...pageData, text_lines: textLines })}
          />
          <p className="text-sm text-gray-600 mt-2">
            Textraderna visas under rubriken och kan rotera automatiskt.
          </p>
        </AdminCard>

        <AdminCard title="Typografi - Textrader">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={pageData.tagline_font}
                  onChange={(e) => setPageData({ ...pageData, tagline_font: e.target.value })}
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
                  value={pageData.tagline_weight}
                  onChange={(e) => setPageData({ ...pageData, tagline_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Fet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                <select
                  value={pageData.tagline_size}
                  onChange={(e) => setPageData({ ...pageData, tagline_size: e.target.value })}
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
                value={pageData.tagline_color}
                onChange={(color) => setPageData({ ...pageData, tagline_color: color })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                <select
                  value={pageData.tagline_align}
                  onChange={(e) => setPageData({ ...pageData, tagline_align: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Vänster</option>
                  <option value="center">Centrerad</option>
                  <option value="right">Höger</option>
                </select>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Ingress">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingress</label>
              <textarea
                value={pageData.ingress_text || ''}
                onChange={(e) => setPageData({ ...pageData, ingress_text: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={pageData.ingress_font}
                  onChange={(e) => setPageData({ ...pageData, ingress_font: e.target.value })}
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
                  value={pageData.ingress_weight}
                  onChange={(e) => setPageData({ ...pageData, ingress_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Fet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                <select
                  value={pageData.ingress_size}
                  onChange={(e) => setPageData({ ...pageData, ingress_size: e.target.value })}
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
                value={pageData.ingress_color}
                onChange={(color) => setPageData({ ...pageData, ingress_color: color })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                <select
                  value={pageData.ingress_align}
                  onChange={(e) => setPageData({ ...pageData, ingress_align: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Vänster</option>
                  <option value="center">Centrerad</option>
                  <option value="right">Höger</option>
                </select>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Kontaktformulär">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Formuläret</strong> visas automatiskt under innehållet. Det hanterar alla fält:
                namn, kund-ID (auto för inloggade), e-post, telefon, ämne och meddelande.
              </p>
              <p className="text-sm text-blue-900 mt-2">
                <strong>Ärenden</strong> sparas i tabellen <code className="bg-white px-1 rounded">contact_tickets</code> och
                kan hanteras under Admin → Kommunikation → Kontaktärenden.
              </p>
            </div>

            <ColorPicker
              label="Bakgrundsfärg - kontaktformulär"
              value={pageData.form_background_color}
              onChange={(color) => setPageData({ ...pageData, form_background_color: color })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rundade hörn</label>
                <select
                  value={pageData.form_border_radius}
                  onChange={(e) => setPageData({ ...pageData, form_border_radius: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="none">Inga</option>
                  <option value="small">Små</option>
                  <option value="medium">Medel</option>
                  <option value="large">Stora</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inre padding</label>
                <select
                  value={pageData.form_padding}
                  onChange={(e) => setPageData({ ...pageData, form_padding: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="small">S</option>
                  <option value="medium">M</option>
                  <option value="large">L</option>
                </select>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
