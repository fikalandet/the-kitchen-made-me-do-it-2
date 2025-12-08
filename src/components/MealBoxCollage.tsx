import React, { useEffect, useState } from 'react';
import { Package, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Dish {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
}

interface ChefInfo {
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface MealBoxCollageProps {
  mealBoxId?: string;
  dishes?: Dish[];
  chefInfo?: ChefInfo;
  className?: string;
}

export const MealBoxCollage: React.FC<MealBoxCollageProps> = ({
  mealBoxId,
  dishes: dishesProp,
  chefInfo,
  className = ''
}) => {
  const [dishes, setDishes] = useState<Dish[]>(dishesProp || []);
  const [loading, setLoading] = useState(!dishesProp && !!mealBoxId);

  useEffect(() => {
    if (dishesProp) {
      setDishes(dishesProp);
      setLoading(false);
    } else if (mealBoxId) {
      fetchDishes();
    }
  }, [mealBoxId, dishesProp]);

  const fetchDishes = async () => {
    if (!mealBoxId) return;

    const { data, error } = await supabase
      .from('meal_box_dishes')
      .select(`
        dish_id,
        sort_order,
        products!meal_box_dishes_dish_id_fkey (
          id,
          name,
          image_url
        )
      `)
      .eq('meal_box_id', mealBoxId)
      .order('sort_order');

    if (!error && data) {
      const transformedDishes = data.map((item: any) => ({
        id: item.products.id,
        name: item.products.name,
        image_url: item.products.image_url,
        sort_order: item.sort_order
      }));
      setDishes(transformedDishes);
    }
    setLoading(false);
  };

  const getGridLayout = (count: number): string => {
    if (count === 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-2 grid-rows-1';
    if (count === 3) return 'grid-cols-3 grid-rows-1';
    if (count === 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    if (count <= 9) return 'grid-cols-3 grid-rows-3';
    return 'grid-cols-4 grid-rows-3';
  };

  if (loading) {
    return (
      <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-gray-400">Laddar...</div>
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
        <Package size={64} className="text-gray-400" />
      </div>
    );
  }

  const displayName = chefInfo?.display_name || chefInfo?.full_name || 'Kock';

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div className={`grid ${getGridLayout(dishes.length)} gap-0.5 w-full h-full bg-gray-300`}>
        {dishes.map((dish) => (
          <div
            key={dish.id}
            className="relative w-full h-full overflow-hidden bg-gray-200"
          >
            {dish.image_url ? (
              <img
                src={dish.image_url}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <Package size={32} className="text-gray-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute top-3 left-3 px-3 py-1.5 bg-white bg-opacity-95 rounded-lg shadow-md">
        <span className="text-xs font-semibold text-gray-800 tracking-wide">
          MATLÅDEKASSE
        </span>
      </div>

      {chefInfo && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 bg-white bg-opacity-95 rounded-full shadow-md">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {chefInfo.avatar_url ? (
              <img
                src={chefInfo.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} className="text-gray-600" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">
            {displayName}
          </span>
        </div>
      )}
    </div>
  );
};
