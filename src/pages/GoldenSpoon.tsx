import React from 'react';
import { Award, Star, TrendingUp, Gift } from 'lucide-react';

export const GoldenSpoon: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#a1c798' }}>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Award size={64} className="mx-auto mb-4" style={{ color: '#fbbf24' }} />
            <h1 className="font-lobster text-5xl text-gray-800 mb-4">
              Guldskeden
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Vårt lojalitetsprogram som belönar dig för att stödja lokala kockar.
              Samla guldpoäng och få exklusiva fördelar.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-lobster text-3xl text-gray-800 mb-12 text-center">
            Hur fungerar det?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Star size={40} />}
              title="Tjäna poäng"
              description="Få guldpoäng för varje köp du gör från våra kockar"
              color="#fbbf24"
            />
            <FeatureCard
              icon={<Gift size={40} />}
              title="Få belöningar"
              description="Använd dina poäng för rabatter och exklusiva erbjudanden"
              color="#f4a261"
            />
            <FeatureCard
              icon={<TrendingUp size={40} />}
              title="Avancera"
              description="Ju mer du handlar, desto fler fördelar får du"
              color="#56c5c5"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-12 shadow-lg text-center" style={{ backgroundColor: '#f6f2e0' }}>
            <h2 className="font-lobster text-3xl text-gray-800 mb-6">
              Sätt att tjäna guldpoäng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <EarnPointsCard
                title="Köp mat"
                points="1 poäng per 10 SEK"
                description="Få poäng automatiskt vid varje köp"
              />
              <EarnPointsCard
                title="Lämna recensioner"
                points="10 poäng"
                description="Dela din upplevelse och hjälp andra"
              />
              <EarnPointsCard
                title="Bjud in vänner"
                points="50 poäng"
                description="Få poäng när dina vänner gör sitt första köp"
              />
              <EarnPointsCard
                title="Bonuspoäng"
                points="Varierar"
                description="Kockar kan belöna lojala kunder med extra poäng"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-lobster text-3xl text-gray-800 mb-12 text-center">
            Vad kan du köpa med dina poäng?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RewardCard
              title="Rabattkuponger"
              points="100 poäng = 50 SEK rabatt"
              description="Använd vid ditt nästa köp"
            />
            <RewardCard
              title="Gratis leverans"
              points="50 poäng"
              description="En leverans utan extra kostnad"
            />
            <RewardCard
              title="Exklusiva rätter"
              points="200 poäng"
              description="Tillgång till specialmenyer"
            />
            <RewardCard
              title="Premium-support"
              points="150 poäng"
              description="Prioriterad kundservice"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center rounded-2xl p-12" style={{ backgroundColor: '#f6f2e0' }}>
          <Award size={48} className="mx-auto mb-4" style={{ color: '#fbbf24' }} />
          <h2 className="font-lobster text-3xl text-gray-800 mb-4">
            Redo att börja samla poäng?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Skapa ett konto och börja tjäna guldpoäng vid ditt första köp.
          </p>
          <button
            className="px-8 py-4 rounded-full font-medium text-white transition-all hover:shadow-lg hover:opacity-90 text-lg"
            style={{ backgroundColor: '#56c5c5' }}
          >
            Gå med nu
          </button>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => (
  <div className="rounded-2xl p-8 shadow-lg text-center" style={{ backgroundColor: 'white' }}>
    <div className="mb-4 flex justify-center" style={{ color }}>
      {icon}
    </div>
    <h3 className="font-lobster text-2xl text-gray-800 mb-3">
      {title}
    </h3>
    <p className="text-gray-600">
      {description}
    </p>
  </div>
);

interface EarnPointsCardProps {
  title: string;
  points: string;
  description: string;
}

const EarnPointsCard: React.FC<EarnPointsCardProps> = ({ title, points, description }) => (
  <div className="rounded-xl p-6 bg-white shadow">
    <h4 className="font-lobster text-xl text-gray-800 mb-2">{title}</h4>
    <div className="text-2xl font-bold mb-2" style={{ color: '#fbbf24' }}>
      {points}
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

interface RewardCardProps {
  title: string;
  points: string;
  description: string;
}

const RewardCard: React.FC<RewardCardProps> = ({ title, points, description }) => (
  <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: 'white' }}>
    <h4 className="font-lobster text-xl text-gray-800 mb-2">{title}</h4>
    <div className="text-lg font-bold mb-2" style={{ color: '#56c5c5' }}>
      {points}
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);
