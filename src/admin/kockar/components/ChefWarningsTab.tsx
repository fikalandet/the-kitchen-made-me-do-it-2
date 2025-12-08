import { useState, useEffect } from 'react';
import { AdminCard } from '../../components';
import { supabase } from '../../../lib/supabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ChefWarningsTabProps {
  chefId: string;
}

interface Warning {
  id: string;
  type: string;
  severity: string;
  message: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  is_new: boolean;
  source: string;
  short_summary: string | null;
}

const severityColors = {
  'låg': 'bg-yellow-100 text-yellow-800',
  'medel': 'bg-orange-100 text-orange-800',
  'hög': 'bg-red-100 text-red-800'
};

export default function ChefWarningsTab({ chefId }: ChefWarningsTabProps) {
  const [activeWarnings, setActiveWarnings] = useState<Warning[]>([]);
  const [closedWarnings, setClosedWarnings] = useState<Warning[]>([]);
  const [showClosed, setShowClosed] = useState(false);
  const [expandedWarningId, setExpandedWarningId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [warningType, setWarningType] = useState('');
  const [severity, setSeverity] = useState('medel');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadWarnings();
  }, [chefId]);

  const loadWarnings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chef_warnings')
        .select('*')
        .eq('chef_id', chefId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const active = data?.filter(w => w.status === 'öppen') || [];
      const closed = data?.filter(w => w.status === 'stängd') || [];

      setActiveWarnings(active);
      setClosedWarnings(closed);
    } catch (error) {
      console.error('Fel vid laddning av varningar:', error);
      setMessage('Kunde inte ladda varningar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarning = async () => {
    if (!warningType || !description.trim()) {
      setMessage('Fyll i både typ, allvarlighetsgrad och beskrivning.');
      return;
    }

    try {
      const { data: profile } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('chef_warnings')
        .insert({
          chef_id: chefId,
          type: warningType,
          severity: severity,
          message: description,
          status: 'öppen'
        });

      if (error) throw error;

      setMessage('Varning skapad!');
      setWarningType('');
      setSeverity('medel');
      setDescription('');

      await loadWarnings();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fel vid skapande av varning:', error);
      setMessage('Kunde inte skapa varning');
    }
  };

  const handleCreateTestWarning = async () => {
    try {
      const { error } = await supabase
        .from('chef_warnings')
        .insert({
          chef_id: chefId,
          type: 'Annat',
          severity: 'medel',
          status: 'öppen',
          source: 'rating',
          is_new: true,
          message: 'Testvarning: Lågt betyg från kund (låtsasdata). Kunden gav 2 av 5 stjärnor och skrev: "Maten var okej men inte speciellt. Förväntade mig mer för priset."',
          short_summary: 'Test: lågt betyg (2/5)'
        });

      if (error) throw error;

      setMessage('Testvarning skapad!');
      await loadWarnings();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fel vid skapande av testvarning:', error);
      setMessage('Kunde inte skapa testvarning');
    }
  };

  const handleResolveWarning = async (warningId: string) => {
    try {
      const { data: profile } = await supabase.auth.getUser();
      const adminEmail = profile.user?.email || 'admin';

      const { error } = await supabase
        .from('chef_warnings')
        .update({
          status: 'stängd',
          resolved_at: new Date().toISOString(),
          resolved_by: adminEmail,
          is_new: false
        })
        .eq('id', warningId);

      if (error) throw error;

      await loadWarnings();
      setExpandedWarningId(null);
    } catch (error) {
      console.error('Fel vid stängning av varning:', error);
    }
  };

  const markAsRead = async (warningId: string) => {
    try {
      await supabase
        .from('chef_warnings')
        .update({ is_new: false })
        .eq('id', warningId);
    } catch (error) {
      console.error('Fel vid markering som läst:', error);
    }
  };

  const handleExpandWarning = async (warningId: string, isNew: boolean) => {
    setExpandedWarningId(expandedWarningId === warningId ? null : warningId);
    if (isNew && expandedWarningId !== warningId) {
      await markAsRead(warningId);
      await loadWarnings();
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

  const getFirstLine = (text: string) => {
    const firstLine = text.split('\n')[0];
    return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-black" style={{ fontFamily: 'Lobster, cursive' }}>
            Aktiva varningar
          </h3>
          <button
            onClick={handleCreateTestWarning}
            className="px-3 py-1.5 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300 transition-colors"
          >
            Skapa testvarning (dev)
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-700 text-sm">Laddar varningar...</p>
          </div>
        ) : activeWarnings.length === 0 ? (
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-700 text-sm">Inga aktiva varningar för denna kock.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Datum</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Typ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Allvarlighetsgrad</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Beskrivning</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {activeWarnings.map((warning) => (
                  <tr key={warning.id} className={`border-b border-gray-200 hover:bg-[#f6f2e0] transition-colors ${warning.is_new ? 'bg-yellow-50' : ''}`}>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {warning.is_new && (
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      )}
                      {formatDate(warning.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        {warning.type}
                        {warning.source !== 'manual' && (
                          <span className="text-xs text-gray-500 italic">({warning.source})</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[warning.severity as keyof typeof severityColors]}`}>
                        {warning.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {expandedWarningId === warning.id ? warning.message : getFirstLine(warning.message)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleExpandWarning(warning.id, warning.is_new)}
                        className="text-xs text-gray-600 hover:text-black underline"
                      >
                        {expandedWarningId === warning.id ? 'Dölj' : 'Visa mer'}
                      </button>
                      <button
                        onClick={() => handleResolveWarning(warning.id)}
                        className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors"
                      >
                        Markera som löst
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {closedWarnings.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowClosed(!showClosed)}
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
            >
              {showClosed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              <span className="text-sm font-medium">
                Stängda varningar ({closedWarnings.length})
              </span>
            </button>

            {showClosed && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Datum skapad</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Typ</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Allvarlighetsgrad</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Beskrivning</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Stängd</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Stängd av</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedWarnings.map((warning) => (
                      <tr key={warning.id} className="border-b border-gray-200 bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(warning.created_at)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {warning.type}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[warning.severity as keyof typeof severityColors]}`}>
                            {warning.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {getFirstLine(warning.message)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {warning.resolved_at ? formatDate(warning.resolved_at) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {warning.resolved_by || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Skapa ny varning
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Typ
            </label>
            <select
              value={warningType}
              onChange={(e) => setWarningType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Välj typ</option>
              <option value="Bemötande">Bemötande</option>
              <option value="Leverans">Leverans</option>
              <option value="Hygien">Hygien</option>
              <option value="Annat">Annat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Allvarlighetsgrad
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="låg">Låg</option>
              <option value="medel">Medel</option>
              <option value="hög">Hög</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Beskrivning
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Beskriv varningen..."
            />
          </div>

          <button
            onClick={handleCreateWarning}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Spara varning
          </button>

          {message && (
            <div className={`mt-2 p-3 rounded-lg ${message.includes('skapad') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
