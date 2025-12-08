import React, { useState, useEffect } from 'react';
import { QrCode, Search, Eye, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Redemption {
  id: string;
  code: string;
  amount: number;
  sent_to: string;
  delivery_method: string;
  greeting_message: string;
  heading: string;
  template: string;
  redeemed: boolean;
  redeemed_at: string;
  created_at: string;
  payment_split_chef: number;
  payment_split_platform: number;
}

export default function GiftCards() {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [isGoldMember, setIsGoldMember] = useState(false);

  useEffect(() => {
    if (user) {
      checkMembership();
      fetchRedemptions();
    }
  }, [user]);

  const checkMembership = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('membership_level')
      .eq('id', user.id)
      .maybeSingle();

    setIsGoldMember(true);
  };

  const fetchRedemptions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('giftcard_redemptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching redemptions:', error);
    } else {
      setRedemptions(data || []);
    }
    setLoading(false);
  };

  if (!isGoldMember) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Presentkort</h2>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#f6f2e0' }}>
            <CreditCard size={40} style={{ color: '#a1c798' }} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Endast för guldmedlemmar</h3>
          <p className="text-gray-600 mb-6">
            Presentkortsfunktionen är endast tillgänglig för guldkockar. Uppgradera ditt medlemskap för att börja sälja presentkort.
          </p>
          <button
            className="px-6 py-3 rounded-lg text-white"
            style={{ backgroundColor: '#a1c798' }}
          >
            Uppgradera till Guld
          </button>
        </div>
      </div>
    );
  }

  const totalSales = redemptions.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalEarnings = redemptions.reduce((sum, r) => sum + (r.payment_split_chef || 0), 0);
  const redeemedCount = redemptions.filter(r => r.redeemed).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Presentkort</h2>
        <button
          onClick={() => setShowRedeemModal(true)}
          className="px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-colors"
          style={{ backgroundColor: '#56c5c5' }}
        >
          <QrCode size={20} />
          Läs in presentkort
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totalt sålda</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{redemptions.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f6f2e0' }}>
              <CreditCard size={24} style={{ color: '#a1c798' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totalt värde</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalSales.toFixed(0)} kr</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f6f2e0' }}>
              <CreditCard size={24} style={{ color: '#56c5c5' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Din andel (85%)</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalEarnings.toFixed(0)} kr</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#a1c798' }}>
              <span className="text-white font-bold">kr</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inlösta</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{redeemedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f6f2e0' }}>
              <Eye size={24} style={{ color: '#a1c798' }} />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Laddar presentkort...</p>
        </div>
      ) : redemptions.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-xl bg-white shadow-md">
          <p className="text-gray-600 mb-4">Inga presentkort har sålts än.</p>
          <p className="text-sm text-gray-500">När kunder köper presentkort kommer de att visas här.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f6f2e0' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Belopp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Mottagare
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Skapad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Din andel
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {redemptions.map((redemption) => (
                <tr key={redemption.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{redemption.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{redemption.amount} kr</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{redemption.sent_to}</div>
                    <div className="text-xs text-gray-500">{redemption.delivery_method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(redemption.created_at).toLocaleDateString('sv-SE')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        redemption.redeemed
                          ? 'text-white'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                      style={redemption.redeemed ? { backgroundColor: '#a1c798' } : {}}
                    >
                      {redemption.redeemed ? 'Inlöst' : 'Aktivt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold" style={{ color: '#a1c798' }}>
                      {redemption.payment_split_chef?.toFixed(0)} kr
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRedeemModal && (
        <RedeemGiftCardModal
          onClose={() => {
            setShowRedeemModal(false);
            fetchRedemptions();
          }}
        />
      )}
    </div>
  );
}

function RedeemGiftCardModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('');
  const [redemption, setRedemption] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCode = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('giftcard_redemptions')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (fetchError || !data) {
      setError('Presentkortet kunde inte hittas');
      setRedemption(null);
    } else if (data.redeemed) {
      setError('Detta presentkort har redan lösts in');
      setRedemption(null);
    } else {
      setRedemption(data);
      setError(null);
    }

    setLoading(false);
  };

  const redeemCard = async () => {
    if (!redemption) return;

    const { error: updateError } = await supabase
      .from('giftcard_redemptions')
      .update({
        redeemed: true,
        redeemed_at: new Date().toISOString()
      })
      .eq('id', redemption.id);

    if (!updateError) {
      alert('Presentkortet har markerats som inlöst!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">Läs in presentkort</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Skriv in kod eller skanna QR
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="GIFT-XXXX-YYYY"
              />
              <button
                onClick={searchCode}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#56c5c5' }}
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {redemption && (
            <div className="p-4 rounded-lg border-2 bg-green-50" style={{ borderColor: '#a1c798' }}>
              <h4 className="font-semibold text-gray-900 mb-2">Giltigt presentkort!</h4>
              <p className="text-sm text-gray-700">Belopp: {redemption.amount} kr</p>
              <p className="text-sm text-gray-700">Skickat till: {redemption.sent_to}</p>
              {redemption.greeting_message && (
                <p className="text-sm text-gray-700 italic mt-2 p-2 bg-white rounded">
                  {redemption.greeting_message}
                </p>
              )}
              <button
                onClick={redeemCard}
                className="mt-4 w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#a1c798' }}
              >
                Markera som inlöst
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
