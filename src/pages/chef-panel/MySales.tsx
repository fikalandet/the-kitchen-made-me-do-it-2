import React, { useState, useEffect } from 'react';
import { Plus, Package, Calendar, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProductTable } from '../../components/ProductTable';
import { ProductDetailDrawer } from '../../components/ProductDetailDrawer';
import { useAuth } from '../../contexts/AuthContext';
import GiftCards from './GiftCards';
import { OrdersTab } from './OrdersTab';
import { RevenueTab } from './RevenueTab';
import { CustomersTab } from './CustomersTab';

interface MySalesProps {
  activeSubTab: string;
}

interface Product {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  status: string;
  available: boolean;
  created_at: string;
  category: string;
  portions?: number;
  profiles?: {
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface InfoCards {
  lowStock: number;
  expiringBatches: number;
  upcomingEvents: number;
}

export const MySales: React.FC<MySalesProps> = ({ activeSubTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [infoCards, setInfoCards] = useState<InfoCards>({
    lowStock: 0,
    expiringBatches: 0,
    upcomingEvents: 0
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openSummaryPanel, setOpenSummaryPanel] = useState<'lowStock' | 'shortDate' | 'upcoming' | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadInfoCards()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles!seller_id (
          display_name,
          full_name,
          avatar_url
        )
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
      return;
    }

    const transformedData = (data || []).map((product: any) => ({
      ...product,
      profiles: Array.isArray(product.profiles) && product.profiles.length > 0
        ? product.profiles[0]
        : null
    }));

    setProducts(transformedData);
  };

  const loadInfoCards = async () => {
    if (!user) return;

    let lowStockCount = 0;
    let expiringBatchesCount = 0;
    let upcomingEventsCount = 0;

    const { data: products } = await supabase
      .from('products')
      .select('id, name, type, freezer_portions')
      .eq('seller_id', user.id);

    if (!products) return;

    for (const product of products) {
      const { data: batches } = await supabase
        .from('batch_inventory')
        .select('quantity_remaining')
        .eq('product_id', product.id);

      if (batches) {
        const totalStock = batches.reduce((sum, b) => sum + b.quantity_remaining, 0);
        if (totalStock < 5) {
          lowStockCount++;
        }
      }

      if ((product.freezer_portions ?? 0) < 5) {
        lowStockCount++;
      }
    }

    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const { data: expiringBatches } = await supabase
      .from('batch_inventory')
      .select('id')
      .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0])
      .gte('expiry_date', today.toISOString().split('T')[0]);

    expiringBatchesCount = expiringBatches?.length || 0;

    const { data: cookingSessions } = await supabase
      .from('cooking_schedule')
      .select('id')
      .gte('cooking_date', today.toISOString().split('T')[0])
      .lte('cooking_date', sevenDaysFromNow.toISOString().split('T')[0])
      .eq('status', 'planned');

    upcomingEventsCount += cookingSessions?.length || 0;

    const { data: liveSessions } = await supabase
      .from('chef_live_sessions')
      .select('id, datum')
      .eq('chef_id', user.id)
      .gte('datum', today.toISOString().split('T')[0])
      .lte('datum', sevenDaysFromNow.toISOString().split('T')[0]);

    upcomingEventsCount += liveSessions?.length || 0;

    const { data: batchSessions } = await supabase
      .from('chef_batch_sessions')
      .select('id, datum')
      .eq('chef_id', user.id)
      .gte('datum', today.toISOString().split('T')[0])
      .lte('datum', sevenDaysFromNow.toISOString().split('T')[0]);

    upcomingEventsCount += batchSessions?.length || 0;

    const { data: deliverySessions } = await supabase
      .from('chef_delivery_sessions')
      .select('id')
      .eq('chef_id', user.id)
      .gte('datum', today.toISOString().split('T')[0])
      .lte('datum', sevenDaysFromNow.toISOString().split('T')[0]);

    upcomingEventsCount += deliverySessions?.length || 0;

    const { data: shoppingMissions } = await supabase
      .from('chef_shopping_missions')
      .select('id')
      .eq('chef_id', user.id)
      .gte('datum', today.toISOString().split('T')[0])
      .lte('datum', sevenDaysFromNow.toISOString().split('T')[0]);

    upcomingEventsCount += shoppingMissions?.length || 0;

    const { data: cateringBookings } = await supabase
      .from('catering_bookings')
      .select('id')
      .gte('event_date', today.toISOString().split('T')[0])
      .lte('event_date', sevenDaysFromNow.toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed']);

    upcomingEventsCount += cateringBookings?.length || 0;

    setInfoCards({
      lowStock: lowStockCount,
      expiringBatches: expiringBatchesCount,
      upcomingEvents: upcomingEventsCount
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedProduct(null);
  };

  const handleProductUpdate = () => {
    loadData();
  };

  const handleCardClick = async (type: 'lowStock' | 'shortDate' | 'upcoming') => {
    if (openSummaryPanel === type) {
      setOpenSummaryPanel(null);
      setDetailData(null);
    } else {
      setOpenSummaryPanel(type);
      await loadDetailData(type);
    }
  };

  const loadDetailData = async (type: 'lowStock' | 'shortDate' | 'upcoming') => {
    if (!user) return;

    try {
      if (type === 'lowStock') {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, type, freezer_portions, available')
          .eq('seller_id', user.id);

        const lowStockProducts = [];
        if (products) {
          for (const product of products) {
            const { data: batches } = await supabase
              .from('batch_inventory')
              .select('quantity_remaining')
              .eq('product_id', product.id);

            const batchStock = batches?.reduce((sum, b) => sum + b.quantity_remaining, 0) || 0;
            const freezerStock = product.freezer_portions ?? 0;

            if (batchStock < 5 || freezerStock < 5) {
              lowStockProducts.push({
                ...product,
                totalStock: batchStock + freezerStock
              });
            }
          }
        }
        setDetailData(lowStockProducts);
      } else if (type === 'shortDate') {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const { data: batches } = await supabase
          .from('batch_inventory')
          .select(`
            id,
            expiry_date,
            quantity_remaining,
            product_id,
            products (name, type)
          `)
          .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0])
          .gte('expiry_date', today.toISOString().split('T')[0]);

        setDetailData(batches || []);
      } else if (type === 'upcoming') {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const events: any[] = [];

        const { data: liveSessions } = await supabase
          .from('chef_live_sessions')
          .select(`
            id,
            datum,
            start_tid,
            slut_tid,
            product_id,
            products (name)
          `)
          .eq('chef_id', user.id)
          .gte('datum', today.toISOString().split('T')[0])
          .lte('datum', sevenDaysFromNow.toISOString().split('T')[0]);

        if (liveSessions) {
          liveSessions.forEach(session => {
            events.push({
              type: 'På spisen nu',
              date: session.datum,
              time: session.start_tid ? `${session.start_tid.substring(0, 5)}-${session.slut_tid?.substring(0, 5) || ''}` : '',
              description: session.products?.name || 'Livesession'
            });
          });
        }

        const { data: cookingSessions } = await supabase
          .from('cooking_schedule')
          .select(`
            id,
            cooking_date,
            cooking_time,
            product_id,
            products (name)
          `)
          .gte('cooking_date', today.toISOString().split('T')[0])
          .lte('cooking_date', sevenDaysFromNow.toISOString().split('T')[0])
          .eq('status', 'planned');

        if (cookingSessions) {
          cookingSessions.forEach(session => {
            events.push({
              type: 'Batch-tillagning',
              date: session.cooking_date,
              time: session.cooking_time,
              description: session.products?.name || 'Okänd produkt'
            });
          });
        }

        const { data: batchSessions } = await supabase
          .from('chef_batch_sessions')
          .select(`
            id,
            datum,
            tillagningstid_start,
            tillagningstid_slut,
            product_id,
            products (name)
          `)
          .eq('chef_id', user.id)
          .gte('datum', today.toISOString().split('T')[0])
          .lte('datum', sevenDaysFromNow.toISOString().split('T')[0]);

        if (batchSessions) {
          batchSessions.forEach(session => {
            events.push({
              type: 'Batch-tillagning',
              date: session.datum,
              time: session.tillagningstid_start ? `${session.tillagningstid_start.substring(0, 5)}-${session.tillagningstid_slut?.substring(0, 5) || ''}` : '',
              description: session.products?.name || 'Okänd produkt'
            });
          });
        }

        const { data: deliverySessions } = await supabase
          .from('chef_delivery_sessions')
          .select(`
            id,
            datum,
            utkörning_start,
            utkörning_slut,
            session_name
          `)
          .eq('chef_id', user.id)
          .gte('datum', today.toISOString().split('T')[0])
          .lte('datum', sevenDaysFromNow.toISOString().split('T')[0]);

        if (deliverySessions) {
          deliverySessions.forEach(session => {
            events.push({
              type: 'Utkörning',
              date: session.datum,
              time: session.utkörning_start ? `${session.utkörning_start.substring(0, 5)}-${session.utkörning_slut?.substring(0, 5) || ''}` : '',
              description: session.session_name || 'Leverans'
            });
          });
        }

        const { data: shoppingMissions } = await supabase
          .from('chef_shopping_missions')
          .select(`
            id,
            datum,
            tid
          `)
          .eq('chef_id', user.id)
          .gte('datum', today.toISOString().split('T')[0])
          .lte('datum', sevenDaysFromNow.toISOString().split('T')[0]);

        if (shoppingMissions) {
          shoppingMissions.forEach(mission => {
            events.push({
              type: 'Inköp',
              date: mission.datum,
              time: mission.tid?.substring(0, 5) || '',
              description: 'Matinköp'
            });
          });
        }

        const { data: cateringBookings } = await supabase
          .from('catering_bookings')
          .select(`
            id,
            event_date,
            event_time,
            event_type,
            product_id,
            products (name)
          `)
          .gte('event_date', today.toISOString().split('T')[0])
          .lte('event_date', sevenDaysFromNow.toISOString().split('T')[0])
          .in('status', ['pending', 'confirmed']);

        if (cateringBookings) {
          cateringBookings.forEach(booking => {
            events.push({
              type: booking.event_type || 'Catering',
              date: booking.event_date,
              time: booking.event_time,
              description: booking.products?.name || 'Event'
            });
          });
        }

        events.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
          const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
          return dateA.getTime() - dateB.getTime();
        });

        setDetailData(events);
      }
    } catch (error) {
      console.error('Error loading detail data:', error);
      setDetailData([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Laddar...</div>
      </div>
    );
  }

  if (activeSubTab === 'gift-cards') {
    return <GiftCards />;
  }

  if (activeSubTab === 'orders') {
    return <OrdersTab />;
  }

  if (activeSubTab === 'revenue') {
    return <RevenueTab />;
  }

  if (activeSubTab === 'customers') {
    return <CustomersTab />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Min försäljning</h2>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#56c5c5' }}
        >
          <Plus className="w-5 h-5" />
          Skapa ny produkt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => handleCardClick('lowStock')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lågt lager</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{infoCards.lowStock}</p>
              <p className="text-xs text-gray-500 mt-1">{infoCards.lowStock} {infoCards.lowStock === 1 ? 'produkt har' : 'produkter har'} lågt lager</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('shortDate')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kort datum</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{infoCards.expiringBatches}</p>
              <p className="text-xs text-gray-500 mt-1">{infoCards.expiringBatches} {infoCards.expiringBatches === 1 ? 'batch har' : 'batchar har'} kort datum</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('upcoming')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kommande händelser</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{infoCards.upcomingEvents}</p>
              <p className="text-xs text-gray-500 mt-1">{infoCards.upcomingEvents} kommande {infoCards.upcomingEvents === 1 ? 'händelse' : 'händelser'}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {openSummaryPanel && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {openSummaryPanel === 'lowStock' && `Produkter med lågt lager (${infoCards.lowStock})`}
              {openSummaryPanel === 'shortDate' && `Batchar med kort datum (${infoCards.expiringBatches})`}
              {openSummaryPanel === 'upcoming' && `Kommande händelser (${infoCards.upcomingEvents})`}
            </h3>
            <button
              onClick={() => {
                setOpenSummaryPanel(null);
                setDetailData(null);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {!detailData ? (
            <p className="text-gray-500">Laddar...</p>
          ) : detailData.length === 0 ? (
            <p className="text-gray-500">
              {openSummaryPanel === 'lowStock' && 'Inga produkter har lågt lager just nu.'}
              {openSummaryPanel === 'shortDate' && 'Inga batchar har kort datum just nu.'}
              {openSummaryPanel === 'upcoming' && 'Inga kommande händelser just nu.'}
            </p>
          ) : (
            <div className="space-y-2">
              {openSummaryPanel === 'lowStock' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produktnamn</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lager</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.map((product: any) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{product.type}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{product.totalStock} st</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.available ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {product.available ? 'Aktiv' : 'Pausad'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {openSummaryPanel === 'shortDate' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produktnamn</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bäst före</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Antal portioner</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.map((batch: any) => (
                        <tr key={batch.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{batch.products?.name || 'Okänd'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('sv-SE') : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{batch.quantity_remaining} st</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {openSummaryPanel === 'upcoming' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tid</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beskrivning</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.map((event: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{event.type}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {event.date ? new Date(event.date).toLocaleDateString('sv-SE') : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{event.time || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{event.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alla produkter</h3>
        <ProductTable products={products} onProductClick={handleProductClick} />
      </div>

      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={handleProductUpdate}
      />
    </div>
  );
};
