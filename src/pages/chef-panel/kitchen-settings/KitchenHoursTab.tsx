import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, Clock } from 'lucide-react';

interface DaySchedule {
  day: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  showOnProfile: boolean;
}

export const KitchenHoursTab: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: 'Måndag', dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '18:00', showOnProfile: true },
    { day: 'Tisdag', dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '18:00', showOnProfile: true },
    { day: 'Onsdag', dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '18:00', showOnProfile: true },
    { day: 'Torsdag', dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '18:00', showOnProfile: true },
    { day: 'Fredag', dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '18:00', showOnProfile: true },
    { day: 'Lördag', dayOfWeek: 6, isOpen: false, openTime: '10:00', closeTime: '16:00', showOnProfile: true },
    { day: 'Söndag', dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '16:00', showOnProfile: true },
  ]);

  useEffect(() => {
    if (user) {
      fetchOpeningHours();
      fetchSpecialDates();
    }
  }, [user]);

  const fetchOpeningHours = async () => {
    const { data } = await supabase
      .from('opening_hours')
      .select('*')
      .eq('chef_id', user?.id);

    if (data && data.length > 0) {
      const updatedSchedule = schedule.map(day => {
        const found = data.find(d => d.day_of_week === day.dayOfWeek);
        if (found) {
          return {
            ...day,
            isOpen: found.is_open,
            openTime: found.open_time || day.openTime,
            closeTime: found.close_time || day.closeTime,
            showOnProfile: found.show_on_profile,
          };
        }
        return day;
      });
      setSchedule(updatedSchedule);
    }
  };

  const fetchSpecialDates = async () => {
    const { data } = await supabase
      .from('special_dates')
      .select('*')
      .eq('chef_id', user?.id)
      .order('date', { ascending: true });

    if (data) {
      setSpecialDates(data.map(d => ({
        date: d.date,
        status: d.status,
        note: d.note || '',
      })));
    }
  };

  const [specialDates, setSpecialDates] = useState<{ date: string; status: string; note: string }[]>([]);
  const [newDate, setNewDate] = useState({ date: '', status: 'closed', note: '' });

  const toggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].isOpen = !updated[index].isOpen;
    setSchedule(updated);
    setHasChanges(true);
  };

  const updateTime = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
    setHasChanges(true);
  };

  const addSpecialDate = () => {
    if (newDate.date) {
      setSpecialDates([...specialDates, { ...newDate }]);
      setNewDate({ date: '', status: 'closed', note: '' });
      setHasChanges(true);
    }
  };

  const removeSpecialDate = (index: number) => {
    setSpecialDates(specialDates.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const toggleShowOnProfile = (index: number) => {
    const updated = [...schedule];
    updated[index].showOnProfile = !updated[index].showOnProfile;
    setSchedule(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save opening hours
      for (const day of schedule) {
        await supabase
          .from('opening_hours')
          .upsert({
            chef_id: user?.id,
            day_of_week: day.dayOfWeek,
            is_open: day.isOpen,
            open_time: day.openTime,
            close_time: day.closeTime,
            show_on_profile: day.showOnProfile,
          }, {
            onConflict: 'chef_id,day_of_week'
          });
      }

      // Delete existing special dates and re-insert
      await supabase
        .from('special_dates')
        .delete()
        .eq('chef_id', user?.id);

      if (specialDates.length > 0) {
        await supabase
          .from('special_dates')
          .insert(specialDates.map(d => ({
            chef_id: user?.id,
            date: d.date,
            status: d.status,
            note: d.note,
          })));
      }

      setHasChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error saving opening hours:', error);
      alert('Kunde inte spara. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lobster text-3xl text-gray-800 mb-2">Öppettider</h2>
        <p className="text-gray-600">Ställ in när ditt kök är öppet för beställningar</p>
      </div>

      <div className="rounded-lg shadow p-6 space-y-6" style={{ backgroundColor: '#f6f2e0' }}>
        <div>
          <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Veckoschema
          </h3>
          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div key={day.day} className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <div className="w-32">
                  <span className="font-medium text-gray-700">{day.day}</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={() => toggleDay(index)}
                    className="w-5 h-5 rounded hours-checkbox"
                  />
                  <span className="text-sm text-gray-600">Öppet</span>
                </label>
                {day.isOpen && (
                  <>
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => updateTime(index, 'openTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => updateTime(index, 'closeTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </>
                )}
                {!day.isOpen && (
                  <span className="text-gray-500 italic">Stängt</span>
                )}
                <label className="flex items-center gap-2 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={day.showOnProfile}
                    onChange={() => toggleShowOnProfile(index)}
                    className="w-5 h-5 rounded hours-checkbox"
                  />
                  <span className="text-sm text-gray-600">Visa på kökssida</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-300 pt-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Avvikande datum
          </h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="date"
                  value={newDate.date}
                  onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={newDate.status}
                  onChange={(e) => setNewDate({ ...newDate, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="closed">Stängt</option>
                  <option value="open">Öppet</option>
                  <option value="fully_booked">Fullbokat</option>
                </select>
                <input
                  type="text"
                  value={newDate.note}
                  onChange={(e) => setNewDate({ ...newDate, note: e.target.value })}
                  placeholder="Anteckning (valfritt)"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={addSpecialDate}
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#56c5c5' }}
                >
                  Lägg till
                </button>
              </div>
            </div>

            {specialDates.length > 0 && (
              <div className="space-y-2">
                {specialDates.map((special, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-700">{special.date}</span>
                      <span className="mx-3 text-gray-400">•</span>
                      <span className="text-gray-600">
                        {special.status === 'closed' && 'Stängt'}
                        {special.status === 'open' && 'Öppet'}
                        {special.status === 'fully_booked' && 'Fullbokat'}
                      </span>
                      {special.note && (
                        <>
                          <span className="mx-3 text-gray-400">•</span>
                          <span className="text-gray-500 italic">{special.note}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => removeSpecialDate(index)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Ta bort
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-6 py-2 rounded-lg text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#56c5c5' }}
          >
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-lg shadow-lg p-4 animate-fade-in" style={{ backgroundColor: '#56c5c5' }}>
          <p className="text-white font-medium">✓ Sparat!</p>
        </div>
      )}
    </div>
  );
};
