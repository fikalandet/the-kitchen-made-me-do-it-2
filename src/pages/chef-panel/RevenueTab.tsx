import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Download, Filter, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface RevenueData {
  id: string;
  date: string;
  type: string;
  gross: number;
  commission: number;
  net: number;
  status: 'utbetald' | 'kommande';
  order_number?: string;
}

interface InfoCards {
  thisWeek: number;
  thisMonth: number;
  nextPayout: { date: string; amount: number };
}

export const RevenueTab: React.FC = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [filteredData, setFilteredData] = useState<RevenueData[]>([]);
  const [infoCards, setInfoCards] = useState<InfoCards>({
    thisWeek: 0,
    thisMonth: 0,
    nextPayout: { date: '', amount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(0.15);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [revenueData, searchTerm, dateFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCommissionRate(),
        loadRevenue()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommissionRate = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_level')
      .eq('id', user.id)
      .single();

    if (profile) {
      const { data: membership } = await supabase
        .from('membership_levels')
        .select('commission_percentage')
        .eq('level', profile.membership_level || 'free')
        .single();

      if (membership) {
        setCommissionRate(parseFloat(membership.commission_percentage) / 100);
      }
    }
  };

  const loadRevenue = async () => {
    if (!user) return;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', user.id)
      .in('payment_status', ['betald', 'väntar'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading revenue:', error);
      return;
    }

    const revenue: RevenueData[] = (orders || []).map((order) => {
      const gross = parseFloat(order.total_amount?.toString() || '0');
      const commission = gross * commissionRate;
      const net = gross - commission;

      return {
        id: order.id,
        date: order.pickup_delivery_datetime || order.created_at,
        type: getTypeLabel(order.order_type || 'engångsköp'),
        gross,
        commission,
        net,
        status: order.payment_status === 'betald' ? 'utbetald' : 'kommande',
        order_number: order.order_number
      };
    });

    setRevenueData(revenue);
    calculateInfoCards(revenue);
    generateChartData(revenue);
  };

  const calculateInfoCards = (revenue: RevenueData[]) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeekRevenue = revenue
      .filter(r => new Date(r.date) >= startOfWeek && r.status === 'utbetald')
      .reduce((sum, r) => sum + r.net, 0);

    const thisMonthRevenue = revenue
      .filter(r => new Date(r.date) >= startOfMonth && r.status === 'utbetald')
      .reduce((sum, r) => sum + r.net, 0);

    const nextPayoutOrders = revenue.filter(r => r.status === 'kommande');
    const nextPayoutAmount = nextPayoutOrders.reduce((sum, r) => sum + r.net, 0);
    const nextPayoutDate = nextPayoutOrders.length > 0
      ? new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().split('T')[0]
      : '';

    setInfoCards({
      thisWeek: thisWeekRevenue,
      thisMonth: thisMonthRevenue,
      nextPayout: {
        date: nextPayoutDate,
        amount: nextPayoutAmount
      }
    });
  };

  const generateChartData = (revenue: RevenueData[]) => {
    const monthlyData: Record<string, number> = {};

    revenue.forEach(r => {
      if (r.status === 'utbetald') {
        const date = new Date(r.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + r.net;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
    const chartData = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
      const label = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
      return {
        label,
        value: monthlyData[month]
      };
    });

    setChartData(chartData);
  };

  const applyFilters = () => {
    let filtered = [...revenueData];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter.from) {
      filtered = filtered.filter(r => new Date(r.date) >= new Date(dateFilter.from));
    }

    if (dateFilter.to) {
      filtered = filtered.filter(r => new Date(r.date) <= new Date(dateFilter.to));
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    setFilteredData(filtered);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'engångsköp': 'Engångsköp',
      'prenumeration': 'Prenumeration',
      'på_spisen_nu': 'På spisen nu',
      'frys': 'Frys',
      'event': 'Event/Kockuppdrag'
    };
    return labels[type] || type;
  };

  const exportToCSV = () => {
    const headers = ['Datum', 'Typ', 'Brutto (kr)', 'Provision (kr)', 'Netto (kr)', 'Status'];
    const rows = filteredData.map(r => [
      new Date(r.date).toLocaleDateString('sv-SE'),
      r.type,
      r.gross.toFixed(2),
      r.commission.toFixed(2),
      r.net.toFixed(2),
      r.status === 'utbetald' ? 'Utbetald' : 'Kommande'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `intakter_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Laddar intäkter...</div>
      </div>
    );
  }

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Intäkter</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Exportera CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Denna vecka</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {infoCards.thisWeek.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
              </p>
              <p className="text-xs text-gray-500 mt-1">Efter provision ({(commissionRate * 100).toFixed(0)}%)</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Denna månad</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {infoCards.thisMonth.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
              </p>
              <p className="text-xs text-gray-500 mt-1">Efter provision ({(commissionRate * 100).toFixed(0)}%)</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nästa utbetalning</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {infoCards.nextPayout.amount.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {infoCards.nextPayout.date
                  ? new Date(infoCards.nextPayout.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
                  : 'Ingen planerad'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Intäkter över tid</h3>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-end justify-between h-64 gap-4">
              {chartData.map((data, index) => {
                const barHeight = (data.value / maxChartValue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      {data.value.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                    </div>
                    <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                      <div
                        className="w-full bg-gradient-to-t from-[#a1c798] to-[#56c5c5] rounded-t-lg transition-all duration-300 hover:opacity-80"
                        style={{ height: `${barHeight}%`, minHeight: barHeight > 0 ? '10px' : '0' }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 text-center">{data.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Ingen intäktsdata att visa ännu
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Alla transaktioner ({filteredData.length})
          </h3>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {filterOpen && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sök
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Beställningsnr, typ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Från datum
                </label>
                <input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Till datum
                </label>
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alla typer</option>
                  <option value="Engångsköp">Engångsköp</option>
                  <option value="Prenumeration">Prenumeration</option>
                  <option value="På spisen nu">På spisen nu</option>
                  <option value="Frys">Frys</option>
                  <option value="Event/Kockuppdrag">Event/Kockuppdrag</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter({ from: '', to: '' });
                  setTypeFilter('all');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Rensa filter
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ av intäkt
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brutto
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provision
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Netto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Inga transaktioner hittades
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString('sv-SE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {item.gross.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 text-right">
                      -{item.commission.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                    </td>
                    <td className="px-4 py-3 text-sm text-green-700 text-right font-bold">
                      {item.net.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'utbetald' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status === 'utbetald' ? 'Utbetald' : 'Kommande'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Totalt
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    {filteredData.reduce((sum, item) => sum + item.gross, 0).toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">
                    -{filteredData.reduce((sum, item) => sum + item.commission, 0).toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">
                    {filteredData.reduce((sum, item) => sum + item.net, 0).toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
