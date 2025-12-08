import { ShoppingBag, Truck } from 'lucide-react';
import { Logistics } from '../../../lib/types/card';

interface LogisticsRowProps {
  logistics: Logistics;
}

export function LogisticsRow({ logistics }: LogisticsRowProps) {
  const hasPickup = logistics.pickup.enabled;
  const hasDelivery = logistics.delivery.enabled;

  if (!hasPickup && !hasDelivery) {
    return null;
  }

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-center gap-4 mb-1">
        {hasPickup && (
          <div className="flex items-center gap-1">
            <ShoppingBag size={14} className="text-gray-600" />
            <span className="text-xs text-gray-700">Uphämtning</span>
          </div>
        )}
        {hasDelivery && (
          <div className="flex items-center gap-1">
            <Truck size={14} className="text-gray-600" />
            <span className="text-xs text-gray-700">Utkörning</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
        {hasPickup && logistics.pickup.hours && (
          <span>{logistics.pickup.hours}</span>
        )}
        {hasDelivery && logistics.delivery.hours && (
          <span>{logistics.delivery.hours}</span>
        )}
      </div>
    </div>
  );
}
