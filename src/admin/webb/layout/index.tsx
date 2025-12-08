import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Monitor, Menu, ArrowDown, Palette } from 'lucide-react';
import { AdminCard } from '../../components';
import Topbar from './Topbar';
import Header from './Header';
import Footer from './Footer';
import Design from './Design';

export default function LayoutOverview() {
  const layoutSections = [
    {
      id: 'topbar',
      title: 'Topbar',
      description: 'Redigera den övre informationsraden (kampanjmeddelanden, viktig info)',
      icon: Monitor,
      path: '/admin/webb/layout/topbar'
    },
    {
      id: 'header',
      title: 'Header & navigationsmeny',
      description: 'Redigera logotyp, huvudmeny och användarmenyer',
      icon: Menu,
      path: '/admin/webb/layout/header'
    },
    {
      id: 'footer',
      title: 'Sidfot',
      description: 'Redigera sidfotens länkar, text och kolumner',
      icon: ArrowDown,
      path: '/admin/webb/layout/footer'
    },
    {
      id: 'design',
      title: 'Färger & typsnitt',
      description: 'Globala designinställningar för hela webbplatsen',
      icon: Palette,
      path: '/admin/webb/layout/design'
    }
  ];

  return (
    <Routes>
      <Route
        index
        element={
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Layout & navigation</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {layoutSections.map((section) => {
                const Icon = section.icon;
                return (
                  <AdminCard key={section.id} className="hover:shadow-lg transition-shadow">
                    <Link to={section.path} className="block">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#a1c798] rounded-lg">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {section.title}
                          </h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      </div>
                    </Link>
                  </AdminCard>
                );
              })}
            </div>
          </div>
        }
      />
      <Route path="topbar" element={<Topbar />} />
      <Route path="header" element={<Header />} />
      <Route path="footer" element={<Footer />} />
      <Route path="design" element={<Design />} />
    </Routes>
  );
}
