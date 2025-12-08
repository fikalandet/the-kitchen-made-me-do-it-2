import { useState, useEffect } from 'react';
import { AdminCard } from '../../components';
import { supabase } from '../../../lib/supabase';

interface ChefLogTabProps {
  chefId: string;
}

interface LogEntry {
  id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export default function ChefLogTab({ chefId }: ChefLogTabProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [chefId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chef_warnings')
        .select('*')
        .eq('chef_id', chefId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Fel vid laddning av logg:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminCard>
      <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
        Logg
      </h3>

      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Datum/Tid</th>
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Typ</th>
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Beskrivning</th>
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Status</th>
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Admin</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                  Laddar logg...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                  Inga händelser i loggen ännu
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-sm text-gray-800">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-800">
                    {log.type}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-800">
                    {log.message.substring(0, 80)}...
                  </td>
                  <td className="py-2 px-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'öppen' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status === 'öppen' ? 'Öppen' : 'Löst'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-800">
                    {log.resolved_by || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}
