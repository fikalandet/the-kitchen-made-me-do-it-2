import { useState, useEffect } from 'react';
import { AdminCard } from '../../components';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface ChefProvisionTabProps {
  chefId: string;
}

interface ChefProvisionData {
  has_custom_commission: boolean;
  custom_commission_percent: number | null;
  custom_commission_valid_from: string | null;
  custom_commission_valid_to: string | null;
  custom_commission_note: string | null;
  membership_level: string;
  standard_commission: number;
  temporary_commission_is_registration_refund: boolean;
  registration_fee_amount: number;
  registration_fee_refunded_amount: number;
  registration_fee_refund_completed: boolean;
}

interface CommissionHistoryEntry {
  id: string;
  commission_type: string;
  commission_percent: number;
  valid_from: string | null;
  valid_to: string | null;
  note: string | null;
  created_at: string;
}

export default function ChefProvisionTab({ chefId }: ChefProvisionTabProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ChefProvisionData | null>(null);
  const [history, setHistory] = useState<CommissionHistoryEntry[]>([]);
  const [isTemporaryActive, setIsTemporaryActive] = useState(false);
  const [isRegistrationRefund, setIsRegistrationRefund] = useState(false);
  const [formData, setFormData] = useState({
    percent: 0,
    validFrom: '',
    validTo: '',
    note: '',
    registrationFeeAmount: 0
  });

  useEffect(() => {
    fetchProvisionData();
    fetchHistory();
  }, [chefId]);

  const fetchProvisionData = async () => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('has_custom_commission, custom_commission_percent, custom_commission_valid_from, custom_commission_valid_to, custom_commission_note, membership_level, temporary_commission_is_registration_refund, registration_fee_amount, registration_fee_refunded_amount, registration_fee_refund_completed')
        .eq('id', chefId)
        .maybeSingle();

      if (profileError) throw profileError;

      const { data: membershipData, error: membershipError } = await supabase
        .from('membership_levels')
        .select('commission_percentage')
        .eq('level', profile?.membership_level || 'free')
        .maybeSingle();

      if (membershipError) throw membershipError;

      const provisionData: ChefProvisionData = {
        has_custom_commission: profile?.has_custom_commission || false,
        custom_commission_percent: profile?.custom_commission_percent || null,
        custom_commission_valid_from: profile?.custom_commission_valid_from || null,
        custom_commission_valid_to: profile?.custom_commission_valid_to || null,
        custom_commission_note: profile?.custom_commission_note || null,
        membership_level: profile?.membership_level || 'free',
        standard_commission: membershipData?.commission_percentage || 15,
        temporary_commission_is_registration_refund: profile?.temporary_commission_is_registration_refund || false,
        registration_fee_amount: profile?.registration_fee_amount || 0,
        registration_fee_refunded_amount: profile?.registration_fee_refunded_amount || 0,
        registration_fee_refund_completed: profile?.registration_fee_refund_completed || false
      };

      setData(provisionData);
      setIsTemporaryActive(provisionData.has_custom_commission);
      setIsRegistrationRefund(provisionData.temporary_commission_is_registration_refund);
      setFormData({
        percent: provisionData.custom_commission_percent || 0,
        validFrom: provisionData.custom_commission_valid_from || '',
        validTo: provisionData.custom_commission_valid_to || '',
        note: provisionData.custom_commission_note || '',
        registrationFeeAmount: provisionData.registration_fee_amount || 0
      });
    } catch (error) {
      console.error('Fel vid laddning av provisionsdata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chef_commission_history')
        .select('*')
        .eq('chef_id', chefId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Fel vid laddning av historik:', error);
    }
  };

  const getMembershipBadge = (level: string) => {
    const levelMap: { [key: string]: string } = {
      free: 'Gratis',
      silver: 'Silver',
      gold: 'Guld'
    };
    return levelMap[level] || level;
  };

  const getCurrentCommission = () => {
    if (!data) return { rate: 0, mode: 'standard', badge: 'Gratis', validUntil: null };

    if (!data.has_custom_commission) {
      return {
        rate: data.standard_commission,
        mode: 'standard',
        badge: getMembershipBadge(data.membership_level),
        validUntil: null
      };
    }

    const today = new Date();
    const validFrom = data.custom_commission_valid_from ? new Date(data.custom_commission_valid_from) : null;
    const validTo = data.custom_commission_valid_to ? new Date(data.custom_commission_valid_to) : null;

    const isWithinPeriod =
      (!validFrom || today >= validFrom) &&
      (!validTo || today <= validTo);

    if (isWithinPeriod && data.custom_commission_percent !== null) {
      return {
        rate: data.custom_commission_percent,
        mode: 'temporary',
        badge: 'Tillfällig',
        validUntil: data.custom_commission_valid_to
      };
    }

    return {
      rate: data.standard_commission,
      mode: 'standard',
      badge: getMembershipBadge(data.membership_level),
      validUntil: null
    };
  };

  const handleSave = async () => {
    if (isTemporaryActive && formData.percent <= 0) {
      alert('Ange en giltig provisionssats');
      return;
    }

    if (isTemporaryActive && isRegistrationRefund && formData.registrationFeeAmount <= 0) {
      alert('Ange ett giltigt belopp för livsmedelsregistrering');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        has_custom_commission: isTemporaryActive,
        custom_commission_percent: isTemporaryActive ? formData.percent : null,
        custom_commission_valid_from: isTemporaryActive && formData.validFrom ? formData.validFrom : null,
        custom_commission_valid_to: isTemporaryActive && formData.validTo && !isRegistrationRefund ? formData.validTo : null,
        custom_commission_note: isTemporaryActive ? formData.note : null,
        temporary_commission_is_registration_refund: isTemporaryActive && isRegistrationRefund,
        registration_fee_amount: isTemporaryActive && isRegistrationRefund ? formData.registrationFeeAmount : 0
      };

      if (!isTemporaryActive) {
        updateData.registration_fee_refunded_amount = 0;
        updateData.registration_fee_refund_completed = false;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', chefId);

      if (updateError) throw updateError;

      const commissionType = isTemporaryActive ? 'temporary' : 'standard';
      const commissionPercent = isTemporaryActive ? formData.percent : data?.standard_commission || 15;

      const { error: historyError } = await supabase
        .from('chef_commission_history')
        .insert({
          chef_id: chefId,
          commission_type: commissionType,
          commission_percent: commissionPercent,
          valid_from: isTemporaryActive && formData.validFrom ? formData.validFrom : null,
          valid_to: isTemporaryActive && formData.validTo ? formData.validTo : null,
          note: isTemporaryActive ? formData.note : 'Återställd till standardprovision',
          created_by: user?.id
        });

      if (historyError) throw historyError;

      const logMessage = isTemporaryActive
        ? `Tillfällig provision ${formData.percent}% aktiverad ${formData.validFrom ? `från ${formData.validFrom}` : ''} ${formData.validTo ? `till ${formData.validTo}` : '(tills vidare)'}`
        : 'Tillfällig provision avaktiverad, återgått till standardprovision';

      const { error: logError } = await supabase
        .from('chef_warnings')
        .insert({
          chef_id: chefId,
          type: 'provision',
          message: logMessage,
          status: 'löst',
          severity: 'info',
          auto_generated: false,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        });

      if (logError) throw logError;

      await fetchProvisionData();
      await fetchHistory();
    } catch (error) {
      console.error('Fel vid sparande:', error);
      alert('Kunde inte spara provisionsinställningar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminCard>
        <p className="text-gray-700">Laddar provisionsdata...</p>
      </AdminCard>
    );
  }

  const current = getCurrentCommission();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const getBadgeColor = (badge: string) => {
    if (badge === 'Tillfällig') return 'bg-orange-100 text-orange-800';
    if (badge === 'Guld') return 'bg-yellow-100 text-yellow-800';
    if (badge === 'Silver') return 'bg-gray-200 text-gray-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Aktuell provision
        </h3>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-sm text-gray-800">
          Den här vyn gäller bara denna kock. Standardprovisionen ändras i den övergripande adminpanelen.
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-800">Vald nivå av kock:</span>
            <span className="text-sm font-bold text-gray-900">{data?.standard_commission}%</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">Nu gällande provision:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(current.badge)}`}>
                  {current.badge}
                </span>
              </div>
              {current.mode === 'temporary' && current.validUntil && (
                <p className="text-xs text-gray-600 mt-1">
                  Gäller t.o.m. {formatDate(current.validUntil)}
                </p>
              )}
            </div>
            <span className="text-lg font-bold text-black">{current.rate}%</span>
          </div>

          {data?.temporary_commission_is_registration_refund && !data.registration_fee_refund_completed && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-gray-800 mb-2">
                Den tillfälliga provisionen är kopplad till återbetalning av livsmedelsregistrering
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Återbetalat hittills:</span>
                <span className="font-medium text-gray-900">
                  {data.registration_fee_refunded_amount.toFixed(2)} kr av {data.registration_fee_amount.toFixed(2)} kr
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((data.registration_fee_refunded_amount / data.registration_fee_amount) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Skapa tillfällig provision
        </h3>

        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isTemporaryActive}
              onChange={(e) => setIsTemporaryActive(e.target.checked)}
              className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-800">
              Aktivera tillfällig provision för denna kock
            </span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Provisionssats (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.percent}
              onChange={(e) => setFormData({ ...formData, percent: parseFloat(e.target.value) || 0 })}
              disabled={!isTemporaryActive}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="0.0"
            />
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRegistrationRefund}
                onChange={(e) => setIsRegistrationRefund(e.target.checked)}
                disabled={!isTemporaryActive}
                className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded disabled:opacity-50"
              />
              <span className="text-sm font-medium text-gray-800">
                Koppla denna tillfälliga provision till återbetalning av livsmedelsregistrering
              </span>
            </label>
            {isRegistrationRefund && isTemporaryActive && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Registreringsavgift (kr)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.registrationFeeAmount}
                  onChange={(e) => setFormData({ ...formData, registrationFeeAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="1700"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Tillfällig provision kommer gälla tills hela avgiften är återbetald via extra provision
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Startdatum</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                disabled={!isTemporaryActive}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Slutdatum {isRegistrationRefund ? '(ignoreras vid återbetalning)' : '(valfritt)'}
              </label>
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                disabled={!isTemporaryActive || isRegistrationRefund}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Orsak</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              disabled={!isTemporaryActive}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Anledning till tillfällig provision..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm disabled:opacity-50"
          >
            {saving ? 'Sparar...' : 'Spara tillfällig provision'}
          </button>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Historik
        </h3>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Datum</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Typ</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Provision</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Period</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Orsak</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                    Ingen historik ännu
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="py-2 px-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.commission_type === 'temporary'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.commission_type === 'temporary' ? 'Tillfällig' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm font-medium text-gray-900">
                      {entry.commission_percent}%
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {entry.valid_from && entry.valid_to
                        ? `${formatDate(entry.valid_from)} - ${formatDate(entry.valid_to)}`
                        : entry.valid_from
                        ? `Från ${formatDate(entry.valid_from)}`
                        : 'Tills vidare'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {entry.note || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
