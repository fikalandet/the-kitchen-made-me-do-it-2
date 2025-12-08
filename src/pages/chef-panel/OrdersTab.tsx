import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Clock, X, Search, Filter, MoreVertical, MessageCircle, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  order_date: string;
  pickup_delivery_datetime: string;
  delivery_type: 'pickup' | 'delivery';
  delivery_address: string | null;
  order_type: 'engångsköp' | 'prenumeration' | 'på_spisen_nu' | 'frys' | 'event';
  status: 'ny' | 'väntar_på_bekräftelse' | 'bekräftad' | 'förbereder' | 'klar' | 'levererad' | 'avbruten';
  customer_message: string | null;
  customer_allergies: string[] | null;
  payment_status: 'väntar' | 'betald' | 'återbetald';
  total_amount: number;
  created_at: string;
  buyer_profile?: {
    full_name: string | null;
    email: string;
    phone: string | null;
  };
  order_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    special_requests: string | null;
  }>;
}

interface InfoCards {
  today: number;
  next7Days: { count: number; portions: number };
  toHandle: number;
}

export const OrdersTab: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [infoCards, setInfoCards] = useState<InfoCards>({
    today: 0,
    next7Days: { count: 0, portions: 0 },
    toHandle: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'next7Days' | 'toHandle'>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, dateFilter, typeFilter, statusFilter, activeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOrders(),
        loadInfoCards()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer_profile:profiles!buyer_id (
          full_name,
          email,
          phone
        ),
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          subtotal,
          special_requests
        )
      `)
      .eq('seller_id', user.id)
      .order('pickup_delivery_datetime', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      return;
    }

    const transformedOrders = (data || []).map((order: any) => ({
      ...order,
      buyer_profile: Array.isArray(order.buyer_profile) && order.buyer_profile.length > 0
        ? order.buyer_profile[0]
        : order.buyer_profile
    }));

    setOrders(transformedOrders);
  };

  const loadInfoCards = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('seller_id', user.id)
      .gte('pickup_delivery_datetime', today.toISOString())
      .lte('pickup_delivery_datetime', todayEnd.toISOString());

    const { data: next7DaysOrders } = await supabase
      .from('orders')
      .select(`
        id,
        order_items (quantity)
      `)
      .eq('seller_id', user.id)
      .gte('pickup_delivery_datetime', today.toISOString())
      .lte('pickup_delivery_datetime', sevenDaysFromNow.toISOString());

    let totalPortions = 0;
    if (next7DaysOrders) {
      next7DaysOrders.forEach((order: any) => {
        if (order.order_items) {
          order.order_items.forEach((item: any) => {
            totalPortions += item.quantity || 0;
          });
        }
      });
    }

    const { data: toHandleOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('seller_id', user.id)
      .in('status', ['ny', 'väntar_på_bekräftelse']);

    setInfoCards({
      today: todayOrders?.length || 0,
      next7Days: {
        count: next7DaysOrders?.length || 0,
        portions: totalPortions
      },
      toHandle: toHandleOrders?.length || 0
    });
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.pickup_delivery_datetime);
        return orderDate >= today && orderDate <= todayEnd;
      });
    } else if (activeFilter === 'next7Days') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.pickup_delivery_datetime);
        return orderDate >= today && orderDate <= sevenDaysFromNow;
      });
    } else if (activeFilter === 'toHandle') {
      filtered = filtered.filter(order =>
        order.status === 'ny' || order.status === 'väntar_på_bekräftelse'
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter.from) {
      filtered = filtered.filter(order =>
        new Date(order.pickup_delivery_datetime) >= new Date(dateFilter.from)
      );
    }

    if (dateFilter.to) {
      filtered = filtered.filter(order =>
        new Date(order.pickup_delivery_datetime) <= new Date(dateFilter.to)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.order_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleCardClick = (filter: 'today' | 'next7Days' | 'toHandle') => {
    if (activeFilter === filter) {
      setActiveFilter('all');
    } else {
      setActiveFilter(filter);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating status:', error);
      alert('Kunde inte uppdatera status');
      return;
    }

    await loadData();
    setActionMenuOpen(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ny': 'bg-blue-100 text-blue-800',
      'väntar_på_bekräftelse': 'bg-yellow-100 text-yellow-800',
      'bekräftad': 'bg-green-100 text-green-800',
      'förbereder': 'bg-purple-100 text-purple-800',
      'klar': 'bg-teal-100 text-teal-800',
      'levererad': 'bg-gray-100 text-gray-800',
      'avbruten': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ny': 'Ny',
      'väntar_på_bekräftelse': 'Väntar på bekräftelse',
      'bekräftad': 'Bekräftad',
      'förbereder': 'Förbereder',
      'klar': 'Klar',
      'levererad': 'Levererad',
      'avbruten': 'Avbruten'
    };
    return labels[status] || status;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Laddar beställningar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Beställningar</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => handleCardClick('today')}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
            activeFilter === 'today' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Idag</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{infoCards.today}</p>
              <p className="text-xs text-gray-500 mt-1">
                {infoCards.today} {infoCards.today === 1 ? 'beställning' : 'beställningar'} idag
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('next7Days')}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
            activeFilter === 'next7Days' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kommande 7 dagar</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{infoCards.next7Days.count}</p>
              <p className="text-xs text-gray-500 mt-1">
                {infoCards.next7Days.portions} portioner totalt
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('toHandle')}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
            activeFilter === 'toHandle' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Att hantera nu</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{infoCards.toHandle}</p>
              <p className="text-xs text-gray-500 mt-1">
                Nya och väntar på bekräftelse
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Alla beställningar ({filteredOrders.length})
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
                    placeholder="Beställningsnr, kundnamn..."
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
                  <option value="engångsköp">Engångsköp</option>
                  <option value="prenumeration">Prenumeration</option>
                  <option value="på_spisen_nu">På spisen nu</option>
                  <option value="frys">Frys</option>
                  <option value="event">Event/Kockuppdrag</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alla statusar</option>
                  <option value="ny">Ny</option>
                  <option value="väntar_på_bekräftelse">Väntar på bekräftelse</option>
                  <option value="bekräftad">Bekräftad</option>
                  <option value="förbereder">Förbereder</option>
                  <option value="klar">Klar</option>
                  <option value="levererad">Levererad</option>
                  <option value="avbruten">Avbruten</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter({ from: '', to: '' });
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setActiveFilter('all');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Rensa filter
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beställning
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum & Tid
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kundnamn
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rätter / Portioner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Inga beställningar hittades
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const totalPortions = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                  const itemCount = order.order_items?.length || 0;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.order_number || order.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          {order.pickup_delivery_datetime
                            ? new Date(order.pickup_delivery_datetime).toLocaleDateString('sv-SE', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.pickup_delivery_datetime
                            ? new Date(order.pickup_delivery_datetime).toLocaleTimeString('sv-SE', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.buyer_profile?.full_name || order.buyer_profile?.email || 'Okänd'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {itemCount} {itemCount === 1 ? 'rätt' : 'rätter'} / {totalPortions} port
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getTypeLabel(order.order_type || 'engångsköp')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status || 'ny')}`}>
                          {getStatusLabel(order.status || 'ny')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === order.id ? null : order.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>

                          {actionMenuOpen === order.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => {
                                  handleOrderClick(order);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Öppna detaljer
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Ändra status');
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Ändra status
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Kontakta kund');
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Kontakta kund
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Lobster, cursive' }}>
                  Beställning {selectedOrder.order_number || selectedOrder.id.substring(0, 8)}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.buyer_profile?.full_name || selectedOrder.buyer_profile?.email}
                </p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status || 'ny')}`}>
                    {getStatusLabel(selectedOrder.status || 'ny')}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Betalstatus</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedOrder.payment_status === 'betald' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedOrder.payment_status === 'betald' ? 'Betald' : selectedOrder.payment_status === 'väntar' ? 'Väntar' : 'Återbetald'}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Upphämtning/Leverans</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOrder.pickup_delivery_datetime
                      ? new Date(selectedOrder.pickup_delivery_datetime).toLocaleString('sv-SE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedOrder.delivery_type === 'delivery' ? 'Utkörning' : 'Upphämtning'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Typ</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getTypeLabel(selectedOrder.order_type || 'engångsköp')}
                  </p>
                </div>
              </div>

              {selectedOrder.delivery_type === 'delivery' && selectedOrder.delivery_address && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Leveransadress</p>
                  <p className="text-sm text-blue-800">{selectedOrder.delivery_address}</p>
                </div>
              )}

              <div>
                <h4 className="text-lg font-bold mb-3">Beställda rätter</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.quantity} portioner × {item.unit_price} kr</p>
                          {item.special_requests && (
                            <p className="text-xs text-gray-600 mt-1 italic">💬 "{item.special_requests}"</p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-900">{item.subtotal} kr</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Inga produkter</p>
                  )}
                </div>
              </div>

              {selectedOrder.customer_allergies && selectedOrder.customer_allergies.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-xs font-semibold text-red-900 mb-1">⚠️ Allergier</p>
                  <p className="text-sm text-red-800">{selectedOrder.customer_allergies.join(', ')}</p>
                </div>
              )}

              {selectedOrder.customer_message && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Meddelande från kund</p>
                  <p className="text-sm text-gray-800">{selectedOrder.customer_message}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-lg font-bold text-gray-900">Totalt</p>
                <p className="text-2xl font-bold text-gray-900">{selectedOrder.total_amount} kr</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    console.log('Lägg till i planeringen');
                  }}
                  className="flex-1 px-4 py-3 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb889] transition-colors text-sm font-medium"
                >
                  Lägg till i planeringen
                </button>
                <button
                  onClick={() => {
                    console.log('Kontakta kund');
                  }}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Kontakta kund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
