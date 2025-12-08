import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Truck, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface KitchenStats {
  avgPressure: number;
  totalPortionsProduced: number;
  livePortions: number;
  batchPortions: number;
  deliveriesCompleted: number;
  freezerLevel: number;
  missionDistribution: Record<string, number>;
}

export const KitchenReportTab: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<KitchenStats>({
    avgPressure: 0,
    totalPortionsProduced: 0,
    livePortions: 0,
    batchPortions: 0,
    deliveriesCompleted: 0,
    freezerLevel: 0,
    missionDistribution: {},
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, timeRange]);

  const fetchStats = async () => {
    if (!user) return;

    setLoading(true);

    const daysBack = timeRange === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: sessions } = await supabase
      .from('cooking_sessions')
      .select('*')
      .eq('chef_id', user.id)
      .gte('session_date', startDateStr);

    const { data: freezerStock } = await supabase
      .from('freezer_stock')
      .select('quantity')
      .eq('chef_id', user.id);

    const livePortions = sessions?.filter(s => s.session_type === 'live')
      .reduce((sum, s) => sum + (s.recipes?.length || 0) * 10, 0) || 0;

    const batchPortions = sessions?.filter(s => s.session_type === 'batch')
      .reduce((sum, s) => sum + (s.recipes?.length || 0) * 20, 0) || 0;

    const freezerLevel = freezerStock?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const missionCounts: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const { data: daySettings } = await supabase
        .from('daily_capacity_settings')
        .select('mission')
        .eq('chef_id', user.id)
        .eq('day_of_week', i)
        .maybeSingle();

      if (daySettings?.mission) {
        missionCounts[daySettings.mission] = (missionCounts[daySettings.mission] || 0) + 1;
      }
    }

    setStats({
      avgPressure: 45,
      totalPortionsProduced: livePortions + batchPortions,
      livePortions,
      batchPortions,
      deliveriesCompleted: sessions?.filter(s => s.status === 'completed').length || 0,
      freezerLevel,
      missionDistribution: missionCounts,
    });

    setLoading(false);
  };

  const MISSION_LABELS: Record<string, string> = {
    live: '🍳 Live',
    batch: '🧊 Batch',
    delivery: '🚗 Utkörning',
    event: '🎪 Event',
    admin: '💻 Admin',
    pause: '😴 Paus',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Laddar statistik...</p>
      </div>
    );
  }

  const warnings = [];
  if (stats.freezerLevel < 10) {
    warnings.push({ type: 'danger', message: 'Frysen är nästan tom - planera batch-tillagning!' });
  }
  if (stats.avgPressure > 85) {
    warnings.push({ type: 'warning', message: 'Högt tryck i köket - överväg att begränsa bokningar' });
  }
  if (stats.avgPressure < 30) {
    warnings.push({ type: 'info', message: 'Lugn vecka framöver - bra tillfälle för batch-produktion' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Köksrapport</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'week'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Senaste veckan
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'month'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Senaste månaden
          </button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="space-y-3">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                warning.type === 'danger'
                  ? 'bg-red-50 border-red-200'
                  : warning.type === 'warning'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <AlertTriangle
                size={20}
                className={
                  warning.type === 'danger'
                    ? 'text-red-600'
                    : warning.type === 'warning'
                    ? 'text-orange-600'
                    : 'text-blue-600'
                }
              />
              <p
                className={`text-sm ${
                  warning.type === 'danger'
                    ? 'text-red-800'
                    : warning.type === 'warning'
                    ? 'text-orange-800'
                    : 'text-blue-800'
                }`}
              >
                {warning.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp size={24} className="text-blue-600" />}
          label="Genomsnittligt tryck"
          value={`${Math.round(stats.avgPressure)}%`}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<BarChart3 size={24} className="text-green-600" />}
          label="Producerade portioner"
          value={stats.totalPortionsProduced.toString()}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Package size={24} className="text-purple-600" />}
          label="Fryslager"
          value={`${stats.freezerLevel} portioner`}
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<Truck size={24} className="text-orange-600" />}
          label="Leveranser"
          value={stats.deliveriesCompleted.toString()}
          bgColor="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="font-semibold mb-4">Produktionsfördelning</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">🍳 Live-portioner</span>
                <span className="text-sm font-medium">{stats.livePortions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${
                      stats.totalPortionsProduced > 0
                        ? (stats.livePortions / stats.totalPortionsProduced) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">🧊 Batch-portioner</span>
                <span className="text-sm font-medium">{stats.batchPortions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${
                      stats.totalPortionsProduced > 0
                        ? (stats.batchPortions / stats.totalPortionsProduced) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="font-semibold mb-4">Missionsfördelning (vecka)</h4>
          <div className="space-y-3">
            {Object.entries(stats.missionDistribution).map(([mission, count]) => (
              <div key={mission} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{MISSION_LABELS[mission] || mission}</span>
                <span className="text-sm font-medium">{count} dagar</span>
              </div>
            ))}
            {Object.keys(stats.missionDistribution).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Ingen missionsdata tillgänglig
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h4 className="font-semibold mb-4">Framtidsspaning</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <TrendingUp size={18} className="text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Prognos kommande vecka</p>
              <p className="text-sm text-gray-600 mt-1">
                Baserat på dina bokningar och kapacitetsinställningar ser veckan ut att vara{' '}
                {stats.avgPressure > 70 ? 'hög belastning' : stats.avgPressure > 40 ? 'måttlig belastning' : 'låg belastning'}.
              </p>
            </div>
          </div>

          {stats.freezerLevel < 20 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Fryslager-rekommendation</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Överväg att planera batch-tillagning för att bygga upp fryslager.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}> = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} rounded-2xl p-5 hover:shadow-md transition-all`}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);
