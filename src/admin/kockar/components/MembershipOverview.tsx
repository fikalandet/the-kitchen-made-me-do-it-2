import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Search, X } from 'lucide-react';
import { AdminSectionHeader, AdminTable, AdminCard, AdminButton } from '../../components';

interface ChefMembership {
  id: string;
  full_name: string;
  email: string;
  kitchen_name: string;
  membership_level: string;
  is_verified: boolean;
  created_at: string;
  membership_start_date: string | null;
  membership_months: number;
}

export default function MembershipOverview() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<ChefMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('membership_start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, kitchen_name, membership_level, is_verified, created_at')
        .eq('role', 'seller')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const chefsWithMembership = (data || []).map(chef => {
        const createdDate = new Date(chef.created_at);
        const now = new Date();
        const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                          (now.getMonth() - createdDate.getMonth());

        return {
          ...chef,
          membership_start_date: chef.created_at,
          membership_months: Math.max(0, monthsDiff),
        };
      });

      setChefs(chefsWithMembership);
    } catch (error) {
      console.error('Error fetching chefs:', error);
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

    const matchesPlan = planFilter === 'all' || chef.membership_level === planFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && chef.is_verified) ||
      (statusFilter === 'inactive' && !chef.is_verified);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const sortedChefs = [...filteredChefs].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'full_name':
        aVal = a.full_name?.toLowerCase() || '';
        bVal = b.full_name?.toLowerCase() || '';
        break;
      case 'membership_level':
        const levelOrder = { gold: 3, silver: 2, free: 1 };
        aVal = levelOrder[a.membership_level as keyof typeof levelOrder] || 0;
        bVal = levelOrder[b.membership_level as keyof typeof levelOrder] || 0;
        break;
      case 'membership_start_date':
        aVal = new Date(a.membership_start_date || 0).getTime();
        bVal = new Date(b.membership_start_date || 0).getTime();
        break;
      case 'membership_months':
        aVal = a.membership_months;
        bVal = b.membership_months;
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
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setPlanFilter('all');
    setStatusFilter('all');
  };

  const stats = {
    free: chefs.filter(c => c.membership_level === 'free').length,
    silver: chefs.filter(c => c.membership_level === 'silver').length,
    gold: chefs.filter(c => c.membership_level === 'gold').length,
    total: chefs.length,
  };

  const filteredStats = {
    free: filteredChefs.filter(c => c.membership_level === 'free').length,
    silver: filteredChefs.filter(c => c.membership_level === 'silver').length,
    gold: filteredChefs.filter(c => c.membership_level === 'gold').length,
    total: filteredChefs.length,
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      silver: 'bg-gray-300 text-gray-900',
      gold: 'bg-yellow-100 text-yellow-800',
    };
    const labels: Record<string, string> = {
      free: 'Gratis',
      silver: 'Silver',
      gold: 'Guld',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level] || colors.free}`}>
        {labels[level] || level}
      </span>
    );
  };

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Inaktiv</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
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
      <AdminSectionHeader title="Kockar – Medlemskap (översikt)" />

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
                  Plan
                </label>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla planer</option>
                  <option value="free">Gratis</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Guld</option>
                </select>
              </div>

              <div className="flex-1 min-w-[180px] max-w-[220px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-5">
            <div className="text-sm font-medium text-gray-700 mb-1">Gratis</div>
            <div className="text-3xl font-bold text-black">{filteredStats.free}</div>
            {filteredStats.total !== stats.total && (
              <div className="text-xs text-gray-600 mt-1">av {stats.free} totalt</div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-400 rounded-lg p-5">
            <div className="text-sm font-medium text-gray-800 mb-1">Silver</div>
            <div className="text-3xl font-bold text-black">{filteredStats.silver}</div>
            {filteredStats.total !== stats.total && (
              <div className="text-xs text-gray-700 mt-1">av {stats.silver} totalt</div>
            )}
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-lg p-5">
            <div className="text-sm font-medium text-yellow-900 mb-1">Guld</div>
            <div className="text-3xl font-bold text-yellow-900">{filteredStats.gold}</div>
            {filteredStats.total !== stats.total && (
              <div className="text-xs text-yellow-800 mt-1">av {stats.gold} totalt</div>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-5">
            <div className="text-sm font-medium text-green-900 mb-1">Totalt</div>
            <div className="text-3xl font-bold text-green-900">{filteredStats.total}</div>
            {filteredStats.total !== stats.total && (
              <div className="text-xs text-green-800 mt-1">av {stats.total} totalt</div>
            )}
          </div>
        </div>
      </div>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Alla kockars medlemskap
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-700">Läser in...</div>
        ) : (
          <AdminTable
            headers={[
              <SortableHeader key="name" field="full_name">Kock</SortableHeader>,
              'E-post',
              <SortableHeader key="plan" field="membership_level">Plan</SortableHeader>,
              'Status',
              <SortableHeader key="start" field="membership_start_date">Startdatum plan</SortableHeader>,
              <SortableHeader key="months" field="membership_months">Antal månader</SortableHeader>,
              'Åtgärder',
            ]}
          >
            {sortedChefs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-700">
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
                    {getLevelBadge(chef.membership_level)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(chef.is_verified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.membership_start_date ? formatDate(chef.membership_start_date) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.membership_months} mån
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AdminButton
                      variant="secondary"
                      onClick={() => navigate(`/admin/kockar/${chef.id}`)}
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
