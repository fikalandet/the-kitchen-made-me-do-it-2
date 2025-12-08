import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, TrendingUp, Users, Award } from 'lucide-react';

export const BecomeChef: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#a1c798' }}>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <ChefHat size={64} className="mx-auto mb-4 text-gray-800" />
            <h1 className="font-lobster text-5xl text-gray-800 mb-4">
              Bli kock på vår plattform
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Dela din passion för matlagning och tjäna pengar på det du älskar.
              Gå med i vår växande gemenskap av hemmakockar.
            </p>
          </div>

          <Link
            to="/login?mode=signup&role=seller"
            className="inline-block px-8 py-4 rounded-full font-medium text-white transition-all hover:shadow-lg hover:opacity-90 text-lg"
            style={{ backgroundColor: '#56c5c5' }}
          >
            Kom igång idag
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-lobster text-3xl text-gray-800 mb-12 text-center">
            Varför bli kock hos oss?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard
              icon={<TrendingUp size={40} />}
              title="Låg provision"
              description="Börja med 15% provision och sänk den till bara 5% med vårt guldmedlemskap"
              color="#56c5c5"
            />
            <BenefitCard
              icon={<Users size={40} />}
              title="Stor räckvidd"
              description="Nå tusentals hungriga kunder i ditt närområde"
              color="#f4a261"
            />
            <BenefitCard
              icon={<Award size={40} />}
              title="Flexibilitet"
              description="Arbeta på dina egna villkor och bestäm själv när du vill laga mat"
              color="#a1c798"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-12 shadow-lg" style={{ backgroundColor: '#f6f2e0' }}>
            <h2 className="font-lobster text-3xl text-gray-800 mb-8 text-center">
              Medlemskapsnivåer
            </h2>
            <div className="space-y-6">
              <MembershipTier
                name="Gratis"
                commission="15%"
                features={[
                  'Upp till 10 produkter',
                  'Meddelandefunktion',
                  'Grundläggande analys'
                ]}
                color="#d1d5db"
              />
              <MembershipTier
                name="Silver"
                commission="10%"
                features={[
                  'Upp till 50 produkter',
                  'Boost dina produkter',
                  'Dela ut guldpoäng',
                  'Meddelandefunktion'
                ]}
                color="#9ca3af"
              />
              <MembershipTier
                name="Guld"
                commission="5%"
                features={[
                  'Obegränsat antal produkter',
                  'Avancerad analys',
                  'Prioriterad support',
                  'Alla funktioner'
                ]}
                color="#fbbf24"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-lobster text-3xl text-gray-800 mb-8">
            Redo att börja?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Det tar bara några minuter att skapa ditt konto och publicera din första maträtt.
          </p>
          <Link
            to="/login?mode=signup&role=seller"
            className="inline-block px-8 py-4 rounded-full font-medium text-white transition-all hover:shadow-lg hover:opacity-90 text-lg"
            style={{ backgroundColor: '#56c5c5' }}
          >
            Skapa ditt konto nu
          </Link>
        </div>
      </section>
    </div>
  );
};

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description, color }) => (
  <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'white' }}>
    <div className="mb-4" style={{ color }}>
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

interface MembershipTierProps {
  name: string;
  commission: string;
  features: string[];
  color: string;
}

const MembershipTier: React.FC<MembershipTierProps> = ({ name, commission, features, color }) => (
  <div className="rounded-xl p-6 border-2" style={{ borderColor: color }}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-lobster text-2xl text-gray-800">{name}</h3>
      <div className="text-right">
        <div className="text-3xl font-bold text-gray-900">{commission}</div>
        <div className="text-sm text-gray-600">provision</div>
      </div>
    </div>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 text-gray-700">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
          {feature}
        </li>
      ))}
    </ul>
  </div>
);
