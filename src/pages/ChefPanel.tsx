import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  type: string;
  description: string | null;
  available: boolean;
  image_url: string | null;
  created_at: string;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  membershipLevel: string;
  commissionRate: number;
}

export const ChefPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    setProducts(productsData || []);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('membership_level')
      .eq('id', user.id)
      .maybeSingle();

    const { data: membershipData } = await supabase
      .from('membership_levels')
      .select('commission_percentage')
      .eq('level', profileData?.membership_level || 'free')
      .maybeSingle();

    const totalProducts = productsData?.length || 0;
    const activeProducts = productsData?.filter(p => p.available).length || 0;

    setStats({
      totalProducts,
      activeProducts,
      totalRevenue: 0,
      membershipLevel: profileData?.membership_level || 'free',
      commissionRate: membershipData?.commission_percentage || 15
    });

    setLoading(false);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna produkt?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (!error) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ available: !currentStatus })
      .eq('id', productId);

    if (!error) {
      setProducts(products.map(p => 
        p.id === productId ? { ...p, available: !currentStatus } : p
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Läser in...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-lobster text-4xl text-gray-800">Min Kockpanel</h1>
        <Link
          to="/products/new"
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors"
          style={{ backgroundColor: '#56c5c5' }}
        >
          <Plus size={20} />
          Lägg till produkt
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Package}
          label="Totala produkter"
          value={stats?.totalProducts || 0}
          color="#56c5c5"
        />
        <StatCard
          icon={TrendingUp}
          label="Aktiva produkter"
          value={stats?.activeProducts || 0}
          color="#a1c798"
        />
        <StatCard
          icon={DollarSign}
          label="Provision"
          value={`${stats?.commissionRate}%`}
          color="#f4a261"
        />
        <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#f6f2e0' }}>
          <div className="text-sm text-gray-600 mb-2">Medlemsnivå</div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              stats?.membershipLevel === 'gold' ? 'bg-yellow-400 text-yellow-900' :
              stats?.membershipLevel === 'silver' ? 'bg-gray-300 text-gray-800' :
              'bg-gray-200 text-gray-700'
            }`}>
              {stats?.membershipLevel === 'gold' ? 'Guld' :
               stats?.membershipLevel === 'silver' ? 'Silver' : 'Gratis'}
            </span>
          </div>
          {stats?.membershipLevel === 'free' && (
            <Link
              to="/membership"
              className="text-sm mt-2 inline-block"
              style={{ color: '#56c5c5' }}
            >
              Uppgradera →
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-lobster text-2xl text-gray-800">Mina produkter</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Du har inga produkter än</p>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#56c5c5' }}
            >
              <Plus size={20} />
              Skapa din första produkt
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <div key={product.id} className="p-6 flex items-center gap-6 hover:bg-white hover:bg-opacity-50 transition-colors">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
                      {product.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      product.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.available ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{product.description}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{product.price} SEK</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAvailability(product.id, product.available)}
                    className="px-4 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    {product.available ? 'Inaktivera' : 'Aktivera'}
                  </button>
                  <Link
                    to={`/products/edit/${product.id}`}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit size={20} className="text-gray-600" />
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 size={20} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#f6f2e0' }}>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
        <Icon size={24} color={color} />
      </div>
    </div>
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-3xl font-bold text-gray-900 mt-1">{value}</div>
  </div>
);
