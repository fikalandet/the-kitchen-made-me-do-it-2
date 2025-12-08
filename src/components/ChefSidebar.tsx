import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ChefHat,
  ShoppingCart,
  MessageSquare,
  ShoppingBag,
  Laptop,
  Megaphone,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Home,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type MainTab =
  | 'dashboard'
  | 'kitchen-settings'
  | 'my-sales'
  | 'planning-and-preparation'
  | 'communication'
  | 'purchasing'
  | 'digital-tools'
  | 'marketing'
  | 'chef-academy'
  | 'ai-tips'
  | 'statistics';

interface ChefSidebarProps {
  activeMainTab: MainTab;
  onMainTabChange: (tab: MainTab) => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
}

interface MenuItem {
  id: MainTab;
  label: string;
  icon: React.ReactNode;
  hasSubTabs: boolean;
  subTabs?: { id: string; label: string }[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'overview', label: 'Översikt' },
      { id: 'onboarding', label: 'Onboarding' },
    ],
  },
  {
    id: 'kitchen-settings',
    label: 'Mitt kök-inställningar',
    icon: <ChefHat size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'preview', label: 'Visa mitt kök' },
      { id: 'info', label: 'Köksinfo' },
      { id: 'contact', label: 'Kontaktuppgifter' },
      { id: 'hours', label: 'Öppettider' },
      { id: 'delivery', label: 'Leveranssätt' },
      { id: 'banking', label: 'Bank & Företag' },
      { id: 'membership', label: 'Medlemskap & Provision' },
    ],
  },
  {
    id: 'my-sales',
    label: 'Min försäljning',
    icon: <ShoppingCart size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'overview', label: 'Min meny' },
      { id: 'orders', label: 'Beställningar' },
      { id: 'revenue', label: 'Intäkter' },
      { id: 'customers', label: 'Kunder' },
      { id: 'gift-cards', label: 'Presentkort' },
    ],
  },
  {
    id: 'planning-and-preparation',
    label: 'Planera & förbered',
    icon: <Calendar size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'planning', label: 'Min planering' },
      { id: 'schedule', label: 'Mitt schema' },
      { id: 'limits', label: 'Mina gränser' },
    ],
  },
  {
    id: 'communication',
    label: 'Kommunikation',
    icon: <MessageSquare size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'messages', label: 'Meddelanden' },
      { id: 'auto-messages', label: 'Automatiska meddelanden' },
      { id: 'sandbox', label: 'Sandbox (endast test)' },
    ],
  },
  {
    id: 'purchasing',
    label: 'Inköp',
    icon: <ShoppingBag size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'consumables', label: 'Förbrukningsmaterial' },
      { id: 'equipment', label: 'Köksutrustning' },
    ],
  },
  {
    id: 'digital-tools',
    label: 'Digitala verktyg',
    icon: <Laptop size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'haccp', label: 'HACCP Egenkontroll' },
      { id: 'ingredients-db', label: 'Ingrediensdatabas' },
      { id: 'nutrition', label: 'Näringsberäkning' },
      { id: 'route-planner', label: 'Ruttplanerare' },
      { id: 'recipe-templates', label: 'Receptmallar' },
      { id: 'recipe-scaling', label: 'Receptskalning' },
      { id: 'shopping-lists', label: 'Inköpslistor' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marknadsföring',
    icon: <Megaphone size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'boost', label: 'Boosta' },
      { id: 'deals', label: 'Schysst deal' },
      { id: 'coupons', label: 'Kupongkort' },
      { id: 'newsletter', label: 'Nyhetsbrev' },
      { id: 'contest', label: 'Tävling' },
    ],
  },
  {
    id: 'chef-academy',
    label: 'Kockakademin',
    icon: <GraduationCap size={20} />,
    hasSubTabs: true,
    subTabs: [
      { id: 'education', label: 'Utbildning' },
      { id: 'guides', label: 'Guider' },
      { id: 'videos', label: 'Instruktionsvideos' },
      { id: 'documents', label: 'Dokument' },
    ],
  },
  {
    id: 'ai-tips',
    label: 'AI-tips',
    icon: <span className="text-lg">🤖</span>,
    hasSubTabs: false,
  },
  {
    id: 'statistics',
    label: 'Statistik',
    icon: <span className="text-lg">📊</span>,
    hasSubTabs: false,
  },
];

export const ChefSidebar: React.FC<ChefSidebarProps> = ({
  activeMainTab,
  onMainTabChange,
  activeSubTab,
  onSubTabChange,
}) => {
  const { user } = useAuth();
  const [expandedTab, setExpandedTab] = useState<MainTab | null>(activeMainTab);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const { data: threads } = await supabase
        .from('message_threads')
        .select('id, party_a_id, party_b_id')
        .or(`party_a_id.eq.${user.id},party_b_id.eq.${user.id}`)
        .eq('status', 'unread');

      setUnreadCount(threads?.length || 0);
    };

    fetchUnreadCount();

    const subscription = supabase
      .channel('thread_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_threads',
        filter: `party_a_id=eq.${user.id}`
      }, fetchUnreadCount)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_threads',
        filter: `party_b_id=eq.${user.id}`
      }, fetchUnreadCount)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleMainTabClick = (tabId: MainTab, hasSubTabs: boolean) => {
    if (hasSubTabs) {
      if (expandedTab === tabId) {
        setExpandedTab(null);
      } else {
        setExpandedTab(tabId);
        onMainTabChange(tabId);
      }
    } else {
      setExpandedTab(null);
      onMainTabChange(tabId);
    }
  };

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: '#a1c798' }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-lobster text-3xl text-gray-800">
            Kockpanel
          </h1>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 hover:bg-white hover:bg-opacity-30 transition-colors"
            title="Tillbaka till startsidan"
          >
            <Home size={20} />
          </Link>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleMainTabClick(item.id, item.hasSubTabs)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  activeMainTab === item.id
                    ? 'font-medium'
                    : 'hover:bg-white hover:bg-opacity-20'
                }`}
                style={{
                  backgroundColor: activeMainTab === item.id ? '#56c5c5' : 'transparent',
                  color: '#000000'
                }}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id === 'communication' && unreadCount > 0 && (
                    <span
                      className="flex items-center justify-center text-white text-xs font-bold rounded-full"
                      style={{
                        backgroundColor: '#000000',
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px',
                        fontSize: '11px'
                      }}
                      title={`Du har ${unreadCount} nya meddelanden.`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                {item.hasSubTabs && (
                  expandedTab === item.id ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )
                )}
                {!item.hasSubTabs && <ChevronRight size={20} />}
              </button>

              {item.hasSubTabs && expandedTab === item.id && item.subTabs && (
                <div className="mt-2 ml-4 space-y-1">
                  {item.subTabs.map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => onSubTabChange?.(subTab.id)}
                      className={`w-full text-left px-4 py-2 rounded transition-colors ${
                        activeSubTab === subTab.id
                          ? 'font-medium'
                          : ''
                      }`}
                      style={{
                        backgroundColor: activeSubTab === subTab.id ? '#56c5c5' : '#f6f2e0',
                        color: '#000000'
                      }}
                      onMouseEnter={(e) => {
                        if (activeSubTab !== subTab.id) {
                          e.currentTarget.style.backgroundColor = '#7dd5d5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeSubTab !== subTab.id) {
                          e.currentTarget.style.backgroundColor = '#f6f2e0';
                        }
                      }}
                    >
                      {subTab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
