import { Chef, Price, Logistics, OnStoveNowProps, CommonProps } from '../types/card';

interface SupabaseProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  membership_level?: string;
  kitchen_open_status?: string;
}

interface SupabaseProduct {
  id: string;
  name: string;
  price?: number;
  image_url?: string;
  seller_id: string;
  available?: boolean;
  rating?: number;
  rating_count?: number;
  pickup_enabled?: boolean;
  pickup_hours?: string;
  delivery_enabled?: boolean;
  delivery_hours?: string;
}

export function transformChef(profile: SupabaseProfile | null | undefined): Chef {
  if (!profile) {
    return {
      id: 'unknown',
      name: 'Kock',
      avatarUrl: '',
      membership: 'free',
      openStatus: 'closed',
    };
  }

  return {
    id: profile.id,
    name: profile.display_name || 'Kock',
    avatarUrl: profile.avatar_url || '',
    membership: (profile.membership_level as 'free' | 'silver' | 'gold') || 'free',
    openStatus: (profile.kitchen_open_status as 'open' | 'soon' | 'closed') || 'closed',
  };
}

export function transformPrice(price: number | null | undefined): Price {
  return {
    currency: 'SEK',
    price: price || 0,
  };
}

export function transformLogistics(product: SupabaseProduct): Logistics {
  return {
    pickup: {
      enabled: product.pickup_enabled ?? false,
      hours: product.pickup_hours,
    },
    delivery: {
      enabled: product.delivery_enabled ?? false,
      hours: product.delivery_hours,
    },
  };
}

export function createCommonProps(
  product: SupabaseProduct,
  chef: Chef,
  interactions: {
    onShare?: () => void;
    onFavToggle?: () => void;
    isFaved?: boolean;
    onInfo?: () => void;
    onPrimary?: () => void;
  } = {}
): CommonProps {
  return {
    id: product.id,
    imageUrl: product.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    hasGallery: false,
    title: product.name,
    rating: product.rating ? {
      value: product.rating,
      count: product.rating_count,
    } : undefined,
    price: transformPrice(product.price),
    chef,
    logistics: transformLogistics(product),
    gp: 30,
    ...interactions,
  };
}

interface DishSchedule {
  cook_date: string;
  portions_available?: number;
  portions_booked?: number;
  cook_time_start?: string;
  cook_time_end?: string;
  product: SupabaseProduct;
}

export function transformToOnStoveNowProps(
  schedule: DishSchedule,
  chef: Chef,
  interactions: {
    onShare?: () => void;
    onFavToggle?: () => void;
    isFaved?: boolean;
    onInfo?: () => void;
    onPrimary?: () => void;
  } = {}
): OnStoveNowProps {
  const commonProps = createCommonProps(schedule.product, chef, interactions);

  const date = new Date(schedule.cook_date);
  const dayName = date.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });

  let timeRange = 'Under dagen';
  if (schedule.cook_time_start && schedule.cook_time_end) {
    timeRange = `${schedule.cook_time_start}-${schedule.cook_time_end}`;
  }

  return {
    ...commonProps,
    schedule: {
      dateLabel: dayName,
      timeRange,
    },
    portions: {
      planned: (schedule.portions_available || 0) + (schedule.portions_booked || 0),
      booked: schedule.portions_booked || 0,
    },
    gp: 20,
  };
}
