import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Search, X } from 'lucide-react';
import { AdminSectionHeader, AdminTable, AdminCard, AdminButton } from '../../components';

interface ChefCommission {
  id: string;
  full_name: string;
  email: string;
  kitchen_name: string;
  membership_level: string;
  standard_commission: number;
  current_commission: number;
  has_custom_commission: boolean;
  custom_commission_percent: number | null;
  custom_commission_valid_from: string | null;
  custom_commission_valid_to: string | null;
  custom_commission_note: string | null;
  temporary_status: 'active' | 'planned' | 'expired' | null;
  is_registration_refund: boolean;
  registration_fee_amount: number;
  registration_fee_refunded: number;
  registration_fee_completed: boolean;
  refund_status: 'active_100' | 'ongoing' | 'completed' | null;
}

export default function CommissionOverview() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<ChefCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [commissionTypeFilter, setCommissionTypeFilter] = useState<string>('all');
  const [temporaryFilter, setTemporaryFilter] = useState<string>('all');
  const [refundFilter, setRefundFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchChefs();
  }, []);

  const getStandardCommission = (level: string): number => {
    if (level === 'gold') return 85;
    return 80;
  };

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, email, kitchen_name, membership_level,
          has_custom_commission, custom_commission_percent,
          custom_commission_valid_from, custom_commission_valid_to,
          custom_commission_note,
          temporary_commission_is_registration_refund,
          registration_fee_amount, registration_fee_refunded_amount,
          registration_fee_refund_completed
        `)
        .eq('role', 'seller')
        .order('full_name', { ascending: true });

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];

      const chefsWithCommission = (data || []).map(chef => {
        const standardCommission = getStandardCommission(chef.membership_level);

        let temporaryStatus: 'active' | 'planned' | 'expired' | null = null;
        if (chef.has_custom_commission && chef.custom_commission_valid_from && chef.custom_commission_valid_to) {
          if (chef.custom_commission_valid_from <= today && chef.custom_commission_valid_to >= today) {
            temporaryStatus = 'active';
          } else if (chef.custom_commission_valid_from > today) {
            temporaryStatus = 'planned';
          } else if (chef.custom_commission_valid_to < today) {
            temporaryStatus = 'expired';
          }
        }

        let refundStatus: 'active_100' | 'ongoing' | 'completed' | null = null;
        if (chef.temporary_commission_is_registration_refund) {
          if (chef.registration_fee_refund_completed) {
            refundStatus = 'completed';
          } else {
            const remaining = (chef.registration_fee_amount || 0) - (chef.registration_fee_refunded_amount || 0);
            if (remaining > 0) {
              refundStatus = temporaryStatus === 'active' ? 'active_100' : 'ongoing';
            } else {
              refundStatus = 'completed';
            }
          }
        }

        let currentCommission = standardCommission;
        if (temporaryStatus === 'active' && chef.custom_commission_percent !== null) {
          currentCommission = chef.custom_commission_percent;
        }

        return {
          id: chef.id,
          full_name: chef.full_name,
          email: chef.email,
          kitchen_name: chef.kitchen_name,
          membership_level: chef.membership_level,
          standard_commission: standardCommission,
          current_commission: currentCommission,
          has_custom_commission: chef.has_custom_commission || false,
          custom_commission_percent: chef.custom_commission_percent,
          custom_commission_valid_from: chef.custom_commission_valid_from,
          custom_commission_valid_to: chef.custom_commission_valid_to,
          custom_commission_note: chef.custom_commission_note,
          temporary_status: temporaryStatus,
          is_registration_refund: chef.temporary_commission_is_registration_refund || false,
          registration_fee_amount: chef.registration_fee_amount || 0,
          registration_fee_refunded: chef.registration_fee_refunded_amount || 0,
          registration_fee_completed: chef.registration_fee_refund_completed || false,
          refund_status: refundStatus,
        };
      });

      setChefs(chefsWithCommission);
    } catch (error) {
      console.error('Error fetching chefs commission:', error);
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

    const matchesCommissionType =
      commissionTypeFilter === 'all' ||
      (commissionTypeFilter === 'standard' && !chef.temporary_status) ||
      (commissionTypeFilter === 'active_temporary' && chef.temporary_status === 'active');

    const matchesTemporary =
      temporaryFilter === 'all' ||
      (temporaryFilter === 'has_any' && chef.has_custom_commission) ||
      (temporaryFilter === 'active' && chef.temporary_status === 'active') ||
      (temporaryFilter === 'expired' && chef.temporary_status === 'expired');

    const matchesRefund =
      refundFilter === 'all' ||
      (refundFilter === 'active_100' && chef.refund_status === 'active_100') ||
      (refundFilter === 'ongoing' && chef.refund_status === 'ongoing') ||
      (refundFilter === 'completed' && chef.refund_status === 'completed') ||
      (refundFilter === 'never' && !chef.is_registration_refund);

    return matchesSearch && matchesPlan && matchesCommissionType && matchesTemporary && matchesRefund;
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
      case 'standard_commission':
        aVal = a.standard_commission;
        bVal = b.standard_commission;
        break;
      case 'current_commission':
        aVal = a.current_commission;
        bVal = b.current_commission;
        break;
      case 'custom_commission_valid_from':
        aVal = a.custom_commission_valid_from ? new Date(a.custom_commission_valid_from).getTime() : 0;
        bVal = b.custom_commission_valid_from ? new Date(b.custom_commission_valid_from).getTime() : 0;
        break;
      case 'custom_commission_valid_to':
        aVal = a.custom_commission_valid_to ? new Date(a.custom_commission_valid_to).getTime() : 0;
        bVal = b.custom_commission_valid_to ? new Date(b.custom_commission_valid_to).getTime() : 0;
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
    setCommissionTypeFilter('all');
    setTemporaryFilter('all');
    setRefundFilter('all');
  };

  const stats = {
    average: chefs.length > 0
      ? Math.round((chefs.reduce((sum, c) => sum + c.current_commission, 0) / chefs.length) * 100) / 100
      : 0,
    withTemporary: chefs.filter(c => c.has_custom_commission).length,
    highest: chefs.length > 0 ? Math.max(...chefs.map(c => c.current_commission)) : 0,
    lowest: chefs.length > 0 ? Math.min(...chefs.map(c => c.current_commission)) : 0,
    activeTemporary: chefs.filter(c => c.temporary_status === 'active').length,
    plannedTemporary: chefs.filter(c => c.temporary_status === 'planned').length,
    expiredTemporary: chefs.filter(c => c.temporary_status === 'expired').length,
    active100: chefs.filter(c => c.refund_status === 'active_100').length,
    averageRemaining: (() => {
      const chefsWithRefund = chefs.filter(c => c.is_registration_refund && !c.registration_fee_completed);
      if (chefsWithRefund.length === 0) return 0;
      const total = chefsWithRefund.reduce((sum, c) => sum + (c.registration_fee_amount - c.registration_fee_refunded), 0);
      return Math.round(total / chefsWithRefund.length);
    })(),
    totalRemaining: chefs
      .filter(c => c.is_registration_refund && !c.registration_fee_completed)
      .reduce((sum, c) => sum + (c.registration_fee_amount - c.registration_fee_refunded), 0),
    completedRefunds: chefs.filter(c => c.refund_status === 'completed').length,
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

  const getTemporaryBadge = (status: 'active' | 'planned' | 'expired' | null, from: string | null, to: string | null) => {
    if (!status) return <span className="text-sm text-gray-500">—</span>;

    const badges = {
      active: <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>,
      planned: <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Planerad</span>,
      expired: <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Utgången</span>,
    };

    return (
      <div className="flex flex-col gap-1">
        {badges[status]}
        {from && to && (
          <span className="text-xs text-gray-600">
            {formatDate(from)} – {formatDate(to)}
          </span>
        )}
      </div>
    );
  };

  const getRefundBadge = (status: 'active_100' | 'ongoing' | 'completed' | null, remaining: number) => {
    if (!status) return <span className="text-sm text-gray-500">—</span>;

    const badges = {
      active_100: <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv 100% provision</span>,
      ongoing: (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Pågående ({remaining.toLocaleString()} kr kvar)
        </span>
      ),
      completed: <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Återbetalning slutförd</span>,
    };

    return badges[status];
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
      <AdminSectionHeader title="Kockar – Provision (översikt)" />

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

              <div className="flex-1 min-w-[140px] max-w-[180px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Plan
                </label>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla</option>
                  <option value="free">Gratis</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Guld</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[240px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Provisionstyp
                </label>
                <select
                  value={commissionTypeFilter}
                  onChange={(e) => setCommissionTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla</option>
                  <option value="standard">Standardprovision</option>
                  <option value="active_temporary">Tillfällig aktiv</option>
                </select>
              </div>

              <div className="flex-1 min-w-[220px] max-w-[260px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Tillfällig provision
                </label>
                <select
                  value={temporaryFilter}
                  onChange={(e) => setTemporaryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla</option>
                  <option value="has_any">Har tillfällig</option>
                  <option value="active">Endast aktiva</option>
                  <option value="expired">Endast utgångna</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[240px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Återbetalning
                </label>
                <select
                  value={refundFilter}
                  onChange={(e) => setRefundFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla</option>
                  <option value="active_100">Aktiv 100%</option>
                  <option value="ongoing">Pågående</option>
                  <option value="completed">Slutförd</option>
                  <option value="never">Aldrig haft</option>
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
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg p-5">
            <div className="text-sm font-medium text-blue-900 mb-1">Snittprovision</div>
            <div className="text-3xl font-bold text-blue-900">{stats.average}%</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-400 rounded-lg p-5">
            <div className="text-sm font-medium text-purple-900 mb-1">Med tillfällig provision</div>
            <div className="text-3xl font-bold text-purple-900">{stats.withTemporary}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-5">
            <div className="text-sm font-medium text-green-900 mb-1">Högsta provision</div>
            <div className="text-3xl font-bold text-green-900">{stats.highest}%</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400 rounded-lg p-5">
            <div className="text-sm font-medium text-orange-900 mb-1">Lägsta provision</div>
            <div className="text-3xl font-bold text-orange-900">{stats.lowest}%</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-4">
          <h4 className="text-sm font-bold text-black mb-3">Tillfälliga provisioner</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-700">Aktiva just nu:</span>
              <span className="ml-2 font-bold text-green-700">{stats.activeTemporary}</span>
            </div>
            <div>
              <span className="text-gray-700">Planerade:</span>
              <span className="ml-2 font-bold text-yellow-700">{stats.plannedTemporary}</span>
            </div>
            <div>
              <span className="text-gray-700">Utgångna:</span>
              <span className="ml-2 font-bold text-gray-600">{stats.expiredTemporary}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-400 rounded-lg p-5">
            <div className="text-sm font-medium text-teal-900 mb-1">Aktiv 100% provision</div>
            <div className="text-3xl font-bold text-teal-900">{stats.active100}</div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-400 rounded-lg p-5">
            <div className="text-sm font-medium text-cyan-900 mb-1">Snitt restbelopp</div>
            <div className="text-3xl font-bold text-cyan-900">{stats.averageRemaining.toLocaleString()} kr</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-400 rounded-lg p-5">
            <div className="text-sm font-medium text-indigo-900 mb-1">Totalt kvar att återbetala</div>
            <div className="text-3xl font-bold text-indigo-900">{stats.totalRemaining.toLocaleString()} kr</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-400 rounded-lg p-5">
            <div className="text-sm font-medium text-emerald-900 mb-1">Färdigställda</div>
            <div className="text-3xl font-bold text-emerald-900">{stats.completedRefunds}</div>
          </div>
        </div>
      </div>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Alla kockars provisioner
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-700">Läser in...</div>
        ) : (
          <AdminTable
            headers={[
              <SortableHeader key="name" field="full_name">Kock</SortableHeader>,
              <SortableHeader key="plan" field="membership_level">Plan</SortableHeader>,
              <SortableHeader key="standard" field="standard_commission">Standard</SortableHeader>,
              <SortableHeader key="current" field="current_commission">Nuvarande</SortableHeader>,
              'Tillfällig provision?',
              <SortableHeader key="from" field="custom_commission_valid_from">Start</SortableHeader>,
              <SortableHeader key="to" field="custom_commission_valid_to">Slut</SortableHeader>,
              'Återbetalning',
              'Åtgärder',
            ]}
          >
            {sortedChefs.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-700">
                  Inga kockar hittades
                </td>
              </tr>
            ) : (
              sortedChefs.map(chef => {
                const remaining = chef.registration_fee_amount - chef.registration_fee_refunded;
                return (
                  <tr key={chef.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-black">{chef.full_name || 'Ej angivet'}</div>
                        {chef.kitchen_name && (
                          <div className="text-sm text-gray-700">{chef.kitchen_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLevelBadge(chef.membership_level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {chef.standard_commission}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-black">
                          {chef.current_commission}%
                        </span>
                        {chef.refund_status === 'active_100' && chef.current_commission === 100 && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                            återbetalning
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTemporaryBadge(chef.temporary_status, chef.custom_commission_valid_from, chef.custom_commission_valid_to)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {chef.custom_commission_valid_from ? formatDate(chef.custom_commission_valid_from) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {chef.custom_commission_valid_to ? formatDate(chef.custom_commission_valid_to) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRefundBadge(chef.refund_status, remaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AdminButton
                        variant="secondary"
                        onClick={() => navigate(`/admin/kockar/${chef.id}?tab=provision`)}
                        className="text-sm py-1.5 px-4"
                      >
                        Öppna kock
                      </AdminButton>
                    </td>
                  </tr>
                );
              })
            )}
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
