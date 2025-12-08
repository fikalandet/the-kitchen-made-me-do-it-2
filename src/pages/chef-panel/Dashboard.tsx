import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, Star } from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  totalCustomers: number;
  averageRating: number;
  pendingOrders: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    totalCustomers: 0,
    averageRating: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id);

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', user.id);

    const activeProducts = products?.filter(p => p.available).length || 0;
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    const pendingOrders = orders?.filter(o => o.order_status === 'pending').length || 0;
    const uniqueCustomers = new Set(orders?.map(o => o.buyer_id)).size;

    setStats({
      totalOrders,
      totalRevenue,
      activeProducts,
      totalCustomers: uniqueCustomers,
      averageRating: 4.5,
      pendingOrders,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Läser in...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-lobster text-3xl text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Välkommen tillbaka! Här är en översikt av din verksamhet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={ShoppingCart}
          label="Totala beställningar"
          value={stats.totalOrders}
          color="#56c5c5"
        />
        <StatCard
          icon={DollarSign}
          label="Total omsättning"
          value={`${stats.totalRevenue.toLocaleString('sv-SE')} SEK`}
          color="#f4a261"
        />
        <StatCard
          icon={Package}
          label="Aktiva produkter"
          value={stats.activeProducts}
          color="#a1c798"
        />
        <StatCard
          icon={Users}
          label="Totalt antal kunder"
          value={stats.totalCustomers}
          color="#56c5c5"
        />
        <StatCard
          icon={Star}
          label="Genomsnittligt betyg"
          value={stats.averageRating.toFixed(1)}
          color="#fbbf24"
        />
        <StatCard
          icon={TrendingUp}
          label="Väntande beställningar"
          value={stats.pendingOrders}
          color="#f4a261"
          highlight={stats.pendingOrders > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
          <h2 className="font-lobster text-2xl text-gray-800 mb-4">
            Senaste beställningar
          </h2>
          <p className="text-gray-600 text-sm">
            Inga beställningar att visa ännu
          </p>
        </div>

        <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
          <h2 className="font-lobster text-2xl text-gray-800 mb-4">
            Populära produkter
          </h2>
          <p className="text-gray-600 text-sm">
            Lägg till produkter för att se statistik
          </p>
        </div>
      </div>

      <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
        <h2 className="font-lobster text-2xl text-gray-800 mb-4">
          Snabbåtgärder
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Lägg till produkt"
            description="Skapa en ny maträtt eller tjänst"
            color="#56c5c5"
          />
          <QuickActionCard
            title="Visa meddelanden"
            description="Kommunicera med dina kunder"
            color="#a1c798"
          />
          <QuickActionCard
            title="Uppdatera meny"
            description="Ändra tillgänglighet och priser"
            color="#f4a261"
          />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, highlight }) => (
  <div
    className={`rounded-lg shadow p-6 ${highlight ? 'ring-2 ring-offset-2' : ''}`}
    style={{
      backgroundColor: '#f6f2e0',
      ...(highlight && { borderColor: color }),
    }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
        <Icon size={24} color={color} />
      </div>
    </div>
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
  </div>
);

interface QuickActionCardProps {
  title: string;
  description: string;
  color: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, color }) => (
  <button
    className="text-left p-4 rounded-lg transition-all hover:shadow-lg hover:scale-105"
    style={{ backgroundColor: 'white' }}
  >
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
      style={{ backgroundColor: color }}
    >
      <span className="text-white text-xl">+</span>
    </div>
    <h3 className="font-lobster text-lg text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </button>
);
