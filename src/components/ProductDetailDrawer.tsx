import React, { useState, useEffect } from 'react';
import { X, Edit2, Pause, Play, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  preparation_time_minutes?: number;
}

interface SubscriptionDetails {
  max_subscribers: number;
  current_subscribers: number;
  delivery_frequency: string;
  next_delivery_date: string;
}

interface BatchInventory {
  batch_number: string;
  production_date: string;
  expiry_date: string;
  quantity_remaining: number;
}

interface CookingSchedule {
  cooking_date: string;
  cooking_time: string;
  planned_portions: number;
  recipe_scaling_factor: number;
  status: string;
}

interface CateringBooking {
  customer_name: string;
  event_date: string;
  number_of_guests: number;
  status: string;
}

interface ProductDetailDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [batches, setBatches] = useState<BatchInventory[]>([]);
  const [cookingSchedules, setCookingSchedules] = useState<CookingSchedule[]>([]);
  const [cateringBookings, setCateringBookings] = useState<CateringBooking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      loadProductDetails();
    }
  }, [product, isOpen]);

  const loadProductDetails = async () => {
    if (!product) return;

    setLoading(true);
    try {
      if (product.type === 'subscription') {
        const { data } = await supabase
          .from('subscription_details')
          .select('*')
          .eq('product_id', product.id)
          .maybeSingle();
        setSubscriptionDetails(data);
      }

      if (product.type === 'dish' && product.category === 'frozen') {
        const { data } = await supabase
          .from('batch_inventory')
          .select('*')
          .eq('product_id', product.id)
          .order('expiry_date', { ascending: true });
        setBatches(data || []);
      }

      if (product.type === 'dish' && product.category === 'cooking_now') {
        const { data } = await supabase
          .from('cooking_schedule')
          .select('*')
          .eq('product_id', product.id)
          .order('cooking_date', { ascending: true });
        setCookingSchedules(data || []);
      }

      if (product.type === 'catering' || product.type === 'hire_chef') {
        const { data } = await supabase
          .from('catering_bookings')
          .select('*')
          .eq('product_id', product.id)
          .order('event_date', { ascending: true });
        setCateringBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!product) return;

    const newStatus = product.status === 'active' ? 'paused' : 'active';

    try {
      await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', product.id);

      onUpdate();
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  if (!isOpen || !product) return null;

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dish: 'Maträtt',
      meal_box: 'Matlådekasse',
      subscription: 'Prenumerationsplan',
      diy_kit: 'Laga-själv-kit',
      hire_chef: 'Hyr mig som kock',
      catering: 'Catering',
      recipe: 'Recept',
      video: 'Matlagningsvideo'
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Produkttyp</span>
                <p className="font-medium text-gray-900">{getProductTypeLabel(product.type)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleStatus}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    product.status === 'active'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {product.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pausa
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Aktivera
                    </>
                  )}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <Edit2 className="w-4 h-4" />
                  Redigera
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Pris</span>
                <p className="font-medium text-gray-900">{product.price} kr</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status</span>
                <p className="font-medium text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status === 'active' ? 'Aktiv' : 'Pausad'}
                  </span>
                </p>
              </div>
            </div>

            {product.description && (
              <div>
                <span className="text-sm text-gray-600">Beskrivning</span>
                <p className="text-gray-900 mt-1">{product.description}</p>
              </div>
            )}
          </div>

          {product.type === 'subscription' && subscriptionDetails && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Prenumerationsdetaljer
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Antal platser</span>
                  <p className="font-medium text-gray-900">
                    {subscriptionDetails.current_subscribers} / {subscriptionDetails.max_subscribers}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Leveransfrekvens</span>
                  <p className="font-medium text-gray-900">{subscriptionDetails.delivery_frequency}</p>
                </div>
                {subscriptionDetails.next_delivery_date && (
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">Nästa leverans</span>
                    <p className="font-medium text-gray-900">
                      {new Date(subscriptionDetails.next_delivery_date).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {batches.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Batchar (I frysen)</h3>
              <div className="space-y-2">
                {batches.map((batch, index) => (
                  <div key={index} className="bg-white rounded p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Batch #{batch.batch_number}</p>
                      <p className="text-sm text-gray-600">
                        Utgår: {new Date(batch.expiry_date).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{batch.quantity_remaining} st</p>
                      <p className="text-sm text-gray-600">kvar</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cookingSchedules.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">På spisen nu</h3>
              <div className="space-y-2">
                {cookingSchedules.map((schedule, index) => (
                  <div key={index} className="bg-white rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {new Date(schedule.cooking_date).toLocaleDateString('sv-SE')} kl {schedule.cooking_time}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        schedule.status === 'planned'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {schedule.status === 'planned' ? 'Planerad' : 'Klar'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {schedule.planned_portions} portioner (skalning: {schedule.recipe_scaling_factor}x)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cateringBookings.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Bokningar</h3>
              <div className="space-y-2">
                {cateringBookings.map((booking, index) => (
                  <div key={index} className="bg-white rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{booking.customer_name}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status === 'pending' ? 'Väntande' : booking.status === 'confirmed' ? 'Bekräftad' : 'Avslutad'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.event_date).toLocaleDateString('sv-SE')} • {booking.number_of_guests} gäster
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Synlighet</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={product.available}
                  className="rounded text-blue-600"
                  disabled
                />
                <span className="text-sm text-gray-700">Visa på marketplace</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded text-blue-600"
                  disabled
                />
                <span className="text-sm text-gray-700">Inkludera i kampanj</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
