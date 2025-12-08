import React from 'react';
import { Lightbulb, TrendingUp, Users, Star } from 'lucide-react';

export const AITips: React.FC = () => {
  const tips = [
    {
      icon: Lightbulb,
      title: 'Optimera dina produktbilder',
      description: 'Produkter med professionella bilder får 3x fler visningar. Överväg att investera i bra fotografering.',
      color: '#fbbf24',
    },
    {
      icon: TrendingUp,
      title: 'Bästa tiden att posta',
      description: 'Dina kunder är mest aktiva mellan 17-19. Lägg upp nya produkter under dessa tider för bästa resultat.',
      color: '#56c5c5',
    },
    {
      icon: Users,
      title: 'Bygg kundrelationer',
      description: 'Kunder som får personliga meddelanden återkommer 60% oftare. Ta dig tid att svara på frågor.',
      color: '#a1c798',
    },
    {
      icon: Star,
      title: 'Be om recensioner',
      description: 'Efter en lyckad order, be kunden om en recension. Det ökar förtroendet för nya kunder.',
      color: '#f4a261',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-lobster text-3xl text-gray-800 mb-2">AI-tips</h1>
        <p className="text-gray-600">
          Personliga rekommendationer baserade på din verksamhet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="rounded-lg shadow p-6"
            style={{ backgroundColor: '#f6f2e0' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-lg flex-shrink-0"
                style={{ backgroundColor: tip.color + '20' }}
              >
                <tip.icon size={24} color={tip.color} />
              </div>
              <div>
                <h3 className="font-lobster text-xl text-gray-800 mb-2">
                  {tip.title}
                </h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-lg shadow p-6"
        style={{ backgroundColor: '#f6f2e0' }}
      >
        <h2 className="font-lobster text-2xl text-gray-800 mb-4">
          Veckans fokus
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#56c5c5' }}
            ></div>
            <p className="text-gray-700">
              Uppdatera dina produktbeskrivningar med mer detaljer
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#56c5c5' }}
            ></div>
            <p className="text-gray-700">
              Lägg till allergener på alla produkter
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#56c5c5' }}
            ></div>
            <p className="text-gray-700">
              Svara på väntande kundmeddelanden
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
