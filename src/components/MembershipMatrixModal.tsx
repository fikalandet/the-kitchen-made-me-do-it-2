import React from 'react';
import { X, Check } from 'lucide-react';

interface MembershipMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembershipMatrixModal: React.FC<MembershipMatrixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const renderCell = (value: string | boolean) => {
    if (value === true || value === '✔') {
      return <Check size={20} style={{ color: '#a1c798' }} className="mx-auto" />;
    }
    if (value === false || value === '–' || value === '') {
      return <span className="text-black text-center block">–</span>;
    }
    return <span className="text-black text-sm text-center block">{value}</span>;
  };

  const salesData = [
    { name: 'Provision', free: '80 %', silver: '80 %', gold: '85 %' },
    { name: 'Egen kökssida', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Antal maträtter i menyn', free: '5 st', silver: 'Obegränsat', gold: 'Obegränsat' },
    { name: 'Tillbehör valbart', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Bilder per maträtt', free: '1 st', silver: '2 st', gold: '5 st' },
    { name: 'Öppet / Stängt-indikator', free: '✔', silver: '✔', gold: '✔' },
    { name: 'På spisen nu', free: '✔', silver: '✔', gold: '✔' },
    { name: 'I frysen', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Förhandsbeställ', free: '–', silver: '✔', gold: '✔' },
    { name: 'Önska käk', free: '–', silver: '✔', gold: '✔' },
    { name: 'Matlådekassar', free: '–', silver: '✔', gold: '✔' },
    { name: 'Laga-själv-kit', free: '–', silver: '✔', gold: '✔' },
    { name: 'Käk-prenumeranter', free: '–', silver: '✔', gold: '✔' },
    { name: 'Receptförsäljning', free: '–', silver: '✔', gold: '✔' },
    { name: 'Testkäka & Tyck till', free: '–', silver: '✔', gold: '✔' },
    { name: 'Catering', free: '–', silver: '–', gold: '✔' },
    { name: 'Hyr mig som kock', free: '–', silver: '–', gold: '✔' },
    { name: 'Matvideos / kurser', free: '–', silver: '–', gold: '✔' },
    { name: 'Digitala workshops', free: '–', silver: '–', gold: '✔' },
  ];

  const toolsData = [
    { name: 'Tillgänglighetskalender', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Chattfunktion med kunder', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Livsmedelssäkerhetsutbildning', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Egenkontrollprogram (HACCP)', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Inspiration & guider 50 +', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Instruktionsvideos', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Kul för barn', free: '✔', silver: '✔', gold: '✔' },
    { name: 'AI-tips', free: 'Basic', silver: 'Basic', gold: 'Avancerad' },
    { name: 'Support & rådgivning', free: 'FAQ + mail', silver: 'FAQ + mail', gold: 'Prioriterad' },
    { name: 'Rabatt på förpackningar', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Rabatt på köksutrustning', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Lagerkoll / nedräkning', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Digitala smaketiketter', free: '–', silver: '✔', gold: '✔' },
    { name: 'Skapa recept', free: '–', silver: '10 st mallar', gold: '20 st mallar' },
    { name: 'Receptskalning', free: '–', silver: '✔', gold: '✔' },
    { name: 'Ingrediensdatabas', free: '–', silver: '–', gold: '✔' },
    { name: 'Näringsvärdesgenerator', free: '–', silver: '–', gold: '✔' },
    { name: 'Automatiska inköpslistor', free: '–', silver: '–', gold: '✔' },
    { name: 'Plocka-och-packa-lista', free: '–', silver: '–', gold: '✔' },
    { name: 'Ruttplanering', free: '–', silver: '–', gold: '✔' },
    { name: 'Guldrådet (årlig förbättringsträff)', free: '–', silver: '–', gold: '✔' },
  ];

  const marketingData = [
    { name: 'Synlighet på startsidan', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Recensioner & omdömen', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Markeras som favorit', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Boosting av maträtt / event / kök', free: 'Köps separat', silver: 'Köps separat', gold: '200 kr/mån + 20 % rabatt på övrigt' },
    { name: 'Medverka på TKMDDI event', free: 'I mån av plats', silver: 'I mån av plats', gold: 'Prioriterad' },
    { name: 'Skapa egna evenemang', free: '–', silver: '✔', gold: '✔' },
    { name: 'Dela ut guldpoäng till kunder', free: '–', silver: '200 poäng/mån', gold: '400 poäng/mån' },
    { name: 'Veckans kockar (startsidan)', free: '–', silver: '✔', gold: '✔' },
    { name: 'Välkomstvideo på kökssidan', free: '–', silver: '✔', gold: '✔' },
    { name: 'Ladda upp reels (Tjuvkik i köket)', free: '–', silver: '✔', gold: '✔' },
    { name: 'Sociala medier-exponering', free: '–', silver: 'I mån av plats', gold: 'Prioriterad' },
    { name: 'Kock i fokus (reportage)', free: '–', silver: 'I mån av plats', gold: 'Prioriterad' },
    { name: 'Samla Kitchen-poäng', free: '–', silver: '✔', gold: '✔' },
    { name: 'Månatlig kitchen-tävling', free: '–', silver: '✔', gold: '✔' },
    { name: 'Skapa egna kampanjer', free: '–', silver: '✔', gold: '✔' },
    { name: 'Skapa egna nyhetsbrev', free: '–', silver: '–', gold: '✔' },
    { name: 'Skapa egna tävlingar', free: '–', silver: '–', gold: '✔' },
    { name: 'Skapa egna presentkort', free: '–', silver: '–', gold: '✔' },
    { name: 'Skapa egna kuponger', free: '–', silver: '–', gold: '✔' },
    { name: 'Prioriterad synlighet vid sök', free: '–', silver: '–', gold: '✔' },
    { name: 'Kundfavorit-etikett', free: '–', silver: '–', gold: '✔' },
    { name: 'Möjlighet att blogga på plattformen', free: '–', silver: '–', gold: '✔' },
    { name: 'Årlig kokbok / kockbidrag', free: '–', silver: '–', gold: '✔' },
  ];

  const statisticsData = [
    { name: 'Försäljning & intäkter', free: '', silver: '', gold: '', isHeader: true },
    { name: '– Antal sålda rätter / Total per månad', free: '✔', silver: '✔', gold: '✔' },
    { name: '– Full försäljningsdashboard / prognoser / trender', free: '–', silver: '✔', gold: '✔' },
    { name: '– Jämförelse med andra Guld-kockar', free: '–', silver: '–', gold: '✔' },
    { name: 'Kundstatistik', free: '', silver: '', gold: '', isHeader: true },
    { name: '– Antal / nya / återkommande kunder', free: '✔', silver: '✔', gold: '✔' },
    { name: '– Nöjdhetsindex / livstidsvärde / retention-rate', free: '–', silver: '✔', gold: '✔' },
    { name: 'Produktprestanda', free: '', silver: '', gold: '', isHeader: true },
    { name: '– Mest sålda rätter / Top 5', free: '✔', silver: '✔', gold: '✔' },
    { name: '– Full produktranking / Stjärnrätter', free: '–', silver: '✔', gold: '✔' },
    { name: 'Drömpoäng & tävlingar', free: '', silver: '', gold: '', isHeader: true },
    { name: '– Poänghistorik / topplistor / flöde / resultat', free: '–', silver: '✔', gold: '✔' },
    { name: 'Synlighet & räckvidd', free: '', silver: '', gold: '', isHeader: true },
    { name: '– Visningar på kökssidan / per rätt', free: '✔', silver: '✔', gold: '✔' },
    { name: '– Djupanalys (kanaler / trafikkällor)', free: '–', silver: '✔', gold: '✔' },
    { name: 'Recensioner & betyg', free: '', silver: '', gold: '', isHeader: true },
    { name: '– Genomsnittsbetyg / trender / ordcloud', free: '✔', silver: '✔', gold: '✔' },
    { name: 'Marknadsföringseffekt', free: '', silver: '', gold: '', isHeader: true },
    { name: '– Klickstatistik / kampanjspårning / UTM', free: '–', silver: '✔', gold: '✔' },
    { name: 'Tips & insikter', free: '', silver: '', gold: '', isHeader: true },
    { name: '– AI-insikter och månatliga förbättringsförslag', free: '–', silver: '✔', gold: '✔' },
    { name: 'Benchmarking & ranking', free: '', silver: '', gold: '', isHeader: true },
    { name: '– Regional ranking / Top Kitchen 10', free: '–', silver: '✔', gold: '✔' },
  ];

  const renderTable = (title: string, data: any[]) => (
    <div className="mb-8">
      <h3 className="font-lobster text-2xl text-black mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-black p-3 text-left bg-white font-lobster text-lg">Funktion</th>
              <th className="border border-black p-3 text-center bg-white font-lobster text-lg">Gratis</th>
              <th className="border border-black p-3 text-center font-lobster text-lg" style={{ backgroundColor: '#f6f2e0' }}>Silver<br/><span className="text-sm font-normal">(299 kr/mån)</span></th>
              <th className="border border-black p-3 text-center font-lobster text-lg" style={{ backgroundColor: '#a1c798' }}>Guld<br/><span className="text-sm font-normal">(499 kr/mån)</span></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const isHeader = row.isHeader;
              return (
                <tr key={index}>
                  <td className={`border border-black p-3 text-left ${isHeader ? 'font-bold bg-gray-100' : 'bg-white'}`}>
                    {row.name}
                  </td>
                  <td className={`border border-black p-3 ${isHeader ? 'bg-gray-100' : 'bg-white'}`}>
                    {!isHeader && renderCell(row.free)}
                  </td>
                  <td className={`border border-black p-3 ${isHeader ? 'bg-gray-100' : ''}`} style={{ backgroundColor: isHeader ? '#e5e7eb' : '#f6f2e0' }}>
                    {!isHeader && renderCell(row.silver)}
                  </td>
                  <td className={`border border-black p-3 ${isHeader ? 'bg-gray-100' : ''}`} style={{ backgroundColor: isHeader ? '#e5e7eb' : '#a1c798' }}>
                    {!isHeader && renderCell(row.gold)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#f6f2e0' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-black" style={{ backgroundColor: '#f6f2e0' }}>
          <h2 className="font-lobster text-3xl text-black">Medlemskapsöversikt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
          >
            <X size={24} className="text-black" />
          </button>
        </div>

        <div className="p-6">
          {renderTable('🍽️ Försäljning & produkter', salesData)}
          {renderTable('🧰 Verktyg & material', toolsData)}
          {renderTable('📣 Synlighet & marknadsföring', marketingData)}
          {renderTable('📊 Statistik', statisticsData)}
        </div>
      </div>
    </div>
  );
};
