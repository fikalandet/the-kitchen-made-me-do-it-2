import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Crown, Info } from 'lucide-react';
import { MembershipMatrixModal } from '../../../components/MembershipMatrixModal';

interface MembershipLevel {
  level: string;
  price: number;
  commission: number;
  features: string[];
}

interface CommissionData {
  standardCommission: number;
  currentCommission: number;
  isTemporary: boolean;
  validFrom: string | null;
  validTo: string | null;
  isRegistrationRefund: boolean;
  registrationFeeAmount: number;
  registrationFeeRefunded: number;
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

const membershipLevels: MembershipLevel[] = [
  {
    level: 'free',
    price: 0,
    commission: 80,
    features: [
      'Grundläggande produkter',
      'Standardsynlighet',
      'Grundläggande support',
      'Tillgång till marknadsplatsen',
    ],
  },
  {
    level: 'silver',
    price: 299,
    commission: 80,
    features: [
      'Alla Free-funktioner',
      'Ökad synlighet',
      'Prioriterad support',
      'Avancerad statistik',
      'Marknadsföringsverktyg',
    ],
  },
  {
    level: 'guld',
    price: 599,
    commission: 85,
    features: [
      'Alla Silver-funktioner',
      'Högsta synlighet',
      'Dedikerad support',
      'Premium-märkning',
      'Exklusiva kampanjer',
      'AI-tips och analys',
      'Tidiga tillgång till nya funktioner',
    ],
  },
];

export const KitchenMembershipTab: React.FC = () => {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<string>('free');
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [history, setHistory] = useState<CommissionHistoryEntry[]>([]);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMembershipLevel();
      fetchCommissionData();
      fetchHistory();
    }
  }, [user]);

  const fetchMembershipLevel = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('membership_level')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) {
      setCurrentLevel(data.membership_level || 'free');
    }
  };

  const fetchCommissionData = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_custom_commission, custom_commission_percent, custom_commission_valid_from, custom_commission_valid_to, membership_level, temporary_commission_is_registration_refund, registration_fee_amount, registration_fee_refunded_amount')
      .eq('id', user?.id)
      .maybeSingle();

    if (profile) {
      const { data: membershipData } = await supabase
        .from('membership_levels')
        .select('commission_percentage')
        .eq('level', profile.membership_level || 'free')
        .maybeSingle();

      const standardCommission = membershipData?.commission_percentage || 80;
      let currentCommission = standardCommission;
      let isTemporary = false;

      if (profile.has_custom_commission && profile.custom_commission_percent) {
        const today = new Date();
        const validFrom = profile.custom_commission_valid_from ? new Date(profile.custom_commission_valid_from) : null;
        const validTo = profile.custom_commission_valid_to ? new Date(profile.custom_commission_valid_to) : null;

        const isWithinPeriod =
          (!validFrom || today >= validFrom) &&
          (!validTo || today <= validTo);

        if (isWithinPeriod) {
          currentCommission = profile.custom_commission_percent;
          isTemporary = true;
        }
      }

      setCommissionData({
        standardCommission,
        currentCommission,
        isTemporary,
        validFrom: profile.custom_commission_valid_from,
        validTo: profile.custom_commission_valid_to,
        isRegistrationRefund: profile.temporary_commission_is_registration_refund || false,
        registrationFeeAmount: profile.registration_fee_amount || 0,
        registrationFeeRefunded: profile.registration_fee_refunded_amount || 0
      });
    }
  };

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('chef_commission_history')
      .select('*')
      .eq('chef_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setHistory(data);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'free':
        return '#a1c798';
      case 'silver':
        return '#C0C0C0';
      case 'guld':
      case 'gold':
        return '#FFD700';
      default:
        return '#a1c798';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const getLevelName = (level: string) => {
    if (level === 'free') return 'Gratis-kock';
    if (level === 'silver') return 'Silver-kock';
    if (level === 'gold' || level === 'guld') return 'Guld-kock';
    return 'Gratis-kock';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lobster text-3xl text-gray-800 mb-2">Medlemskap & Provision</h2>
        <p className="text-gray-600">Hantera ditt medlemskap och se din provision</p>
      </div>

      <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
        <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Crown size={20} />
          Ditt nuvarande medlemskap
        </h3>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Ordinarie provision</h4>
              <p className="text-4xl font-bold" style={{ color: getLevelColor(currentLevel) }}>
                {commissionData?.standardCommission || 80}%
              </p>
            </div>
            <div className="text-right">
              <h4 className="text-lg font-bold" style={{ color: getLevelColor(currentLevel) }}>
                {getLevelName(currentLevel)}
              </h4>
              <p className="text-sm text-gray-600">
                {membershipLevels.find(m => m.level === currentLevel)?.price} SEK/månad
              </p>
            </div>
          </div>
          {commissionData?.isTemporary && (
            <div className="border-t pt-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">AKTUELL PROVISION (TILLFÄLLIG)</p>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#56c5c5' }}>
                      {commissionData.currentCommission}%
                    </p>
                    {commissionData.validFrom && (
                      <p className="text-xs text-blue-700">
                        Gäller: {formatDate(commissionData.validFrom)}
                        {commissionData.validTo && ` – ${formatDate(commissionData.validTo)}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {commissionData?.isRegistrationRefund && commissionData.registrationFeeAmount > 0 && (
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Återbetalning av livsmedelsregistrering</h3>
          <div className="bg-white rounded-lg p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">TILLFÄLLIG PROVISION</span>
                {commissionData.validFrom && (
                  <span className="text-sm text-gray-600">
                    {formatDate(commissionData.validFrom)}
                    {commissionData.validTo && ` – ${formatDate(commissionData.validTo)}`}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#56c5c5' }}>
                {commissionData.currentCommission}%
              </p>
              <p className="text-sm text-gray-600">Återbetalning livsmedelsregistrering</p>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Återbetalat</span>
                <span className="font-semibold text-gray-900">
                  {commissionData.registrationFeeRefunded.toFixed(2)} kr av {commissionData.registrationFeeAmount.toFixed(2)} kr
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${Math.min((commissionData.registrationFeeRefunded / commissionData.registrationFeeAmount) * 100, 100)}%`,
                    backgroundColor: '#56c5c5'
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {Math.max(commissionData.registrationFeeAmount - commissionData.registrationFeeRefunded, 0).toFixed(2)} kr kvar att återbetala
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Historik</h3>
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Datum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Typ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Provision</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Notering</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    Ingen historik ännu
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.commission_type === 'temporary'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.commission_type === 'temporary' ? 'Tillfällig' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {entry.commission_percent}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entry.note || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setShowMatrixModal(true)}
          className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#000000', color: '#ffffff' }}
        >
          Vad ingår i Gratis-, Silver- & Guldmedlemskap
        </button>
        <button
          className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#56c5c5', color: '#ffffff' }}
        >
          Uppgradera
        </button>
      </div>

      <MembershipMatrixModal isOpen={showMatrixModal} onClose={() => setShowMatrixModal(false)} />

      <div className="rounded-lg p-6 border-2" style={{ borderColor: '#56c5c5', backgroundColor: '#fff' }}>
        <div className="flex items-start gap-3">
          <Info size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#56c5c5' }} />
          <div>
            <p className="text-sm text-gray-700">
              Här ser du din aktuella provision, tillfälliga justeringar och eventuell återbetalning av livsmedelsregistrering. Provisionen uppdateras automatiskt varje gång du får en utbetalning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
