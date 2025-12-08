import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';

export const Statistics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-lobster text-3xl text-gray-800 mb-2">Statistik</h1>
        <p className="text-gray-600">
          Detaljerad statistik och analys av din verksamhet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          label="Försäljning denna månad"
          value="0 SEK"
          change="+0%"
          color="#56c5c5"
        />
        <StatCard
          icon={ShoppingCart}
          label="Beställningar denna månad"
          value="0"
          change="+0%"
          color="#f4a261"
        />
        <StatCard
          icon={Users}
          label="Nya kunder"
          value="0"
          change="+0%"
          color="#a1c798"
        />
        <StatCard
          icon={DollarSign}
          label="Genomsnittligt ordervärde"
          value="0 SEK"
          change="+0%"
          color="#fbbf24"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-lg shadow p-6"
          style={{ backgroundColor: '#f6f2e0' }}
        >
          <h2 className="font-lobster text-2xl text-gray-800 mb-4">
            Försäljning över tid
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Graf kommer här
          </div>
        </div>

        <div
          className="rounded-lg shadow p-6"
          style={{ backgroundColor: '#f6f2e0' }}
        >
          <h2 className="font-lobster text-2xl text-gray-800 mb-4">
            Populäraste produkter
          </h2>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Ingen data tillgänglig ännu
            </p>
          </div>
        </div>
      </div>

      <div
        className="rounded-lg shadow p-6"
        style={{ backgroundColor: '#f6f2e0' }}
      >
        <h2 className="font-lobster text-2xl text-gray-800 mb-4">
          Kundbeteende
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Mest aktiva dag</p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Mest aktiv tid</p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Återkommande kunder</p>
            <p className="text-2xl font-bold text-gray-900">0%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  change,
  color,
}) => (
  <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
        <Icon size={20} color={color} />
      </div>
    </div>
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-green-600">{change}</div>
  </div>
);
