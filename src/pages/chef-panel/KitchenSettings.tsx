import React from 'react';
import { KitchenPreviewTab } from './kitchen-settings/KitchenPreviewTab';
import { KitchenInfoTab } from './kitchen-settings/KitchenInfoTab';
import { KitchenContactTab } from './kitchen-settings/KitchenContactTab';
import { KitchenHoursTab } from './kitchen-settings/KitchenHoursTab';
import { KitchenDeliveryTab } from './kitchen-settings/KitchenDeliveryTab';
import { KitchenBankTab } from './kitchen-settings/KitchenBankTab';
import { KitchenMembershipTab } from './kitchen-settings/KitchenMembershipTab';

interface KitchenSettingsProps {
  activeSubTab: string;
}

export const KitchenSettings: React.FC<KitchenSettingsProps> = ({ activeSubTab }) => {
  const renderContent = () => {
    switch (activeSubTab) {
      case 'preview':
        return <KitchenPreviewTab />;
      case 'info':
        return <KitchenInfoTab />;
      case 'contact':
        return <KitchenContactTab />;
      case 'hours':
        return <KitchenHoursTab />;
      case 'delivery':
        return <KitchenDeliveryTab />;
      case 'banking':
        return <KitchenBankTab />;
      case 'membership':
        return <KitchenMembershipTab />;
      default:
        return (
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Mitt kök-inställningar</h2>
            <p className="text-gray-600">Välj en undermeny till vänster för att komma igång</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};
