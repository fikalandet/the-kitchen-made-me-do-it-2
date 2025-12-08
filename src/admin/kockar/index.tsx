import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, X } from 'lucide-react';
import { AdminSectionHeader, AdminTable, AdminCard, AdminButton } from '../components';
import MembershipOverview from './components/MembershipOverview';
import PointsOverview from './components/PointsOverview';
import CommissionOverview from './components/CommissionOverview';
import GeographicDistribution from './components/GeographicDistribution';
import GlobalDocumentsTab from './components/GlobalDocumentsTab';

type TabType = 'register' | 'medlemskap' | 'poang' | 'provision' | 'geografisk' | 'dokument' | 'varningar';

interface Chef {
  id: string;
  full_name: string;
  email: string;
  city: string;
  is_verified: boolean;
  membership_level: string;
  kitchen_name: string;
  created_at: string;
  warnings?: {
    total: number;
    new: number;
  };
}

export default function Kockar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('register');
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  useEffect(() => {
    if (activeTab === 'register') {
      fetchChefs();
    }
  }, [activeTab]);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, city, is_verified, membership_level, kitchen_name, created_at')
        .eq('role', 'seller')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: warningsData } = await supabase
        .from('chef_warnings')
        .select('chef_id, status, is_new');

      const warningsByChef = warningsData?.reduce((acc: Record<string, { total: number; new: number }>, warning) => {
        if (!acc[warning.chef_id]) {
          acc[warning.chef_id] = { total: 0, new: 0 };
        }
        if (warning.status === 'öppen') {
          acc[warning.chef_id].total++;
          if (warning.is_new) {
            acc[warning.chef_id].new++;
          }
        }
        return acc;
      }, {}) || {};

      const chefsWithWarnings = (data || []).map(chef => ({
        ...chef,
        warnings: warningsByChef[chef.id] || { total: 0, new: 0 }
      }));

      setChefs(chefsWithWarnings);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCities = Array.from(new Set(chefs.map(chef => chef.city).filter(Boolean))).sort();

  const resetFilters = () => {
    setSearchQuery('');
    setMembershipFilter('all');
    setStatusFilter('all');
    setCityFilter('all');
  };

  const filteredChefs = chefs.filter(chef => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      chef.full_name?.toLowerCase().includes(query) ||
      chef.email?.toLowerCase().includes(query) ||
      chef.kitchen_name?.toLowerCase().includes(query)
    );

    const matchesMembership = membershipFilter === 'all' || chef.membership_level === membershipFilter;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const chefCreatedAt = new Date(chef.created_at);

    // Status mapping:
    // - 'active': is_verified = true (kocken är godkänd och aktiv)
    // - 'inactive': is_verified = false (kocken är inte godkänd/verifierad ännu)
    // - 'new': created_at inom senaste 30 dagarna (nya kockar)
    // OBS: Status som 'pausade', 'avslutade', 'i onboarding' är inte implementerade i databasen ännu,
    // men kan lätt läggas till när dessa fält finns tillgängliga i profiles-tabellen.
    const matchesStatus = (() => {
      switch (statusFilter) {
        case 'all':
          return true;
        case 'active':
          return chef.is_verified === true;
        case 'inactive':
          return chef.is_verified === false;
        case 'new':
          return chefCreatedAt >= thirtyDaysAgo;
        default:
          return true;
      }
    })();

    const matchesCity = cityFilter === 'all' || chef.city === cityFilter;

    return matchesSearch && matchesMembership && matchesStatus && matchesCity;
  });

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Väntar</span>;
  };

  const getMembershipBadge = (level: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      silver: 'bg-gray-300 text-gray-900',
      gold: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level] || colors.free}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: 'register', label: 'Kockregister' },
    { id: 'medlemskap', label: 'Medlemskap' },
    { id: 'poang', label: 'Poäng' },
    { id: 'provision', label: 'Provision' },
    { id: 'geografisk', label: 'Geografisk spridning' },
    { id: 'dokument', label: 'Dokument' },
    { id: 'varningar', label: 'Varningar' },
  ];

  return (
    <div>
      <div className="mb-6 border-b border-gray-300">
        <nav className="-mb-px flex gap-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'register' && (
        <div>
          <AdminSectionHeader title="Kockregister" />

          <AdminCard>
            <div className="mb-6 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök på namn, e-post eller kök..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[180px] max-w-[220px]">
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Medlemskap
                  </label>
                  <select
                    value={membershipFilter}
                    onChange={(e) => setMembershipFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  >
                    <option value="all">Alla medlemskap</option>
                    <option value="free">Gratis</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Guld</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[280px] max-w-[320px]">
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  >
                    <option value="all">Alla statusar</option>
                    <option value="active">Aktiva</option>
                    <option value="inactive">Inaktiva</option>
                    <option value="new">Nya kockar (senaste 30 dagar)</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[180px] max-w-[220px]">
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Ort
                  </label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  >
                    <option value="all">Alla orter</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Rensa filter</span>
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-700">
                Visar {filteredChefs.length} av {chefs.length} kockar
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-700">Läser in kockar...</div>
            ) : (
              <AdminTable headers={['Namn', 'E-post', 'Stad/Område', 'Status', 'Medlemskap', 'Varningar', 'Åtgärder']}>
                {filteredChefs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-700">
                      Inga kockar hittades
                    </td>
                  </tr>
                ) : (
                  filteredChefs.map(chef => (
                    <tr key={chef.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black">{chef.full_name || 'Ej angivet'}</div>
                          {chef.kitchen_name && (
                            <div className="text-sm text-gray-700">{chef.kitchen_name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {chef.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {chef.city || 'Ej angivet'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(chef.is_verified)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMembershipBadge(chef.membership_level)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {chef.warnings && chef.warnings.total > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border-2 border-red-300">
                              {chef.warnings.total}
                            </span>
                            {chef.warnings.new > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                {chef.warnings.new} ny
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AdminButton
                          variant="secondary"
                          onClick={() => navigate(`/admin/kockar/${chef.id}`)}
                          className="text-sm py-1.5 px-4"
                        >
                          Visa kock
                        </AdminButton>
                      </td>
                    </tr>
                  ))
                )}
              </AdminTable>
            )}
          </AdminCard>
        </div>
      )}

      {activeTab === 'medlemskap' && (
        <MembershipOverview />
      )}

      {activeTab === 'poang' && (
        <PointsOverview />
      )}

      {activeTab === 'provision' && (
        <CommissionOverview />
      )}

      {activeTab === 'geografisk' && (
        <GeographicDistribution />
      )}

      {activeTab === 'dokument' && (
        <GlobalDocumentsTab />
      )}

      {activeTab === 'varningar' && (
        <div className="text-gray-600">Här bygger vi Varningar senare.</div>
      )}
    </div>
  );
}
