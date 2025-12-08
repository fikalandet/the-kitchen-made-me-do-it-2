import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, Award } from 'lucide-react';

interface MembershipLevel {
  level: string;
  commission_percentage: number;
  features: any;
  max_products: number | null;
}

export const Membership: React.FC = () => {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<string>('free');
  const [memberships, setMemberships] = useState<MembershipLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('membership_level')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) {
      setCurrentLevel(profileData.membership_level);
    }

    const { data: membershipData } = await supabase
      .from('membership_levels')
      .select('*')
      .order('commission_percentage', { ascending: false });

    if (membershipData) {
      setMemberships(membershipData);
    }

    setLoading(false);
  };

  const handleUpgrade = async (level: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ membership_level: level })
      .eq('id', user.id);

    if (!error) {
      setCurrentLevel(level);
      alert(`Du har uppgraderat till ${level === 'silver' ? 'Silver' : 'Guld'}-medlemskap!`);
    } else {
      alert('Ett fel uppstod vid uppgradering. Försök igen.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Läser in...</p>
      </div>
    );
  }

  const getMembershipIcon = (level: string) => {
    switch (level) {
      case 'gold':
        return <Crown size={32} className="text-yellow-600" />;
      case 'silver':
        return <Award size={32} className="text-gray-500" />;
      default:
        return <Check size={32} className="text-gray-400" />;
    }
  };

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'gold':
        return '#fbbf24';
      case 'silver':
        return '#9ca3af';
      default:
        return '#d1d5db';
    }
  };

  const getMembershipName = (level: string) => {
    switch (level) {
      case 'gold':
        return 'Guld';
      case 'silver':
        return 'Silver';
      default:
        return 'Gratis';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-lobster text-4xl text-gray-800 mb-2">Medlemskap</h1>
        <p className="text-gray-600">
          Uppgradera ditt medlemskap för att få lägre provision och fler funktioner
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {memberships.map((membership) => {
          const isCurrentLevel = membership.level === currentLevel;
          const canUpgrade =
            (currentLevel === 'free' && (membership.level === 'silver' || membership.level === 'gold')) ||
            (currentLevel === 'silver' && membership.level === 'gold');

          return (
            <div
              key={membership.level}
              className={`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                isCurrentLevel ? 'ring-4 ring-opacity-50' : ''
              }`}
              style={{
                backgroundColor: '#f6f2e0',
                ...(isCurrentLevel && { ringColor: getMembershipColor(membership.level) })
              }}
            >
              <div
                className="p-6 text-white text-center"
                style={{ backgroundColor: getMembershipColor(membership.level) }}
              >
                <div className="flex justify-center mb-3">
                  {getMembershipIcon(membership.level)}
                </div>
                <h2 className="font-lobster text-3xl mb-2">
                  {getMembershipName(membership.level)}
                </h2>
                <div className="text-4xl font-bold mb-1">
                  {membership.commission_percentage}%
                </div>
                <p className="text-sm opacity-90">Provision</p>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      {membership.max_products
                        ? `Upp till ${membership.max_products} produkter`
                        : 'Obegränsat antal produkter'}
                    </span>
                  </div>

                  {membership.features?.messaging && (
                    <div className="flex items-start gap-3">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Meddelandefunktion</span>
                    </div>
                  )}

                  {membership.features?.boost && (
                    <div className="flex items-start gap-3">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Boost produkter</span>
                    </div>
                  )}

                  {membership.features?.can_award_points && (
                    <div className="flex items-start gap-3">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Dela ut guldpoäng</span>
                    </div>
                  )}

                  {membership.features?.advanced_analytics && (
                    <div className="flex items-start gap-3">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Avancerad analys</span>
                    </div>
                  )}
                </div>

                {isCurrentLevel ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg font-medium bg-gray-300 text-gray-600 cursor-not-allowed"
                  >
                    Nuvarande plan
                  </button>
                ) : canUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(membership.level)}
                    className="w-full py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: getMembershipColor(membership.level) }}
                  >
                    Uppgradera till {getMembershipName(membership.level)}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
                  >
                    {membership.level === 'free' ? 'Standard' : 'Ej tillgänglig'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 rounded-lg" style={{ backgroundColor: '#f6f2e0' }}>
        <h3 className="font-lobster text-2xl text-gray-800 mb-4">Om medlemskap</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>Gratis:</strong> Perfekt för att komma igång. Sälj upp till 10 produkter med 15% provision.
          </p>
          <p>
            <strong>Silver:</strong> För seriösa säljare. Sälj upp till 50 produkter med endast 10% provision.
            Boost dina produkter och dela ut guldpoäng till dina kunder.
          </p>
          <p>
            <strong>Guld:</strong> För professionella kockar. Obegränsat antal produkter med endast 5% provision.
            Alla funktioner inklusive avancerad analys och prioriterad support.
          </p>
        </div>
      </div>
    </div>
  );
};
