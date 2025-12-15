import React, { useState } from 'react';
import { CustomerSidebar, CustomerTab } from '../components/CustomerSidebar';
import { Orders } from './customer-panel/Orders';
import { Points } from './customer-panel/Points';
import { Support } from './customer-panel/Support';
import { Account } from './customer-panel/Account';

export const CustomerPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CustomerTab>('orders');

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <Orders />;
      case 'points':
        return <Points />;
      case 'support':
        return <Support />;
      case 'account':
        return <Account />;
      default:
        return <Orders />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#a1c798' }}>
      <div className="w-80 flex-shrink-0">
        <CustomerSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
