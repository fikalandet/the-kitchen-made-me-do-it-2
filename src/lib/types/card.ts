export type Chef = {
  id: string;
  name: string;
  avatarUrl: string;
  membership: 'free' | 'silver' | 'gold';
  openStatus: 'open' | 'soon' | 'closed';
};

export type Logistics = {
  pickup: { enabled: boolean; hours?: string };
  delivery: { enabled: boolean; hours?: string };
};

export type Price = {
  currency: 'SEK';
  price: number;
  originalPrice?: number;
};

export type CommonProps = {
  id: string;
  imageUrl: string;
  hasGallery?: boolean;
  title: string;
  rating?: { value: number; count?: number };
  price: Price;
  packageLabel?: string;
  chef: Chef;
  logistics: Logistics;
  gp?: number;
  onShare?: () => void;
  onFavToggle?: () => void;
  isFaved?: boolean;
  onInfo?: () => void;
  onPrimary?: () => void;
};

export type OnStoveNowProps = CommonProps & {
  schedule: { dateLabel: string; timeRange: string };
  portions: { planned: number; booked: number };
};

export type AvailableDishProps = CommonProps & {
  availability: { frozenCount?: number; preOrder?: boolean; subscribe?: boolean };
};

export type RushDishProps = AvailableDishProps & {
  shortDate: boolean;
};

export type FlavorTagDishProps = AvailableDishProps & {
  flavorTag?: string;
  flavorTagColor?: string;
  discountedPrice?: number;
};

export type BundleProps = CommonProps & {
  description?: string;
  availability: { frozenCount?: number; preOrder?: boolean; subscribe?: boolean };
  productType?: string;
};

export type SubscriptionProps = CommonProps & {
  planType: 'dish' | 'bundle' | 'diy';
  availabilityDays: string[];
};

export type TestEatProps = CommonProps & {
  testPortions: number;
};

export type EventCardProps = {
  id: string;
  imageUrl: string;
  title: string;
  chef: Chef;
  description?: string;
  price?: Price;
  seats?: number;
  city?: string;
  venue?: string;
  address?: string;
  date: string;
  time: string;
  onShare?: () => void;
  onFavToggle?: () => void;
  isFaved?: boolean;
  onComment?: () => void;
  onAttending?: (status: 'yes' | 'maybe' | null) => void;
  attendingStatus?: 'yes' | 'maybe' | null;
  attendingCounts?: { yes: number; maybe: number };
};

export type ChefOfWeekProps = {
  chef: Chef;
  kitchenName: string;
  adminComment: string;
  imageShape?: 'round' | 'square';
  imageSize?: number;
  imagePlacement?: 'left' | 'center' | 'right';
  onVisitKitchen?: () => void;
  cardBackgroundColor?: string;
  cardNameColor?: string;
  cardCommentColor?: string;
};
