import React, { useState, useEffect } from 'react';
import { X, MessageSquare, User, ShoppingBag, Calendar, DollarSign, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CustomerProfileModalProps {
  customerId: string;
  onClose: () => void;
  onSendMessage: (customerId: string, customerName: string) => void;
}

interface CustomerData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  created_at: string;
}

interface OrderData {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  order_status: string;
  delivery_type: string;
  customer_allergies: string[];
  customer_message: string;
}

interface CustomerStats {
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: string;
  purchaseFrequency: string;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customerId,
  onClose,
  onSendMessage
}) => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalSpent: 0,
    orderCount: 0,
    averageOrderValue: 0,
    lastOrderDate: '',
    purchaseFrequency: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCustomerProfile(),
        loadCustomerOrders(),
        loadCustomerNotes()
      ]);
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url, created_at')
      .eq('id', customerId)
      .single();

    if (error) {
      console.error('Error loading customer profile:', error);
      return;
    }

    setCustomer(data);
  };

  const loadCustomerOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', customerId)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading customer orders:', error);
      return;
    }

    setOrders(data || []);
    calculateStats(data || []);
  };

  const calculateStats = (orderData: OrderData[]) => {
    const totalSpent = orderData.reduce((sum, order) => sum + parseFloat(order.total_amount?.toString() || '0'), 0);
    const orderCount = orderData.length;
    const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

    const lastOrder = orderData[0];
    const lastOrderDate = lastOrder ? lastOrder.created_at : '';

    let purchaseFrequency = 'Ny kund';
    if (orderCount > 1 && lastOrder) {
      const firstOrderDate = new Date(orderData[orderData.length - 1].created_at);
      const lastOrderDate = new Date(lastOrder.created_at);
      const daysDiff = Math.floor((lastOrderDate.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24));

      if (orderCount > 1) {
        const avgDaysBetweenOrders = daysDiff / (orderCount - 1);
        if (avgDaysBetweenOrders < 7) {
          purchaseFrequency = 'Flera gånger per vecka';
        } else if (avgDaysBetweenOrders < 14) {
          purchaseFrequency = 'Varje vecka';
        } else if (avgDaysBetweenOrders < 30) {
          purchaseFrequency = 'Varannan vecka';
        } else if (avgDaysBetweenOrders < 60) {
          purchaseFrequency = 'Varje månad';
        } else {
          purchaseFrequency = 'Mer sällan';
        }
      }
    }

    setStats({
      totalSpent,
      orderCount,
      averageOrderValue,
      lastOrderDate,
      purchaseFrequency
    });
  };

  const loadCustomerNotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chef_customer_notes')
      .select('notes')
      .eq('chef_id', user.id)
      .eq('customer_id', customerId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading customer notes:', error);
      return;
    }

    if (data) {
      setNotes(data.notes || '');
    }
  };

  const saveNotes = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('chef_customer_notes')
        .upsert({
          chef_id: user.id,
          customer_id: customerId,
          notes,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCustomerStatus = () => {
    if (stats.orderCount === 0) return 'Ny';
    if (stats.orderCount === 1) return 'Engångskund';
    if (stats.orderCount >= 10) return 'Storkund';
    if (stats.orderCount >= 5) return 'Stammis';
    return 'Återkommande';
  };

  const getAllergies = () => {
    const allergiesSet = new Set<string>();
    orders.forEach(order => {
      if (order.customer_allergies) {
        order.customer_allergies.forEach(allergy => allergiesSet.add(allergy));
      }
    });
    return Array.from(allergiesSet);
  };

  if (loading || !customer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-gray-600">Laddar kundprofil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Kundprofil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-[#a1c798] to-[#56c5c5] rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {customer.avatar_url ? (
                <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{customer.full_name}</h3>
              <div className="mt-1 space-y-1 text-sm text-gray-600">
                <p>{customer.email}</p>
                {customer.phone && <p>{customer.phone}</p>}
                <p className="text-xs text-gray-500">
                  Kund sedan {new Date(customer.created_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="mt-2">
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  {getCustomerStatus()}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSendMessage(customer.id, customer.full_name)}
              className="flex items-center gap-2 px-4 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb587] transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Skicka meddelande
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Totalt spenderat</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSpent.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-medium">Antal beställningar</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.orderCount}</p>
              <p className="text-xs text-gray-600 mt-1">
                Snitt: {stats.averageOrderValue.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr/köp
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Köpfrekvens</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.purchaseFrequency}</p>
              {stats.lastOrderDate && (
                <p className="text-xs text-gray-600 mt-1">
                  Senast: {new Date(stats.lastOrderDate).toLocaleDateString('sv-SE')}
                </p>
              )}
            </div>
          </div>

          {getAllergies().length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-gray-900 mb-2">Allergier & preferenser</h4>
              <div className="flex flex-wrap gap-2">
                {getAllergies().map((allergy, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Anteckningar om kunden</h4>
              <button
                onClick={saveNotes}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb587] transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Sparar...' : 'Spara'}
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Skriv anteckningar om kundens preferenser, specialönskemål, viktiga datum, etc."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Beställningshistorik ({orders.length})</h4>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Inga beställningar ännu
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Beställning #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('sv-SE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {order.customer_message && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            {order.customer_message}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {parseFloat(order.total_amount?.toString() || '0').toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {order.delivery_type === 'pickup' ? 'Hämtas' : 'Levereras'}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          order.order_status === 'bekräftad' ? 'bg-green-100 text-green-800' :
                          order.order_status === 'levererad' ? 'bg-blue-100 text-blue-800' :
                          order.order_status === 'avbruten' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.order_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
};
