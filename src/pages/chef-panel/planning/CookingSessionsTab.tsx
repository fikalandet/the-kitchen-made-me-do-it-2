import React, { useState, useEffect } from 'react';
import { Plus, Flame, Snowflake, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface CookingSession {
  id: string;
  session_type: 'live' | 'batch';
  session_date: string;
  start_time: string;
  end_time: string;
  recipes: any[];
  show_in_feed: boolean;
  auto_refill_freezer: boolean;
  comment: string;
  batch_number: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export const CookingSessionsTab: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CookingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [sessionType, setSessionType] = useState<'live' | 'batch'>('live');

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('cooking_sessions')
      .select('*')
      .eq('chef_id', user.id)
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (!error && data) {
      setSessions(data);
    }

    setLoading(false);
  };

  const handleCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const sessionData = {
      chef_id: user.id,
      session_type: sessionType,
      session_date: formData.get('date') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      recipes: [],
      show_in_feed: sessionType === 'live' && formData.get('show_in_feed') === 'on',
      auto_refill_freezer: sessionType === 'batch' && formData.get('auto_refill') === 'on',
      batch_number: sessionType === 'batch' ? (formData.get('batch_number') as string) : null,
      comment: formData.get('comment') as string,
      status: 'planned',
    };

    const { data, error } = await supabase
      .from('cooking_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (!error && data) {
      const defaultSteps = sessionType === 'live'
        ? ['Förbered ingredienser', 'Tillaga', 'Kyl och paketera']
        : ['Förbered ingredienser', 'Batch-tillaga', 'Portionera', 'Frys in'];

      const checklistItems = defaultSteps.map((step, index) => ({
        session_id: data.id,
        step_name: step,
        step_order: index,
        is_completed: false,
      }));

      await supabase.from('cook_prep_checklist').insert(checklistItems);

      setShowNewSessionModal(false);
      fetchSessions();
    }
  };

  const handleStatusChange = async (sessionId: string, newStatus: string) => {
    const { error } = await supabase
      .from('cooking_sessions')
      .update({ status: newStatus })
      .eq('id', sessionId);

    if (!error) {
      fetchSessions();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Laddar tillagningspass...</p>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Tillagningspass</h3>
        <button
          onClick={() => setShowNewSessionModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Nytt pass
        </button>
      </div>

      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Skapa nytt tillagningspass</h3>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ av pass
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionType('live')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      sessionType === 'live'
                        ? 'border-black'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={sessionType === 'live' ? { backgroundColor: '#a1c798' } : {}}
                  >
                    <span>🍳 Live (På spisen nu)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionType('batch')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      sessionType === 'batch'
                        ? 'border-black'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={sessionType === 'batch' ? { backgroundColor: '#56c5c5' } : {}}
                  >
                    <span>🧊 Batch (Frysproduktion)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starttid
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sluttid
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {sessionType === 'live' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_in_feed"
                    id="show_in_feed"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="show_in_feed" className="text-sm text-gray-700">
                    Visa i kundflödet "På spisen nu"
                  </label>
                </div>
              )}

              {sessionType === 'batch' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batchnummer (valfritt)
                    </label>
                    <input
                      type="text"
                      name="batch_number"
                      placeholder="t.ex. B2025-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="auto_refill"
                      id="auto_refill"
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="auto_refill" className="text-sm text-gray-700">
                      Påfyll frysen automatiskt när klart
                    </label>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kommentar (valfritt)
                </label>
                <textarea
                  name="comment"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Anteckningar om passet..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Skapa pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Kommande pass</h4>
        {upcomingSessions.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Inga planerade pass ännu</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {completedSessions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Genomförda pass</h4>
          <div className="grid gap-4">
            {completedSessions.slice(0, 5).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SessionCard: React.FC<{
  session: CookingSession;
  onStatusChange: (id: string, status: string) => void;
}> = ({ session, onStatusChange }) => {
  const isLive = session.session_type === 'live';
  const bgColor = isLive ? 'bg-[#b6d3aa]' : 'bg-[#7eb9b9]';
  const borderColor = isLive ? 'border-[#a1c798]' : 'border-[#56c5c5]';
  const icon = isLive ? <Flame size={20} className="text-green-600" /> : <Snowflake size={20} className="text-blue-600" />;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-2xl p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="font-medium text-gray-900">
              {isLive ? '🍳 Live-pass' : '🧊 Batch-pass'}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar size={14} />
              {new Date(session.session_date).toLocaleDateString('sv-SE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.status === 'completed' ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : session.status === 'in_progress' ? (
            <AlertCircle size={20} className="text-orange-600" />
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
        </span>
      </div>

      {session.comment && (
        <p className="text-sm text-gray-600 mb-3">{session.comment}</p>
      )}

      <div className="flex gap-2">
        {session.status === 'planned' && (
          <button
            onClick={() => onStatusChange(session.id, 'in_progress')}
            className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
          >
            Starta pass
          </button>
        )}
        {session.status === 'in_progress' && (
          <button
            onClick={() => onStatusChange(session.id, 'completed')}
            className="px-3 py-1.5 text-sm bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Markera klart
          </button>
        )}
      </div>
    </div>
  );
};
