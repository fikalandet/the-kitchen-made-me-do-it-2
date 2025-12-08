import { Link } from 'react-router-dom';
import { AdminCard } from '../../components';
import { ListOrdered, Grid3x3 } from 'lucide-react';

export default function StartsidaOverview() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Startsidan</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminCard className="hover:shadow-lg transition-shadow">
          <Link to="/admin/webb/startsida/ordning" className="block">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#a1c798] rounded-lg">
                <ListOrdered className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Ordning & synlighet
                </h3>
                <p className="text-sm text-gray-600">
                  Hantera ordning och synlighet för alla sektioner på startsidan.
                </p>
              </div>
            </div>
          </Link>
        </AdminCard>

        <AdminCard className="hover:shadow-lg transition-shadow">
          <Link to="/admin/webb/startsida/sektioner" className="block">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#a1c798] rounded-lg">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Sektioner
                </h3>
                <p className="text-sm text-gray-600">
                  Redigera inställningar för varje sektion på startsidan.
                </p>
              </div>
            </div>
          </Link>
        </AdminCard>
      </div>
    </div>
  );
}
