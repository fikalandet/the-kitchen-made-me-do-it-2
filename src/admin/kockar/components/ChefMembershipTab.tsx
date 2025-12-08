import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AdminCard } from '../../components';
import { useAuth } from '../../../contexts/AuthContext';
import { Pencil, Trash2 } from 'lucide-react';

interface ChefMembershipTabProps {
  chefId: string;
  currentLevel: string;
}

interface MembershipHistory {
  id: string;
  old_level: string;
  new_level: string;
  is_temporary: boolean;
  valid_from: string | null;
  valid_until: string | null;
  reason: string | null;
  created_at: string;
}

export default function ChefMembershipTab({ chefId }: ChefMembershipTabProps) {
  const { user } = useAuth();
  const [permanentLevel, setPermanentLevel] = useState('free');
  const [activeTempMembership, setActiveTempMembership] = useState<MembershipHistory | null>(null);
  const [membershipLevel, setMembershipLevel] = useState('free');
  const [isTemporary, setIsTemporary] = useState(false);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<MembershipHistory[]>([]);
  const [lastChanged, setLastChanged] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [editingTemp, setEditingTemp] = useState<MembershipHistory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentLevel();
    fetchHistory();
  }, [chefId]);

  const fetchCurrentLevel = async () => {
    setLoadingCurrent(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_level')
        .eq('id', chefId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPermanentLevel(data.membership_level || 'free');
        setMembershipLevel(data.membership_level || 'free');
      }
    } catch (error) {
      console.error('Error fetching current level:', error);
    } finally {
      setLoadingCurrent(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chef_membership_history')
        .select('*')
        .eq('chef_id', chefId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setHistory(data || []);
      if (data && data.length > 0) {
        setLastChanged(data[0].created_at);
      }

      const today = new Date().toISOString().split('T')[0];
      const activeTemp = data?.find(
        (item) =>
          item.is_temporary &&
          item.valid_from &&
          item.valid_until &&
          item.valid_from <= today &&
          item.valid_until >= today
      );

      if (activeTemp) {
        setActiveTempMembership(activeTemp);
      } else {
        setActiveTempMembership(null);
      }
    } catch (error) {
      console.error('Error fetching membership history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      free: 'Gratis',
      silver: 'Silver',
      gold: 'Guld',
    };
    return labels[level] || level;
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      silver: 'bg-gray-300 text-gray-900',
      gold: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[level] || colors.free}`}>
        {getLevelLabel(level)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = async () => {
    if (!isTemporary && membershipLevel === permanentLevel) {
      setMessage('Kocken har redan den här nivån.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (isTemporary && !validFrom) {
      setMessage('Ange startdatum för tillfällig ändring.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (isTemporary && !validUntil) {
      setMessage('Ange slutdatum för tillfällig ändring.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (isTemporary && validFrom && validUntil && validFrom >= validUntil) {
      setMessage('Startdatum måste vara före slutdatum.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      if (!isTemporary) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ membership_level: membershipLevel })
          .eq('id', chefId);

        if (updateError) throw updateError;
      }

      const { error: historyError } = await supabase
        .from('chef_membership_history')
        .insert({
          chef_id: chefId,
          old_level: permanentLevel,
          new_level: membershipLevel,
          is_temporary: isTemporary,
          valid_from: isTemporary && validFrom ? validFrom : null,
          valid_until: isTemporary && validUntil ? validUntil : null,
          reason: reason.trim() || null,
          changed_by_admin_id: user?.id || null,
        });

      if (historyError) throw historyError;

      setMessage('Medlemskap uppdaterat!');

      setIsTemporary(false);
      setValidFrom('');
      setValidUntil('');
      setReason('');

      await fetchCurrentLevel();
      await fetchHistory();

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating membership:', error);
      setMessage('Kunde inte uppdatera medlemskap.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTemp = (temp: MembershipHistory) => {
    setEditingTemp(temp);
    setMembershipLevel(temp.new_level);
    setIsTemporary(true);
    setValidFrom(temp.valid_from || '');
    setValidUntil(temp.valid_until || '');
    setReason(temp.reason || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateTemp = async () => {
    if (!editingTemp) return;

    if (!validFrom || !validUntil) {
      setMessage('Ange både start- och slutdatum.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (validFrom >= validUntil) {
      setMessage('Startdatum måste vara före slutdatum.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('chef_membership_history')
        .update({
          new_level: membershipLevel,
          valid_from: validFrom,
          valid_until: validUntil,
          reason: reason.trim() || null,
        })
        .eq('id', editingTemp.id);

      if (error) throw error;

      setMessage('Tillfällig ändring uppdaterad!');
      setEditingTemp(null);
      setIsTemporary(false);
      setValidFrom('');
      setValidUntil('');
      setReason('');

      await fetchCurrentLevel();
      await fetchHistory();

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating temporary membership:', error);
      setMessage('Kunde inte uppdatera tillfällig ändring.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemp = async (tempId: string) => {
    try {
      const { error } = await supabase
        .from('chef_membership_history')
        .delete()
        .eq('id', tempId);

      if (error) throw error;

      setMessage('Tillfällig ändring borttagen!');
      setDeleteConfirmId(null);
      await fetchCurrentLevel();
      await fetchHistory();

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting temporary membership:', error);
      setMessage('Kunde inte ta bort tillfällig ändring.');
      setDeleteConfirmId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTemp(null);
    setIsTemporary(false);
    setValidFrom('');
    setValidUntil('');
    setReason('');
    setMembershipLevel(permanentLevel);
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Medlemskap
        </h3>
        {loadingCurrent || loadingHistory ? (
          <p className="text-gray-600 text-sm">Läser in...</p>
        ) : (
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-gray-700 font-medium">Aktuell nivå:</span>
                {activeTempMembership ? (
                  <div className="flex items-center gap-2">
                    {getLevelBadge(activeTempMembership.new_level)}
                    <span className="text-sm text-gray-600">
                      (tillfällig {formatDate(activeTempMembership.valid_from!)} till {formatDate(activeTempMembership.valid_until!)})
                    </span>
                  </div>
                ) : (
                  getLevelBadge(permanentLevel)
                )}
              </div>
              {activeTempMembership && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-700 font-medium">Därefter åter till:</span>
                  {getLevelBadge(permanentLevel)}
                  <span className="text-sm text-gray-600">(vald nivå)</span>
                </div>
              )}
            </div>
            {lastChanged && (
              <p className="text-sm text-gray-600">
                Senast ändrat: {formatDateTime(lastChanged)}
              </p>
            )}
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-black" style={{ fontFamily: 'Lobster, cursive' }}>
            {editingTemp ? 'Redigera Tillfällig Ändring' : 'Ändra Medlemskap'}
          </h3>
          {editingTemp && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm text-gray-700 hover:text-black transition-colors"
            >
              Avbryt
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Ny nivå
            </label>
            <select
              value={membershipLevel}
              onChange={(e) => setMembershipLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="free">Gratis</option>
              <option value="silver">Silver</option>
              <option value="gold">Guld</option>
            </select>
          </div>

          {!editingTemp && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="temporary"
                checked={isTemporary}
                onChange={(e) => setIsTemporary(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="temporary" className="text-sm font-medium text-gray-800">
                Tillfällig ändring
              </label>
            </div>
          )}

          {(isTemporary || editingTemp) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Från och med
                </label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Till och med
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  min={validFrom || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Orsak (valfritt)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="T.ex. kampanj, testperiod, manuell justering..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={editingTemp ? handleUpdateTemp : handleSave}
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Sparar...' : editingTemp ? 'Uppdatera' : 'Spara medlemskap'}
            </button>
            {editingTemp && (
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Avbryt
              </button>
            )}
          </div>

          {message && (
            <p className={`text-sm ${message.includes('inte') || message.includes('redan') || message.includes('Ange') || message.includes('måste') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Historik
        </h3>

        {loadingHistory ? (
          <p className="text-gray-600 text-sm">Läser in historik...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-600 text-sm">Ingen historik ännu.</p>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-800">Datum</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-800">Ändring</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-800">Typ</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-800">Period</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-800">Orsak</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-800">Åtgärd</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const today = new Date().toISOString().split('T')[0];
                  const canEdit = item.is_temporary && item.valid_until && item.valid_until >= today;

                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-gray-600">{getLevelLabel(item.old_level)}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="font-medium text-gray-900">{getLevelLabel(item.new_level)}</span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {item.is_temporary ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">
                            Tillfällig
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                            Permanent
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {item.valid_from && item.valid_until ? (
                          <span>{formatDate(item.valid_from)} – {formatDate(item.valid_until)}</span>
                        ) : item.valid_until ? (
                          <span>Till {formatDate(item.valid_until)}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {item.reason || '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        {canEdit && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditTemp(item)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              style={{ color: '#56c5c5' }}
                              title="Redigera"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors"
                              title="Radera"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-black mb-4">
              Bekräfta borttagning
            </h3>
            <p className="text-gray-700 mb-6">
              Är du säker på att du vill ta bort denna tillfälliga ändring?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={() => handleDeleteTemp(deleteConfirmId)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
