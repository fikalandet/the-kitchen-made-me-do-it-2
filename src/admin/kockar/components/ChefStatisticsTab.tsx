import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AdminCard } from '../../components';

interface ChefStatisticsTabProps {
  chefId: string;
}

interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  uniqueCustomers: number;
  lastOrderDate: string | null;
}

export default function ChefStatisticsTab({ chefId }: ChefStatisticsTabProps) {
  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    totalRevenue: 0,
    uniqueCustomers: 0,
    lastOrderDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [chefId]);

  const fetchStatistics = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, buyer_id, created_at')
        .eq('seller_id', chefId);

      if (error) throw error;

      if (orders && orders.length > 0) {
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        const uniqueCustomers = new Set(orders.map(o => o.buyer_id)).size;
        const sortedOrders = [...orders].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastOrderDate = sortedOrders[0]?.created_at;

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          uniqueCustomers,
          lastOrderDate,
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Ingen';
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  if (loading) {
    return (
      <AdminCard>
        <p className="text-gray-700">Läser in statistik...</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard>
      <h3 className="text-xl font-bold text-black mb-6" style={{ fontFamily: 'Lobster, cursive' }}>
        Försäljningsöversikt
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Antal beställningar</p>
          <p className="text-2xl font-bold text-black">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total försäljning</p>
          <p className="text-2xl font-bold text-black">{stats.totalRevenue.toFixed(0)} kr</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Unika kunder</p>
          <p className="text-2xl font-bold text-black">{stats.uniqueCustomers}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Senaste beställning</p>
          <p className="text-2xl font-bold text-black">{formatDate(stats.lastOrderDate)}</p>
        </div>
      </div>
    </AdminCard>
  );
}
