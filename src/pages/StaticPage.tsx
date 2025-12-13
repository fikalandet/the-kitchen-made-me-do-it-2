import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

interface StaticPageData {
  id: string;
  slug: string;
  title: string;
  intro: string | null;
  content: ContentBlock[];
  cta_enabled: boolean;
  cta_text: string | null;
  cta_link: string | null;
  page_type: string;
}

interface ContentBlock {
  type: string;
  content: string;
}

export function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError('Sidan kunde inte hittas');
      } else {
        setPage(data);
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Ett fel uppstod när sidan skulle laddas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sidan hittades inte</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#a1c798] hover:text-[#8fb386]"
            >
              <ArrowLeft className="w-5 h-5" />
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f2e0' }}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {page.title}
          </h1>

          {page.intro && (
            <div className="text-xl text-gray-600 mb-8 leading-relaxed">
              {page.intro}
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {page.content && Array.isArray(page.content) && page.content.length > 0 ? (
              page.content.map((block, index) => (
                <div key={index} className="mb-6">
                  {block.type === 'text' && (
                    <div className="text-gray-700 leading-relaxed">{block.content}</div>
                  )}
                  {block.type === 'heading' && (
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                      {block.content}
                    </h2>
                  )}
                  {block.type === 'list' && (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {block.content.split('\n').map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Här kommer innehåll...</p>
                <p className="mt-2">Denna sida byggs just nu.</p>
              </div>
            )}
          </div>

          {page.cta_enabled && page.cta_text && page.cta_link && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <a
                  href={page.cta_link}
                  className="inline-block px-8 py-4 bg-[#a1c798] text-white font-semibold rounded-lg hover:bg-[#8fb386] transition-colors"
                >
                  {page.cta_text}
                </a>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#a1c798] hover:text-[#8fb386]"
            >
              <ArrowLeft className="w-5 h-5" />
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
