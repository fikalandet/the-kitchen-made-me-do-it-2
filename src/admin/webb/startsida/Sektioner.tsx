import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { AdminCard, AdminTable } from '../../components';
import { Edit, Loader } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  slug: string;
  visible: boolean;
  order_index: number;
}

export default function Sektioner() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_sections')
        .select('id, name, slug, visible, order_index')
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      console.log('Sections loaded', data);
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError('Kunde inte hämta sektioner från databasen.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Startsidan – sektioner</h2>
        <AdminCard>
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-[#a1c798]" />
            <span className="ml-3 text-gray-600">Laddar sektioner...</span>
          </div>
        </AdminCard>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Startsidan – sektioner</h2>
        <AdminCard>
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        </AdminCard>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Startsidan – sektioner</h2>
      <p className="text-gray-600 mb-4">
        Redigera innehåll och design för varje sektion på startsidan
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Antal sektioner: {sections.length}
      </p>

      <AdminCard>
        <AdminTable headers={['Namn', 'Slug', 'Status', 'Åtgärd']}>
          {sections.map((section) => (
            <tr key={section.id}>
              <td className="px-6 py-4 font-medium">{section.name}</td>
              <td className="px-6 py-4 text-gray-600 text-sm">{section.slug}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    section.visible
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {section.visible ? 'Aktiv' : 'Dold'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/admin/webb/startsida/sektioner/${section.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Redigera
                </Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}
