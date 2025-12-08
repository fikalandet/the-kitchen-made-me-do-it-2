import { useState, useEffect } from 'react';
import { Users, ChefHat, TrendingUp, Flag, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminCard, AdminSectionHeader, AdminTable } from '../components';
import { supabase } from '../../lib/supabase';

type TabType = 'overview' | 'onboarding';

const dummyChefs = [
  { name: 'Maria Andersson', email: 'maria@example.com', city: 'Stockholm', date: '2025-12-03' },
  { name: 'Johan Berg', email: 'johan@example.com', city: 'Göteborg', date: '2025-12-02' },
  { name: 'Lisa Nilsson', email: 'lisa@example.com', city: 'Malmö', date: '2025-12-01' },
];

const dummyOrders = [
  { id: '#1234', customer: 'Anna Svensson', chef: 'Maria Andersson', product: 'Thai Curry', amount: '250 kr', date: '2025-12-05' },
  { id: '#1233', customer: 'Erik Johansson', chef: 'Johan Berg', product: 'Pizza Margherita', amount: '180 kr', date: '2025-12-05' },
  { id: '#1232', customer: 'Karin Olsson', chef: 'Lisa Nilsson', product: 'Lasagne', amount: '220 kr', date: '2025-12-04' },
];

const dummyOnboarding = [
  { name: 'Sara Karlsson', email: 'sara@example.com', city: 'Uppsala', step: 'Registrerad', updated: '2025-12-04', status: 'ongoing' },
  { name: 'Peter Lindström', email: 'peter@example.com', city: 'Lund', step: 'Skickat intresse', updated: '2025-12-03', status: 'ongoing' },
  { name: 'Emma Gustafsson', email: 'emma@example.com', city: 'Västerås', step: 'Väntar på godkännande', updated: '2025-12-02', status: 'ongoing' },
  { name: 'Daniel Eriksson', email: 'daniel@example.com', city: 'Örebro', step: 'Redo att gå live', updated: '2025-12-01', status: 'ready' },
  { name: 'Sofia Persson', email: 'sofia@example.com', city: 'Linköping', step: 'Registrerad', updated: '2025-11-30', status: 'stopped' },
];

interface NewWarning {
  id: string;
  chef_id: string;
  type: string;
  severity: string;
  short_summary: string | null;
  created_at: string;
  chef_name: string;
  chef_email: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newWarningsCount, setNewWarningsCount] = useState<number>(0);
  const [recentWarnings, setRecentWarnings] = useState<NewWarning[]>([]);
  const [loadingWarnings, setLoadingWarnings] = useState(true);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchNewWarnings();
    }
  }, [activeTab]);

  const fetchNewWarnings = async () => {
    setLoadingWarnings(true);
    try {
      const { data: warnings, error } = await supabase
        .from('chef_warnings')
        .select(`
          id,
          chef_id,
          type,
          severity,
          short_summary,
          message,
          created_at,
          profiles!chef_warnings_chef_id_fkey (
            full_name,
            email
          )
        `)
        .eq('is_new', true)
        .eq('status', 'öppen')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedWarnings = (warnings || []).map((w: any) => ({
        id: w.id,
        chef_id: w.chef_id,
        type: w.type,
        severity: w.severity,
        short_summary: w.short_summary || w.message?.substring(0, 50) + '...',
        created_at: w.created_at,
        chef_name: w.profiles?.full_name || 'Okänd kock',
        chef_email: w.profiles?.email || ''
      }));

      setRecentWarnings(formattedWarnings);

      const { count, error: countError } = await supabase
        .from('chef_warnings')
        .select('*', { count: 'exact', head: true })
        .eq('is_new', true)
        .eq('status', 'öppen');

      if (!countError) {
        setNewWarningsCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching warnings:', error);
    } finally {
      setLoadingWarnings(false);
    }
  };

  return (
    <div>
      <div className="mb-6 border-b border-gray-300">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
            }`}
          >
            Översikt
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'onboarding'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
            }`}
          >
            Onboarding
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div>
          <AdminSectionHeader title="Dashboard – Översikt" />

          <div className="grid grid-cols-2 gap-6 mb-8">
            <AdminCard>
              <div className="flex items-center gap-3 mb-2">
                <ChefHat className="w-5 h-5 text-gray-700" />
                <h4 className="text-sm font-medium text-gray-700">Aktiva kockar</h4>
              </div>
              <p className="text-3xl font-bold text-black">47</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-gray-700" />
                <h4 className="text-sm font-medium text-gray-700">Aktiva kunder</h4>
              </div>
              <p className="text-3xl font-bold text-black">312</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-700" />
                <h4 className="text-sm font-medium text-gray-700">Försäljning idag</h4>
              </div>
              <p className="text-3xl font-bold text-black">8 450 kr</p>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h4 className="text-sm font-medium text-gray-700">Nya varningar</h4>
              </div>
              <p className="text-3xl font-bold text-black">{loadingWarnings ? '-' : newWarningsCount}</p>
            </AdminCard>
          </div>

          {newWarningsCount > 0 && (
            <div className="mb-6">
              <AdminCard>
                <h4 className="font-bold text-black text-lg mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
                  Senaste nya varningar
                </h4>
                <div className="space-y-3">
                  {recentWarnings.map((warning) => (
                    <div key={warning.id} className="flex justify-between items-start p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            warning.severity === 'hög' ? 'bg-red-100 text-red-800' :
                            warning.severity === 'medel' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {warning.severity}
                          </span>
                          <span className="text-xs text-gray-600">{warning.type}</span>
                        </div>
                        <p className="font-medium text-black">{warning.chef_name}</p>
                        <p className="text-sm text-gray-700">{warning.short_summary}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(warning.created_at).toLocaleDateString('sv-SE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Link
                        to={`/admin/kockar/${warning.chef_id}?tab=varningar`}
                        className="ml-4 px-3 py-1.5 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors whitespace-nowrap"
                      >
                        Visa kock
                      </Link>
                    </div>
                  ))}
                </div>
              </AdminCard>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <AdminCard>
              <h4 className="font-bold text-black text-lg mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
                Senaste registrerade kockar
              </h4>
              <div className="space-y-4">
                {dummyChefs.map((chef, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-black">{chef.name}</p>
                      <p className="text-sm text-gray-700">{chef.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-black">{chef.city}</p>
                      <p className="text-sm text-gray-700">{chef.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard>
              <h4 className="font-bold text-black text-lg mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
                Senaste beställningar
              </h4>
              <div className="space-y-4">
                {dummyOrders.map((order, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-black">{order.id} – {order.product}</p>
                      <p className="font-medium text-black">{order.amount}</p>
                    </div>
                    <p className="text-sm text-gray-700">{order.customer} → {order.chef}</p>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        </div>
      )}

      {activeTab === 'onboarding' && (
        <div>
          <AdminSectionHeader
            title="Onboarding av kockar"
            subtitle="Här ser du var i onboardingprocessen våra kockar befinner sig."
          />

          <AdminTable
            headers={['Kocknamn', 'E-post', 'Stad/område', 'Onboarding-steg', 'Senast uppdaterad', 'Status']}
          >
            {dummyOnboarding.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.step}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.updated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'ready'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'stopped'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.status === 'ready' ? 'Klar' : item.status === 'stopped' ? 'Stoppad' : 'Pågår'}
                  </span>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}
    </div>
  );
}
