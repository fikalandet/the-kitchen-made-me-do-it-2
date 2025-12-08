import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, ShoppingCart, Download, Mail, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface ChecklistItem {
  id: string;
  session_id: string;
  step_name: string;
  step_order: number;
  is_completed: boolean;
  completed_at: string | null;
}

interface ShoppingListItem {
  id: string;
  session_id: string;
  ingredient_name: string;
  needed_qty: number;
  unit: string;
  stock_qty: number;
  shortage_qty: number;
  is_purchased: boolean;
  purchased_at: string | null;
}

interface CookingSession {
  id: string;
  session_type: string;
  session_date: string;
  start_time: string;
  recipes: any[];
}

export const ExecutionTab: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CookingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSession) {
      fetchChecklistAndShopping();
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('cooking_sessions')
      .select('id, session_type, session_date, start_time, recipes')
      .eq('chef_id', user.id)
      .gte('session_date', today)
      .in('status', ['planned', 'in_progress'])
      .order('session_date', { ascending: true });

    if (!error && data) {
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0].id);
      }
    }

    setLoading(false);
  };

  const fetchChecklistAndShopping = async () => {
    if (!selectedSession) return;

    const { data: checklistData } = await supabase
      .from('cook_prep_checklist')
      .select('*')
      .eq('session_id', selectedSession)
      .order('step_order');

    const { data: shoppingData } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('session_id', selectedSession);

    if (checklistData) setChecklist(checklistData);
    if (shoppingData) setShoppingList(shoppingData);
  };

  const toggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('cook_prep_checklist')
      .update({
        is_completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    if (!error) {
      fetchChecklistAndShopping();
    }
  };

  const toggleShoppingItem = async (itemId: string, isPurchased: boolean) => {
    const { error } = await supabase
      .from('shopping_lists')
      .update({
        is_purchased: !isPurchased,
        purchased_at: !isPurchased ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    if (!error) {
      fetchChecklistAndShopping();
    }
  };

  const exportShoppingListCSV = () => {
    const csv = ['Ingrediens,Behov,Enhet,Lager,Brist']
      .concat(
        shoppingList.map(
          (item) =>
            `${item.ingredient_name},${item.needed_qty},${item.unit || ''},${item.stock_qty},${item.shortage_qty || ''}`
        )
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inkopslista.csv';
    a.click();
  };

  const completedSteps = checklist.filter((item) => item.is_completed).length;
  const totalSteps = checklist.length;
  const preparationPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const purchasedItems = shoppingList.filter((item) => item.is_purchased).length;
  const totalItems = shoppingList.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <p className="text-gray-600">Inga planerade pass att förbereda</p>
        <p className="text-sm text-gray-500 mt-2">
          Skapa ett tillagningspass för att se checklistor och inköpslistor
        </p>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.id === selectedSession);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Välj tillagningspass
        </label>
        <select
          value={selectedSession || ''}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {new Date(session.session_date).toLocaleDateString('sv-SE', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}{' '}
              {session.start_time.slice(0, 5)} -{' '}
              {session.session_type === 'live' ? '🍳 Live' : '🧊 Batch'}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Checklista</h3>
            <div className="text-sm text-gray-600">
              {completedSteps} / {totalSteps} klara
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Förberedelsenivå</span>
              <span className="text-sm font-medium">{Math.round(preparationPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${preparationPercentage}%` }}
              />
            </div>
          </div>

          {checklist.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Ingen checklista skapad</p>
          ) : (
            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id, item.is_completed)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    item.is_completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-[#b6d3aa]/30 border-[#a1c798]/50 hover:border-[#a1c798]'
                  }`}
                >
                  {item.is_completed ? (
                    <CheckSquare size={20} className="text-green-600 flex-shrink-0" />
                  ) : (
                    <Square size={20} className="text-gray-400 flex-shrink-0" />
                  )}
                  <span
                    className={`flex-1 ${
                      item.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}
                  >
                    {item.step_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart size={20} />
              Inköpslista
            </h3>
            <div className="flex gap-2">
              <button
                onClick={exportShoppingListCSV}
                disabled={shoppingList.length === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Exportera CSV"
              >
                <Download size={18} />
              </button>
              <button
                disabled={shoppingList.length === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Skicka via e-post"
              >
                <Mail size={18} />
              </button>
              <button
                disabled={shoppingList.length === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Exportera PDF"
              >
                <FileText size={18} />
              </button>
            </div>
          </div>

          {totalItems > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              {purchasedItems} av {totalItems} inköpta
            </div>
          )}

          {shoppingList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-3">Ingen inköpslista genererad</p>
              <p className="text-xs text-gray-400">
                Lägg till recept i passet för att auto-generera inköpslista
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shoppingList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleShoppingItem(item.id, item.is_purchased)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                    item.is_purchased
                      ? 'bg-green-50 border-green-200'
                      : 'bg-[#b6d3aa]/30 border-[#a1c798]/50 hover:border-[#a1c798]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {item.is_purchased ? (
                      <CheckSquare size={18} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <Square size={18} className="text-gray-400 flex-shrink-0" />
                    )}
                    <span
                      className={`font-medium ${
                        item.is_purchased ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {item.ingredient_name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.needed_qty} {item.unit}
                    {item.shortage_qty > 0 && (
                      <span className="ml-2 text-orange-600">(-{item.shortage_qty})</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
