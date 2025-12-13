import { useState } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import LayoutOverview from './layout';
import StartsidaMain from './startsida';
import SidorMain from './sidor';
import LandningMain from './landning';

export default function WebbsidanMain() {
  const location = useLocation();

  const tabs = [
    { id: 'layout', label: 'Layout & navigation', path: '/admin/webb/layout' },
    { id: 'startsida', label: 'Startsidan', path: '/admin/webb/startsida' },
    { id: 'sidor', label: 'Sidor', path: '/admin/webb/sidor' },
    { id: 'landning', label: 'Landningssidor', path: '/admin/webb/landning' }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Webbsidan</h1>
        <p className="text-gray-600">Redigera layout, startsida och statiska sidor</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={`pb-4 px-4 rounded-t-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-[#56c5c5] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <Routes>
        <Route index element={<Navigate to="/admin/webb/layout" replace />} />
        <Route path="layout/*" element={<LayoutOverview />} />
        <Route path="startsida/*" element={<StartsidaMain />} />
        <Route path="sidor/*" element={<SidorMain />} />
        <Route path="landning/*" element={<LandningMain />} />
      </Routes>
    </div>
  );
}
