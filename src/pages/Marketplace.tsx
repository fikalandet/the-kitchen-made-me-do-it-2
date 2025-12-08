import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Clock, Users, AlertCircle } from 'lucide-react';
import { MealBoxCollage } from '../components/MealBoxCollage';

interface Product {
  id: string;
  name: string;
  price: number;
  type: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  preparation_time_minutes: number | null;
  portions: number | null;
  seller_id: string;
  profiles: {
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  meal_box_details?: {
    use_custom_image: boolean;
  } | null;
  capacity_info?: {
    available_capacity: number;
    is_sold_out: boolean;
    show_remaining_spots: boolean;
    low_capacity_threshold: number;
    next_available_date: string | null;
  };
}

export const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const getCapacityInfo = async (productId: string) => {
    const { data: mealBoxDetails } = await supabase
      .from('meal_box_details')
      .select('has_capacity_limit, unlimited_capacity, show_remaining_spots, low_capacity_threshold')
      .eq('product_id', productId)
      .maybeSingle();

    if (!mealBoxDetails || !mealBoxDetails.has_capacity_limit || mealBoxDetails.unlimited_capacity) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: capacityPeriods } = await supabase
      .from('meal_box_capacity_periods')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .gte('delivery_date', today)
      .order('delivery_date');

    if (!capacityPeriods || capacityPeriods.length === 0) {
      return {
        available_capacity: 0,
        is_sold_out: true,
        show_remaining_spots: mealBoxDetails.show_remaining_spots,
        low_capacity_threshold: mealBoxDetails.low_capacity_threshold,
        next_available_date: null
      };
    }

    const nextAvailableSlot = capacityPeriods.find(p => !p.is_sold_out);
    const totalAvailableCapacity = capacityPeriods
      .filter(p => !p.is_sold_out)
      .reduce((sum, p) => sum + (p.max_capacity - p.current_bookings), 0);

    return {
      available_capacity: totalAvailableCapacity,
      is_sold_out: totalAvailableCapacity === 0,
      show_remaining_spots: mealBoxDetails.show_remaining_spots,
      low_capacity_threshold: mealBoxDetails.low_capacity_threshold,
      next_available_date: nextAvailableSlot?.delivery_date || null
    };
  };

  const fetchProducts = async () => {
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        type,
        description,
        image_url,
        category,
        preparation_time_minutes,
        portions,
        seller_id,
        profiles!seller_id (
          display_name,
          full_name,
          avatar_url
        )
      `)
      .eq('available', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (selectedCategory !== 'all') {
      query = query.eq('type', selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      const transformedData = await Promise.all(
        (data || []).map(async (product: any) => {
          const capacityInfo = product.type === 'meal_box' ? await getCapacityInfo(product.id) : null;

          let mealBoxDetails = null;
          if (product.type === 'meal_box') {
            const { data: details } = await supabase
              .from('meal_box_details')
              .select('use_custom_image')
              .eq('product_id', product.id)
              .maybeSingle();
            mealBoxDetails = details;
          }

          return {
            ...product,
            profiles: Array.isArray(product.profiles) && product.profiles.length > 0
              ? product.profiles[0]
              : null,
            meal_box_details: mealBoxDetails,
            capacity_info: capacityInfo
          };
        })
      );
      setProducts(transformedData);
    }
    setLoading(false);
  };

  const getProductTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      dish: 'Maträtt',
      meal_box: 'Matlådekasse',
      subscription: 'Prenumeration',
      diy_kit: 'Gör-det-själv-kit',
      hire_chef: 'Hyra kock',
      catering: 'Catering',
      recipe: 'Recept',
      video: 'Video'
    };
    return types[type] || type;
  };

  const categories = [
    { value: 'all', label: 'Alla' },
    { value: 'dish', label: 'Maträtter' },
    { value: 'meal_box', label: 'Matlådekassar' },
    { value: 'subscription', label: 'Prenumerationer' },
    { value: 'diy_kit', label: 'DIY-kit' },
    { value: 'hire_chef', label: 'Hyra kock' },
    { value: 'catering', label: 'Catering' }
  ];

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#a1c798' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-lobster text-4xl mb-2 text-gray-800">
            Hitta käk
          </h1>
          <p className="text-gray-700">
            Upptäck och beställ hemlagad mat från lokala kockar
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.value
                  ? 'text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={
                selectedCategory === category.value
                  ? { backgroundColor: '#56c5c5' }
                  : { backgroundColor: '#f6f2e0' }
              }
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-700">Läser in produkter...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: '#f6f2e0' }}
                >
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {product.type === 'meal_box' && !product.meal_box_details?.use_custom_image ? (
                      <MealBoxCollage
                        mealBoxId={product.id}
                        chefInfo={product.profiles}
                        className="w-full h-full"
                      />
                    ) : product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={64} className="text-gray-400" />
                      </div>
                    )}
                    {product.capacity_info?.is_sold_out && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">FULLBOKAD</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
                        {getProductTypeLabel(product.type)}
                      </span>
                      {product.category && (
                        <span className="text-xs text-gray-600">{product.category}</span>
                      )}
                    </div>

                    <h2 className="font-lobster text-xl text-gray-800 mb-2">
                      {product.name}
                    </h2>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description || 'Ingen beskrivning tillgänglig'}
                    </p>

                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                      {product.preparation_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{product.preparation_time_minutes} min</span>
                        </div>
                      )}
                      {product.portions && (
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{product.portions} port.</span>
                        </div>
                      )}
                    </div>

                    {product.capacity_info && !product.capacity_info.is_sold_out && product.capacity_info.show_remaining_spots && (
                      <div className="mb-3">
                        {product.capacity_info.available_capacity <= product.capacity_info.low_capacity_threshold ? (
                          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle size={16} className="text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-700">
                              Endast {product.capacity_info.available_capacity} platser kvar!
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-xs font-medium text-green-700">
                              {product.capacity_info.available_capacity} platser tillgängliga
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{product.price} SEK</p>
                        {product.profiles && (
                          <p className="text-xs text-gray-600">
                            av {product.profiles.display_name || product.profiles.full_name || 'Okänd kock'}
                          </p>
                        )}
                      </div>
                      {product.capacity_info?.is_sold_out ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-lg text-white font-medium bg-gray-400 cursor-not-allowed"
                        >
                          Fullbokad
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#56c5c5' }}
                        >
                          Köp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Package size={64} className="mx-auto mb-4 text-gray-700" />
                <p className="text-gray-700">Inga produkter tillgängliga än i denna kategori.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
