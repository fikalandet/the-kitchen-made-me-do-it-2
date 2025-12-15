import React from 'react';
import {
  ShoppingBag,
  Award,
  MessageCircle,
  User,
  Home,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export type CustomerTab =
  | 'orders'
  | 'points'
  | 'support'
  | 'account';

interface CustomerSidebarProps {
  activeTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
}

interface MenuItem {
  id: CustomerTab;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    id: 'orders',
    label: 'Mina beställningar',
    icon: <ShoppingBag size={20} />,
  },
  {
    id: 'points',
    label: 'Poäng & belöningar',
    icon: <Award size={20} />,
  },
  {
    id: 'support',
    label: 'Support & meddelanden',
    icon: <MessageCircle size={20} />,
  },
  {
    id: 'account',
    label: 'Mitt konto',
    icon: <User size={20} />,
  },
];

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: '#a1c798' }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-lobster text-3xl text-gray-800">
            Kundpanel
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
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'font-medium'
                  : 'hover:bg-white hover:bg-opacity-20'
              }`}
              style={{
                backgroundColor: activeTab === item.id ? '#56c5c5' : 'transparent',
                color: '#000000'
              }}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
