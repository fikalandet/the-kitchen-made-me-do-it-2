import React, { useState } from 'react';
import { ChefSidebar, MainTab } from '../components/ChefSidebar';
import { Dashboard } from './chef-panel/Dashboard';
import { KitchenSettings } from './chef-panel/KitchenSettings';
import { MySales } from './chef-panel/MySales';
import { PlanningAndPreparation } from './chef-panel/PlanningAndPreparation';
import { Communication } from './chef-panel/Communication';
import { Purchasing } from './chef-panel/Purchasing';
import { DigitalTools } from './chef-panel/DigitalTools';
import { Marketing } from './chef-panel/Marketing';
import { ChefAcademy } from './chef-panel/ChefAcademy';
import { AITips } from './chef-panel/AITips';
import { Statistics } from './chef-panel/Statistics';

export const NewChefPanel: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('');

  const handleMainTabChange = (tab: MainTab) => {
    setActiveMainTab(tab);
    setActiveSubTab('');
  };

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
  };

  React.useEffect(() => {
    if (activeMainTab === 'planning-and-preparation' && !activeSubTab) {
      setActiveSubTab('limits');
    }
  }, [activeMainTab, activeSubTab]);

  const renderContent = () => {
    switch (activeMainTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'kitchen-settings':
        return <KitchenSettings activeSubTab={activeSubTab} />;
      case 'my-sales':
        return <MySales activeSubTab={activeSubTab} />;
      case 'planning-and-preparation':
        return <PlanningAndPreparation activeSubTab={activeSubTab} />;
      case 'communication':
        return <Communication activeSubTab={activeSubTab} />;
      case 'purchasing':
        return <Purchasing activeSubTab={activeSubTab} />;
      case 'digital-tools':
        return <DigitalTools activeSubTab={activeSubTab} />;
      case 'marketing':
        return <Marketing activeSubTab={activeSubTab} />;
      case 'chef-academy':
        return <ChefAcademy activeSubTab={activeSubTab} />;
      case 'ai-tips':
        return <AITips />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#a1c798' }}>
      <div className="w-80 flex-shrink-0">
        <ChefSidebar
          activeMainTab={activeMainTab}
          onMainTabChange={handleMainTabChange}
          activeSubTab={activeSubTab}
          onSubTabChange={handleSubTabChange}
        />
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
