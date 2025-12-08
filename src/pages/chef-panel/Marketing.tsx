import React from 'react';
import { BoostWizard } from './marketing/BoostWizard';

interface MarketingProps {
  activeSubTab: string;
}

export const Marketing: React.FC<MarketingProps> = ({ activeSubTab }) => {
  const renderContent = () => {
    switch (activeSubTab) {
      case 'boost':
        return <BoostWizard />;
      case 'deals':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Schysst deal</h2>
            <p className="text-gray-600">Skapa rabatterbjudanden</p>
          </div>
        );
      case 'coupons':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Kupongkort</h2>
            <p className="text-gray-600">Skapa och hantera kuponger</p>
          </div>
        );
      case 'newsletter':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Nyhetsbrev</h2>
            <p className="text-gray-600">Hantera nyhetsbrev till kunder</p>
          </div>
        );
      case 'contest':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Tävling</h2>
            <p className="text-gray-600">Skapa och hantera tävlingar</p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Marknadsföring</h2>
            <p className="text-gray-600">Välj en undermeny till vänster</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {activeSubTab === 'boost' ? (
        renderContent()
      ) : (
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
          {renderContent()}
        </div>
      )}
    </div>
  );
};
