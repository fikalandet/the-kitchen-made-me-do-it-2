import { AdminCard } from '../../components';

interface ChefReviewsTabProps {
  chefId: string;
}

export default function ChefReviewsTab({ chefId }: ChefReviewsTabProps) {
  return (
    <AdminCard>
      <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
        Kundomdömen
      </h3>

      <div className="bg-white rounded-lg p-6">
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-black mb-2">-</p>
          <p className="text-sm text-gray-600">Snittbetyg (av 5)</p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-gray-700 text-sm">
            Här kommer vi visa kundomdömen och snittbetyg för kocken.
          </p>
        </div>
      </div>
    </AdminCard>
  );
}
