import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AdminCard, AdminButton } from '../../components';
import { ArrowLeft, Save, Eye, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface StaticPageData {
  id: string;
  slug: string;
  title: string;
  intro: string;
  content: ContentBlock[];
  cta_enabled: boolean;
  cta_text: string;
  cta_link: string;
  is_published: boolean;
  show_in_menu: boolean;
  menu_order: number | null;
  page_type: string;
  meta_description: string;
}

interface ContentBlock {
  type: 'text' | 'heading' | 'list';
  content: string;
}

export default function StaticPageEditor() {
  const { pageSlug } = useParams<{ pageSlug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pageSlug) {
      fetchPage();
    }
  }, [pageSlug]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('slug', pageSlug)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPage({
          ...data,
          content: Array.isArray(data.content) ? data.content : [],
          intro: data.intro || '',
          cta_text: data.cta_text || '',
          cta_link: data.cta_link || '',
          meta_description: data.meta_description || ''
        });
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('static_pages')
        .update({
          title: page.title,
          intro: page.intro,
          content: page.content,
          cta_enabled: page.cta_enabled,
          cta_text: page.cta_text,
          cta_link: page.cta_link,
          is_published: page.is_published,
          show_in_menu: page.show_in_menu,
          menu_order: page.menu_order,
          meta_description: page.meta_description
        })
        .eq('id', page.id);

      if (error) throw error;

      alert('Sidan har sparats!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Ett fel uppstod när sidan skulle sparas');
    } finally {
      setSaving(false);
    }
  };

  const addContentBlock = (type: 'text' | 'heading' | 'list') => {
    if (!page) return;

    const newBlock: ContentBlock = {
      type,
      content: ''
    };

    setPage({
      ...page,
      content: [...page.content, newBlock]
    });
  };

  const updateContentBlock = (index: number, content: string) => {
    if (!page) return;

    const updatedContent = [...page.content];
    updatedContent[index] = { ...updatedContent[index], content };

    setPage({
      ...page,
      content: updatedContent
    });
  };

  const removeContentBlock = (index: number) => {
    if (!page) return;

    const updatedContent = page.content.filter((_, i) => i !== index);

    setPage({
      ...page,
      content: updatedContent
    });
  };

  const moveContentBlock = (index: number, direction: 'up' | 'down') => {
    if (!page) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= page.content.length) return;

    const updatedContent = [...page.content];
    [updatedContent[index], updatedContent[newIndex]] = [updatedContent[newIndex], updatedContent[index]];

    setPage({
      ...page,
      content: updatedContent
    });
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Laddar...</h2>
      </div>
    );
  }

  if (!page) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sidan hittades inte</h2>
        <Link to="/admin/webb/sidor" className="text-[#a1c798] hover:underline">
          Tillbaka till sidor
        </Link>
      </div>
    );
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Redigera: {page.title}</h2>
          <p className="text-gray-600 text-sm">Slug: /{page.slug}</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Förhandsgranska
          </a>
          <AdminButton
            onClick={handleSave}
            disabled={saving}
            icon={<Save className="w-4 h-4" />}
          >
            {saving ? 'Sparar...' : 'Spara'}
          </AdminButton>
        </div>
      </div>

      <div className="space-y-6">
        <AdminCard title="Grundinställningar">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sidrubrik (H1)
              </label>
              <input
                type="text"
                value={page.title}
                onChange={(e) => setPage({ ...page, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingress / Introtext
              </label>
              <textarea
                value={page.intro}
                onChange={(e) => setPage({ ...page, intro: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                placeholder="Kort introduktionstext..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (SEO)
              </label>
              <textarea
                value={page.meta_description}
                onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                placeholder="Beskrivning för sökmotorer..."
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.is_published}
                  onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
                  className="w-4 h-4 text-[#a1c798] rounded"
                />
                <span className="text-sm font-medium text-gray-700">Publicerad</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.show_in_menu}
                  onChange={(e) => setPage({ ...page, show_in_menu: e.target.checked })}
                  className="w-4 h-4 text-[#a1c798] rounded"
                />
                <span className="text-sm font-medium text-gray-700">Visa i meny</span>
              </label>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Innehållsblock">
          <div className="space-y-4">
            {page.content.map((block, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {block.type === 'text' && 'Textblock'}
                    {block.type === 'heading' && 'Rubrik'}
                    {block.type === 'list' && 'Lista'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveContentBlock(index, 'up')}
                      disabled={index === 0}
                      className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveContentBlock(index, 'down')}
                      disabled={index === page.content.length - 1}
                      className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeContentBlock(index)}
                      className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={block.content}
                  onChange={(e) => updateContentBlock(index, e.target.value)}
                  rows={block.type === 'heading' ? 1 : 4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                  placeholder={
                    block.type === 'list'
                      ? 'Ett listitem per rad...'
                      : 'Skriv innehåll här...'
                  }
                />
              </div>
            ))}

            <div className="flex gap-2">
              <button
                onClick={() => addContentBlock('text')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Lägg till text
              </button>
              <button
                onClick={() => addContentBlock('heading')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Lägg till rubrik
              </button>
              <button
                onClick={() => addContentBlock('list')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Lägg till lista
              </button>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Call-to-Action">
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={page.cta_enabled}
                onChange={(e) => setPage({ ...page, cta_enabled: e.target.checked })}
                className="w-4 h-4 text-[#a1c798] rounded"
              />
              <span className="text-sm font-medium text-gray-700">Aktivera CTA-block</span>
            </label>

            {page.cta_enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Knapptext
                  </label>
                  <input
                    type="text"
                    value={page.cta_text}
                    onChange={(e) => setPage({ ...page, cta_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                    placeholder="T.ex. Kom igång nu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Länk
                  </label>
                  <input
                    type="text"
                    value={page.cta_link}
                    onChange={(e) => setPage({ ...page, cta_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                    placeholder="/bli-kock"
                  />
                </div>
              </>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
