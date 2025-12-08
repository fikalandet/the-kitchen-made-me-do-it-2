import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AdminCard } from '../../components';
import { Plus, Minus } from 'lucide-react';

interface ChefPointsTabProps {
  chefId: string;
}

interface PointsHistory {
  id: string;
  delta: number;
  new_balance: number;
  reason: string;
  created_at: string;
}

export default function ChefPointsTab({ chefId }: ChefPointsTabProps) {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'remove'>('add');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentAdmin();
    fetchData();
  }, [chefId]);

  const fetchCurrentAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setAdminId(user.id);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('kitchen_points_balance')
        .eq('id', chefId)
        .maybeSingle();

      if (profileError) throw profileError;

      const { data: historyData, error: historyError } = await supabase
        .from('chef_kitchen_points_history')
        .select('*')
        .eq('chef_id', chefId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;

      setBalance(profile?.kitchen_points_balance || 0);
      setHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching points data:', error);
      setMessage('Kunde inte ladda poäng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!points || isNaN(Number(points)) || Number(points) <= 0) {
      setMessage('Ange ett giltigt antal poäng.');
      return;
    }

    if (!reason.trim()) {
      setMessage('Ange en orsak.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const delta = actionType === 'add' ? Number(points) : -Number(points);
      const newBalance = balance + delta;

      if (newBalance < 0) {
        setMessage('Saldot kan inte bli negativt.');
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ kitchen_points_balance: newBalance })
        .eq('id', chefId);

      if (updateError) throw updateError;

      const { data: historyData, error: historyError } = await supabase
        .from('chef_kitchen_points_history')
        .insert({
          chef_id: chefId,
          delta,
          new_balance: newBalance,
          reason: reason.trim(),
          changed_by_admin_id: adminId,
        })
        .select()
        .single();

      if (historyError) throw historyError;

      setBalance(newBalance);

      if (historyData) {
        setHistory([historyData, ...history]);
      }

      setMessage('Poäng uppdaterade!');
      setPoints('');
      setReason('');
    } catch (error) {
      console.error('Error updating points:', error);
      setMessage('Kunde inte uppdatera poäng.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminCard>
        <p className="text-gray-700">Läser in poäng...</p>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="text-2xl font-bold text-black mb-6" style={{ fontFamily: 'Lobster, cursive' }}>
          Poäng
        </h3>
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Aktuellt saldo</p>
          <p className="text-5xl font-bold text-black">{balance}</p>
          <p className="text-sm text-gray-600 mt-2">Kitchen-poäng</p>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-2xl font-bold text-black mb-6" style={{ fontFamily: 'Lobster, cursive' }}>
          Ändra poäng
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Typ av ändring
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setActionType('add')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  actionType === 'add'
                    ? 'bg-[#56c5c5] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Plus className="w-5 h-5" />
                Lägg till poäng
              </button>
              <button
                onClick={() => setActionType('remove')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  actionType === 'remove'
                    ? 'bg-[#56c5c5] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Minus className="w-5 h-5" />
                Ta bort poäng
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Antal poäng
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              placeholder="Ange antal"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Orsak
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Beskriv varför poängen läggs till eller tas bort"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('uppdaterade')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Sparar...' : 'Spara ändring'}
          </button>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-2xl font-bold text-black mb-6" style={{ fontFamily: 'Lobster, cursive' }}>
          Historik
        </h3>
        {history.length === 0 ? (
          <p className="text-gray-700 text-center py-4">Ingen historik ännu.</p>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f6f2e0]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">
                    Datum
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">
                    Ändring
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">
                    Nytt saldo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">
                    Orsak
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f2e0]/30'}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`font-semibold ${
                          item.delta > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.delta > 0 ? '+' : ''}{item.delta}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.new_balance}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
