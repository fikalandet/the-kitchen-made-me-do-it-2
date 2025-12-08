import { useParams, Link } from 'react-router-dom';
import { AdminCard } from '../../components';
import { ArrowLeft } from 'lucide-react';

export default function StaticPageEditor() {
  const { pageSlug } = useParams<{ pageSlug: string }>();

  const pageNames: Record<string, string> = {
    'om-oss': 'Om oss',
    'kontakta-oss': 'Kontakta oss',
    'guldskeden': 'Guldskeden',
    'vara-kockar': 'Våra kockar',
    'faq': 'FAQ',
    'policys-villkor': 'Policys & villkor',
    'sa-funkar-det': 'Så funkar det',
    'samarbeten': 'Samarbeten',
    'blogg-kategorier': 'Blogg & kategorier'
  };

  const pageName = pageSlug ? pageNames[pageSlug] || pageSlug : '';

  return (
    <div>
      <Link
        to="/admin/webb/sidor"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Tillbaka till sidor
      </Link>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Sida: {pageName}</h2>
      <p className="text-gray-600 mb-6">Kommer snart</p>

      <AdminCard>
        <div className="text-center py-12">
          <p className="text-gray-500">
            Här ska sid-editorn enligt webeditor.md användas. Ingen logik implementerad ännu.
          </p>
        </div>
      </AdminCard>
    </div>
  );
}
