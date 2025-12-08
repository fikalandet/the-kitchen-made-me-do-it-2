import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Search, X } from 'lucide-react';
import { AdminSectionHeader, AdminTable, AdminCard, AdminButton } from '../../components';

interface ChefPoints {
  id: string;
  full_name: string;
  email: string;
  kitchen_name: string;
  current_balance: number;
  awarded_last_30: number;
  used_last_30: number;
  total_awarded: number;
  total_used: number;
}

export default function PointsOverview() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<ChefPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('current_balance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, kitchen_name, kitchen_points_balance')
        .eq('role', 'seller')
        .order('kitchen_points_balance', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: history, error: historyError } = await supabase
        .from('chef_kitchen_points_history')
        .select('chef_id, delta, created_at')
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const chefsWithPoints = (profiles || []).map(chef => {
        const chefHistory = history?.filter(h => h.chef_id === chef.id) || [];

        const totalAwarded = chefHistory
          .filter(h => h.delta > 0)
          .reduce((sum, h) => sum + h.delta, 0);

        const totalUsed = Math.abs(
          chefHistory
            .filter(h => h.delta < 0)
            .reduce((sum, h) => sum + h.delta, 0)
        );

        const recentHistory = chefHistory.filter(h => {
          const date = new Date(h.created_at);
          return date >= thirtyDaysAgo;
        });

        const awardedLast30 = recentHistory
          .filter(h => h.delta > 0)
          .reduce((sum, h) => sum + h.delta, 0);

        const usedLast30 = Math.abs(
          recentHistory
            .filter(h => h.delta < 0)
            .reduce((sum, h) => sum + h.delta, 0)
        );

        return {
          id: chef.id,
          full_name: chef.full_name,
          email: chef.email,
          kitchen_name: chef.kitchen_name,
          current_balance: chef.kitchen_points_balance || 0,
          awarded_last_30: awardedLast30,
          used_last_30: usedLast30,
          total_awarded: totalAwarded,
          total_used: totalUsed,
        };
      });

      setChefs(chefsWithPoints);
    } catch (error) {
      console.error('Error fetching chefs points:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChefs = chefs.filter(chef => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      chef.full_name?.toLowerCase().includes(query) ||
      chef.email?.toLowerCase().includes(query) ||
      chef.kitchen_name?.toLowerCase().includes(query)
    );

    const matchesBalance =
      balanceFilter === 'all' ||
      (balanceFilter === 'has_points' && chef.current_balance > 0) ||
      (balanceFilter === 'zero' && chef.current_balance === 0);

    let matchesPeriod = true;
    if (periodFilter === '30') {
      matchesPeriod = chef.awarded_last_30 > 0 || chef.used_last_30 > 0;
    }

    return matchesSearch && matchesBalance && matchesPeriod;
  });

  const sortedChefs = [...filteredChefs].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'full_name':
        aVal = a.full_name?.toLowerCase() || '';
        bVal = b.full_name?.toLowerCase() || '';
        break;
      case 'current_balance':
        aVal = a.current_balance;
        bVal = b.current_balance;
        break;
      case 'awarded_last_30':
        aVal = a.awarded_last_30;
        bVal = b.awarded_last_30;
        break;
      case 'used_last_30':
        aVal = a.used_last_30;
        bVal = b.used_last_30;
        break;
      case 'total_awarded':
        aVal = a.total_awarded;
        bVal = b.total_awarded;
        break;
      case 'total_used':
        aVal = a.total_used;
        bVal = b.total_used;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setBalanceFilter('all');
    setPeriodFilter('all');
  };

  const stats = {
    totalAwarded: chefs.reduce((sum, c) => sum + c.total_awarded, 0),
    totalUsed: chefs.reduce((sum, c) => sum + c.total_used, 0),
    activeBalance: chefs.reduce((sum, c) => sum + c.current_balance, 0),
    averageBalance: chefs.length > 0
      ? Math.round(chefs.reduce((sum, c) => sum + c.current_balance, 0) / chefs.length)
      : 0,
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-black">{sortDirection === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div>
      <AdminSectionHeader title="Kockar – Poäng (översikt)" />

      <div className="mb-6 space-y-4">
        <AdminCard>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[280px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Sök kock
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Namn, e-post eller kök..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[180px] max-w-[220px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Poängstatus
                </label>
                <select
                  value={balanceFilter}
                  onChange={(e) => setBalanceFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla</option>
                  <option value="has_points">Har poäng &gt; 0</option>
                  <option value="zero">Har 0 poäng</option>
                </select>
              </div>

              <div className="flex-1 min-w-[180px] max-w-[220px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Period
                </label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla</option>
                  <option value="30">Senaste 30 dagar</option>
                </select>
              </div>

              <div>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">Rensa</span>
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-700 font-medium">
              {filteredChefs.length} kockar hittades
            </div>
          </div>
        </AdminCard>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-5">
            <div className="text-sm font-medium text-green-900 mb-1">Totalt utdelade poäng</div>
            <div className="text-3xl font-bold text-green-900">{stats.totalAwarded.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-lg p-5">
            <div className="text-sm font-medium text-red-900 mb-1">Totalt använda poäng</div>
            <div className="text-3xl font-bold text-red-900">{stats.totalUsed.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg p-5">
            <div className="text-sm font-medium text-blue-900 mb-1">Aktivt saldo totalt</div>
            <div className="text-3xl font-bold text-blue-900">{stats.activeBalance.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400 rounded-lg p-5">
            <div className="text-sm font-medium text-amber-900 mb-1">Genomsnittligt saldo</div>
            <div className="text-3xl font-bold text-amber-900">{stats.averageBalance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Alla kockars poäng
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-700">Läser in...</div>
        ) : (
          <AdminTable
            headers={[
              <SortableHeader key="name" field="full_name">Kock</SortableHeader>,
              'E-post',
              <SortableHeader key="balance" field="current_balance">Aktuellt saldo</SortableHeader>,
              <SortableHeader key="awarded30" field="awarded_last_30">Utdelat 30 dagar</SortableHeader>,
              <SortableHeader key="used30" field="used_last_30">Använt 30 dagar</SortableHeader>,
              <SortableHeader key="totalAwarded" field="total_awarded">Totalt utdelade</SortableHeader>,
              <SortableHeader key="totalUsed" field="total_used">Totalt använda</SortableHeader>,
              'Åtgärder',
            ]}
          >
            {sortedChefs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-700">
                  Inga kockar hittades
                </td>
              </tr>
            ) : (
              sortedChefs.map(chef => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-black">
                      {chef.current_balance.toLocaleString()} p
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-medium">
                    {chef.awarded_last_30 > 0 ? `+${chef.awarded_last_30.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700 font-medium">
                    {chef.used_last_30 > 0 ? `−${chef.used_last_30.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.total_awarded.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.total_used.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AdminButton
                      variant="secondary"
                      onClick={() => navigate(`/admin/kockar/${chef.id}?tab=poang`)}
                      className="text-sm py-1.5 px-4"
                    >
                      Öppna kock
                    </AdminButton>
                  </td>
                </tr>
              ))
            )}
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
