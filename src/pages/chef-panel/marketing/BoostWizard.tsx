import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, AlertCircle, Star, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { MealBoxCollage } from '../../../components/MealBoxCollage';

interface BoostWizardProps {
  preselectedProductId?: string;
  chefId?: string;
  isAdminMode?: boolean;
  onClose?: () => void;
}

interface Feed {
  id: string;
  title: string;
  description: string;
  requires_membership: string;
  allowed_types: string[];
  extra_rules: Record<string, any>;
}

interface Product {
  id: string;
  title: string;
  type: string;
  created_at: string;
  avg_rating?: number;
  is_discounted?: boolean;
  has_taste_tag?: boolean;
  image_url?: string;
}

interface KitchenBoostOption {
  id: 'kitchen';
  title: string;
  type: 'kitchen';
}

interface BoostReservation {
  id: string;
  feed_title: string;
  slot_tier: string;
  period_type: string;
  start_date: string;
  end_date: string;
  status: string;
  amount: number;
}

export const BoostWizard: React.FC<BoostWizardProps> = ({ preselectedProductId, chefId, isAdminMode = false, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedKitchen, setSelectedKitchen] = useState<boolean>(false);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [slotTier, setSlotTier] = useState<'top2' | 'slot3plus'>('top2');
  const [periodType, setPeriodType] = useState<string>('weekday_1day');
  const [startDate, setStartDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [myBoosts, setMyBoosts] = useState<BoostReservation[]>([]);
  const [showMyBoosts, setShowMyBoosts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (user || chefId) {
        setLoading(true);
        setError(null);
        await Promise.all([fetchProducts(), fetchFeeds(), fetchMyBoosts()]);
        setLoading(false);
      }
    };
    loadData();
  }, [user, chefId]);

  useEffect(() => {
    if (preselectedProductId && products.length > 0) {
      const product = products.find(p => p.id === preselectedProductId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [preselectedProductId, products]);

  const fetchProducts = async () => {
    const targetChefId = chefId || user?.id;
    if (!targetChefId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id, name, type, created_at, price, image_url, available')
        .eq('seller_id', targetChefId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError('Kunde inte hämta produkter: ' + fetchError.message);
        return;
      }

      if (data) {
        const mappedProducts = data.map((p: any) => ({
          id: p.id,
          title: p.name,
          type: p.type,
          created_at: p.created_at,
          avg_rating: undefined,
          is_discounted: false,
          has_taste_tag: false,
          image_url: p.image_url
        }));
        setProducts(mappedProducts as Product[]);
      }
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setError('Ett fel uppstod vid hämtning av produkter');
    }
  };

  const fetchFeeds = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('feeds')
        .select('*')
        .order('title');

      if (fetchError) {
        console.error('Error fetching feeds:', fetchError);
        setError('Kunde inte hämta flöden: ' + fetchError.message);
        return;
      }

      if (data) {
        setFeeds(data as Feed[]);
      }
    } catch (err) {
      console.error('Error in fetchFeeds:', err);
      setError('Ett fel uppstod vid hämtning av flöden');
    }
  };

  const fetchMyBoosts = async () => {
    const targetChefId = chefId || user?.id;
    if (!targetChefId) return;

    const { data } = await supabase
      .from('boost_reservations')
      .select(`
        id,
        slot_tier,
        period_type,
        start_date,
        end_date,
        status,
        feed_id,
        feeds(title),
        boost_orders(amount)
      `)
      .eq('chef_id', targetChefId)
      .order('start_date', { ascending: false });

    if (data) {
      setMyBoosts(data.map(b => ({
        id: b.id,
        feed_title: b.feeds?.title || b.feed_id,
        slot_tier: b.slot_tier,
        period_type: b.period_type,
        start_date: b.start_date,
        end_date: b.end_date,
        status: b.status,
        amount: b.boost_orders?.amount || 0
      })) as BoostReservation[]);
    }
  };

  const checkEligibility = (feed: Feed, product: Product | null): { eligible: boolean; reason?: string } => {
    if (selectedKitchen) {
      return { eligible: true };
    }

    if (!product) return { eligible: false, reason: 'Ingen produkt vald' };

    const mealBoxFeeds = ['Kylskåpsmeny', 'Bråttomkäk', 'Schyssta deals', 'Smaketiketter', 'Nytt på menyn', 'Populärt käk'];
    if (product.type === 'meal_box' && mealBoxFeeds.includes(feed.title)) {
      return { eligible: true };
    }

    if (!feed.allowed_types.includes(product.type)) {
      return { eligible: false, reason: `Produkttypen ${getProductTypeLabel(product.type)} är inte tillåten i detta flöde` };
    }

    if (feed.extra_rules.max_age_days) {
      const daysSinceCreated = Math.floor((Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreated > feed.extra_rules.max_age_days) {
        return { eligible: false, reason: `Produkten är för gammal (max ${feed.extra_rules.max_age_days} dagar)` };
      }
    }

    if (feed.extra_rules.min_rating && (!product.avg_rating || product.avg_rating < feed.extra_rules.min_rating)) {
      return { eligible: false, reason: `Produkten måste ha minst ${feed.extra_rules.min_rating} i betyg` };
    }

    if (feed.extra_rules.require_discount && !product.is_discounted) {
      return { eligible: false, reason: 'Produkten måste vara rabatterad för detta flöde' };
    }

    return { eligible: true };
  };

  const calculatePrice = async () => {
    if (!selectedFeed) return;

    const { data } = await supabase
      .from('boost_prices')
      .select('price_sek')
      .eq('feed_id', selectedFeed)
      .eq('period_type', periodType)
      .eq('slot_tier', slotTier)
      .eq('active', true)
      .maybeSingle();

    if (data) {
      const membershipDiscount = 0;
      setTotalPrice(data.price_sek * (1 - membershipDiscount / 100));
    }
  };

  useEffect(() => {
    calculatePrice();
  }, [selectedFeed, slotTier, periodType]);

  useEffect(() => {
    if (selectedFeed) {
      const selectedFeedData = feeds.find(f => f.id === selectedFeed);
      if (selectedFeedData?.title === 'Kock i fokus') {
        fetchBookedDates();
      }
    }
  }, [selectedFeed]);

  const fetchBookedDates = async () => {
    if (!selectedFeed) return;

    const { data } = await supabase
      .from('boost_reservations')
      .select('start_date, end_date')
      .eq('feed_id', selectedFeed)
      .in('status', ['reserved', 'active']);

    if (data) {
      const dates: string[] = [];
      data.forEach(booking => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }
      });
      setBookedDates(dates);
    }
  };

  const handlePurchase = async () => {
    const targetChefId = chefId || user?.id;
    if (!targetChefId || !selectedProduct) return;

    const orderAmount = isAdminMode ? 0 : totalPrice;

    const { data: order, error: orderError } = await supabase
      .from('boost_orders')
      .insert({
        chef_id: targetChefId,
        status: 'completed',
        amount: orderAmount,
        currency: 'SEK',
        membership_level_at_purchase: 'free'
      })
      .select()
      .single();

    if (orderError || !order) {
      alert('Fel vid skapande av order: ' + orderError?.message);
      return;
    }

    const startDateObj = new Date(startDate);
    let endDateObj = new Date(startDate);

    switch (periodType) {
      case 'weekday_1day':
        endDateObj = startDateObj;
        break;
      case 'mon_thu':
        endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 3);
        break;
      case 'friday':
      case 'saturday':
      case 'sunday':
        endDateObj = startDateObj;
        break;
      case 'fri_sun':
        endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 2);
        break;
    }

    if (selectedFeed) {
      const { data: boostProduct, error: boostProductError } = await supabase
        .from('boost_products')
        .insert({
          type: selectedProduct.type,
          ref_id: selectedProduct.id,
          chef_id: targetChefId
        })
        .select()
        .single();

      if (boostProductError) {
        alert('Fel vid skapande av boost-produkt: ' + boostProductError.message);
        return;
      }

      if (boostProduct) {
        const { error: reservationError } = await supabase
          .from('boost_reservations')
          .insert({
            order_id: order.id,
            boost_product_id: boostProduct.id,
            feed_id: selectedFeed,
            chef_id: targetChefId,
            slot_tier: slotTier,
            period_type: periodType,
            start_date: startDateObj.toISOString().split('T')[0],
            end_date: endDateObj.toISOString().split('T')[0],
            status: 'reserved'
          });

        if (reservationError) {
          alert('Fel vid skapande av reservation: ' + reservationError.message);
          return;
        }

        const { error: updateProductError } = await supabase
          .from('products')
          .update({ is_boosted: true })
          .eq('id', selectedProduct.id);

        if (updateProductError) {
          console.error('Fel vid uppdatering av is_boosted:', updateProductError);
        }
      }
    }

    setPurchaseSuccess(true);
    setOrderId(order.id);
    await fetchMyBoosts();

    setTimeout(() => {
      setPurchaseSuccess(false);
      setOrderId(null);
      setCurrentStep(1);
      setSelectedProduct(null);
      setSelectedKitchen(false);
      setSelectedFeed(null);

      if (onClose) {
        onClose();
      }
    }, 3000);
  };

  const getProductTypeLabel = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'recipe': 'Recept',
      'meal_box': 'Matlådekasse',
      'dish': 'Maträtt',
      'kitchen': 'Mitt kök'
    };
    return typeMap[type] || type;
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Steg 1: Välj vad som ska boostas</h3>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Laddar produkter...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      ) : products.length === 0 && !selectedKitchen ? (
        <div className="text-center py-12 px-6 rounded-xl" style={{ backgroundColor: '#ffffff' }}>
          <p className="text-gray-600 mb-4">Du har inga produkter att boosta än.</p>
          <p className="text-sm text-gray-500">Skapa först en produkt för att kunna använda boost-funktionen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSelectedKitchen(!selectedKitchen);
              setSelectedProduct(null);
            }}
            className={`p-4 rounded-xl shadow-md transition-all overflow-hidden`}
            style={{
              backgroundColor: selectedKitchen ? '#a1c798' : '#d4e7d1',
              border: selectedKitchen ? '2px solid #a1c798' : '2px solid transparent'
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 overflow-hidden">
                <span className="text-4xl">👨‍🍳</span>
              </div>
              <h4 className={`font-semibold mb-2 ${selectedKitchen ? 'text-white' : 'text-gray-800'}`}>Mitt kök</h4>
              <p className={`text-sm ${selectedKitchen ? 'text-white' : 'text-gray-600'}`}>Typ: {getProductTypeLabel('kitchen')}</p>
            </div>
          </button>

          {products.map(product => (
          <button
            key={product.id}
            onClick={() => {
              setSelectedProduct(product);
              setSelectedKitchen(false);
            }}
            className={`p-4 rounded-xl shadow-md transition-all overflow-hidden relative`}
            style={{
              backgroundColor: selectedProduct?.id === product.id ? '#a1c798' : '#d4e7d1',
              border: selectedProduct?.id === product.id ? '2px solid #a1c798' : '2px solid transparent'
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🍽️</span>
                )}
              </div>
              <h4 className={`font-semibold mb-2 text-center ${selectedProduct?.id === product.id ? 'text-white' : 'text-gray-800'}`}>{product.title}</h4>
              <p className={`text-sm ${selectedProduct?.id === product.id ? 'text-white' : 'text-gray-600'}`}>Typ: {getProductTypeLabel(product.type)}</p>
            </div>
            {product.avg_rating && (
              <div className="flex items-center gap-1 mt-2">
                <Star size={14} fill={selectedProduct?.id === product.id ? '#ffffff' : '#a1c798'} color={selectedProduct?.id === product.id ? '#ffffff' : '#a1c798'} />
                <span className={`text-sm ${selectedProduct?.id === product.id ? 'text-white' : 'text-gray-800'}`}>{product.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </button>
          ))}
        </div>
      )}
    </div>
  );

  const getFilteredFeeds = () => {
    if (selectedKitchen) {
      return feeds.filter(feed =>
        feed.title === 'Kock i fokus' || feed.title === 'Veckans kockar'
      );
    }

    if (selectedProduct?.type === 'meal_box') {
      return feeds.filter(feed =>
        feed.title === 'Kylskåpsmeny' ||
        feed.title === 'Bråttomkäk' ||
        feed.title === 'Schyssta deals' ||
        feed.title === 'Smaketiketter' ||
        feed.title === 'Nytt på menyn' ||
        feed.title === 'Populärt käk'
      );
    }

    return feeds;
  };

  const getFeedDescription = (feedTitle: string, originalDescription: string): string => {
    if (feedTitle === 'Bråttomkäk') {
      return 'Mat som snart går ut';
    }
    return originalDescription;
  };

  const renderStep2 = () => {
    const filteredFeeds = getFilteredFeeds();
    const eligibleFeeds = filteredFeeds.filter(feed => checkEligibility(feed, selectedProduct).eligible);

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Steg 2: Välj var det ska synas</h3>
        {eligibleFeeds.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-xl" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-gray-600 mb-4">Inga tillgängliga flöden för denna produkt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eligibleFeeds.map(feed => {
              const isSelected = selectedFeed === feed.id;

              return (
                <button
                  key={feed.id}
                  onClick={() => {
                    setSelectedFeed(isSelected ? null : feed.id);
                  }}
                  className="w-full p-4 rounded-xl shadow-md text-left transition-all"
                  style={{
                    backgroundColor: isSelected ? '#a1c798' : '#d4e7d1',
                    border: isSelected ? '2px solid #a1c798' : '2px solid transparent'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>{feed.title}</h4>
                      <p className={`text-sm mt-1 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                        {getFeedDescription(feed.title, feed.description)}
                      </p>
                    </div>
                    {isSelected && (
                      <Check size={24} color="#ffffff" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const isDateValid = (date: string, periodType: string): boolean => {
    const d = new Date(date);
    const dayOfWeek = d.getDay();

    switch (periodType) {
      case 'weekday_1day':
      case 'mon_thu':
        return dayOfWeek >= 1 && dayOfWeek <= 4;
      case 'friday':
        return dayOfWeek === 5;
      case 'saturday':
        return dayOfWeek === 6;
      case 'sunday':
        return dayOfWeek === 0;
      case 'fri_sun':
        return dayOfWeek === 5;
      default:
        return true;
    }
  };

  const isDateBooked = (date: string): boolean => {
    return bookedDates.includes(date);
  };

  const getDateClassName = (date: string): string => {
    if (isDateBooked(date)) {
      return 'bg-red-100 text-red-600';
    }
    return '';
  };

  const selectedFeedData = feeds.find(f => f.id === selectedFeed);
  const isKockIFokus = selectedFeedData?.title === 'Kock i fokus';

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Steg 3: Välj plats och period</h3>

      {isKockIFokus ? (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f6f2e0' }}>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Kock i fokus</strong> har endast EN plats tillgänglig. Välj ett ledigt datum nedan.
          </p>
          <p className="text-xs text-gray-600">
            Röda datum är redan bokade. Gröna datum är lediga.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Platsnivå</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSlotTier('top2')}
              className="p-4 rounded-xl shadow-md transition-all"
              style={{
                backgroundColor: slotTier === 'top2' ? '#a1c798' : '#ffffff',
                color: slotTier === 'top2' ? '#ffffff' : '#000000'
              }}
            >
              <TrendingUp size={24} className="mx-auto mb-2" />
              <p className="font-semibold">Top-2</p>
              <p className="text-sm mt-1">Position 1-2</p>
            </button>
            <button
              onClick={() => setSlotTier('slot3plus')}
              className="p-4 rounded-xl shadow-md transition-all"
              style={{
                backgroundColor: slotTier === 'slot3plus' ? '#a1c798' : '#ffffff',
                color: slotTier === 'slot3plus' ? '#ffffff' : '#000000'
              }}
            >
              <TrendingUp size={24} className="mx-auto mb-2" />
              <p className="font-semibold">Plats 3+</p>
              <p className="text-sm mt-1">Position 3 eller senare</p>
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Period</label>
        <select
          value={periodType}
          onChange={(e) => {
            setPeriodType(e.target.value);
            setStartDate('');
          }}
          className="w-full p-3 rounded-lg border border-gray-300"
          style={{ backgroundColor: '#ffffff' }}
        >
          <option value="weekday_1day">1 vardagsdygn (mån-tors)</option>
          <option value="mon_thu">Måndag-Torsdag</option>
          <option value="friday">Fredag</option>
          <option value="saturday">Lördag</option>
          <option value="sunday">Söndag</option>
          <option value="fri_sun">Fredag-Söndag</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Startdatum</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            const selectedDate = e.target.value;
            if (isDateValid(selectedDate, periodType) && !isDateBooked(selectedDate)) {
              setStartDate(selectedDate);
              setDateError(null);
            } else if (isDateBooked(selectedDate)) {
              setDateError('Detta datum är redan bokat. Välj ett annat datum.');
            } else {
              const periodLabels: Record<string, string> = {
                'weekday_1day': '1 vardagsdygn (mån-tors)',
                'friday_1day': '1 fredagsdygn',
                'weekend_1day': '1 helgdygn (lör-sön)',
                'week_7days': '1 vecka (7 dagar)',
                'month_30days': '1 månad (30 dagar)'
              };
              setDateError(`Valt datum stämmer inte med perioden "${periodLabels[periodType] || periodType}". Välj ett korrekt datum.`);
            }
          }}
          className="w-full p-3 rounded-lg border border-gray-300"
          style={{ backgroundColor: '#ffffff' }}
          min={new Date().toISOString().split('T')[0]}
        />
        {dateError && (
          <div className="mt-3 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#fef5e7', border: '1px solid #f9c74f' }}>
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#d68910' }}>
                {dateError}
              </p>
            </div>
          </div>
        )}
        {isKockIFokus && bookedDates.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-800 mb-2">Bokade datum:</p>
            <div className="flex flex-wrap gap-2">
              {bookedDates.map(date => (
                <span key={date} className="px-2 py-1 rounded text-xs bg-red-100 text-red-600">
                  {new Date(date).toLocaleDateString('sv-SE')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedFeedData = feeds.find(f => f.id === selectedFeed);

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Steg 4: Pris och medlemskap</h3>

        <div className="p-6 rounded-xl shadow-md" style={{ backgroundColor: '#ffffff' }}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-800">Valt flöde:</span>
            <span className="font-semibold">{selectedFeedData?.title || '-'}</span>
          </div>
          {!isKockIFokus && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-800">Platsnivå:</span>
              <span className="font-semibold">{slotTier === 'top2' ? 'Top-2' : 'Plats 3+'}</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-800">Period:</span>
            <span className="font-semibold">{periodType}</span>
          </div>
        <div className="border-t pt-4 mt-4" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-gray-800">Totalt:</span>
            <span className="text-2xl font-bold" style={{ color: '#a1c798' }}>
              {isAdminMode ? '0' : totalPrice.toFixed(0)} SEK
            </span>
          </div>
          {isAdminMode ? (
            <p className="text-sm font-semibold text-orange-600 mt-2">ADMIN-BOOST (ingen kostnad)</p>
          ) : (
            <p className="text-sm text-gray-600 mt-2">Inkl. moms</p>
          )}
        </div>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f6f2e0' }}>
        <p className="text-sm text-gray-700">
          <strong>Policy:</strong> Avbokning kostnadsfritt ≥24h innan start. Mindre än 24h: ingen återbetalning.
        </p>
      </div>
      </div>
    );
  };

  const renderStep5 = () => {
    const selectedFeedData = feeds.find(f => f.id === selectedFeed);

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Steg 5: Förhandsgranskning</h3>

        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#f6f2e0' }}>
          <p className="text-sm text-gray-700 font-medium mb-1">
            Flöde: {selectedFeedData?.title}
          </p>
          <p className="text-xs text-gray-600">
            Så här kommer {selectedKitchen ? 'ditt kök' : 'din produkt'} att visas i det valda flödet.
          </p>
        </div>

        {selectedKitchen ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <span className="text-4xl">👨‍🍳</span>
            </div>
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                Mitt kök
              </h4>
              <p className="text-sm text-gray-600">
                Hemkock
              </p>
            </div>
          </div>
        ) : selectedProduct && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
            {!isKockIFokus && (
              <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white z-10"
                style={{ backgroundColor: '#a1c798' }}
              >
                {slotTier === 'top2' ? 'Top-2' : '3+'}
              </div>
            )}
            {selectedProduct.type === 'meal_box' ? (
              <div className="w-full h-48 overflow-hidden">
                <MealBoxCollage
                  mealBoxId={selectedProduct.id}
                  className="w-full h-full"
                />
              </div>
            ) : selectedProduct.image_url ? (
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-5xl">🍽️</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold text-gray-800 flex-1">
                  {selectedProduct.title}
                </h4>
                {selectedProduct.price && (
                  <span className="text-lg font-bold" style={{ color: '#a1c798' }}>
                    {selectedProduct.price} kr
                  </span>
                )}
              </div>
              {selectedProduct.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {selectedProduct.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 rounded-full bg-gray-100">
                  {getProductTypeLabel(selectedProduct.type)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMyBoosts = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Mina boostar</h3>

      {myBoosts.length === 0 ? (
        <div className="p-8 rounded-xl text-center" style={{ backgroundColor: '#ffffff' }}>
          <p className="text-gray-600">Du har inga aktiva boostar än.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myBoosts.map(boost => (
            <div key={boost.id} className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{boost.feed_title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {boost.slot_tier === 'top2' ? 'Top-2' : 'Plats 3+'} | {boost.period_type}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(boost.start_date).toLocaleDateString('sv-SE')} - {new Date(boost.end_date).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      backgroundColor: boost.status === 'active' ? '#a1c798' :
                                     boost.status === 'scheduled' ? '#56c5c5' : '#9ca3af'
                    }}
                  >
                    {boost.status === 'scheduled' ? 'Schemalagd' :
                     boost.status === 'active' ? 'Aktiv' :
                     boost.status === 'completed' ? 'Avslutad' : 'Avbruten'}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 mt-2">{boost.amount} SEK</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (showMyBoosts) {
    return (
      <div className="p-6 rounded-xl" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowMyBoosts(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#56c5c5' }}
          >
            <ChevronLeft size={20} />
            Tillbaka
          </button>
        </div>
        {renderMyBoosts()}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: '#f6f2e0' }}>
      {purchaseSuccess ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-lobster text-3xl text-gray-800 mb-2">Boost skapad!</h2>
          <p className="text-gray-700 mb-2">
            {isAdminMode ? 'Admin-boost har skapats för kocken (0 kr)' : 'Din boost har skapats och kommer visas enligt schemat'}
          </p>
          {orderId && (
            <p className="text-sm text-gray-600">Ordernummer: {orderId}</p>
          )}
          <p className="text-sm text-gray-500 mt-4">Stänger automatiskt om några sekunder...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="font-lobster text-3xl text-gray-800">Boosta</h2>
              <button
                onClick={() => setShowMyBoosts(true)}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#56c5c5' }}
              >
                Mina boostar
              </button>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                <X size={24} />
              </button>
            )}
          </div>

      <div className="mb-6">
        <div className="flex justify-between items-start">
          {[
            {
              step: 1,
              label: 'Vad',
              value: selectedKitchen ? 'Mitt kök' : (selectedProduct ? `${getProductTypeLabel(selectedProduct.type)}: ${selectedProduct.title}` : null)
            },
            {
              step: 2,
              label: 'Var',
              value: selectedFeed ? feeds.find(f => f.id === selectedFeed)?.title : null
            },
            {
              step: 3,
              label: 'När',
              value: startDate ? `${isKockIFokus ? '' : (slotTier === 'top2' ? 'Top-2, ' : 'Plats 3+, ')}${new Date(startDate).toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })}` : null
            },
            {
              step: 4,
              label: 'Pris',
              value: totalPrice > 0 ? `${totalPrice.toFixed(0)} kr` : null
            },
            {
              step: 5,
              label: 'Förhandsgranskning',
              value: null
            }
          ].map(({ step, label, value }, index, array) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mb-1 ${
                    currentStep >= step ? 'text-white' : 'text-gray-400'
                  }`}
                  style={{
                    backgroundColor: currentStep >= step ? '#a1c798' : '#e5e7eb'
                  }}
                >
                  {step}
                </div>
                <div className="text-center w-full">
                  <div className={`text-xs font-medium ${currentStep >= step ? 'text-gray-800' : 'text-gray-400'}`}>
                    {label}:
                  </div>
                  {value && (
                    <div className={`text-xs mt-0.5 truncate w-full ${currentStep >= step ? 'text-gray-600' : 'text-gray-400'}`} title={value}>
                      {value}
                    </div>
                  )}
                </div>
              </div>
              {index < array.length - 1 && (
                <div className="flex items-start pt-3 px-2 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: currentStep > step ? '#a1c798' : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md min-h-96">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white disabled:opacity-50"
          style={{ backgroundColor: '#56c5c5' }}
        >
          <ChevronLeft size={20} />
          Föregående
        </button>

        {currentStep < 5 ? (
          <button
            onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            disabled={
              (currentStep === 1 && !selectedProduct && !selectedKitchen) ||
              (currentStep === 2 && !selectedFeed) ||
              (currentStep === 3 && !startDate)
            }
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white disabled:opacity-50"
            style={{ backgroundColor: '#a1c798' }}
          >
            Nästa
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white"
            style={{ backgroundColor: '#a1c798' }}
          >
            <Check size={20} />
            Köp & schemalägg
          </button>
        )}
      </div>
        </>
      )}
    </div>
  );
};
