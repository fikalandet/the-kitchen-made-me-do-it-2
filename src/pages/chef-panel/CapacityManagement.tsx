import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

interface CapacityPeriod {
  id: string;
  product_id: string;
  delivery_date: string;
  max_capacity: number;
  current_bookings: number;
  is_sold_out: boolean;
  is_active: boolean;
  product?: {
    name: string;
    type: string;
  };
}

export const CapacityManagement: React.FC = () => {
  const { user } = useAuth();
  const [capacityPeriods, setCapacityPeriods] = useState<CapacityPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCapacityData();
    }
  }, [user]);

  const fetchCapacityData = async () => {
    if (!user) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('meal_box_capacity_periods')
      .select(`
        *,
        products!inner(
          name,
          type,
          seller_id
        )
      `)
      .eq('products.seller_id', user.id)
      .gte('delivery_date', today)
      .order('delivery_date');

    if (!error && data) {
      const transformed = data.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        delivery_date: item.delivery_date,
        max_capacity: item.max_capacity,
        current_bookings: item.current_bookings,
        is_sold_out: item.is_sold_out,
        is_active: item.is_active,
        product: {
          name: item.products.name,
          type: item.products.type
        }
      }));
      setCapacityPeriods(transformed);
    }

    setLoading(false);
  };

  const handleRegenerateRecurring = async (productId: string) => {
    setRegenerating(productId);

    const { error } = await supabase.rpc('generate_recurring_capacity_periods', {
      p_product_id: productId,
      p_weeks_ahead: null
    });

    if (!error) {
      await fetchCapacityData();
    }

    setRegenerating(null);
  };

  const handleUpdateCapacity = async (periodId: string, newCapacity: number) => {
    const { error } = await supabase
      .from('meal_box_capacity_periods')
      .update({ max_capacity: newCapacity })
      .eq('id', periodId);

    if (!error) {
      await fetchCapacityData();
    }
  };

  const handleToggleActive = async (periodId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('meal_box_capacity_periods')
      .update({ is_active: !isActive })
      .eq('id', periodId);

    if (!error) {
      await fetchCapacityData();
    }
  };

  const getCapacityPercentage = (bookings: number, max: number): number => {
    return Math.round((bookings / max) * 100);
  };

  const getCapacityColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const groupByProduct = (periods: CapacityPeriod[]) => {
    const grouped: Record<string, CapacityPeriod[]> = {};
    periods.forEach(period => {
      if (!grouped[period.product_id]) {
        grouped[period.product_id] = [];
      }
      grouped[period.product_id].push(period);
    });
    return grouped;
  };

  const groupedPeriods = groupByProduct(capacityPeriods);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Laddar kapacitetsdata...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kapacitetshantering</h2>
        <p className="text-gray-600">
          Hantera och övervaka dina bokningar och kapacitet för kommande leveranser
        </p>
      </div>

      {Object.keys(groupedPeriods).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">Inga kapacitetsperioder hittades</p>
          <p className="text-sm text-gray-500">
            Skapa en matlådekasse med kapacitetsgräns för att se den här
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPeriods).map(([productId, periods]) => {
            const productName = periods[0]?.product?.name || 'Okänd produkt';
            const totalCapacity = periods.reduce((sum, p) => sum + p.max_capacity, 0);
            const totalBookings = periods.reduce((sum, p) => sum + p.current_bookings, 0);
            const availableCapacity = totalCapacity - totalBookings;
            const soldOutCount = periods.filter(p => p.is_sold_out).length;

            return (
              <div key={productId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-[#a1c798] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{productName}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-white">
                        <span className="flex items-center gap-1">
                          <TrendingUp size={14} />
                          {totalBookings} / {totalCapacity} bokade
                        </span>
                        {soldOutCount > 0 && (
                          <span className="flex items-center gap-1">
                            <AlertTriangle size={14} />
                            {soldOutCount} fullbokade datum
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRegenerateRecurring(productId)}
                      disabled={regenerating === productId}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-[#a1c798] rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={regenerating === productId ? 'animate-spin' : ''} />
                      {regenerating === productId ? 'Uppdaterar...' : 'Uppdatera schema'}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {periods.map((period) => {
                      const percentage = getCapacityPercentage(period.current_bookings, period.max_capacity);
                      const remaining = period.max_capacity - period.current_bookings;

                      return (
                        <div key={period.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  {formatDate(period.delivery_date)}
                                </span>
                                {period.is_sold_out && (
                                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                                    FULLBOKAD
                                  </span>
                                )}
                                {!period.is_active && (
                                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                    INAKTIV
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleActive(period.id, period.is_active)}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                  period.is_active
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {period.is_active ? 'Inaktivera' : 'Aktivera'}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2 text-sm">
                                <span className="text-gray-600">
                                  {period.current_bookings} av {period.max_capacity} platser bokade
                                </span>
                                <span className="font-medium text-gray-900">{percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-full transition-all ${getCapacityColor(percentage)}`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {remaining > 0 ? `${remaining} platser kvar` : 'Inga platser kvar'}
                              </p>
                            </div>

                            <div className="w-32">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Max kapacitet
                              </label>
                              <input
                                type="number"
                                value={period.max_capacity}
                                onChange={(e) => handleUpdateCapacity(period.id, parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': '#56c5c5' } as any}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
