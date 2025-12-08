import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ChefHat,
  Users,
  Package,
  MessageSquare,
  Megaphone,
  Wallet,
  Flag,
  Settings,
  Globe,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SubMenuItem {
  path: string;
  label: string;
}

interface MenuItem {
  id: string;
  path?: string;
  label: string;
  icon: any;
  exact?: boolean;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    path: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true
  },
  {
    id: 'kockar',
    path: '/admin/kockar',
    label: 'Kockar',
    icon: ChefHat
  },
  {
    id: 'kunder',
    path: '/admin/kunder',
    label: 'Kunder',
    icon: Users
  },
  {
    id: 'produkter',
    path: '/admin/produkter',
    label: 'Produkter',
    icon: Package
  },
  {
    id: 'kommunikation',
    path: '/admin/kommunikation',
    label: 'Kommunikation',
    icon: MessageSquare
  },
  {
    id: 'marknadsforing',
    path: '/admin/marknadsforing',
    label: 'Marknadsföring',
    icon: Megaphone
  },
  {
    id: 'ekonomi',
    path: '/admin/ekonomi',
    label: 'Ekonomi',
    icon: Wallet
  },
  {
    id: 'rodaflaggor',
    path: '/admin/rodaflaggor',
    label: 'Röda flaggor',
    icon: Flag
  },
  {
    id: 'webbsidan',
    path: '/admin/webb',
    label: 'Webbsidan',
    icon: Globe
  },
  {
    id: 'system',
    path: '/admin/system',
    label: 'Systeminställningar',
    icon: Settings
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleMenu = (menuId: string) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const isPathActive = (path?: string, exact?: boolean) => {
    if (!path) return false;
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f6f2e0] flex">
      <aside className="w-64 bg-black flex-shrink-0">
        <div className="p-6">
          <h1
            className="text-3xl font-bold text-white text-center"
            style={{ fontFamily: 'Lobster, cursive' }}
          >
            Adminpanel
          </h1>
        </div>
        <nav className="px-3 pb-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = isPathActive(item.path, item.exact);
              const isExpanded = expandedMenu === item.id;
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <li key={item.id}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors text-white hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <ul className="mt-1 ml-4 space-y-1 bg-[#f6f2e0] rounded-lg p-2">
                          {item.subItems?.map((subItem) => {
                            const isSubActive = location.pathname === subItem.path;
                            return (
                              <li key={subItem.path}>
                                <NavLink
                                  to={subItem.path}
                                  className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                                    isSubActive
                                      ? 'bg-[#a1c798] text-black font-medium'
                                      : 'text-gray-700 hover:bg-[#a1c798] hover:text-black'
                                  }`}
                                >
                                  {subItem.label}
                                </NavLink>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.path!}
                      end={item.exact}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white text-black'
                          : 'text-white hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
