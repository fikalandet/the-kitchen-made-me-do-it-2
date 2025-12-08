import React from 'react';

interface DigitalToolsProps {
  activeSubTab: string;
}

export const DigitalTools: React.FC<DigitalToolsProps> = ({ activeSubTab }) => {
  const renderContent = () => {
    switch (activeSubTab) {
      case 'recipe-creator':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Receptskapare</h2>
            <p className="text-gray-600">Skapa och spara recept</p>
          </div>
        );
      case 'meal-planner':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Måltidsplanerare</h2>
            <p className="text-gray-600">Planera veckans menyer</p>
          </div>
        );
      case 'cost-calculator':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Kostnadskalkylator</h2>
            <p className="text-gray-600">Beräkna kostnad per portion</p>
          </div>
        );
      case 'nutrition':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Näringsberäkning</h2>
            <p className="text-gray-600">Beräkna näringsvärden</p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Digitala verktyg</h2>
            <p className="text-gray-600">Välj ett verktyg till vänster</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
        {renderContent()}
      </div>
    </div>
  );
};
