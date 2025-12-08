import { AdminCard } from '../../components';

export default function Header() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Header & navigationsmeny – inställningar</h2>
      <p className="text-gray-600 mb-6">Kommer snart</p>

      <AdminCard>
        <div className="text-center py-12">
          <p className="text-gray-500">
            Denna sida ska byggas enligt webeditor.md. Inga funktioner implementerade ännu.
          </p>
        </div>
      </AdminCard>
    </div>
  );
}
