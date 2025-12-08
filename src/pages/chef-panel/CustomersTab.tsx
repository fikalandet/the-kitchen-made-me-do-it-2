import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Repeat, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerProfileModal } from '../../components/CustomerProfileModal';
import { useNavigate } from 'react-router-dom';

interface CustomerData {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  lastOrderDate: string;
  orderCount: number;
  totalSpent: number;
  status: string;
}

interface InfoCards {
  totalCustomers: number;
  newCustomers: number;
  returningPercentage: number;
}

export const CustomersTab: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [infoCards, setInfoCards] = useState<InfoCards>({
    totalCustomers: 0,
    newCustomers: 0,
    returningPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [customers, searchTerm, statusFilter]);

  const loadCustomers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('buyer_id, total_amount, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customerMap = new Map<string, {
        orderCount: number;
        totalSpent: number;
        lastOrderDate: string;
        firstOrderDate: string;
      }>();

      (orders || []).forEach(order => {
        const buyerId = order.buyer_id;
        const amount = parseFloat(order.total_amount?.toString() || '0');
        const orderDate = order.created_at;

        if (customerMap.has(buyerId)) {
          const existing = customerMap.get(buyerId)!;
          existing.orderCount += 1;
          existing.totalSpent += amount;
          if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = orderDate;
          }
          if (new Date(orderDate) < new Date(existing.firstOrderDate)) {
            existing.firstOrderDate = orderDate;
          }
        } else {
          customerMap.set(buyerId, {
            orderCount: 1,
            totalSpent: amount,
            lastOrderDate: orderDate,
            firstOrderDate: orderDate
          });
        }
      });

      const customerIds = Array.from(customerMap.keys());

      if (customerIds.length === 0) {
        setCustomers([]);
        setInfoCards({
          totalCustomers: 0,
          newCustomers: 0,
          returningPercentage: 0
        });
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', customerIds);

      if (profilesError) throw profilesError;

      const customersData: CustomerData[] = (profiles || []).map(profile => {
        const stats = customerMap.get(profile.id)!;
        return {
          id: profile.id,
          full_name: profile.full_name || 'Okänd kund',
          email: profile.email,
          avatar_url: profile.avatar_url || '',
          lastOrderDate: stats.lastOrderDate,
          orderCount: stats.orderCount,
          totalSpent: stats.totalSpent,
          status: getCustomerStatus(stats.orderCount)
        };
      });

      customersData.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());

      setCustomers(customersData);
      calculateInfoCards(customersData, customerMap);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInfoCards = (customersData: CustomerData[], customerMap: Map<string, any>) => {
    const totalCustomers = customersData.length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers = customersData.filter(customer => {
      const stats = customerMap.get(customer.id);
      return stats && new Date(stats.firstOrderDate) >= thirtyDaysAgo;
    }).length;

    const returningCustomers = customersData.filter(c => c.orderCount > 1).length;
    const returningPercentage = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    setInfoCards({
      totalCustomers,
      newCustomers,
      returningPercentage
    });
  };

  const getCustomerStatus = (orderCount: number) => {
    if (orderCount === 0) return 'Ny';
    if (orderCount === 1) return 'Engångskund';
    if (orderCount >= 10) return 'Storkund';
    if (orderCount >= 5) return 'Stammis';
    return 'Återkommande';
  };

  const applyFilters = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  };

  const handleSendMessage = (customerId: string, customerName: string) => {
    setSelectedCustomerId(null);
    navigate('/chef-panel/communication', {
      state: {
        prefilledRecipientId: customerId,
        prefilledRecipientName: customerName
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Laddar kunder...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Kunder</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totalt antal kunder</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {infoCards.totalCustomers}
              </p>
              <p className="text-xs text-gray-500 mt-1">Unika kunder som handlat</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nya senaste 30 dagarna</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {infoCards.newCustomers}
              </p>
              <p className="text-xs text-gray-500 mt-1">Första köp senaste månaden</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Återkommande kunder</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {infoCards.returningPercentage.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {customers.filter(c => c.orderCount > 1).length} av {infoCards.totalCustomers} kunder
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Repeat className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Alla kunder ({filteredCustomers.length})
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sök
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Namn eller e-post..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Kundstatus
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alla statusar</option>
                  <option value="Ny">Ny</option>
                  <option value="Engångskund">Engångskund</option>
                  <option value="Återkommande">Återkommande</option>
                  <option value="Stammis">Stammis</option>
                  <option value="Storkund">Storkund</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
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
                  Namn
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Senaste beställning
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Antal beställningar
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Totalt spenderat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kundstatus
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Inga kunder hittades
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#a1c798] to-[#56c5c5] rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            customer.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.full_name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(customer.lastOrderDate).toLocaleDateString('sv-SE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {customer.orderCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {customer.totalSpent.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'Storkund' ? 'bg-purple-100 text-purple-800' :
                        customer.status === 'Stammis' ? 'bg-blue-100 text-blue-800' :
                        customer.status === 'Återkommande' ? 'bg-green-100 text-green-800' :
                        customer.status === 'Engångskund' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomerId && (
        <CustomerProfileModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};
