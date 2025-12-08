import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Trash2, Printer, MessageCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface MissionActivity {
  type: 'live' | 'batch' | 'delivery' | 'event' | 'planning' | 'rest' | 'preparation' | 'shopping';
  label: string;
  icon: string;
  details: string;
  time: string;
  color: string;
  booked?: number;
  capacity?: number;
  preparationMinutes?: number;
  deliveryStops?: any[];
  dishes?: Array<{
    product_id: string;
    product_name?: string;
    antal_portioner: number;
    tillagningstid_start?: string;
    tillagningstid_slut?: string;
  }>;
}

interface DayData {
  date: string;
  dayName: string;
  dayNumber: string;
  activities: MissionActivity[];
  isRestDay: boolean;
  pressurePercent: number;
}

const MISSION_COLORS = {
  live: '#a1c798',
  batch: '#56c5c5',
  delivery: '#f4d36b',
  event: '#f6b7b7',
  planning: '#f6f2e0',
  rest: '#dddddd',
  shopping: '#f6f2e0',
};

const MISSION_ICONS = {
  live: '🍳',
  batch: '🧊',
  delivery: '🚗',
  event: '🎀',
  planning: '💻',
  rest: '😴',
  shopping: '🛒',
};

export const MyScheduleTab: React.FC = () => {
  const { user } = useAuth();
  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [weekPressure, setWeekPressure] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<{ day: DayData; activity: MissionActivity } | null>(null);
  const [deliveryStatuses, setDeliveryStatuses] = useState<{ [key: string]: boolean }>({});
  const [expandedDeliveries, setExpandedDeliveries] = useState<{ [key: string]: boolean }>({});
  const [smsModalOpen, setSmsModalOpen] = useState<string | null>(null);
  const [delayReason, setDelayReason] = useState('');
  const [newEstimatedTime, setNewEstimatedTime] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [shoppingListData, setShoppingListData] = useState<{
    date: string;
    dayName: string;
    ingredients: Array<{
      ingredient_name: string;
      total_quantity: number;
      unit: string;
      category: string;
    }>;
  } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsInputModalOpen, setSmsInputModalOpen] = useState(false);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('');

  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  function formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    if (user) {
      fetchWeekData();
    }
  }, [user, currentWeekStart]);

  const fetchShoppingList = async (date: string) => {
    if (!user) return;

    const { data: shoppingData } = await supabase
      .from('chef_shopping_missions')
      .select(`
        *,
        shopping_mission_dishes (
          product_id,
          antal_portioner,
          product:products(name)
        )
      `)
      .eq('chef_id', user.id)
      .eq('datum', date)
      .maybeSingle();

    if (!shoppingData || !shoppingData.shopping_mission_dishes || shoppingData.shopping_mission_dishes.length === 0) {
      alert('Ingen inköpslista hittades för detta datum');
      return;
    }

    const productIds = shoppingData.shopping_mission_dishes.map((dish: any) => dish.product_id);
    const portionsPerProduct: Record<string, number> = {};

    shoppingData.shopping_mission_dishes.forEach((dish: any) => {
      if (!dish.product_id) return;
      portionsPerProduct[dish.product_id] = (portionsPerProduct[dish.product_id] || 0) + dish.antal_portioner;
    });

    const { data: ingredients } = await supabase
      .from('product_recipe_ingredients')
      .select('*')
      .in('product_id', productIds);

    const ingredientMap: Record<string, {
      ingredient_name: string;
      total_quantity: number;
      unit: string;
      category: string;
    }> = {};

    ingredients?.forEach((ing: any) => {
      const portions = portionsPerProduct[ing.product_id] || 1;
      const totalQty = ing.quantity_per_portion * portions;
      const key = `${ing.ingredient_name}-${ing.unit}`;

      if (ingredientMap[key]) {
        ingredientMap[key].total_quantity += totalQty;
      } else {
        ingredientMap[key] = {
          ingredient_name: ing.ingredient_name,
          total_quantity: totalQty,
          unit: ing.unit,
          category: ing.category || 'Övrigt',
        };
      }
    });

    const ingredientList = Object.values(ingredientMap).sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return a.ingredient_name.localeCompare(b.ingredient_name);
    });

    const dateObj = new Date(date);
    setShoppingListData({
      date: date,
      dayName: dateObj.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' }),
      ingredients: ingredientList,
    });
    setShoppingListModalOpen(true);
  };

  const handleDeleteActivity = async (activity: MissionActivity, date: string) => {
    if (!user) return;
    if (!confirm('Är du säker på att du vill ta bort denna aktivitet?')) return;

    setDeleting(true);

    try {
      const dayOfWeek = new Date(date).getDay();
      const dayBoolMap: Record<number, string> = {
        0: 'alla_söndagar',
        1: 'alla_måndagar',
        2: 'alla_tisdagar',
        3: 'alla_onsdagar',
        4: 'alla_torsdagar',
        5: 'alla_fredagar',
        6: 'alla_lördagar',
      };

      if (activity.type === 'live') {
        await supabase
          .from('chef_live_sessions')
          .delete()
          .eq('chef_id', user.id)
          .or(`datum.eq.${date},${dayBoolMap[dayOfWeek]}.eq.true`);
      } else if (activity.type === 'batch') {
        await supabase
          .from('chef_batch_sessions')
          .delete()
          .eq('chef_id', user.id)
          .or(`datum.eq.${date},${dayBoolMap[dayOfWeek]}.eq.true`);
      } else if (activity.type === 'delivery') {
        await supabase
          .from('chef_delivery_sessions')
          .delete()
          .eq('chef_id', user.id)
          .or(`datum.eq.${date},${dayBoolMap[dayOfWeek]}.eq.true`);
      }

      setSelectedActivity(null);
      await fetchWeekData();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Fel vid borttagning');
    } finally {
      setDeleting(false);
    }
  };

  const fetchWeekData = async () => {
    if (!user) return;

    setLoading(true);

    const days: DayData[] = [];
    let totalPressure = 0;
    let daysWithData = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      const { data: restDayData } = await supabase
        .from('chef_mission_settings')
        .select('is_rest_day')
        .eq('chef_id', user.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_rest_day', true)
        .maybeSingle();

      const isRestDay = !!restDayData;
      const activities: MissionActivity[] = [];
      let dayCapacity = 0;
      let dayBooked = 0;

      if (!isRestDay) {
        const dayBoolMap: Record<number, string> = {
          0: 'alla_söndagar',
          1: 'alla_måndagar',
          2: 'alla_tisdagar',
          3: 'alla_onsdagar',
          4: 'alla_torsdagar',
          5: 'alla_fredagar',
          6: 'alla_lördagar',
        };

        const { data: liveSessions } = await supabase
          .from('chef_live_sessions')
          .select('*, product:products(name)')
          .eq('chef_id', user.id)
          .or(`datum.eq.${dateStr},${dayBoolMap[dayOfWeek]}.eq.true`);

        if (liveSessions && liveSessions.length > 0) {
          liveSessions.forEach((session: any) => {
            const capacity = session.antal_portioner || 0;
            dayCapacity += capacity;
            const booked = Math.floor(capacity * 0.6);
            dayBooked += booked;

            activities.push({
              type: 'live',
              label: `På spisen nu - ${session.product?.name || 'Maträtt'}`,
              icon: MISSION_ICONS.live,
              details: `${booked}/${capacity} port`,
              time: `${formatTime(session.start_tid)} - ${formatTime(session.slut_tid)}`,
              color: MISSION_COLORS.live,
              booked,
              capacity,
            });
          });
        }

        const { data: batchSessions } = await supabase
          .from('chef_batch_sessions')
          .select('*, product:products(name)')
          .eq('chef_id', user.id)
          .or(`datum.eq.${dateStr},${dayBoolMap[dayOfWeek]}.eq.true`);

        if (batchSessions && batchSessions.length > 0) {
          const totalPortions = batchSessions.reduce((sum: number, s: any) => sum + (s.antal_portioner || 0), 0);
          const booked = Math.floor(totalPortions * 0.4);
          const firstSession = batchSessions[0];

          const dishNames = batchSessions.map((s: any) => s.product?.name).filter(Boolean).join(', ');

          const dishes = batchSessions.map((s: any) => ({
            product_id: s.product_id,
            product_name: s.product?.name,
            antal_portioner: s.antal_portioner,
            tillagningstid_start: s.tillagningstid_start,
            tillagningstid_slut: s.tillagningstid_slut,
          }));

          activities.push({
            type: 'batch',
            label: `Batch-tillagning (${batchSessions.length} rätter)`,
            icon: MISSION_ICONS.batch,
            details: `${dishNames.substring(0, 30)}${dishNames.length > 30 ? '...' : ''} - ${booked}/${totalPortions} port`,
            time: `${formatTime(firstSession.tillagningstid_start)} - ${formatTime(firstSession.tillagningstid_slut)}`,
            color: MISSION_COLORS.batch,
            booked,
            capacity: totalPortions,
            dishes,
          });
        }

        const { data: deliveryData } = await supabase
          .from('chef_delivery_sessions')
          .select('*')
          .eq('chef_id', user.id)
          .or(`datum.eq.${dateStr},${dayBoolMap[dayOfWeek]}.eq.true`)
          .order('utkörning_start');

        if (deliveryData && deliveryData.length > 0) {
          deliveryData.forEach((session: any) => {
            const totalStops = session.antal_stopp || 0;

            activities.push({
              type: 'delivery',
              label: 'Utkörning',
              icon: MISSION_ICONS.delivery,
              details: `Max ${totalStops} stopp`,
              time: `${formatTime(session.utkörning_start)} - ${formatTime(session.utkörning_slut)}`,
              color: MISSION_COLORS.delivery,
              booked: 0,
              capacity: totalStops,
              deliveryStops: [],
            });
          });
        }

        const { data: shoppingData } = await supabase
          .from('chef_shopping_missions')
          .select(`
            *,
            shopping_mission_dishes (
              product_id,
              antal_portioner,
              product:products(name)
            )
          `)
          .eq('chef_id', user.id)
          .eq('datum', dateStr);

        if (shoppingData && shoppingData.length > 0) {
          shoppingData.forEach((mission: any) => {
            const dishCount = mission.shopping_mission_dishes?.length || 0;
            const dishNames = mission.shopping_mission_dishes?.map((d: any) => d.product?.name).filter(Boolean).join(', ') || '';

            activities.push({
              type: 'shopping',
              label: 'Inköp av mat',
              icon: MISSION_ICONS.shopping,
              details: dishCount > 0 ? `${dishCount} rätter - ${dishNames.substring(0, 30)}${dishNames.length > 30 ? '...' : ''}` : 'Ingen lista än',
              time: formatTime(mission.tid),
              color: MISSION_COLORS.shopping,
            });
          });
        }

        const { data: eventSettings } = await supabase
          .from('chef_mission_settings')
          .select('settings')
          .eq('chef_id', user.id)
          .eq('mission', 'event')
          .eq('day_of_week', dayOfWeek)
          .maybeSingle();

        if (eventSettings?.settings) {
          const settings = eventSettings.settings;
          const totalPortioner = (settings.max_rätter || 0) * (settings.max_portioner_per_rätt || 0);
          const booked = Math.floor(totalPortioner * 0.2);

          if (settings.förberedelsetid_minuter) {
            activities.push({
              type: 'preparation',
              label: `Förbered ${settings.förberedelsetid_minuter} min`,
              icon: '⏱️',
              details: `${settings.förberedelsetid_minuter} min`,
              time: '',
              color: '#ffc0cb',
              preparationMinutes: settings.förberedelsetid_minuter,
            });
          }

          activities.push({
            type: 'event',
            label: 'Event/Hyr mig',
            icon: MISSION_ICONS.event,
            details: `${booked}/${totalPortioner} port`,
            time: `Setup ${settings.setup_tid_minuter || 60} min`,
            color: MISSION_COLORS.event,
            booked,
            capacity: totalPortioner,
          });
        }
      }

      const pressurePercent = dayCapacity > 0 ? Math.round((dayBooked / dayCapacity) * 100) : 0;

      if (!isRestDay && dayCapacity > 0) {
        totalPressure += pressurePercent;
        daysWithData++;
      }

      activities.sort((a, b) => {
        const getTimeValue = (timeStr: string) => {
          const match = timeStr.match(/(\d{2}):(\d{2})/);
          if (match) {
            return parseInt(match[1]) * 60 + parseInt(match[2]);
          }
          return 9999;
        };
        return getTimeValue(a.time) - getTimeValue(b.time);
      });

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('sv-SE', { weekday: 'long' }),
        dayNumber: date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
        activities,
        isRestDay,
        pressurePercent: isRestDay ? 0 : pressurePercent,
      });
    }

    setWeekDays(days);
    setWeekPressure(daysWithData > 0 ? Math.round(totalPressure / daysWithData) : 0);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Laddar veckoschema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lobster, cursive' }}>
            Mitt schema
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Vecka {currentWeekStart.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })} - {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const newDate = new Date(currentWeekStart);
              newDate.setDate(newDate.getDate() - 7);
              setCurrentWeekStart(newDate);
            }}
            className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentWeekStart(getMonday(new Date()))}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Idag
          </button>
          <button
            onClick={() => {
              const newDate = new Date(currentWeekStart);
              newDate.setDate(newDate.getDate() + 7);
              setCurrentWeekStart(newDate);
            }}
            className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {weekDays.map((day, index) => (
          <div
            key={index}
            onClick={() => setSelectedDay(day)}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            style={{ borderRadius: '16px' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{day.dayName}</p>
                <p className="text-lg font-bold mt-0.5">{day.dayNumber}</p>
              </div>
              <Calendar size={18} className="text-gray-400" />
            </div>

            {day.isRestDay ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <span className="text-3xl block">{MISSION_ICONS.rest}</span>
                  <p className="text-xs text-gray-500 font-medium mt-2">Vilodag</p>
                </div>
              </div>
            ) : day.activities.length > 0 ? (
              <>
                {day.pressurePercent > 0 && (
                  <div className="mb-3" title={`${day.activities.find(a => a.booked)?.booked || 0} av ${day.activities.find(a => a.capacity)?.capacity || 0} portioner bokade`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Tryck i köket</span>
                      <span className="text-xs font-semibold text-gray-900">{day.pressurePercent}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${day.pressurePercent}%`,
                          backgroundColor: day.pressurePercent > 80 ? '#f87171' : day.pressurePercent > 60 ? '#fbbf24' : '#a1c798',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  {day.activities.map((activity, actIndex) => (
                    activity.type === 'preparation' ? (
                      <div
                        key={actIndex}
                        className="px-1.5 py-0.5 flex items-center gap-0.5 opacity-90 w-fit"
                        style={{
                          backgroundColor: activity.color,
                          borderLeft: `3px solid ${activity.color}`,
                          filter: 'brightness(0.95)'
                        }}
                      >
                        <span className="text-[9px]">{activity.icon}</span>
                        <span className="text-[9px] text-gray-700 font-medium whitespace-nowrap">{activity.label}</span>
                      </div>
                    ) : (
                      <div
                        key={actIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activity.type === 'shopping') {
                            fetchShoppingList(day.date);
                          } else {
                            setSelectedActivity({ day, activity });
                          }
                        }}
                        className="rounded-lg px-2 py-1.5 transition-all hover:scale-[1.02] cursor-pointer hover:shadow-md"
                        style={{ backgroundColor: activity.color }}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{activity.icon}</span>
                            <span className="text-[10px] opacity-75 text-gray-700">{activity.time}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 leading-tight mt-0.5 font-medium">
                          {activity.details}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-gray-400 italic">Ingen aktivitet</p>
              </div>
            )}

          </div>
        ))}
      </div>

      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedActivity(null)}>
          <div
            className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ backgroundColor: selectedActivity.activity.type === 'delivery' ? '#f6f2e0' : '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl"
              style={{ backgroundColor: selectedActivity.activity.type === 'delivery' ? '#f6f2e0' : '#ffffff' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedActivity.activity.icon}</span>
                <div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: 'Lobster, cursive' }}>
                    {selectedActivity.activity.label}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedActivity.day.dayName}, {selectedActivity.day.dayNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              {selectedActivity.activity.type === 'delivery' && selectedActivity.activity.deliveryStops && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Ruttplanering</h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Bokade stopp</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedActivity.activity.booked}/{selectedActivity.activity.capacity}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-600 mb-1">Tid</p>
                      <p className="text-sm font-medium">{selectedActivity.activity.time}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Leveranser ({selectedActivity.activity.deliveryStops.length})</h5>
                    {selectedActivity.activity.deliveryStops.map((stop, idx) => {
                      const stopKey = `${selectedActivity.day.date}-${idx}`;
                      const isDelivered = deliveryStatuses[stopKey] || stop.delivered;

                      if (isDelivered && !expandedDeliveries[stopKey]) {
                        return (
                          <div
                            key={idx}
                            onClick={() => setExpandedDeliveries(prev => ({ ...prev, [stopKey]: true }))}
                            className="flex items-center gap-3 p-2 rounded-lg transition-all shadow-sm cursor-pointer hover:opacity-90"
                            style={{ backgroundColor: '#a1c798' }}
                          >
                            <div className="w-6 h-6 rounded-full bg-[#56c5c5] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <p className="text-base font-bold text-white flex-1">Levererad</p>
                            <span className="text-white text-xs">▼</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-lg shadow-md transition-all overflow-hidden"
                        >
                          <div className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-full bg-[#56c5c5] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{stop.customer}</p>
                                  <p className="text-xs text-gray-600">{stop.address}, {stop.city}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">⏰ Leverans: {stop.time}</p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    📞 {stop.phone}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600"><span className="font-semibold">Produkt:</span> {stop.product} ({stop.portions} port)</p>
                                  {stop.needsHeating && (
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      {stop.wantsHeated ? '🔥 Uppvärmd' : '❄️ Fryst'}
                                    </p>
                                  )}
                                  {stop.customerNote && (
                                    <p className="text-xs italic text-gray-600 mt-0.5">💬 "{stop.customerNote}"</p>
                                  )}
                                </div>
                              </div>
                              {isDelivered && (
                                <button
                                  onClick={() => setExpandedDeliveries(prev => ({ ...prev, [stopKey]: false }))}
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                  ▲
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-green-700 font-medium">
                                  ✅ Betald {stop.paymentTime}
                                </span>
                                {stop.smsSent && (
                                  <span className="text-green-700 font-medium">
                                    📩 SMS sänt {stop.smsTime}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setDeliveryStatuses(prev => ({ ...prev, [stopKey]: true }));
                                }}
                                className="px-3 py-1 bg-[#a1c798] text-white rounded hover:bg-[#8fb889] transition-colors text-xs font-medium"
                              >
                                Levererad
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  alert(`SMS skickat till ${stop.customer}: "Din mat är på väg! Förväntad leverans: ${stop.time}"`);
                                }}
                                className="flex-1 px-2 py-0.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs"
                              >
                                Leverans på väg
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSmsModalOpen(stopKey);
                                }}
                                className="flex-1 px-2 py-0.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs"
                              >
                                Leverans försenad
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-900 font-semibold mb-1">✅ Rutten är optimerad</p>
                    <p className="text-xs text-green-800">Leveranserna är sorterade i den mest miljövänliga ordningen baserat på din köksadress. Detta sparar både tid och miljö!</p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                      Exportera rutt
                    </button>
                    <button className="flex-1 px-4 py-3 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb889] transition-colors text-sm font-medium">
                      Öppna i Google Maps
                    </button>
                  </div>
                </>
              )}

              {selectedActivity.activity.type === 'live' && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">På spisen nu</h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Antal portioner</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedActivity.activity.capacity}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-600 mb-1">Tid</p>
                      <p className="text-sm font-medium">{selectedActivity.activity.time}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Datum</p>
                      <p className="text-sm font-medium">{selectedActivity.day.date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      className="px-4 py-3 rounded-lg transition-colors text-sm font-medium"
                      style={{ backgroundColor: '#f6f2e0', color: '#333' }}
                    >
                      Inköpslista
                    </button>
                    <button
                      className="px-4 py-3 rounded-lg hover:opacity-90 transition-colors text-sm font-medium text-white"
                      style={{ backgroundColor: '#a1c798' }}
                    >
                      Redigera
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(selectedActivity.activity, selectedActivity.day.date)}
                      disabled={deleting}
                      className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      {deleting ? 'Tar bort...' : 'Ta bort'}
                    </button>
                  </div>
                </>
              )}

              {selectedActivity.activity.type === 'batch' && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Batch-tillagning</h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Totalt portioner</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedActivity.activity.capacity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Planerade rätter</h5>
                    {selectedActivity.activity.dishes && selectedActivity.activity.dishes.length > 0 ? (
                      selectedActivity.activity.dishes.map((dish, idx) => (
                        <div key={idx} className="p-4 bg-[#56c5c5]/20 rounded-lg border border-[#56c5c5]">
                          <p className="text-sm font-semibold text-gray-900">{dish.product_name || 'Okänd rätt'}</p>
                          <p className="text-xs text-gray-600 mt-1">{dish.antal_portioner} portioner</p>
                          {dish.tillagningstid_start && dish.tillagningstid_slut && (
                            <p className="text-xs text-gray-600 mt-1">
                              {formatTime(dish.tillagningstid_start)} - {formatTime(dish.tillagningstid_slut)}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">Inga rätter inlagda</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="px-4 py-3 rounded-lg transition-colors text-sm font-medium"
                      style={{ backgroundColor: '#f6f2e0', color: '#333' }}
                    >
                      Inköpslista
                    </button>
                    <button
                      className="px-4 py-3 rounded-lg hover:opacity-90 transition-colors text-sm font-medium text-white"
                      style={{ backgroundColor: '#56c5c5' }}
                    >
                      Fyll på i frysen
                    </button>
                    <button
                      className="px-4 py-3 rounded-lg hover:opacity-90 transition-colors text-sm font-medium text-white"
                      style={{ backgroundColor: '#a1c798' }}
                    >
                      Tillagat och klart!
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(selectedActivity.activity, selectedActivity.day.date)}
                      disabled={deleting}
                      className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      {deleting ? 'Tar bort...' : 'Ta bort'}
                    </button>
                  </div>
                </>
              )}

              {selectedActivity.activity.type === 'event' && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Event/Catering/Kockuppdrag</h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Antal gäster</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedActivity.activity.capacity}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-600 mb-1">Tid</p>
                      <p className="text-sm font-medium">{selectedActivity.activity.time}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Datum</p>
                      <p className="text-sm font-medium">{selectedActivity.day.date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      className="px-4 py-3 rounded-lg transition-colors text-sm font-medium"
                      style={{ backgroundColor: '#f6b7b7', color: '#333' }}
                    >
                      Mer info
                    </button>
                    <button
                      className="px-4 py-3 rounded-lg hover:opacity-90 transition-colors text-sm font-medium text-white"
                      style={{ backgroundColor: '#a1c798' }}
                    >
                      Redigera
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(selectedActivity.activity, selectedActivity.day.date)}
                      disabled={deleting}
                      className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      {deleting ? 'Tar bort...' : 'Ta bort'}
                    </button>
                  </div>
                </>
              )}

              {selectedActivity.activity.type === 'shopping' && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Inköp av mat</h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Antal recept</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedActivity.activity.dishes?.length || 0}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-600 mb-1">Tid</p>
                      <p className="text-sm font-medium">{selectedActivity.activity.time}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Datum</p>
                      <p className="text-sm font-medium">{selectedActivity.day.date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setSelectedActivity(null);
                        fetchShoppingList(selectedActivity.day.date);
                      }}
                      className="px-4 py-3 rounded-lg transition-colors text-sm font-medium hover:opacity-90"
                      style={{ backgroundColor: '#f6f2e0', color: '#333' }}
                    >
                      Inköpslista
                    </button>
                    <button
                      className="px-4 py-3 rounded-lg hover:opacity-90 transition-colors text-sm font-medium text-white"
                      style={{ backgroundColor: '#a1c798' }}
                    >
                      Redigera
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(selectedActivity.activity, selectedActivity.day.date)}
                      disabled={deleting}
                      className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      {deleting ? 'Tar bort...' : 'Ta bort'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Lobster, cursive' }}>
                  {selectedDay.dayName}
                </h3>
                <p className="text-sm text-gray-600">{selectedDay.dayNumber}</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              {selectedDay.isRestDay ? (
                <div className="text-center py-12">
                  <span className="text-6xl block mb-4">{MISSION_ICONS.rest}</span>
                  <p className="text-lg font-medium text-gray-600">Vilodag</p>
                  <p className="text-sm text-gray-500 mt-2">Ingen aktivitet planerad</p>
                </div>
              ) : selectedDay.activities.length > 0 ? (
                <>
                  {selectedDay.pressurePercent > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Tryck i köket</span>
                        <span className="text-xl font-bold text-gray-900">{selectedDay.pressurePercent}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${selectedDay.pressurePercent}%`,
                            backgroundColor: selectedDay.pressurePercent > 80 ? '#f87171' : selectedDay.pressurePercent > 60 ? '#fbbf24' : '#a1c798',
                          }}
                        />
                      </div>
                      {selectedDay.activities.find(a => a.booked) && (
                        <p className="text-xs text-gray-600 mt-2">
                          {selectedDay.activities.find(a => a.booked)?.booked} av {selectedDay.activities.find(a => a.capacity)?.capacity} portioner bokade
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedDay.activities.filter(a => a.type !== 'preparation').map((activity, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedDay(null);
                          setTimeout(() => setSelectedActivity({ day: selectedDay, activity }), 100);
                        }}
                        className="p-4 rounded-xl transition-all hover:scale-[1.01] cursor-pointer hover:shadow-md"
                        style={{ backgroundColor: activity.color }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{activity.icon}</span>
                          <h4 className="text-base font-bold text-gray-800">{activity.label}</h4>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p className="font-medium">{activity.details}</p>
                          <p className="text-xs opacity-75">{activity.time}</p>
                        </div>
                        <p className="mt-2 text-xs font-medium text-gray-800">
                          → Klicka för detaljer
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                      Inköpslista
                    </button>
                    <button className="flex-1 px-4 py-3 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb889] transition-colors text-sm font-medium">
                      Markera klart
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Ingen aktivitet planerad</p>
                  <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                    Lägg till aktivitet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {smsModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => {
          setSmsModalOpen(null);
          setDelayReason('');
          setNewEstimatedTime('');
        }}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Lobster, cursive' }}>
                📩 Skicka förseningsmeddelande
              </h3>
              <button
                onClick={() => {
                  setSmsModalOpen(null);
                  setDelayReason('');
                  setNewEstimatedTime('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const stop = selectedActivity.activity.deliveryStops?.find((_, idx) => {
                const stopKey = `${selectedActivity.day.date}-${idx}`;
                return stopKey === smsModalOpen;
              });

              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{stop?.customer}</p>
                    <p className="text-xs text-gray-600">📞 {stop?.phone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orsak till försening
                    </label>
                    <input
                      type="text"
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value)}
                      placeholder="T.ex. P g a bilköer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ny uppskattad leveranstid
                    </label>
                    <input
                      type="time"
                      value={newEstimatedTime}
                      onChange={(e) => setNewEstimatedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Förhandsgranska meddelande:</p>
                    <p className="text-xs text-blue-800 italic">
                      "Din leverans är försenad {delayReason ? `p g a ${delayReason.toLowerCase()}` : ''}.
                      Ny beräknad leveranstid: {newEstimatedTime || stop?.time}. Vi ber om ursäkt för besväret!"
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSmsModalOpen(null);
                        setDelayReason('');
                        setNewEstimatedTime('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={() => {
                        const message = `Din leverans är försenad${delayReason ? ` p g a ${delayReason.toLowerCase()}` : ''}. Ny beräknad leveranstid: ${newEstimatedTime || stop?.time}. Vi ber om ursäkt för besväret!`;
                        alert(`SMS skickat till ${stop?.customer}: "${message}"`);
                        setSmsModalOpen(null);
                        setDelayReason('');
                        setNewEstimatedTime('');
                      }}
                      disabled={!delayReason || !newEstimatedTime}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📩 Skicka SMS
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {shoppingListModalOpen && shoppingListData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShoppingListModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛒</span>
                <div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: 'Lobster, cursive' }}>
                    Inköpslista
                  </h3>
                  <p className="text-sm text-gray-600">{shoppingListData.dayName}</p>
                </div>
              </div>
              <button
                onClick={() => setShoppingListModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              {shoppingListData.ingredients.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(
                    shoppingListData.ingredients.reduce((acc, ing) => {
                      if (!acc[ing.category]) acc[ing.category] = [];
                      acc[ing.category].push(ing);
                      return acc;
                    }, {} as Record<string, typeof shoppingListData.ingredients>)
                  ).map(([category, ingredients]) => (
                    <div key={category}>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">{category}</h4>
                      <div className="space-y-2">
                        {ingredients.map((ing, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="text-sm text-gray-900">{ing.ingredient_name}</span>
                            <span className="text-sm font-semibold text-gray-700">
                              {ing.total_quantity} {ing.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Inga ingredienser hittades</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900 font-semibold mb-1">💡 Tips</p>
                <p className="text-xs text-blue-800">
                  Använd knapparna nedan för att skriva ut listan eller skicka den till dig själv via SMS
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <Printer size={18} />
                  Skriv ut
                </button>
                <button
                  onClick={() => {
                    setSmsInputModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb889] transition-colors text-sm font-medium"
                >
                  <MessageCircle size={18} />
                  Skicka SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {smsInputModalOpen && shoppingListData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4" onClick={() => {
          setSmsInputModalOpen(false);
          setSmsPhoneNumber('');
        }}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-[#a1c798]/20 flex items-center justify-center">
                  <MessageCircle size={24} className="text-[#a1c798]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Lobster, cursive' }}>
                    Skicka inköpslista via SMS
                  </h3>
                  <p className="text-sm text-gray-600">{shoppingListData.dayName}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobilnummer
                  </label>
                  <input
                    type="tel"
                    value={smsPhoneNumber}
                    onChange={(e) => setSmsPhoneNumber(e.target.value)}
                    placeholder="070-123 45 67"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#a1c798] transition-colors text-base"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ange ditt mobilnummer för att få inköpslistan via SMS
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📱</span>
                    <div>
                      <p className="text-xs font-semibold text-blue-900 mb-1">SMS kommer innehålla:</p>
                      <p className="text-xs text-blue-800">
                        {shoppingListData.ingredients.length} ingredienser grupperade efter kategori
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setSmsInputModalOpen(false);
                  setSmsPhoneNumber('');
                }}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold"
              >
                Avbryt
              </button>
              <button
                onClick={() => {
                  if (smsPhoneNumber.trim()) {
                    const ingredientText = shoppingListData.ingredients
                      .map(ing => `- ${ing.ingredient_name}: ${ing.total_quantity} ${ing.unit}`)
                      .join('\n');
                    alert(`SMS skickat till ${smsPhoneNumber}:\n\nInköpslista ${shoppingListData.dayName}:\n${ingredientText}`);
                    setSmsInputModalOpen(false);
                    setSmsPhoneNumber('');
                  }
                }}
                disabled={!smsPhoneNumber.trim()}
                className="flex-1 px-4 py-3 bg-[#a1c798] text-white rounded-xl hover:bg-[#8fb889] transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Skicka SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
