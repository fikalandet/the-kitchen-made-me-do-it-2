import React from 'react';

interface PurchasingProps {
  activeSubTab: string;
}

export const Purchasing: React.FC<PurchasingProps> = ({ activeSubTab }) => {
  const renderContent = () => {
    switch (activeSubTab) {
      case 'consumables':
        return (
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Förbrukningsmaterial</h2>
            <p className="text-gray-600">Hantera förbrukningsmaterial</p>
          </div>
        );
      case 'equipment':
        return (
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Köksutrustning</h2>
            <p className="text-gray-600">Hantera din köksutrustning</p>
          </div>
        );
      default:
        return (
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Inköp</h2>
            <p className="text-gray-600">Välj en undermeny till vänster</p>
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
