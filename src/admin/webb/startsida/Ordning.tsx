import { AdminCard } from '../../components';

export default function Ordning() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Startsidan – ordning & synlighet</h2>
      <p className="text-gray-600 mb-6">Kommer snart</p>

      <AdminCard>
        <div className="text-center py-12">
          <p className="text-gray-500">
            Här ska vi kunna sortera sektioner och slå av/på dem enligt webeditor.md.
          </p>
        </div>
      </AdminCard>
    </div>
  );
}
