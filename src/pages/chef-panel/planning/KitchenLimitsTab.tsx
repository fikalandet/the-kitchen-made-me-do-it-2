import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Plus, Trash2, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { PlanningPassCard } from '../../../components/PlanningPassCard';

interface DeliverySession {
  id?: string;
  antal_stopp: number;
  max_avstånd_mil: number;
  packtid_minuter: number;
  utkörning_start: string;
  utkörning_slut: string;
  datum?: string;
  alla_måndagar?: boolean;
  alla_tisdagar?: boolean;
  alla_onsdagar?: boolean;
  alla_torsdagar?: boolean;
  alla_fredagar?: boolean;
  alla_lördagar?: boolean;
  alla_söndagar?: boolean;
  isSaved?: boolean;
}

interface LiveSession {
  id?: string;
  product_id: string;
  antal_portioner: number;
  datum: string;
  start_tid: string;
  slut_tid: string;
  alla_måndagar?: boolean;
  alla_tisdagar?: boolean;
  alla_onsdagar?: boolean;
  alla_torsdagar?: boolean;
  alla_fredagar?: boolean;
  alla_lördagar?: boolean;
  alla_söndagar?: boolean;
  isSaved?: boolean;
}

interface BatchDish {
  id?: string;
  product_id: string;
  antal_portioner: number;
  tillagningstid_start: string;
  tillagningstid_slut: string;
}

interface BatchSession {
  id?: string;
  dishes: BatchDish[];
  datum: string;
  alla_måndagar?: boolean;
  alla_tisdagar?: boolean;
  alla_onsdagar?: boolean;
  alla_torsdagar?: boolean;
  alla_fredagar?: boolean;
  alla_lördagar?: boolean;
  alla_söndagar?: boolean;
  isSaved?: boolean;
}

interface ShoppingMission {
  id?: string;
  datum: string;
  tid: string;
  dishes: BatchDish[];
  isSaved?: boolean;
}

const defaultLiveSettings = {
  antal_portioner_per_pass: 20,
  tillagningstid_start: '10:00',
  tillagningstid_slut: '14:00',
  förberedelsetid_minuter: 30,
};

const defaultBatchSettings = {
  antal_rätter_per_pass: 3,
  portioner_per_rätt: 20,
  tillagningstid_per_rätt_start: '08:00',
  tillagningstid_per_rätt_slut: '16:00',
  förberedelsetid_minuter: 60,
};

const defaultEventSettings = {
  max_rätter: 5,
  max_portioner_per_rätt: 50,
  förberedelsetid_minuter: 120,
  setup_tid_minuter: 60,
};

const MISSIONS = [
  { key: 'live', label: '🍳 På spisen nu', color: '#a1c798' },
  { key: 'batch', label: '🧊 Batch-tillagning', color: '#56c5c5' },
  { key: 'delivery', label: '🚗 Utkörning', color: '#f4d36b' },
  { key: 'event', label: '🎀 Event/Catering/Kockuppdrag', color: '#f6b7b7' },
  { key: 'shopping', label: '🛒 Inköp av mat', color: '#f6f2e0' },
];

const WEEKDAYS = [
  { value: 1, label: 'Måndag' },
  { value: 2, label: 'Tisdag' },
  { value: 3, label: 'Onsdag' },
  { value: 4, label: 'Torsdag' },
  { value: 5, label: 'Fredag' },
  { value: 6, label: 'Lördag' },
  { value: 0, label: 'Söndag' },
];

const checkTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const [h1, m1] = start1.split(':').map(Number);
  const [h2, m2] = end1.split(':').map(Number);
  const [h3, m3] = start2.split(':').map(Number);
  const [h4, m4] = end2.split(':').map(Number);

  const start1Min = h1 * 60 + m1;
  const end1Min = h2 * 60 + m2;
  const start2Min = h3 * 60 + m3;
  const end2Min = h4 * 60 + m4;

  return (start1Min < end2Min && start2Min < end1Min);
};

interface MissionTimeSlot {
  type: string;
  datum: string;
  start: string;
  end: string;
  label: string;
}

const checkAllMissionsForOverlap = (
  liveSessions: LiveSession[],
  batchSessions: BatchSession[],
  deliverySessions: DeliverySession[],
  shoppingMissions: ShoppingMission[]
): { hasOverlap: boolean; message: string } => {
  const allSlots: MissionTimeSlot[] = [];

  liveSessions.forEach((s, i) => {
    allSlots.push({
      type: 'Live',
      datum: s.datum,
      start: s.start_tid,
      end: s.slut_tid,
      label: `Live-pass ${i + 1}`
    });
  });

  batchSessions.forEach((s, i) => {
    s.dishes.forEach((d, j) => {
      allSlots.push({
        type: 'Batch',
        datum: s.datum,
        start: d.tillagningstid_start,
        end: d.tillagningstid_slut,
        label: `Batch ${i + 1}, Rätt ${j + 1}`
      });
    });
  });

  deliverySessions.forEach((s, i) => {
    allSlots.push({
      type: 'Delivery',
      datum: s.datum || '',
      start: s.utkörning_start,
      end: s.utkörning_slut,
      label: `Utkörning ${i + 1}`
    });
  });

  shoppingMissions.forEach((s, i) => {
    const endTime = s.tid.split(':').map(Number);
    const endHour = endTime[0] + 1;
    allSlots.push({
      type: 'Shopping',
      datum: s.datum,
      start: s.tid,
      end: `${endHour.toString().padStart(2, '0')}:${endTime[1].toString().padStart(2, '0')}`,
      label: `Inköp ${i + 1}`
    });
  });

  for (let i = 0; i < allSlots.length; i++) {
    for (let j = i + 1; j < allSlots.length; j++) {
      const s1 = allSlots[i];
      const s2 = allSlots[j];

      if (s1.datum && s2.datum && s1.datum === s2.datum && checkTimeOverlap(s1.start, s1.end, s2.start, s2.end)) {
        return {
          hasOverlap: true,
          message: `Tidskonflikt: ${s1.label} och ${s2.label} överlappar den ${s1.datum}!`
        };
      }
    }
  }

  return { hasOverlap: false, message: '' };
};

interface KitchenLimitsTabProps {
  showOnlyMissions?: boolean;
  showOnlyLimits?: boolean;
}

export const KitchenLimitsTab: React.FC<KitchenLimitsTabProps> = ({ showOnlyMissions = false, showOnlyLimits = false }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [daySettings, setDaySettings] = useState<Record<string, Record<number, any>>>({
    live: {},
    batch: {},
    event: {},
  });
  const [batchSessions, setBatchSessions] = useState<BatchSession[]>([]);
  const [deliverySessions, setDeliverySessions] = useState<DeliverySession[]>([]);
  const [restDays, setRestDays] = useState<number[]>([]);
  const [savedDays, setSavedDays] = useState<Record<string, number[]>>({
    live: [],
    batch: [],
    event: [],
    delivery: [],
  });
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [chefDishes, setChefDishes] = useState<Array<{ id: string; name: string }>>([]);
  const [shoppingMissions, setShoppingMissions] = useState<ShoppingMission[]>([]);
  const [showPlannedMissionsModal, setShowPlannedMissionsModal] = useState<number | null>(null);
  const [selectedPlannedMissions, setSelectedPlannedMissions] = useState<string[]>([]);
  const [shoppingLists, setShoppingLists] = useState<Record<number, { items: any[]; missingRecipes: any[] }>>({});
  const [generatingList, setGeneratingList] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllSettings();
      fetchChefDishes();
    }
  }, [user]);

  const fetchChefDishes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('products')
      .select('id, name')
      .eq('seller_id', user.id)
      .eq('type', 'dish')
      .eq('available', true)
      .order('name');

    if (data) {
      setChefDishes(data);
    }
  };

  const generateShoppingListForInkopspass = async (missionDishes: BatchDish[]) => {
    if (!user || missionDishes.length === 0) {
      return { items: [], missingRecipes: [] };
    }

    const productIds = missionDishes.map(d => d.product_id).filter(Boolean);
    if (productIds.length === 0) {
      return { items: [], missingRecipes: [] };
    }

    const portionsPerProduct: Record<string, number> = {};
    missionDishes.forEach(dish => {
      if (!dish.product_id) return;
      portionsPerProduct[dish.product_id] = (portionsPerProduct[dish.product_id] || 0) + dish.antal_portioner;
    });

    const { data: ingredients } = await supabase
      .from('product_recipe_ingredients')
      .select('*')
      .in('product_id', productIds);

    const productsWithRecipes = new Set<string>();
    const ingredientMap: Record<string, {
      ingredient_name: string;
      total_quantity: number;
      unit: string;
      category: string;
    }> = {};

    if (ingredients && ingredients.length > 0) {
      ingredients.forEach((ing: any) => {
        productsWithRecipes.add(ing.product_id);
        const totalPortions = portionsPerProduct[ing.product_id] || 0;
        const calculatedQuantity = ing.quantity_per_portion * totalPortions;
        const key = `${ing.ingredient_name}|${ing.unit}|${ing.category || ''}`;

        if (ingredientMap[key]) {
          ingredientMap[key].total_quantity += calculatedQuantity;
        } else {
          ingredientMap[key] = {
            ingredient_name: ing.ingredient_name,
            total_quantity: calculatedQuantity,
            unit: ing.unit,
            category: ing.category || '',
          };
        }
      });
    }

    const missingRecipes = missionDishes
      .filter(dish => dish.product_id && !productsWithRecipes.has(dish.product_id))
      .map(dish => {
        const dishName = chefDishes.find(d => d.id === dish.product_id)?.name || 'Okänd rätt';
        return {
          product_id: dish.product_id,
          product_name: dishName,
        };
      });

    const uniqueMissing = Array.from(
      new Map(missingRecipes.map(item => [item.product_id, item])).values()
    );

    const items = Object.values(ingredientMap).sort((a, b) => {
      if (a.category && !b.category) return -1;
      if (!a.category && b.category) return 1;
      if (a.category !== b.category) return a.category.localeCompare(b.category, 'sv');
      return a.ingredient_name.localeCompare(b.ingredient_name, 'sv');
    });

    return { items, missingRecipes: uniqueMissing };
  };

  const fetchAllSettings = async () => {
    if (!user) return;

    setLoading(true);

    const { data: liveData } = await supabase
      .from('chef_live_sessions')
      .select('*')
      .eq('chef_id', user.id);

    if (liveData) {
      setLiveSessions(liveData.map((session: any) => ({
        id: session.id,
        product_id: session.product_id,
        antal_portioner: session.antal_portioner,
        datum: session.datum || '',
        start_tid: session.start_tid,
        slut_tid: session.slut_tid,
        alla_måndagar: session.alla_måndagar,
        alla_tisdagar: session.alla_tisdagar,
        alla_onsdagar: session.alla_onsdagar,
        alla_torsdagar: session.alla_torsdagar,
        alla_fredagar: session.alla_fredagar,
        alla_lördagar: session.alla_lördagar,
        alla_söndagar: session.alla_söndagar,
        isSaved: true,
      })));
    }

    const { data: batchData } = await supabase
      .from('chef_batch_sessions')
      .select('*')
      .eq('chef_id', user.id);

    if (batchData) {
      const sessionMap = new Map<string, BatchSession>();

      batchData.forEach((row: any) => {
        const sessionKey = row.datum || `recurring-${row.id}`;

        if (!sessionMap.has(sessionKey)) {
          sessionMap.set(sessionKey, {
            id: row.id,
            dishes: [],
            datum: row.datum || '',
            tillagningstid_start: row.tillagningstid_start,
            tillagningstid_slut: row.tillagningstid_slut,
            alla_måndagar: row.alla_måndagar,
            alla_tisdagar: row.alla_tisdagar,
            alla_onsdagar: row.alla_onsdagar,
            alla_torsdagar: row.alla_torsdagar,
            alla_fredagar: row.alla_fredagar,
            alla_lördagar: row.alla_lördagar,
            alla_söndagar: row.alla_söndagar,
            isSaved: true,
          });
        }

        sessionMap.get(sessionKey)!.dishes.push({
          id: row.id,
          product_id: row.product_id,
          antal_portioner: row.antal_portioner,
          tillagningstid_start: row.tillagningstid_start,
          tillagningstid_slut: row.tillagningstid_slut,
        });
      });

      setBatchSessions(Array.from(sessionMap.values()));
    }

    const { data: allData } = await supabase
      .from('chef_mission_settings')
      .select('*')
      .eq('chef_id', user.id);

    if (allData) {
      const settingsByMission: Record<string, Record<number, any>> = {
        live: {},
        batch: {},
        event: {},
      };

      const savedByMission: Record<string, number[]> = {
        live: [],
        batch: [],
        event: [],
        delivery: [],
      };

      allData.forEach((item: any) => {
        if (item.mission && item.mission !== 'delivery' && item.day_of_week !== null && !item.is_rest_day) {
          settingsByMission[item.mission][item.day_of_week] = item.settings;
          savedByMission[item.mission].push(item.day_of_week);
        }
      });

      setDaySettings(settingsByMission);
      setSavedDays(savedByMission);
    }

    const { data: deliveryData } = await supabase
      .from('chef_delivery_sessions')
      .select('*')
      .eq('chef_id', user.id)
      .order('utkörning_start');

    if (deliveryData) {
      setDeliverySessions(deliveryData.map((session: any) => ({
        id: session.id,
        antal_stopp: session.antal_stopp,
        max_avstånd_mil: session.max_avstånd_mil,
        packtid_minuter: session.packtid_minuter,
        utkörning_start: session.utkörning_start,
        utkörning_slut: session.utkörning_slut,
        datum: session.datum || '',
        alla_måndagar: session.alla_måndagar,
        alla_tisdagar: session.alla_tisdagar,
        alla_onsdagar: session.alla_onsdagar,
        alla_torsdagar: session.alla_torsdagar,
        alla_fredagar: session.alla_fredagar,
        alla_lördagar: session.alla_lördagar,
        alla_söndagar: session.alla_söndagar,
        isSaved: true,
      })));
    }

    const { data: restDaysData } = await supabase
      .from('chef_mission_settings')
      .select('day_of_week')
      .eq('chef_id', user.id)
      .eq('is_rest_day', true)
      .not('day_of_week', 'is', null);

    if (restDaysData) {
      setRestDays(restDaysData.map((d: any) => d.day_of_week));
    }

    const { data: shoppingData } = await supabase
      .from('chef_shopping_missions')
      .select(`
        id,
        datum,
        tid,
        shopping_mission_dishes (
          product_id,
          antal_portioner
        )
      `)
      .eq('chef_id', user.id);

    if (shoppingData) {
      setShoppingMissions(shoppingData.map((mission: any) => ({
        id: mission.id,
        datum: mission.datum,
        tid: mission.tid,
        dishes: mission.shopping_mission_dishes?.map((d: any) => ({
          product_id: d.product_id,
          antal_portioner: d.antal_portioner,
          tillagningstid_start: '',
          tillagningstid_slut: '',
        })) || [],
        isSaved: true,
      })));
    }

    setLoading(false);
  };

  const updateDaySetting = (mission: string, day: number, field: string, value: any) => {
    setDaySettings({
      ...daySettings,
      [mission]: {
        ...daySettings[mission],
        [day]: {
          ...daySettings[mission][day],
          [field]: value,
        },
      },
    });
  };

  const handleSaveDeliverySessions = async () => {
    if (!user) return;

    setSaving(true);

    try {
      await supabase
        .from('chef_delivery_sessions')
        .delete()
        .eq('chef_id', user.id);

      for (const session of deliverySessions) {
        await supabase
          .from('chef_delivery_sessions')
          .insert({
            chef_id: user.id,
            antal_stopp: session.antal_stopp,
            max_avstånd_mil: session.max_avstånd_mil,
            packtid_minuter: session.packtid_minuter,
            utkörning_start: session.utkörning_start,
            utkörning_slut: session.utkörning_slut,
            datum: session.datum || null,
            alla_måndagar: session.alla_måndagar || false,
            alla_tisdagar: session.alla_tisdagar || false,
            alla_onsdagar: session.alla_onsdagar || false,
            alla_torsdagar: session.alla_torsdagar || false,
            alla_fredagar: session.alla_fredagar || false,
            alla_lördagar: session.alla_lördagar || false,
            alla_söndagar: session.alla_söndagar || false,
          });
      }

      await fetchAllSettings();
      alert('Alla utkörnings-pass sparade!');
    } catch (error) {
      console.error('Error saving delivery sessions:', error);
      alert('Fel vid sparande');
    } finally {
      setSaving(false);
    }
  };

  const toggleRestDay = async (day: number) => {
    if (!user) return;

    const isRestDay = restDays.includes(day);

    if (isRestDay) {
      await supabase
        .from('chef_mission_settings')
        .delete()
        .eq('chef_id', user.id)
        .eq('day_of_week', day)
        .eq('is_rest_day', true);

      setRestDays(restDays.filter(d => d !== day));
    } else {
      await supabase
        .from('chef_mission_settings')
        .insert({
          chef_id: user.id,
          mission: 'live',
          day_of_week: day,
          is_rest_day: true,
          settings: {},
        });

      setRestDays([...restDays, day]);
    }
  };

  const handleSaveDay = async (mission: string, day: number) => {
    if (!user) return;

    setSaving(true);

    try {
      await supabase
        .from('chef_mission_settings')
        .delete()
        .eq('chef_id', user.id)
        .eq('mission', mission)
        .eq('day_of_week', day)
        .eq('is_rest_day', false);

      const settings = daySettings[mission][day];

      if (settings && Object.keys(settings).length > 0) {
        await supabase
          .from('chef_mission_settings')
          .insert({
            chef_id: user.id,
            mission,
            day_of_week: day,
            settings: settings,
            is_rest_day: false,
          });

        setSavedDays(prev => ({
          ...prev,
          [mission]: [...new Set([...prev[mission], day])],
        }));
      }

      await fetchAllSettings();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Fel vid sparande');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLiveSessions = async () => {
    if (!user) return;

    const overlapCheck = checkAllMissionsForOverlap(liveSessions, batchSessions, deliverySessions, shoppingMissions);
    if (overlapCheck.hasOverlap) {
      alert(overlapCheck.message);
      return;
    }

    setSaving(true);

    try {
      await supabase
        .from('chef_live_sessions')
        .delete()
        .eq('chef_id', user.id);

      for (const session of liveSessions) {
        if (!session.product_id) continue;

        await supabase
          .from('chef_live_sessions')
          .insert({
            chef_id: user.id,
            product_id: session.product_id,
            antal_portioner: session.antal_portioner,
            datum: session.datum || null,
            start_tid: session.start_tid,
            slut_tid: session.slut_tid,
            alla_måndagar: session.alla_måndagar || false,
            alla_tisdagar: session.alla_tisdagar || false,
            alla_onsdagar: session.alla_onsdagar || false,
            alla_torsdagar: session.alla_torsdagar || false,
            alla_fredagar: session.alla_fredagar || false,
            alla_lördagar: session.alla_lördagar || false,
            alla_söndagar: session.alla_söndagar || false,
          });
      }

      await fetchAllSettings();
      alert('Alla pass sparade!');
    } catch (error) {
      console.error('Error saving live sessions:', error);
      alert('Fel vid sparande');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBatchSessions = async () => {
    if (!user) return;

    const overlapCheck = checkAllMissionsForOverlap(liveSessions, batchSessions, deliverySessions, shoppingMissions);
    if (overlapCheck.hasOverlap) {
      alert(overlapCheck.message);
      return;
    }

    setSaving(true);

    try {
      await supabase
        .from('chef_batch_sessions')
        .delete()
        .eq('chef_id', user.id);

      for (const session of batchSessions) {
        for (const dish of session.dishes) {
          if (!dish.product_id) continue;

          await supabase
            .from('chef_batch_sessions')
            .insert({
              chef_id: user.id,
              product_id: dish.product_id,
              antal_portioner: dish.antal_portioner,
              datum: session.datum || null,
              tillagningstid_start: session.tillagningstid_start,
              tillagningstid_slut: session.tillagningstid_slut,
              alla_måndagar: session.alla_måndagar || false,
              alla_tisdagar: session.alla_tisdagar || false,
              alla_onsdagar: session.alla_onsdagar || false,
              alla_torsdagar: session.alla_torsdagar || false,
              alla_fredagar: session.alla_fredagar || false,
              alla_lördagar: session.alla_lördagar || false,
              alla_söndagar: session.alla_söndagar || false,
            });
        }
      }

      await fetchAllSettings();
      alert('Alla batch-pass sparade!');
    } catch (error) {
      console.error('Error saving batch sessions:', error);
      alert('Fel vid sparande');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShoppingMissions = async () => {
    if (!user) return;

    const overlapCheck = checkAllMissionsForOverlap(liveSessions, batchSessions, deliverySessions, shoppingMissions);
    if (overlapCheck.hasOverlap) {
      alert(overlapCheck.message);
      return;
    }

    setSaving(true);

    try {
      await supabase
        .from('chef_shopping_missions')
        .delete()
        .eq('chef_id', user.id);

      for (const mission of shoppingMissions) {
        if (mission.dishes.length === 0) continue;

        const { data: newMission, error } = await supabase
          .from('chef_shopping_missions')
          .insert({
            chef_id: user.id,
            datum: mission.datum,
            tid: mission.tid
          })
          .select('id')
          .single();

        if (error) throw error;

        if (newMission) {
          for (const dish of mission.dishes) {
            if (!dish.product_id) continue;

            await supabase
              .from('shopping_mission_dishes')
              .insert({
                shopping_mission_id: newMission.id,
                product_id: dish.product_id,
                antal_portioner: dish.antal_portioner
              });
          }
        }
      }

      await fetchAllSettings();
      alert('Alla inköpsmissioner sparade!');
    } catch (error) {
      console.error('Error saving shopping missions:', error);
      alert('Fel vid sparande');
    } finally {
      setSaving(false);
    }
  };

  const handleResetMission = async (mission: string) => {
    if (!user) return;

    if (!confirm('Är du säker på att du vill rensa alla inställningar för denna mission?')) {
      return;
    }

    setSaving(true);

    if (mission === 'live') {
      await supabase
        .from('chef_live_sessions')
        .delete()
        .eq('chef_id', user.id);
      setLiveSessions([]);
    } else if (mission === 'batch') {
      await supabase
        .from('chef_batch_sessions')
        .delete()
        .eq('chef_id', user.id);
      setBatchSessions([]);
    } else if (mission === 'delivery') {
      await supabase
        .from('chef_delivery_sessions')
        .delete()
        .eq('chef_id', user.id);
      setDeliverySessions([]);
    } else if (mission === 'shopping') {
      await supabase
        .from('chef_shopping_missions')
        .delete()
        .eq('chef_id', user.id);
      setShoppingMissions([]);
    } else {
      await supabase
        .from('chef_mission_settings')
        .delete()
        .eq('chef_id', user.id)
        .eq('mission', mission);
      setDaySettings({ ...daySettings, [mission]: {} });
    }

    setSaving(false);
    await fetchAllSettings();
  };

  const getDaySettingOrDefault = (mission: string, day: number) => {
    if (daySettings[mission][day]) {
      return daySettings[mission][day];
    }

    const defaults: Record<string, any> = {
      live: defaultLiveSettings,
      batch: defaultBatchSettings,
      event: defaultEventSettings,
    };

    return defaults[mission];
  };

  const hasConfiguredDays = (mission: string) => {
    if (mission === 'delivery') {
      return deliverySessions.length > 0;
    }
    if (mission === 'batch') {
      return batchSessions.length > 0;
    }
    if (mission === 'live') {
      return liveSessions.length > 0;
    }
    if (mission === 'shopping') {
      return shoppingMissions.length > 0;
    }
    if (mission === 'event') {
      return daySettings[mission] && Object.keys(daySettings[mission]).length > 0;
    }
    return false;
  };

  const isDaySaved = (mission: string, day: number) => {
    return savedDays[mission]?.includes(day);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Laddar inställningar...</p>
      </div>
    );
  }

  const getTitle = () => {
    if (showOnlyMissions) return 'Min planering';
    if (showOnlyLimits) return 'Mina köksgränser';
    return 'Mina köksgränser';
  };

  const getDescription = () => {
    if (showOnlyMissions) return 'Skapa och hantera dina missions för veckan';
    if (showOnlyLimits) return 'Här ställer du in dina limits, hur mycket du grejar per dag.';
    return 'Här ställer du in dina limits, hur mycket du grejar per dag.';
  };

  return (
    <div className="space-y-6">
      {!showOnlyMissions && !showOnlyLimits && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lobster, cursive' }}>
              {getTitle()}
            </h2>
            <p className="text-gray-600 text-sm mt-2 max-w-2xl">
              {getDescription()}
            </p>
          </div>
        </div>
      )}

      {!showOnlyLimits && (
        <div className="space-y-4">
          {MISSIONS.map((mission) => (
          <div key={mission.key} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <button
              onClick={() => setExpandedMission(expandedMission === mission.key ? null : mission.key)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={{
                backgroundColor: expandedMission === mission.key ? '#f6f2e0' :
                  hasConfiguredDays(mission.key) ?
                    (mission.key === 'live' ? 'rgba(161, 199, 152, 0.3)' :
                     mission.key === 'batch' ? 'rgba(86, 197, 197, 0.3)' :
                     mission.key === 'delivery' ? 'rgba(244, 211, 107, 0.3)' :
                     mission.key === 'event' ? 'rgba(246, 183, 183, 0.3)' :
                     mission.key === 'shopping' ? 'rgba(246, 242, 224, 0.5)' :
                     'white') :
                  'white',
                color: 'inherit'
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mission.label.split(' ')[0]}</span>
                <h3 className="font-semibold">{mission.label.substring(2)}</h3>
              </div>
              <div className="flex items-center gap-2">
                {hasConfiguredDays(mission.key) && expandedMission !== mission.key && (
                  <CheckCircle size={20} className="text-green-700" />
                )}
                <span className="text-gray-400">
                  {expandedMission === mission.key ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {expandedMission === mission.key && (
              <div className="px-6 py-6 border-t border-gray-200 bg-[#f6f2e0]/30">
                <div className="flex justify-end gap-3 mb-4">
                  <button
                    onClick={() => handleResetMission(mission.key)}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    Rensa alla
                  </button>
                </div>

                {mission.key === 'live' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-gray-600">Boka in specifika datum för På spisen nu</p>
                      <button
                        onClick={() => {
                          setLiveSessions([...liveSessions, {
                            product_id: '',
                            antal_portioner: 20,
                            datum: '',
                            start_tid: '10:00',
                            slut_tid: '14:00',
                            isSaved: false,
                          }]);
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-colors bg-black text-white hover:bg-gray-800"
                      >
                        <Plus size={14} />
                        Lägg till pass
                      </button>
                    </div>

                    {liveSessions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm italic">
                        Inga pass inbokade. Klicka på "Lägg till pass" för att boka ett nytt datum.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {liveSessions.map((session, idx) => (
                          <PlanningPassCard
                            key={idx}
                            isSaved={session.isSaved}
                            borderColor="#a1c798"
                            saving={saving}
                            onSave={async () => {
                              if (!user || !session.product_id) return;
                              const overlapCheck = checkAllMissionsForOverlap(liveSessions, batchSessions, deliverySessions, shoppingMissions);
                              if (overlapCheck.hasOverlap) {
                                alert(overlapCheck.message);
                                return;
                              }
                              setSaving(true);
                              try {
                                await supabase
                                  .from('chef_live_sessions')
                                  .delete()
                                  .eq('chef_id', user.id)
                                  .eq('product_id', session.product_id)
                                  .eq('datum', session.datum);

                                await supabase
                                  .from('chef_live_sessions')
                                  .insert({
                                    chef_id: user.id,
                                    product_id: session.product_id,
                                    antal_portioner: session.antal_portioner,
                                    datum: session.datum || null,
                                    start_tid: session.start_tid,
                                    slut_tid: session.slut_tid,
                                    alla_måndagar: session.alla_måndagar || false,
                                    alla_tisdagar: session.alla_tisdagar || false,
                                    alla_onsdagar: session.alla_onsdagar || false,
                                    alla_torsdagar: session.alla_torsdagar || false,
                                    alla_fredagar: session.alla_fredagar || false,
                                    alla_lördagar: session.alla_lördagar || false,
                                    alla_söndagar: session.alla_söndagar || false,
                                  });
                                await fetchAllSettings();
                              } catch (error) {
                                console.error('Error saving:', error);
                                alert('Fel vid sparande');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            onDelete={async () => {
                              if (!user) return;
                              const overlapCheck = checkAllMissionsForOverlap(
                                liveSessions.filter((_, i) => i !== idx),
                                batchSessions,
                                deliverySessions,
                                shoppingMissions
                              );
                              if (overlapCheck.hasOverlap) {
                                alert(overlapCheck.message);
                                return;
                              }
                              setSaving(true);
                              try {
                                if (session.product_id) {
                                  await supabase
                                    .from('chef_live_sessions')
                                    .delete()
                                    .eq('chef_id', user.id)
                                    .eq('product_id', session.product_id)
                                    .eq('datum', session.datum);
                                }
                                await fetchAllSettings();
                              } catch (error) {
                                console.error('Error deleting:', error);
                                alert('Fel vid borttagning');
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Maträtt</label>
                                <select
                                  value={session.product_id}
                                  onChange={(e) => {
                                    const updated = [...liveSessions];
                                    updated[idx].product_id = e.target.value;
                                    updated[idx].isSaved = false;
                                    setLiveSessions(updated);
                                  }}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                >
                                  <option value="">Välj maträtt...</option>
                                  {chefDishes.map((dish) => (
                                    <option key={dish.id} value={dish.id}>
                                      {dish.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Antal portioner</label>
                                <input
                                  type="number"
                                  value={session.antal_portioner}
                                  onChange={(e) => {
                                    const updated = [...liveSessions];
                                    updated[idx].antal_portioner = parseInt(e.target.value);
                                    updated[idx].isSaved = false;
                                    setLiveSessions(updated);
                                  }}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Datum</label>
                                <input
                                  type="date"
                                  value={session.datum}
                                  onChange={(e) => {
                                    const updated = [...liveSessions];
                                    updated[idx].datum = e.target.value;
                                    updated[idx].isSaved = false;
                                    setLiveSessions(updated);
                                  }}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Tid</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="time"
                                    value={session.start_tid}
                                    onChange={(e) => {
                                      const updated = [...liveSessions];
                                      updated[idx].start_tid = e.target.value;
                                      updated[idx].isSaved = false;
                                      setLiveSessions(updated);
                                    }}
                                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                  />
                                  <span className="text-xs text-gray-500">-</span>
                                  <input
                                    type="time"
                                    value={session.slut_tid}
                                    onChange={(e) => {
                                      const updated = [...liveSessions];
                                      updated[idx].slut_tid = e.target.value;
                                      updated[idx].isSaved = false;
                                      setLiveSessions(updated);
                                    }}
                                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">Eller boka in som återkommande:</p>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { key: 'alla_måndagar', label: 'Alla måndagar' },
                                  { key: 'alla_tisdagar', label: 'Alla tisdagar' },
                                  { key: 'alla_onsdagar', label: 'Alla onsdagar' },
                                  { key: 'alla_torsdagar', label: 'Alla torsdagar' },
                                  { key: 'alla_fredagar', label: 'Alla fredagar' },
                                  { key: 'alla_lördagar', label: 'Alla lördagar' },
                                  { key: 'alla_söndagar', label: 'Alla söndagar' },
                                ].map((day) => (
                                  <label key={day.key} className="flex items-center gap-1.5 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={session[day.key as keyof LiveSession] as boolean || false}
                                      onChange={(e) => {
                                        const updated = [...liveSessions];
                                        (updated[idx] as any)[day.key] = e.target.checked;
                                        updated[idx].isSaved = false;
                                        setLiveSessions(updated);
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-gray-700">{day.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </PlanningPassCard>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {mission.key === 'batch' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-medium text-gray-700">Boka in batch-tillagning</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setBatchSessions([]);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Rensa alla
                        </button>
                        <button
                          onClick={() => {
                            setBatchSessions([...batchSessions, {
                              dishes: [{ product_id: '', antal_portioner: 20, tillagningstid_start: '08:00', tillagningstid_slut: '10:00' }],
                              datum: '',
                              isSaved: false,
                            }]);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-black text-white hover:bg-gray-800"
                        >
                          <Plus size={16} />
                          Lägg till pass
                        </button>
                      </div>
                    </div>

                    {batchSessions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm italic">
                        Inga pass inbokade. Klicka på "Lägg till pass" för att boka ett nytt batch-pass.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {batchSessions.map((batch, idx) => (
                          <PlanningPassCard
                            key={idx}
                            isSaved={batch.isSaved}
                            borderColor="#56c5c5"
                            saving={saving}
                            onSave={async () => {
                              if (!user) return;
                              const overlapCheck = checkAllMissionsForOverlap(liveSessions, batchSessions, deliverySessions, shoppingMissions);
                              if (overlapCheck.hasOverlap) {
                                alert(overlapCheck.message);
                                return;
                              }
                              setSaving(true);
                              try {
                                for (const dish of batch.dishes) {
                                  if (!dish.product_id) continue;

                                  if (dish.id) {
                                    await supabase
                                      .from('chef_batch_sessions')
                                      .update({
                                        antal_portioner: dish.antal_portioner,
                                        tillagningstid_start: dish.tillagningstid_start,
                                        tillagningstid_slut: dish.tillagningstid_slut,
                                        datum: batch.datum || null,
                                        alla_måndagar: batch.alla_måndagar || false,
                                        alla_tisdagar: batch.alla_tisdagar || false,
                                        alla_onsdagar: batch.alla_onsdagar || false,
                                        alla_torsdagar: batch.alla_torsdagar || false,
                                        alla_fredagar: batch.alla_fredagar || false,
                                        alla_lördagar: batch.alla_lördagar || false,
                                        alla_söndagar: batch.alla_söndagar || false,
                                      })
                                      .eq('id', dish.id)
                                      .eq('chef_id', user.id);
                                  } else {
                                    await supabase
                                      .from('chef_batch_sessions')
                                      .insert({
                                        chef_id: user.id,
                                        product_id: dish.product_id,
                                        antal_portioner: dish.antal_portioner,
                                        datum: batch.datum || null,
                                        tillagningstid_start: dish.tillagningstid_start,
                                        tillagningstid_slut: dish.tillagningstid_slut,
                                        alla_måndagar: batch.alla_måndagar || false,
                                        alla_tisdagar: batch.alla_tisdagar || false,
                                        alla_onsdagar: batch.alla_onsdagar || false,
                                        alla_torsdagar: batch.alla_torsdagar || false,
                                        alla_fredagar: batch.alla_fredagar || false,
                                        alla_lördagar: batch.alla_lördagar || false,
                                        alla_söndagar: batch.alla_söndagar || false,
                                      });
                                  }
                                }
                                await fetchAllSettings();
                              } catch (error) {
                                console.error('Error saving:', error);
                                alert('Fel vid sparande');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            onDelete={async () => {
                              if (!user) return;
                              setSaving(true);
                              try {
                                if (batch.datum) {
                                  await supabase
                                    .from('chef_batch_sessions')
                                    .delete()
                                    .eq('chef_id', user.id)
                                    .eq('datum', batch.datum);
                                }
                                await fetchAllSettings();
                              } catch (error) {
                                console.error('Error deleting:', error);
                                alert('Fel vid borttagning');
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            <div className="space-y-3 mb-3">
                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Datum</label>
                                <input
                                  type="date"
                                  value={batch.datum}
                                  onChange={(e) => {
                                    const updated = [...batchSessions];
                                    updated[idx].datum = e.target.value;
                                    updated[idx].isSaved = false;
                                    setBatchSessions(updated);
                                  }}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                />
                              </div>

                              <div className="border-t border-gray-200 pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs text-gray-600">Rätter:</label>
                                  <button
                                    onClick={() => {
                                      const updated = [...batchSessions];
                                      updated[idx].dishes.push({ product_id: '', antal_portioner: 20, tillagningstid_start: '08:00', tillagningstid_slut: '10:00' });
                                      updated[idx].isSaved = false;
                                      setBatchSessions(updated);
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                                  >
                                    + Rätt
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {batch.dishes.map((dish, dishIdx) => (
                                    <div key={dishIdx} className="bg-gray-50 p-2 rounded">
                                      <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                          <label className="text-xs text-gray-600 block mb-1">Maträtt</label>
                                          <select
                                            value={dish.product_id}
                                            onChange={(e) => {
                                              const updated = [...batchSessions];
                                              updated[idx].dishes[dishIdx].product_id = e.target.value;
                                              updated[idx].isSaved = false;
                                              setBatchSessions(updated);
                                            }}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                          >
                                            <option value="">Välj rätt...</option>
                                            {chefDishes.map((d) => (
                                              <option key={d.id} value={d.id}>
                                                {d.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="text-xs text-gray-600 block mb-1">Portioner</label>
                                          <input
                                            type="number"
                                            value={dish.antal_portioner}
                                            onChange={(e) => {
                                              const updated = [...batchSessions];
                                              updated[idx].dishes[dishIdx].antal_portioner = parseInt(e.target.value);
                                              updated[idx].isSaved = false;
                                              setBatchSessions(updated);
                                            }}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                          />
                                        </div>

                                        <div className="col-span-2">
                                          <label className="text-xs text-gray-600 block mb-1">Tillagningstid</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="time"
                                              value={dish.tillagningstid_start}
                                              onChange={(e) => {
                                                const updated = [...batchSessions];
                                                updated[idx].dishes[dishIdx].tillagningstid_start = e.target.value;
                                                updated[idx].isSaved = false;
                                                setBatchSessions(updated);
                                              }}
                                              className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                            />
                                            <span className="text-xs text-gray-500">-</span>
                                            <input
                                              type="time"
                                              value={dish.tillagningstid_slut}
                                              onChange={(e) => {
                                                const updated = [...batchSessions];
                                                updated[idx].dishes[dishIdx].tillagningstid_slut = e.target.value;
                                                updated[idx].isSaved = false;
                                                setBatchSessions(updated);
                                              }}
                                              className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                            />
                                            <button
                                              onClick={async () => {
                                                const dishToRemove = batch.dishes[dishIdx];
                                                if (dishToRemove.id) {
                                                  try {
                                                    await supabase
                                                      .from('chef_batch_sessions')
                                                      .delete()
                                                      .eq('id', dishToRemove.id)
                                                      .eq('chef_id', user?.id);
                                                  } catch (error) {
                                                    console.error('Error deleting dish:', error);
                                                  }
                                                }
                                                const updated = [...batchSessions];
                                                updated[idx].dishes = updated[idx].dishes.filter((_, i) => i !== dishIdx);
                                                updated[idx].isSaved = false;
                                                setBatchSessions(updated);
                                              }}
                                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {batch.dishes.length === 0 && (
                                    <div className="text-xs text-gray-400 italic text-center py-2">
                                      Inga rätter tillagda
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">Eller boka in som återkommande:</p>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { key: 'alla_måndagar', label: 'Alla måndagar' },
                                  { key: 'alla_tisdagar', label: 'Alla tisdagar' },
                                  { key: 'alla_onsdagar', label: 'Alla onsdagar' },
                                  { key: 'alla_torsdagar', label: 'Alla torsdagar' },
                                  { key: 'alla_fredagar', label: 'Alla fredagar' },
                                  { key: 'alla_lördagar', label: 'Alla lördagar' },
                                  { key: 'alla_söndagar', label: 'Alla söndagar' },
                                ].map((day) => (
                                  <label key={day.key} className="flex items-center gap-1.5 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={batch[day.key as keyof BatchSession] as boolean || false}
                                      onChange={(e) => {
                                        const updated = [...batchSessions];
                                        (updated[idx] as any)[day.key] = e.target.checked;
                                        updated[idx].isSaved = false;
                                        setBatchSessions(updated);
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-gray-700">{day.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </PlanningPassCard>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {mission.key === 'delivery' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-gray-600">Boka in utkörningar</p>
                      <button
                        onClick={() => {
                          setDeliverySessions([...deliverySessions, {
                            antal_stopp: 10,
                            max_avstånd_mil: 3,
                            packtid_minuter: 30,
                            utkörning_start: '14:00',
                            utkörning_slut: '18:00',
                            datum: '',
                            isSaved: false,
                          }]);
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-colors bg-black text-white hover:bg-gray-800"
                      >
                        <Plus size={14} />
                        Lägg till pass
                      </button>
                    </div>

                    {deliverySessions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm italic">
                        Inga pass inbokade. Klicka på "Lägg till pass" för att boka en ny utkörning.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {deliverySessions.map((session, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-white" style={{ borderWidth: '2px', borderColor: '#f4d36b' }}>
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="text-xs text-gray-600 block mb-1">Datum</label>
                                    <input
                                      type="date"
                                      value={session.datum}
                                      onChange={(e) => {
                                        const updated = [...deliverySessions];
                                        updated[idx].datum = e.target.value;
                                        setDeliverySessions(updated);
                                      }}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-xs text-gray-600 block mb-1">Utkörnings tid</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="time"
                                        value={session.utkörning_start}
                                        onChange={(e) => {
                                          const updated = [...deliverySessions];
                                          updated[idx].utkörning_start = e.target.value;
                                          setDeliverySessions(updated);
                                        }}
                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                      />
                                      <span className="text-xs text-gray-500">-</span>
                                      <input
                                        type="time"
                                        value={session.utkörning_slut}
                                        onChange={(e) => {
                                          const updated = [...deliverySessions];
                                          updated[idx].utkörning_slut = e.target.value;
                                          setDeliverySessions(updated);
                                        }}
                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="text-xs text-gray-600 block mb-1">Antal stopp</label>
                                    <input
                                      type="number"
                                      value={session.antal_stopp}
                                      onChange={(e) => {
                                        const updated = [...deliverySessions];
                                        updated[idx].antal_stopp = parseInt(e.target.value);
                                        setDeliverySessions(updated);
                                      }}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-xs text-gray-600 block mb-1">Max avstånd (mil)</label>
                                    <input
                                      type="number"
                                      value={session.max_avstånd_mil}
                                      onChange={(e) => {
                                        const updated = [...deliverySessions];
                                        updated[idx].max_avstånd_mil = parseInt(e.target.value);
                                        setDeliverySessions(updated);
                                      }}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-600 mb-2">Eller boka in som återkommande:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      { key: 'alla_måndagar', label: 'Alla måndagar' },
                                      { key: 'alla_tisdagar', label: 'Alla tisdagar' },
                                      { key: 'alla_onsdagar', label: 'Alla onsdagar' },
                                      { key: 'alla_torsdagar', label: 'Alla torsdagar' },
                                      { key: 'alla_fredagar', label: 'Alla fredagar' },
                                      { key: 'alla_lördagar', label: 'Alla lördagar' },
                                      { key: 'alla_söndagar', label: 'Alla söndagar' },
                                    ].map((day) => (
                                      <label key={day.key} className="flex items-center gap-1.5 text-xs">
                                        <input
                                          type="checkbox"
                                          checked={session[day.key as keyof DeliverySession] as boolean || false}
                                          onChange={(e) => {
                                            const updated = [...deliverySessions];
                                            (updated[idx] as any)[day.key] = e.target.checked;
                                            setDeliverySessions(updated);
                                          }}
                                          className="rounded border-gray-300"
                                        />
                                        <span className="text-gray-700">{day.label}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 mt-5">
                                <button
                                  onClick={async () => {
                                    if (!user) return;
                                    setSaving(true);
                                    try {
                                      if (delivery.datum) {
                                        await supabase
                                          .from('chef_delivery_sessions')
                                          .delete()
                                          .eq('chef_id', user.id)
                                          .eq('datum', delivery.datum);
                                      }
                                      await fetchAllSettings();
                                    } catch (error) {
                                      console.error('Error deleting:', error);
                                      alert('Fel vid borttagning');
                                    } finally {
                                      setSaving(false);
                                    }
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  title="Ta bort"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!user) return;
                                    const overlapCheck = checkAllMissionsForOverlap(liveSessions, batchSessions, deliverySessions, shoppingMissions);
                                    if (overlapCheck.hasOverlap) {
                                      alert(overlapCheck.message);
                                      return;
                                    }
                                    setSaving(true);
                                    try {
                                      await supabase
                                        .from('chef_delivery_sessions')
                                        .delete()
                                        .eq('chef_id', user.id)
                                        .eq('datum', delivery.datum);

                                      await supabase
                                        .from('chef_delivery_sessions')
                                        .insert({
                                          chef_id: user.id,
                                          datum: delivery.datum || null,
                                          utkörning_start: delivery.utkörning_start,
                                          utkörning_slut: delivery.utkörning_slut,
                                          alla_måndagar: delivery.alla_måndagar || false,
                                          alla_tisdagar: delivery.alla_tisdagar || false,
                                          alla_onsdagar: delivery.alla_onsdagar || false,
                                          alla_torsdagar: delivery.alla_torsdagar || false,
                                          alla_fredagar: delivery.alla_fredagar || false,
                                          alla_lördagar: delivery.alla_lördagar || false,
                                          alla_söndagar: delivery.alla_söndagar || false,
                                        });
                                      await fetchAllSettings();
                                    } catch (error) {
                                      console.error('Error saving:', error);
                                      alert('Fel vid sparande');
                                    } finally {
                                      setSaving(false);
                                    }
                                  }}
                                  className="p-1.5 bg-black text-white hover:bg-gray-800 rounded"
                                  title="Spara"
                                >
                                  <Save size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {mission.key === 'shopping' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-gray-600">Schemalägg inköpsmissioner för matvaror</p>
                      <button
                        onClick={() => {
                          setShoppingMissions([...shoppingMissions, {
                            datum: '',
                            tid: '09:00',
                            dishes: [],
                            isSaved: false,
                          }]);
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-colors bg-black text-white hover:bg-gray-800"
                      >
                        <Plus size={14} />
                        Lägg till inköpsmission
                      </button>
                    </div>

                    {shoppingMissions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm italic">
                        Inga inköpsmissioner inbokade. Klicka på "Lägg till inköpsmission" för att schemalägga.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {shoppingMissions.map((mission, mIdx) => (
                          <div key={mIdx} className="p-4 rounded-lg bg-white" style={{ borderWidth: '2px', borderColor: '#f6f2e0' }}>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-gray-600 block mb-1">Datum</label>
                                    <p className="text-xs text-gray-500 mb-1">Välj datum för när du ska handla maten</p>
                                    <input
                                      type="date"
                                      value={mission.datum}
                                      onChange={(e) => {
                                        const updated = [...shoppingMissions];
                                        updated[mIdx].datum = e.target.value;
                                        updated[mIdx].isSaved = false;
                                        setShoppingMissions(updated);
                                      }}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-xs text-gray-600 block mb-1">Tid</label>
                                    <input
                                      type="time"
                                      value={mission.tid}
                                      onChange={(e) => {
                                        const updated = [...shoppingMissions];
                                        updated[mIdx].tid = e.target.value;
                                        updated[mIdx].isSaved = false;
                                        setShoppingMissions(updated);
                                      }}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={async () => {
                                      if (!user) return;
                                      setSaving(true);
                                      try {
                                        if (mission.datum) {
                                          await supabase
                                            .from('chef_shopping_missions')
                                            .delete()
                                            .eq('chef_id', user.id)
                                            .eq('datum', mission.datum);
                                        }
                                        await fetchAllSettings();
                                      } catch (error) {
                                        console.error('Error deleting:', error);
                                        alert('Fel vid borttagning');
                                      } finally {
                                        setSaving(false);
                                      }
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                    title="Ta bort"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!user || !mission.datum) return;
                                      const overlapCheck = checkAllMissionsForOverlap(liveSessions, batchSessions, deliverySessions, shoppingMissions);
                                      if (overlapCheck.hasOverlap) {
                                        alert(overlapCheck.message);
                                        return;
                                      }
                                      setSaving(true);
                                      try {
                                        await supabase
                                          .from('chef_shopping_missions')
                                          .delete()
                                          .eq('chef_id', user.id)
                                          .eq('datum', mission.datum);

                                        const { data: newMission, error } = await supabase
                                          .from('chef_shopping_missions')
                                          .insert({
                                            chef_id: user.id,
                                            datum: mission.datum,
                                            tid: mission.tid
                                          })
                                          .select('id')
                                          .single();

                                        if (error) throw error;

                                        if (newMission && mission.dishes.length > 0) {
                                          for (const dish of mission.dishes) {
                                            if (!dish.product_id) continue;
                                            await supabase
                                              .from('shopping_mission_dishes')
                                              .insert({
                                                shopping_mission_id: newMission.id,
                                                product_id: dish.product_id,
                                                antal_portioner: dish.antal_portioner
                                              });
                                          }
                                        }
                                        await fetchAllSettings();
                                      } catch (error) {
                                        console.error('Error saving:', error);
                                        alert('Fel vid sparande');
                                      } finally {
                                        setSaving(false);
                                      }
                                    }}
                                    className="p-1.5 bg-black text-white hover:bg-gray-800 rounded"
                                    title="Spara"
                                  >
                                    <Save size={16} />
                                  </button>
                                </div>
                              </div>

                              <div className="py-3 border-t border-b border-gray-200 my-3">
                                <p className="text-xs font-medium text-gray-700 mb-2">Planera utifrån din tillagningsplanering</p>
                                <button
                                  onClick={() => setShowPlannedMissionsModal(mIdx)}
                                  className="text-xs px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded"
                                >
                                  Hämta från planerade tillagningar
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-xs text-gray-600">Maträtter att handla för:</label>
                                  <button
                                    onClick={() => {
                                      const updated = [...shoppingMissions];
                                      updated[mIdx].dishes.push({ product_id: '', antal_portioner: 4, tillagningstid_start: '', tillagningstid_slut: '' });
                                      setShoppingMissions(updated);
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                                  >
                                    + Lägg till maträtt
                                  </button>
                                </div>

                                {mission.dishes.map((dish, dIdx) => (
                                  <div key={dIdx} className="flex items-center gap-2 bg-white p-2 rounded">
                                    <select
                                      value={dish.product_id}
                                      onChange={(e) => {
                                        const updated = [...shoppingMissions];
                                        updated[mIdx].dishes[dIdx].product_id = e.target.value;
                                        updated[mIdx].isSaved = false;
                                        setShoppingMissions(updated);
                                      }}
                                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="">Välj maträtt...</option>
                                      {chefDishes.map((d) => (
                                        <option key={d.id} value={d.id}>
                                          {d.name}
                                        </option>
                                      ))}
                                    </select>

                                    <input
                                      type="number"
                                      value={dish.antal_portioner}
                                      onChange={(e) => {
                                        const updated = [...shoppingMissions];
                                        updated[mIdx].dishes[dIdx].antal_portioner = parseInt(e.target.value);
                                        updated[mIdx].isSaved = false;
                                        setShoppingMissions(updated);
                                      }}
                                      placeholder="Portioner"
                                      className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />

                                    <button
                                      onClick={() => {
                                        const updated = [...shoppingMissions];
                                        updated[mIdx].dishes = updated[mIdx].dishes.filter((_, i) => i !== dIdx);
                                        setShoppingMissions(updated);
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))}

                                {mission.dishes.length === 0 && (
                                  <div className="text-xs text-gray-400 italic text-center py-2">
                                    Inga maträtter tillagda
                                  </div>
                                )}
                              </div>

                              {mission.dishes.length > 0 && (
                                <div className="pt-3 border-t border-gray-200">
                                  <button
                                    onClick={async () => {
                                      setGeneratingList(mIdx);
                                      const result = await generateShoppingListForInkopspass(mission.dishes);
                                      setShoppingLists(prev => ({ ...prev, [mIdx]: result }));
                                      setGeneratingList(null);
                                    }}
                                    disabled={generatingList === mIdx}
                                    className="text-xs px-3 py-1.5 bg-[#a1c798] text-white hover:bg-[#8fb889] rounded disabled:opacity-50"
                                  >
                                    {generatingList === mIdx ? 'Genererar...' : 'Generera inköpslista'}
                                  </button>
                                </div>
                              )}

                              {shoppingLists[mIdx] && (
                                <div className="pt-3 border-t border-gray-200 mt-3 space-y-3">
                                  {shoppingLists[mIdx].missingRecipes.length > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-orange-900 mb-2">
                                        Följande rätter saknar inköpsunderlag och kunde inte räknas in:
                                      </p>
                                      <ul className="text-xs text-orange-800 list-disc list-inside space-y-1">
                                        {shoppingLists[mIdx].missingRecipes.map((recipe: any, idx: number) => (
                                          <li key={idx}>{recipe.product_name}</li>
                                        ))}
                                      </ul>
                                      <p className="text-xs text-orange-700 mt-2 italic">
                                        Gå till respektive maträtt och fyll i "Recept & inköpsunderlag"
                                      </p>
                                    </div>
                                  )}

                                  {shoppingLists[mIdx].items.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-gray-700 mb-2">Inköpslista:</p>
                                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                                        <table className="w-full text-xs">
                                          <thead className="bg-gray-100">
                                            <tr>
                                              <th className="text-left py-2 px-2 font-semibold">Ingrediens</th>
                                              <th className="text-right py-2 px-2 font-semibold">Mängd</th>
                                              <th className="text-left py-2 px-2 font-semibold">Enhet</th>
                                              <th className="text-left py-2 px-2 font-semibold">Kategori</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {shoppingLists[mIdx].items.map((item: any, idx: number) => (
                                              <tr key={idx} className="border-t border-gray-200">
                                                <td className="py-2 px-2">{item.ingredient_name}</td>
                                                <td className="py-2 px-2 text-right">
                                                  <input
                                                    type="number"
                                                    step="0.1"
                                                    value={item.total_quantity}
                                                    onChange={(e) => {
                                                      const updated = { ...shoppingLists };
                                                      updated[mIdx].items[idx].total_quantity = parseFloat(e.target.value);
                                                      setShoppingLists(updated);
                                                    }}
                                                    className="w-16 px-1 py-0.5 border border-gray-300 rounded text-right text-xs"
                                                  />
                                                </td>
                                                <td className="py-2 px-2">{item.unit}</td>
                                                <td className="py-2 px-2 text-gray-600">{item.category || '-'}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {shoppingLists[mIdx].items.length === 0 && shoppingLists[mIdx].missingRecipes.length === 0 && (
                                    <p className="text-xs text-gray-500 italic text-center py-2">
                                      Inga ingredienser hittades
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {showPlannedMissionsModal !== null && (() => {
                  const today = new Date().toISOString().split('T')[0];

                  const filteredLiveSessions = liveSessions.filter(session => {
                    if (session.datum && session.datum >= today) {
                      return true;
                    }
                    if (session.alla_måndagar || session.alla_tisdagar || session.alla_onsdagar ||
                        session.alla_torsdagar || session.alla_fredagar || session.alla_lördagar || session.alla_söndagar) {
                      return true;
                    }
                    return false;
                  });

                  const filteredBatchSessions = batchSessions.filter(batch => {
                    if (batch.datum && batch.datum >= today) {
                      return true;
                    }
                    if (batch.alla_måndagar || batch.alla_tisdagar || batch.alla_onsdagar ||
                        batch.alla_torsdagar || batch.alla_fredagar || batch.alla_lördagar || batch.alla_söndagar) {
                      return true;
                    }
                    return false;
                  });

                  return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPlannedMissionsModal(null)}>
                      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold">Välj planerade tillagningar</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Alla kommande planerade tillagningar
                            </p>
                          </div>
                          <button
                            onClick={() => setShowPlannedMissionsModal(null)}
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            ×
                          </button>
                        </div>

                        <div className="space-y-3">
                            {filteredLiveSessions.length === 0 && filteredBatchSessions.length === 0 ? (
                              <p className="text-sm text-gray-500 italic text-center py-8">
                                Inga kommande planerade tillagningar. Lägg till uppgifter i "På spisen nu" eller "Batch-tillagning" först.
                              </p>
                            ) : (
                              <>
                                {filteredLiveSessions.map((session, idx) => {
                                  const originalIdx = liveSessions.indexOf(session);
                                  const dishName = chefDishes.find(d => d.id === session.product_id)?.name || 'Okänd rätt';
                                  const key = `live-${originalIdx}`;
                                  const dateText = session.datum
                                    ? new Date(session.datum).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
                                    : 'Återkommande';
                                  return (
                                    <label key={key} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100">
                                      <input
                                        type="checkbox"
                                        checked={selectedPlannedMissions.includes(key)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedPlannedMissions([...selectedPlannedMissions, key]);
                                          } else {
                                            setSelectedPlannedMissions(selectedPlannedMissions.filter(k => k !== key));
                                          }
                                        }}
                                        className="rounded border-gray-300"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">🍳 På spisen nu: {dishName}</p>
                                        <p className="text-xs text-gray-600">{session.antal_portioner} portioner · Tillagas: {dateText}</p>
                                      </div>
                                    </label>
                                  );
                                })}

                                {filteredBatchSessions.map((batch, filteredBatchIdx) => {
                                  const originalBatchIdx = batchSessions.indexOf(batch);
                                  const dateText = batch.datum
                                    ? new Date(batch.datum).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
                                    : 'Återkommande';
                                  return batch.dishes.map((dish, dishIdx) => {
                                    const dishName = chefDishes.find(d => d.id === dish.product_id)?.name || 'Okänd rätt';
                                    const key = `batch-${originalBatchIdx}-${dishIdx}`;
                                    return (
                                      <label key={key} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100">
                                        <input
                                          type="checkbox"
                                          checked={selectedPlannedMissions.includes(key)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedPlannedMissions([...selectedPlannedMissions, key]);
                                            } else {
                                              setSelectedPlannedMissions(selectedPlannedMissions.filter(k => k !== key));
                                            }
                                          }}
                                          className="rounded border-gray-300"
                                        />
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-gray-900">🧊 Batch-tillagning: {dishName}</p>
                                          <p className="text-xs text-gray-600">{dish.antal_portioner} portioner · Tillagas: {dateText}</p>
                                    </div>
                                  </label>
                                );
                              });
                            })}
                          </>
                        )}
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowPlannedMissionsModal(null)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Avbryt
                        </button>
                        <button
                          onClick={() => {
                            if (showPlannedMissionsModal === null) return;
                            const updated = [...shoppingMissions];
                            const currentMission = updated[showPlannedMissionsModal];

                            selectedPlannedMissions.forEach(key => {
                              if (key.startsWith('live-')) {
                                const idx = parseInt(key.split('-')[1]);
                                const session = liveSessions[idx];
                                if (session) {
                                  const existingDish = currentMission.dishes.find(d => d.product_id === session.product_id);
                                  if (existingDish) {
                                    existingDish.antal_portioner += session.antal_portioner;
                                  } else {
                                    currentMission.dishes.push({
                                      product_id: session.product_id,
                                      antal_portioner: session.antal_portioner,
                                      tillagningstid_start: '',
                                      tillagningstid_slut: '',
                                    });
                                  }
                                }
                              } else if (key.startsWith('batch-')) {
                                const [, batchIdx, dishIdx] = key.split('-').map(Number);
                                const dish = batchSessions[batchIdx]?.dishes[dishIdx];
                                if (dish) {
                                  const existingDish = currentMission.dishes.find(d => d.product_id === dish.product_id);
                                  if (existingDish) {
                                    existingDish.antal_portioner += dish.antal_portioner;
                                  } else {
                                    currentMission.dishes.push({
                                      product_id: dish.product_id,
                                      antal_portioner: dish.antal_portioner,
                                      tillagningstid_start: '',
                                      tillagningstid_slut: '',
                                    });
                                  }
                                }
                              }
                            });

                            updated[showPlannedMissionsModal].isSaved = false;
                            setShoppingMissions(updated);
                            setSelectedPlannedMissions([]);
                            setShowPlannedMissionsModal(null);
                          }}
                          className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                          disabled={selectedPlannedMissions.length === 0}
                        >
                          Lägg till valda ({selectedPlannedMissions.length})
                        </button>
                      </div>
                  </div>
                </div>
              );
            })()}

                {mission.key === 'event' && (
                  <div className="space-y-3">
                    {WEEKDAYS.map((day) => {
                      const isRestDay = restDays.includes(day.value);
                      const settings = getDaySettingOrDefault('event', day.value);
                      const isSaved = isDaySaved('event', day.value);

                      return (
                        <div key={day.value} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                          <div className="w-24 font-medium text-sm">{day.label}</div>

                          {isRestDay ? (
                            <>
                              <div className="flex-1 text-sm text-gray-500 italic">Vilodag</div>
                              <button
                                onClick={() => toggleRestDay(day.value)}
                                className="text-xs px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              >
                                Ta bort vilodag
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">Max rätter:</label>
                                <input
                                  type="number"
                                  value={settings.max_rätter || ''}
                                  onChange={(e) => updateDaySetting('event', day.value, 'max_rätter', parseInt(e.target.value))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="5"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">Port/rätt:</label>
                                <input
                                  type="number"
                                  value={settings.max_portioner_per_rätt || ''}
                                  onChange={(e) => updateDaySetting('event', day.value, 'max_portioner_per_rätt', parseInt(e.target.value))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="50"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">Förb.tid:</label>
                                <input
                                  type="number"
                                  value={settings.förberedelsetid_minuter || ''}
                                  onChange={(e) => updateDaySetting('event', day.value, 'förberedelsetid_minuter', parseInt(e.target.value))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="120"
                                />
                                <span className="text-xs text-gray-500">min</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">Setup:</label>
                                <input
                                  type="number"
                                  value={settings.setup_tid_minuter || ''}
                                  onChange={(e) => updateDaySetting('event', day.value, 'setup_tid_minuter', parseInt(e.target.value))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="60"
                                />
                                <span className="text-xs text-gray-500">min</span>
                              </div>

                              <button
                                onClick={() => toggleRestDay(day.value)}
                                className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              >
                                Sätt vilodag
                              </button>

                              <button
                                onClick={() => handleSaveDay('event', day.value)}
                                disabled={saving}
                                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-colors ${
                                  isSaved
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : 'bg-black text-white hover:bg-gray-800'
                                }`}
                              >
                                {isSaved ? <Check size={14} /> : <Save size={14} />}
                                {isSaved ? 'Sparad' : 'Spara'}
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {!showOnlyMissions && showOnlyLimits && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kapacitetsgränser</h3>
            <p className="text-sm text-gray-600 mb-4">
              Här kan du ställa in dina maximala kapaciteter för olika typer av uppdrag.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max portioner per dag (Live-tillagning)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max batch-portioner per vecka
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: 200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max utkörningar per dag
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: 10"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
