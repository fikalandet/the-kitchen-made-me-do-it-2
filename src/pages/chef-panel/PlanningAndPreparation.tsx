import React from 'react';
import { KitchenLimitsTab } from './planning/KitchenLimitsTab';
import { MyScheduleTab } from './planning/MyScheduleTab';

interface PlanningAndPreparationProps {
  activeSubTab?: string;
}

export const PlanningAndPreparation: React.FC<PlanningAndPreparationProps> = ({ activeSubTab }) => {
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'planning':
        return <KitchenLimitsTab showOnlyMissions />;
      case 'schedule':
        return <MyScheduleTab />;
      case 'limits':
        return <KitchenLimitsTab showOnlyLimits />;
      default:
        return <KitchenLimitsTab showOnlyMissions />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Planera & förbered</h2>
        <p className="text-gray-600">
          Hantera din ork, planera tillagning och håll pulsen i ditt kök
        </p>
      </div>

      <div>{renderSubTabContent()}</div>
    </div>
  );
};
