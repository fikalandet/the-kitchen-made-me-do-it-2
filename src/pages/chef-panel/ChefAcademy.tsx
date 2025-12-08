import React from 'react';

interface ChefAcademyProps {
  activeSubTab: string;
}

export const ChefAcademy: React.FC<ChefAcademyProps> = ({ activeSubTab }) => {
  const renderContent = () => {
    switch (activeSubTab) {
      case 'courses':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Kurser</h2>
            <p className="text-gray-600">Utforska kurser för att utveckla dina färdigheter</p>
          </div>
        );
      case 'tutorials':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Tutorials</h2>
            <p className="text-gray-600">Lär dig nya tekniker genom tutorials</p>
          </div>
        );
      case 'resources':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Resurser</h2>
            <p className="text-gray-600">Användbara resurser för kockar</p>
          </div>
        );
      case 'certifications':
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Certifieringar</h2>
            <p className="text-gray-600">Få certifieringar och visa dina kunskaper</p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4">Kockakademin</h2>
            <p className="text-gray-600">Välj en undermeny till vänster</p>
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
