import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard, AdminTable } from '../../components';
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  page_type: string;
  is_published: boolean;
}

export default function SidorList() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('static_pages')
        .select('id, slug, title, page_type, is_published')
        .order('page_type', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const pageTypeLabels: Record<string, string> = {
    standard: 'Standard',
    editorial_category: 'Redaktionell kategori',
    policy: 'Policy'
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Statiska sidor</h2>
        <p className="text-gray-600 mb-6">Laddar...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Statiska sidor</h2>
      <p className="text-gray-600 mb-6">
        Redigera innehåll för statiska sidor på webbplatsen
      </p>

      <div className="mb-6">
        <AdminCard title="Specialsidor">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Om oss</h3>
                <p className="text-sm text-gray-600">Specialdesignad Om oss-sida med hero-kort och flexibelt innehåll</p>
              </div>
              <Link
                to="/admin/webb/sidor/om-oss-editor"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors"
              >
                <Edit className="w-4 h-4" />
                Redigera
              </Link>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Standardsidor">
        <AdminTable>
          <thead>
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Sida</th>
              <th className="text-left py-3 px-4 font-semibold">Typ</th>
              <th className="text-center py-3 px-4 font-semibold">Status</th>
              <th className="text-right py-3 px-4 font-semibold">Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-t border-gray-200">
                <td className="py-3 px-4">{page.title}</td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {pageTypeLabels[page.page_type] || page.page_type}
                </td>
                <td className="py-3 px-4 text-center">
                  {page.is_published ? (
                    <CheckCircle className="w-5 h-5 text-green-600 inline-block" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 inline-block" />
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    to={`/admin/webb/sidor/${page.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Redigera
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
