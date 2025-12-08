import React, { useState, useEffect } from 'react';
import { Calendar, Check, TrendingUp, Award, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BoostProps {
  preselectedProductId?: string;
}

interface Product {
  id: string;
  name: string;
  type: string;
  created_at: string;
  seller_id: string;
}

interface Feed {
  id: string;
  title: string;
  description: string;
  requires_membership: string;
  allowed_types: string[];
  extra_rules: any;
}

interface Price {
  feed_id: string;
  period_type: string;
  slot_tier: string;
  price_sek: number;
}

export const Boost: React.FC<BoostProps> = ({ preselectedProductId }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [maxAllowedStep, setMaxAllowedStep] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'product' | 'profile' | 'event' | 'competition'>('product');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(preselectedProductId || null);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [slotTier, setSlotTier] = useState<'top2' | 'slot3plus'>('top2');
  const [periodType, setPeriodType] = useState<string>('weekday_1day');
  const [startDate, setStartDate] = useState<string>('');
  const [prices, setPrices] = useState<Price[]>([]);
  const [membershipLevel, setMembershipLevel] = useState<string>('free');
  const [totalPrice, setTotalPrice] = useState(0);
  const [myBoosts, setMyBoosts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'create' | 'manage'>('create');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedFeeds, slotTier, periodType, membershipLevel, prices]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchProducts(),
        fetchFeeds(),
        fetchPrices(),
        fetchMyBoosts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('membership_level')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) {
      setMembershipLevel(data.membership_level || 'free');
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, type, created_at, seller_id')
      .eq('seller_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setProducts(data);
  };

  const fetchFeeds = async () => {
    const { data } = await supabase
      .from('feeds')
      .select('*')
      .order('id');

    if (data) setFeeds(data);
  };

  const fetchPrices = async () => {
    const { data } = await supabase
      .from('boost_prices')
      .select('*')
      .eq('active', true);

    if (data) setPrices(data);
  };

  const fetchMyBoosts = async () => {
    const { data } = await supabase
      .from('boost_orders')
      .select(`
        *,
        reservations:boost_reservations(*)
      `)
      .eq('chef_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setMyBoosts(data);
  };

  const calculateTotalPrice = () => {
    if (selectedFeeds.length === 0) {
      setTotalPrice(0);
      return;
    }

    let total = 0;
    selectedFeeds.forEach(feedId => {
      const price = prices.find(p =>
        p.feed_id === feedId &&
        p.period_type === periodType &&
        p.slot_tier === slotTier
      );
      total += price?.price_sek || 49;
    });

    const discount = membershipLevel === 'silver' ? 0.1 : membershipLevel === 'gold' ? 0.2 : 0;
    total = total * (1 - discount);
    setTotalPrice(total);
  };

  const isFeedEligible = (feed: Feed): { eligible: boolean; reason?: string } => {
    const selectedProd = products.find(p => p.id === selectedProduct);
    if (!selectedProd) return { eligible: false, reason: 'Välj en produkt först' };

    if (feed.requires_membership === 'silver' && membershipLevel === 'free') {
      return { eligible: false, reason: 'Kräver Silver-medlemskap' };
    }
    if (feed.requires_membership === 'gold' && membershipLevel !== 'gold') {
      return { eligible: false, reason: 'Kräver Guld-medlemskap' };
    }

    if (!feed.allowed_types.includes(selectedProd.type)) {
      return { eligible: false, reason: 'Produkttypen stöds inte' };
    }

    if (feed.extra_rules?.max_age_days) {
      const age = Math.floor((Date.now() - new Date(selectedProd.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (age > feed.extra_rules.max_age_days) {
        return { eligible: false, reason: `Produkten är äldre än ${feed.extra_rules.max_age_days} dagar` };
      }
    }

    return { eligible: true };
  };

  const handleCreateBoost = async () => {
    if (!selectedProduct || selectedFeeds.length === 0 || !startDate) {
      alert('Fyll i alla obligatoriska fält');
      return;
    }

    const selectedProd = products.find(p => p.id === selectedProduct);
    if (!selectedProd) return;

    try {
      for (const feedId of selectedFeeds) {
        const { data, error } = await supabase.rpc('create_boost_reservation', {
          p_product_id: selectedProduct,
          p_product_type: selectedProd.type,
          p_feed_id: feedId,
          p_slot_tier: slotTier,
          p_period_type: periodType,
          p_start_date: startDate
        });

        if (error) {
          console.error('Error creating boost:', error);
          alert(`Fel vid bokning av ${feedId}: ${error.message}`);
          return;
        }
      }

      alert('Boost skapad!');
      setViewMode('manage');
      fetchMyBoosts();
    } catch (error) {
      console.error('Error:', error);
      alert('Ett fel uppstod vid skapande av boost');
    }
  };

  const canContinue = () => {
    if (step === 1) return !!selectedProduct;
    if (step === 2) return selectedFeeds.length > 0;
    if (step === 3) return !!startDate;
    if (step === 4) return true;
    if (step === 5) return true;
    return true;
  };

  const handleNext = () => {
    if (canContinue()) {
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep > maxAllowedStep) {
        setMaxAllowedStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    setStep(Math.max(step - 1, 1));
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= maxAllowedStep) {
      setStep(targetStep);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8" role="tablist">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="flex items-center">
          <button
            role="tab"
            aria-selected={step === s}
            onClick={() => handleStepClick(s)}
            disabled={s > maxAllowedStep}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step >= s ? 'text-white' : 'bg-white text-gray-400'
            } ${s <= maxAllowedStep ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
            style={{ backgroundColor: step >= s ? '#a1c798' : undefined }}
          >
            {step > s ? <Check size={20} /> : s}
          </button>
          {s < 6 && (
            <div
              className={`h-1 w-12 mx-2 transition-all ${
                step > s ? '' : 'bg-gray-300'
              }`}
              style={{ backgroundColor: step > s ? '#a1c798' : undefined }}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4">Steg 1: Vad ska boostas?</h2>

      <div className="flex gap-4 mb-6">
        {(['product', 'profile', 'event', 'competition'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedTab === tab ? 'text-white shadow-md' : 'bg-white text-black border-2'
            }`}
            style={{
              backgroundColor: selectedTab === tab ? '#a1c798' : undefined,
              borderColor: selectedTab === tab ? '#a1c798' : '#e5e7eb'
            }}
          >
            {tab === 'product' ? 'Produkt' : tab === 'profile' ? 'Kockprofil' : tab === 'event' ? 'Event' : 'Tävling'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Laddar produkter...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Du har inga produkter att boosta ännu</p>
          <p className="text-sm text-gray-500">Skapa en produkt först för att kunna boosta den</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedProduct === product.id ? 'ring-2 shadow-lg' : 'bg-white border-2 border-gray-200 hover:border-gray-300'
              }`}
              style={{
                ringColor: selectedProduct === product.id ? '#a1c798' : undefined,
                backgroundColor: selectedProduct === product.id ? '#f6f2e0' : undefined
              }}
            >
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.type}</p>
            </button>
          ))}
        </div>
      )}

      {!selectedProduct && (
        <p className="text-sm text-red-600 mt-4">Välj en produkt för att fortsätta</p>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={handleNext}
          disabled={!canContinue()}
          className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#a1c798' }}
        >
          Nästa <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4">Steg 2: Var ska det synas?</h2>

      {feeds.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Inga flöden tillgängliga</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feeds.map((feed) => {
            const eligibility = isFeedEligible(feed);
            return (
              <div key={feed.id} className="relative">
                <label
                  className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                    eligibility.eligible ? 'cursor-pointer hover:border-gray-300' : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: selectedFeeds.includes(feed.id) ? '#f6f2e0' : 'white',
                    borderColor: selectedFeeds.includes(feed.id) ? '#a1c798' : '#e5e7eb'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedFeeds.includes(feed.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFeeds([...selectedFeeds, feed.id]);
                      } else {
                        setSelectedFeeds(selectedFeeds.filter(id => id !== feed.id));
                      }
                    }}
                    disabled={!eligibility.eligible}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{feed.title}</div>
                    <div className="text-sm text-gray-600">{feed.description}</div>
                    {!eligibility.eligible && (
                      <div className="text-sm text-red-600 mt-1">{eligibility.reason}</div>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      )}

      {selectedFeeds.length === 0 && (
        <p className="text-sm text-red-600 mt-4">Välj minst ett flöde för att fortsätta</p>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          style={{ backgroundColor: '#56c5c5', color: 'white' }}
        >
          <ChevronLeft size={20} /> Tillbaka
        </button>
        <button
          onClick={handleNext}
          disabled={!canContinue()}
          className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#a1c798' }}
        >
          Nästa <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4">Steg 3: Plats & Period</h2>

      <div className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Platsnivå</label>
          <div className="flex gap-4">
            <button
              onClick={() => setSlotTier('top2')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                slotTier === 'top2' ? 'ring-2' : 'hover:border-gray-300'
              }`}
              style={{
                backgroundColor: slotTier === 'top2' ? '#f6f2e0' : 'white',
                borderColor: slotTier === 'top2' ? '#a1c798' : '#e5e7eb'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award size={24} style={{ color: '#a1c798' }} />
                <span className="font-bold">Top-2</span>
              </div>
              <p className="text-sm text-gray-600">Garanterad plats 1-2 i flödet</p>
            </button>
            <button
              onClick={() => setSlotTier('slot3plus')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                slotTier === 'slot3plus' ? 'ring-2' : 'hover:border-gray-300'
              }`}
              style={{
                backgroundColor: slotTier === 'slot3plus' ? '#f6f2e0' : 'white',
                borderColor: slotTier === 'slot3plus' ? '#a1c798' : '#e5e7eb'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp size={24} style={{ color: '#56c5c5' }} />
                <span className="font-bold">Plats 3+</span>
              </div>
              <p className="text-sm text-gray-600">Listning garanterad men ej exakt position</p>
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Period</label>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg"
          >
            <option value="weekday_1day">1 vardagsdygn (mån-tors)</option>
            <option value="mon_thu">Mån-Tors (4 dagar)</option>
            <option value="friday">Fredag</option>
            <option value="saturday">Lördag</option>
            <option value="sunday">Söndag</option>
            <option value="fri_sun">Fre-Sön (3 dagar)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Startdatum</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border-2 border-gray-200 rounded-lg"
          />
        </div>
      </div>

      {!startDate && (
        <p className="text-sm text-red-600 mt-4">Välj ett startdatum för att fortsätta</p>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          style={{ backgroundColor: '#56c5c5', color: 'white' }}
        >
          <ChevronLeft size={20} /> Tillbaka
        </button>
        <button
          onClick={handleNext}
          disabled={!canContinue()}
          className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#a1c798' }}
        >
          Nästa <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const discount = membershipLevel === 'silver' ? 10 : membershipLevel === 'gold' ? 20 : 0;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Steg 4: Pris & Medlemskap</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f6f2e0' }}>
            <div className="flex justify-between mb-2">
              <span>Antal flöden:</span>
              <span className="font-semibold">{selectedFeeds.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Platsnivå:</span>
              <span className="font-semibold">{slotTier === 'top2' ? 'Top-2' : 'Plats 3+'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Period:</span>
              <span className="font-semibold">{periodType}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-2" style={{ color: '#56c5c5' }}>
                <span>Medlemsrabatt ({membershipLevel}):</span>
                <span className="font-semibold">-{discount}%</span>
              </div>
            )}
            <div className="border-t-2 border-gray-300 pt-2 mt-2">
              <div className="flex justify-between text-xl font-bold">
                <span>Totalt:</span>
                <span>{totalPrice.toFixed(2)} SEK</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Inkl. moms</p>
            </div>
          </div>

          <div className="p-4 border-2 rounded-lg" style={{ borderColor: '#56c5c5', backgroundColor: '#f0fffe' }}>
            <h3 className="font-semibold mb-2">Policy för avbokning:</h3>
            <p className="text-sm text-gray-700">
              Avbokning är kostnadsfri om den görs minst 24 timmar innan start.
              Vid avbokning mindre än 24 timmar innan start sker ingen återbetalning.
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            style={{ backgroundColor: '#56c5c5', color: 'white' }}
          >
            <ChevronLeft size={20} /> Tillbaka
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2"
            style={{ backgroundColor: '#a1c798' }}
          >
            Nästa <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    const selectedProd = products.find(p => p.id === selectedProduct);

    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Steg 5: Förhandsgranskning</h2>

        <div className="p-6 rounded-xl" style={{ backgroundColor: '#f6f2e0' }}>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg flex items-center justify-center text-4xl" style={{ backgroundColor: '#a1c798' }}>
              🍽️
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{selectedProd?.name}</h3>
                <span
                  className="text-xs px-2 py-1 rounded font-semibold"
                  style={{
                    backgroundColor: slotTier === 'top2' ? '#a1c798' : '#56c5c5',
                    color: 'white'
                  }}
                >
                  {slotTier === 'top2' ? 'TOP-2' : '3+'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Typ: {selectedProd?.type}</p>
              <p className="text-sm text-gray-600">
                Visas i: {selectedFeeds.map(id => feeds.find(f => f.id === id)?.title).join(', ')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            style={{ backgroundColor: '#56c5c5', color: 'white' }}
          >
            <ChevronLeft size={20} /> Tillbaka
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2"
            style={{ backgroundColor: '#a1c798' }}
          >
            Nästa <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4">Steg 6: Betalning & Bekräftelse</h2>

      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#a1c798' }}>
          <Check size={40} color="white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Bekräfta din bokning</h3>
        <p className="text-gray-600 mb-6">
          Du är nu redo att köpa och schemalägga din boost!
        </p>

        <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: '#f6f2e0' }}>
          <div className="text-3xl font-bold mb-2">{totalPrice.toFixed(2)} SEK</div>
          <p className="text-sm text-gray-600">Totalkostnad inkl. moms</p>
        </div>

        <button
          onClick={handleCreateBoost}
          className="px-8 py-4 rounded-lg text-white font-bold text-lg"
          style={{ backgroundColor: '#a1c798' }}
        >
          Köp & Schemalägg Boost
        </button>
      </div>

      <div className="flex justify-start mt-6">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          style={{ backgroundColor: '#56c5c5', color: 'white' }}
        >
          <ChevronLeft size={20} /> Tillbaka
        </button>
      </div>
    </div>
  );

  const renderMyBoosts = () => (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6">Mina Boostar</h2>

      {myBoosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>Du har inga boostar ännu</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: '#a1c798' }}>
                <th className="text-left p-3">Objekt</th>
                <th className="text-left p-3">Flöde</th>
                <th className="text-left p-3">Plats</th>
                <th className="text-left p-3">Period</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Pris</th>
              </tr>
            </thead>
            <tbody>
              {myBoosts.map((boost) => (
                <tr key={boost.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">{boost.id.slice(0, 8)}</td>
                  <td className="p-3">{boost.reservations?.length || 0} flöden</td>
                  <td className="p-3">-</td>
                  <td className="p-3">{new Date(boost.created_at).toLocaleDateString('sv-SE')}</td>
                  <td className="p-3">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: boost.status === 'paid' ? '#a1c798' : '#56c5c5',
                        color: 'white'
                      }}
                    >
                      {boost.status}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{boost.amount} SEK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="text-gray-600">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f6f2e0' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Boosta</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('create')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'create' ? 'text-white' : 'bg-white'
              }`}
              style={{ backgroundColor: viewMode === 'create' ? '#a1c798' : undefined }}
            >
              Skapa Boost
            </button>
            <button
              onClick={() => setViewMode('manage')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'manage' ? 'text-white' : 'bg-white'
              }`}
              style={{ backgroundColor: viewMode === 'manage' ? '#a1c798' : undefined }}
            >
              Mina Boostar
            </button>
          </div>
        </div>

        {viewMode === 'create' ? (
          <>
            {renderStepIndicator()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 6 && renderStep6()}
          </>
        ) : (
          renderMyBoosts()
        )}
      </div>
    </div>
  );
};
