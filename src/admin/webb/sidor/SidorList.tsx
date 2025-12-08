import { Link } from 'react-router-dom';
import { AdminCard, AdminTable } from '../../components';
import { Edit } from 'lucide-react';

export default function SidorList() {
  const staticPages = [
    { id: 'om-oss', name: 'Om oss' },
    { id: 'kontakta-oss', name: 'Kontakta oss' },
    { id: 'guldskeden', name: 'Guldskeden' },
    { id: 'vara-kockar', name: 'Våra kockar' },
    { id: 'faq', name: 'FAQ' },
    { id: 'policys-villkor', name: 'Policys & villkor' },
    { id: 'sa-funkar-det', name: 'Så funkar det' },
    { id: 'samarbeten', name: 'Samarbeten' },
    { id: 'blogg-kategorier', name: 'Blogg & kategorier' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Statiska sidor</h2>
      <p className="text-gray-600 mb-6">
        Redigera innehåll för statiska sidor på webbplatsen
      </p>

      <AdminCard>
        <AdminTable>
          <thead>
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Sida</th>
              <th className="text-right py-3 px-4 font-semibold">Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {staticPages.map((page) => (
              <tr key={page.id} className="border-t border-gray-200">
                <td className="py-3 px-4">{page.name}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    to={`/admin/webb/sidor/${page.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Redigera
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
