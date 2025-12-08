import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AdminCard } from '../../components';
import { Mail, Phone, MapPin, MessageSquare, UserX, UserCheck } from 'lucide-react';

interface ChefOverviewProps {
  chefId: string;
  chefData: {
    full_name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    postal_code: string;
    kitchen_name: string;
    profile_image_url: string;
    banner_image_url: string;
    is_verified: boolean;
    membership_level: string;
    created_at: string;
  };
}

interface ChefStats {
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string | null;
  averageRating: number | null;
}

export default function ChefOverviewTab({ chefId, chefData }: ChefOverviewProps) {
  const [stats, setStats] = useState<ChefStats>({
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lastOrderDate: null,
    averageRating: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [chefId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', chefId)
        .eq('available', true);

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('seller_id', chefId)
        .order('created_at', { ascending: false });

      if (prodError) console.error('Error fetching products:', prodError);
      if (ordersError) console.error('Error fetching orders:', ordersError);

      const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0;
      const lastOrder = orders && orders.length > 0 ? orders[0].created_at : null;

      setStats({
        activeProducts: products?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue,
        lastOrderDate: lastOrder,
        averageRating: null,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    alert('Meddelandefunktion byggs i nästa steg.');
  };

  const handleToggleStatus = () => {
    const action = chefData.is_verified ? 'Pausa' : 'Återaktivera';
    if (confirm(`${action} kockens konto?`)) {
      console.log(`${action} kock:`, chefId);
      alert('Här kommer du senare kunna ändra status på kockens konto.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Ingen än';
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Aktiv
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        Väntar
      </span>
    );
  };

  const getMembershipBadge = (level: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      silver: 'bg-gray-300 text-gray-900',
      gold: 'bg-yellow-200 text-yellow-900',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[level] || colors.free}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        {chefData.banner_image_url && (
          <div className="h-32 -mx-6 -mt-6 mb-6 rounded-t-lg overflow-hidden">
            <img
              src={chefData.banner_image_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {chefData.profile_image_url ? (
              <img
                src={chefData.profile_image_url}
                alt={chefData.full_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 border-4 border-white shadow-md">
                {chefData.full_name?.charAt(0) || '?'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold text-black mb-1" style={{ fontFamily: 'Lobster, cursive' }}>
              {chefData.full_name || 'Ej angivet'}
            </h2>
            {chefData.kitchen_name && (
              <p className="text-lg text-gray-800 mb-2">
                {chefData.kitchen_name}
              </p>
            )}
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{chefData.city || 'Ej angivet'}</span>
              <span className="mx-2">•</span>
              <span className="text-sm">
                Startade: {formatDate(chefData.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {stats.averageRating !== null ? (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-lg">⭐</span>
                  <span className="font-medium text-black">{stats.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600 text-sm">av 5</span>
                </div>
              ) : (
                <span className="text-gray-600 text-sm">Inga omdömen ännu</span>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${chefData.email}`} className="hover:text-black underline">
                {chefData.email}
              </a>
              {chefData.phone && (
                <>
                  <span className="mx-2">•</span>
                  <Phone className="w-4 h-4" />
                  <span>{chefData.phone}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {getStatusBadge(chefData.is_verified)}
            {getMembershipBadge(chefData.membership_level)}
          </div>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-2xl font-bold text-black mb-6" style={{ fontFamily: 'Lobster, cursive' }}>
          Snabb statistik
        </h3>
        {loading ? (
          <p className="text-gray-700">Läser in statistik...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Aktiva produkter</p>
              <p className="text-3xl font-bold text-black">{stats.activeProducts}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Antal beställningar</p>
              <p className="text-3xl font-bold text-black">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Total försäljning</p>
              <p className="text-3xl font-bold text-black">{stats.totalRevenue.toFixed(0)} kr</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Senaste beställning</p>
              <p className="text-lg font-bold text-black">{formatDate(stats.lastOrderDate)}</p>
            </div>
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <h3 className="text-2xl font-bold text-black mb-6" style={{ fontFamily: 'Lobster, cursive' }}>
          Kontakt & åtgärder
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-bold text-black mb-4">Kontaktuppgifter</h4>
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Namn</p>
                <p className="text-black">{chefData.full_name || 'Ej angivet'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">E-post</p>
                <a href={`mailto:${chefData.email}`} className="text-black hover:underline">
                  {chefData.email}
                </a>
              </div>
              {chefData.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Telefon</p>
                  <p className="text-black">{chefData.phone}</p>
                </div>
              )}
              {(chefData.address || chefData.postal_code || chefData.city) && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Adress</p>
                  <p className="text-black">
                    {[chefData.address, `${chefData.postal_code} ${chefData.city}`.trim()]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-black mb-4">Snabbåtgärder</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSendMessage}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Skicka meddelande
              </button>
              <button
                onClick={handleToggleStatus}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#56c5c5] text-white rounded-lg hover:bg-[#45b0b0] transition-colors"
              >
                {chefData.is_verified ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Pausa kockens konto
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Återaktivera kockens konto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
