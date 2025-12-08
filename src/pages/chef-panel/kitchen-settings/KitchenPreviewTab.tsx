import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Star, MapPin, Share2, Heart, MessageSquare, Navigation, Package, Eye, EyeOff, Instagram, Facebook, Youtube, Twitter, Linkedin } from 'lucide-react';
import { WishFoodModal } from '../../../components/WishFoodModal';
import { PurchaseGiftCardModal } from '../../../components/PurchaseGiftCardModal';

interface KitchenProfile {
  kitchen_name: string;
  description: string;
  profile_image_url: string;
  banner_image_url: string;
  welcome_video_url: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  pickup_available: boolean;
  delivery_available: boolean;
  delivery_price_per_km: number;
  free_delivery_threshold: number;
  delivery_pricing_type: string;
  delivery_distance_ranges: Array<{ min: number; max: number; price: number }>;
  show_obs_notification: boolean;
  obs_notification_title: string;
  obs_notification_text: string;
  obs_notification_bg_color: string;
  membership_level: string;
  wish_food_enabled: boolean;
  wish_food_info_text: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
  twitter_url: string;
  linkedin_url: string;
}

type ActiveTab = 'welcome-video' | 'deals' | 'menu' | 'boxes' | 'recipes' | 'booking' | 'events';

export const KitchenPreviewTab: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<KitchenProfile | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [openingHours, setOpeningHours] = useState<any[]>([]);
  const [mealBoxes, setMealBoxes] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [bookingServices, setBookingServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu');
  const [kitchenStatus, setKitchenStatus] = useState<'open' | 'closed' | 'opening-soon' | 'closing-soon'>('open');
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [isGiftCardModalOpen, setIsGiftCardModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchKitchenData();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (openingHours.length > 0) {
        calculateKitchenStatus(openingHours);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [openingHours]);

  const fetchKitchenData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('kitchen_name, description, profile_image_url, banner_image_url, welcome_video_url, address, postal_code, city, phone, email, pickup_available, delivery_available, delivery_price_per_km, free_delivery_threshold, delivery_pricing_type, delivery_distance_ranges, show_obs_notification, obs_notification_title, obs_notification_text, obs_notification_bg_color, membership_level, wish_food_enabled, wish_food_info_text, instagram_url, facebook_url, tiktok_url, youtube_url, twitter_url, linkedin_url')
        .eq('id', user?.id)
        .single();

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .eq('type', 'dish')
        .eq('available', true);

      const { data: hoursData } = await supabase
        .from('opening_hours')
        .select('*')
        .eq('chef_id', user?.id)
        .eq('show_on_profile', true)
        .order('day_of_week', { ascending: true });

      const { data: mealBoxData } = await supabase
        .from('meal_box_details')
        .select(`
          *,
          products!inner(
            id,
            name,
            description,
            price,
            image_url,
            available
          )
        `)
        .eq('products.available', true);

      const { data: subscriptionData } = await supabase
        .from('subscription_details')
        .select('*')
        .eq('chef_id', user?.id)
        .eq('is_active', true);

      const { data: mealBoxProductsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .in('type', ['meal_box', 'diy_kit'])
        .eq('available', true);

      const { data: recipesData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .in('type', ['recipe', 'video'])
        .eq('available', true);

      const { data: bookingData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .in('type', ['catering', 'hire_chef'])
        .eq('available', true);

      setProfile(profileData as any);
      setProducts(productsData || []);
      setOpeningHours(hoursData || []);

      const formattedMealBoxData = (mealBoxData || []).map((box: any) => ({
        ...box,
        name: box.products?.name || 'Matlådekasse',
        description: box.products?.description || '',
        price: box.products?.price || 0,
        image_url: box.products?.image_url || null
      }));

      setMealBoxes([...formattedMealBoxData, ...(mealBoxProductsData || [])]);
      setSubscriptions(subscriptionData || []);
      setRecipes(recipesData || []);
      setBookingServices(bookingData || []);

      if (hoursData && hoursData.length > 0) {
        calculateKitchenStatus(hoursData);
      }
    } catch (error) {
      console.error('Error fetching kitchen data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKitchenStatus = (hours: any[]) => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = hours.find(h => h.day_of_week === currentDay && h.is_open);

    if (!todayHours) {
      setKitchenStatus('closed');
      return;
    }

    const [openHour, openMin] = todayHours.open_time.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close_time.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    const minutesUntilOpen = openTime - currentTime;
    const minutesUntilClose = closeTime - currentTime;

    if (currentTime < openTime) {
      if (minutesUntilOpen <= 30) {
        setKitchenStatus('opening-soon');
      } else {
        setKitchenStatus('closed');
      }
    } else if (currentTime >= openTime && currentTime < closeTime) {
      if (minutesUntilClose <= 30) {
        setKitchenStatus('closing-soon');
      } else {
        setKitchenStatus('open');
      }
    } else {
      setKitchenStatus('closed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (kitchenStatus) {
      case 'open':
        return { color: '#22c55e', emoji: '🟢' };
      case 'closed':
        return { color: '#ef4444', emoji: '🔴' };
      case 'opening-soon':
      case 'closing-soon':
        return { color: '#f59e0b', emoji: '🟡' };
      default:
        return { color: '#22c55e', emoji: '🟢' };
    }
  };

  const status = getStatusDisplay();
  // TEMPORARY: Show all features for testing
  const isGoldOrSilver = true; // profile?.membership_level === 'gold' || profile?.membership_level === 'silver';

  const renderRightContent = () => {
    switch (activeTab) {
      case 'welcome-video':
        return (
          <div className="space-y-4">
            <h3 className="font-lobster text-xl text-gray-800">Välkomstvideo</h3>
            {profile?.welcome_video_url ? (
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <video src={profile.welcome_video_url} controls className="w-full h-full" />
              </div>
            ) : (
              <p className="text-sm text-gray-600">Ingen välkomstvideo uppladdad</p>
            )}
          </div>
        );
      case 'deals':
        return (
          <div className="space-y-4">
            <h3 className="font-lobster text-xl text-gray-800">Schyssta deals</h3>
            <p className="text-sm text-gray-600">Inga aktiva deals just nu</p>
          </div>
        );
      case 'menu':
        return (
          <div className="space-y-4">
            <h3 className="font-lobster text-xl text-gray-800">Min meny</h3>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1">{product.name}</h4>
                      <p className="text-base font-bold" style={{ color: '#56c5c5' }}>
                        {product.price} SEK
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Inga produkter tillgängliga</p>
            )}
          </div>
        );
      case 'boxes':
        return (
          <div className="space-y-4">
            <h3 className="font-lobster text-xl text-gray-800">Kassar & prenumerationer</h3>
            {mealBoxes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Matlådekassar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mealBoxes.map((box) => (
                    <div key={box.id} className="bg-white rounded-lg overflow-hidden shadow">
                      {box.image_url ? (
                        <img src={box.image_url} alt={box.name} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                          <Package size={32} className="text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">{box.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{box.description}</p>
                        <p className="text-base font-bold" style={{ color: '#56c5c5' }}>
                          {box.price} SEK
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {subscriptions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Prenumerationer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-white rounded-lg overflow-hidden shadow">
                      {sub.image_url ? (
                        <img src={sub.image_url} alt={sub.name} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                          <Package size={32} className="text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">{sub.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{sub.description}</p>
                        <p className="text-base font-bold" style={{ color: '#56c5c5' }}>
                          {sub.price} SEK / {sub.billing_frequency === 'weekly' ? 'vecka' : sub.billing_frequency === 'monthly' ? 'månad' : 'period'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mealBoxes.length === 0 && subscriptions.length === 0 && (
              <p className="text-sm text-gray-600">Inga kassar eller prenumerationer tillgängliga</p>
            )}
          </div>
        );
      case 'recipes':
        return (
          <div className="space-y-4">
            <h3 className="font-lobster text-xl text-gray-800">Recept & videos</h3>
            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                      <p className="text-base font-bold" style={{ color: '#56c5c5' }}>
                        {item.price ? `${item.price} SEK` : 'Gratis'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Inga recept eller videos tillgängliga</p>
            )}
          </div>
        );
      case 'booking':
        return (
          <div className="space-y-4">
            <h3 className="font-lobster text-xl text-gray-800">Boka mig</h3>
            {bookingServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookingServices.map((service) => (
                  <div key={service.id} className="bg-white rounded-lg overflow-hidden shadow">
                    {service.image_url ? (
                      <img src={service.image_url} alt={service.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1">{service.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                      <p className="text-base font-bold" style={{ color: '#56c5c5' }}>
                        {service.price} SEK
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Bokningsinformation kommer snart</p>
            )}
          </div>
        );
      case 'events':
        return (
          <div className="space-y-4">
            <h3 className="font-lobster text-xl text-gray-800">Tävling & events</h3>
            <p className="text-sm text-gray-600">Inga aktiva tävlingar eller events</p>
          </div>
        );
      default:
        return null;
    }
  };

  const previewContent = (
    <div className="min-h-screen" style={{ backgroundColor: '#a1c798' }}>
      <div className="relative">
        <div className="relative h-64">
          {profile?.banner_image_url ? (
            <img src={profile.banner_image_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}

          <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
            {profile?.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.kitchen_name || 'Kök'}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-300 border-4 border-white shadow-lg" />
            )}
            <div className="flex justify-center mt-1">
              <div className="bg-white px-3 py-1 rounded-full flex items-center gap-2 shadow">
                <span style={{ color: status.color, fontSize: '12px' }}>{status.emoji}</span>
                <span className="text-xs font-medium text-gray-800">
                  {kitchenStatus === 'open' ? 'Öppet' :
                   kitchenStatus === 'closed' ? 'Stängt' :
                   kitchenStatus === 'opening-soon' ? 'Öppnar snart' : 'Stänger snart'}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Dela"
            >
              <Share2 size={18} className="text-gray-700" />
            </button>
            <button
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Favorit"
            >
              <Heart size={18} className="text-gray-700" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-2 px-4 flex-wrap" style={{ marginTop: '3mm' }}>
          <button
            onClick={() => isGoldOrSilver && profile?.welcome_video_url && profile.welcome_video_url.trim() !== '' && setActiveTab('welcome-video')}
            disabled={!isGoldOrSilver || !profile?.welcome_video_url || profile.welcome_video_url.trim() === ''}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: activeTab === 'welcome-video' ? '#56c5c5' : (!isGoldOrSilver || !profile?.welcome_video_url || profile.welcome_video_url.trim() === '' ? '#e5e7eb' : '#ffffff'),
              color: (!isGoldOrSilver || !profile?.welcome_video_url || profile.welcome_video_url.trim() === '' ? '#9ca3af' : '#000000'),
              opacity: (!isGoldOrSilver || !profile?.welcome_video_url || profile.welcome_video_url.trim() === '' ? 0.6 : 1)
            }}
          >
            Välkomstvideo
          </button>

          <button
            onClick={() => isGoldOrSilver && setActiveTab('deals')}
            disabled={!isGoldOrSilver}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: activeTab === 'deals' ? '#56c5c5' : (!isGoldOrSilver ? '#e5e7eb' : '#ffffff'),
              color: (!isGoldOrSilver ? '#9ca3af' : '#000000'),
              opacity: (!isGoldOrSilver ? 0.6 : 1)
            }}
          >
            Schyssta deals
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'menu' ? '#56c5c5' : '#ffffff',
              color: '#000000'
            }}
          >
            Min meny
          </button>

          <button
            onClick={() => isGoldOrSilver && setActiveTab('boxes')}
            disabled={!isGoldOrSilver}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: activeTab === 'boxes' ? '#56c5c5' : (!isGoldOrSilver ? '#e5e7eb' : '#ffffff'),
              color: (!isGoldOrSilver ? '#9ca3af' : '#000000'),
              opacity: (!isGoldOrSilver ? 0.6 : 1)
            }}
          >
            Kassar & prenumerationer
          </button>

          <button
            onClick={() => isGoldOrSilver && setActiveTab('recipes')}
            disabled={!isGoldOrSilver}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: activeTab === 'recipes' ? '#56c5c5' : (!isGoldOrSilver ? '#e5e7eb' : '#ffffff'),
              color: (!isGoldOrSilver ? '#9ca3af' : '#000000'),
              opacity: (!isGoldOrSilver ? 0.6 : 1)
            }}
          >
            Recept & videos
          </button>

          <button
            onClick={() => isGoldOrSilver && setActiveTab('booking')}
            disabled={!isGoldOrSilver}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: activeTab === 'booking' ? '#56c5c5' : (!isGoldOrSilver ? '#e5e7eb' : '#ffffff'),
              color: (!isGoldOrSilver ? '#9ca3af' : '#000000'),
              opacity: (!isGoldOrSilver ? 0.6 : 1)
            }}
          >
            Boka mig
          </button>

          <button
            onClick={() => isGoldOrSilver && setActiveTab('events')}
            disabled={!isGoldOrSilver}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: activeTab === 'events' ? '#56c5c5' : (!isGoldOrSilver ? '#e5e7eb' : '#ffffff'),
              color: (!isGoldOrSilver ? '#9ca3af' : '#000000'),
              opacity: (!isGoldOrSilver ? 0.6 : 1)
            }}
          >
            Tävling & events
          </button>

          <button
            onClick={() => setIsGiftCardModalOpen(true)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          >
            Presentkort
          </button>
        </div>

        {profile?.show_obs_notification && (profile.obs_notification_title || profile.obs_notification_text) && (
          <div className="max-w-7xl mx-auto px-4 mt-2">
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor:
                  profile.obs_notification_bg_color === 'light-pink' ? '#fce7f3' :
                  profile.obs_notification_bg_color === 'black' ? '#000000' :
                  profile.obs_notification_bg_color === 'white' ? '#ffffff' :
                  profile.obs_notification_bg_color === 'light-teal' ? '#a8e6e3' :
                  profile.obs_notification_bg_color === 'light-yellow' ? '#fef3c7' :
                  profile.obs_notification_bg_color === 'light-blue' ? '#dbeafe' :
                  profile.obs_notification_bg_color === 'light-purple' ? '#e9d5ff' :
                  '#fef3c7',
                color: profile.obs_notification_bg_color === 'black' ? '#ffffff' : '#000000'
              }}
            >
              <div>
                {profile.obs_notification_title && (
                  <div className="font-bold mb-1">{profile.obs_notification_title}</div>
                )}
                {profile.obs_notification_text && (
                  <div>{profile.obs_notification_text}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4" style={{ marginTop: '3mm' }}>
        <div className="grid grid-cols-[280px,1fr] gap-6">
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="font-lobster text-2xl text-gray-800 mb-1">
                {profile?.kitchen_name || 'Ditt kök'}
              </h1>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className="text-yellow-500 fill-current" />
                ))}
                <span className="ml-1 text-xs text-gray-600">(4.8)</span>
              </div>
            </div>

            {profile?.wish_food_enabled && (
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="font-lobster text-base text-gray-800 mb-2 text-center">
                  Hos mig kan du önska käk
                </h2>
                <div className="flex justify-center">
                  <button
                    onClick={() => setIsWishModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#56c5c5', color: '#ffffff' }}
                  >
                    Skriv & önska
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-lobster text-base text-gray-800 mb-2 text-center">
                Kort om mig
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed text-center">
                {profile?.description || 'Ingen beskrivning tillgänglig än'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-lobster text-base text-gray-800 mb-2 text-center">
                Hitta hit
              </h2>
              <p className="text-xs text-gray-700 text-center mb-3">
                {profile?.address || 'Ingen adress angiven'}
                {profile?.postal_code && profile?.city && (
                  <><br />{profile.postal_code} {profile.city}</>
                )}
              </p>
              <div className="flex justify-center">
                <button
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: '#56c5c5', color: '#ffffff' }}
                >
                  <Navigation size={14} />
                  Öppna i GPS
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-lobster text-base text-gray-800 mb-2 text-center">
                Leverans
              </h2>
              <div className="space-y-2">
                {profile?.pickup_available && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-700">
                    <MapPin size={14} />
                    <span>Upphämtning tillgänglig</span>
                  </div>
                )}
                {profile?.delivery_available && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-700">
                      <span>Utkörning tillgänglig</span>
                    </div>
                    {profile.delivery_pricing_type === 'per_km' && profile.delivery_price_per_km > 0 && (
                      <div className="text-xs text-gray-700 text-center">
                        ({profile.delivery_price_per_km} kr/km)
                      </div>
                    )}
                    {profile.delivery_pricing_type === 'distance_range' && profile.delivery_distance_ranges && profile.delivery_distance_ranges.length > 0 && (
                      <div className="text-xs text-gray-700 text-center space-y-0.5">
                        {profile.delivery_distance_ranges.map((range: any, index: number) => (
                          <div key={index}>
                            {range.min}-{range.max} km: {range.price} kr
                          </div>
                        ))}
                      </div>
                    )}
                    {profile.free_delivery_threshold > 0 && (
                      <div className="text-green-600 text-xs text-center">
                        Fri leverans över {profile.free_delivery_threshold} kr
                      </div>
                    )}
                  </div>
                )}
                {!profile?.pickup_available && !profile?.delivery_available && (
                  <p className="text-xs text-gray-600 text-center">Ingen leveransmetod angiven</p>
                )}
              </div>
            </div>

            {openingHours.length > 0 && (
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="font-lobster text-base text-gray-800 mb-2 text-center">
                  Öppettider
                </h2>
                <div className="space-y-1">
                  {openingHours.map((hours) => {
                    const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
                    return hours.is_open && (
                      <div key={hours.day_of_week} className="flex justify-between text-xs text-gray-700">
                        <span className="font-medium">{dayNames[hours.day_of_week]}</span>
                        <span>{hours.open_time?.slice(0, 5)} - {hours.close_time?.slice(0, 5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(profile?.instagram_url || profile?.facebook_url || profile?.tiktok_url || profile?.youtube_url || profile?.twitter_url || profile?.linkedin_url) && (
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="font-lobster text-base text-gray-800 mb-2 text-center">
                  Sociala medier
                </h2>
                <div className="flex justify-center gap-3 flex-wrap">
                  {profile?.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Instagram size={20} className="text-gray-700" />
                    </a>
                  )}
                  {profile?.facebook_url && (
                    <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Facebook size={20} className="text-gray-700" />
                    </a>
                  )}
                  {profile?.tiktok_url && (
                    <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </a>
                  )}
                  {profile?.youtube_url && (
                    <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Youtube size={20} className="text-gray-700" />
                    </a>
                  )}
                  {profile?.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Twitter size={20} className="text-gray-700" />
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Linkedin size={20} className="text-gray-700" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-lobster text-base text-gray-800 mb-2 text-center">
                Skicka meddelande
              </h2>
              <div className="flex justify-center">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: '#000000', color: '#ffffff' }}
                >
                  <MessageSquare size={14} />
                  Öppna meddelandeformulär
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow p-4" style={{ marginTop: '52px' }}>
              {renderRightContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullPreview) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#a1c798' }}>
        <button
          onClick={() => setIsFullPreview(false)}
          className="fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Stäng förhandsvisning"
        >
          <EyeOff size={20} className="text-gray-700" />
        </button>
        {previewContent}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div>
          <h2 className="font-lobster text-2xl text-gray-800">Visa mitt kök</h2>
          <p className="text-xs text-gray-600 mt-1">Så här ser din profil ut för kunder</p>
        </div>
        <button
          onClick={() => setIsFullPreview(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: '#56c5c5', color: '#ffffff' }}
        >
          <Eye size={18} />
          Förhandsgranska i fullbredd
        </button>
      </div>
      {previewContent}

      <WishFoodModal
        isOpen={isWishModalOpen}
        onClose={() => setIsWishModalOpen(false)}
        infoText={profile?.wish_food_info_text || ''}
        kitchenName={profile?.kitchen_name || 'detta kök'}
      />

      {isGiftCardModalOpen && user && (
        <PurchaseGiftCardModal
          chefId={user.id}
          chefName={profile?.kitchen_name || 'Kocken'}
          chefAvatar={profile?.profile_image_url}
          onClose={() => setIsGiftCardModalOpen(false)}
        />
      )}
    </div>
  );
};
