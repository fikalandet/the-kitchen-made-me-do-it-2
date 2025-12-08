import React from 'react';
import { DishCardBase } from '../cards/DishCardBase';
import { Clock, Truck, MapPin } from 'lucide-react';

interface LiveDishCardProps {
  id: string;
  name: string;
  chef_name: string;
  chef_avatar?: string;
  price: number;
  image_url?: string;
  rating?: number;
  cook_date: string;
  cook_times?: string[];
  portions_left?: number;
  subscription_seats_left?: number;
  pickup_available?: boolean;
  delivery_available?: boolean;
  delivery_fee?: number;
}

export const LiveDishCard: React.FC<LiveDishCardProps> = ({
  name,
  chef_name,
  chef_avatar,
  price,
  image_url,
  rating,
  cook_date,
  cook_times,
  portions_left,
  subscription_seats_left,
  pickup_available,
  delivery_available,
  delivery_fee,
}) => {
  const badges = (
    <>
      {portions_left && portions_left < 5 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          {portions_left} kvar
        </div>
      )}
    </>
  );

  const subscriptionPill = subscription_seats_left && subscription_seats_left > 0 ? (
    <div
      className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-3"
      style={{ backgroundColor: '#56c5c5' }}
    >
      Prenumerera – {subscription_seats_left} kvar
    </div>
  ) : null;

  const availabilitySection = (
    <div className="mb-3 space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock size={16} />
        <span>{cook_date}</span>
      </div>
      {cook_times && cook_times.length > 0 && (
        <div className="text-xs text-gray-600">
          Tider: {cook_times.join(', ')}
        </div>
      )}
    </div>
  );

  const deliverySection = (
    <div className="mb-3 flex items-center justify-center gap-4 text-sm">
      {pickup_available && (
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span className="font-medium">Upphämtning</span>
        </div>
      )}
      {delivery_available && (
        <div className="flex items-center gap-1">
          <Truck size={14} />
          <span className="font-medium">Utkörning</span>
          {delivery_fee !== undefined && (
            <span className="text-xs text-gray-600 ml-1">
              {delivery_fee > 0 ? `${delivery_fee} kr` : 'Gratis'}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const buttonSection = (
    <div className="flex items-center justify-center gap-3">
      <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50">
        Mer info
      </button>
      <button
        className="px-4 py-2 text-white rounded-full text-sm hover:opacity-90"
        style={{ backgroundColor: '#56c5c5' }}
      >
        Boka
      </button>
    </div>
  );

  return (
    <DishCardBase
      image_url={image_url}
      title={name}
      price={price}
      chef_name={chef_name}
      chef_avatar={chef_avatar}
      rating={rating}
      badges={badges}
      subscriptionPill={subscriptionPill}
      availabilitySection={availabilitySection}
      deliverySection={deliverySection}
      buttonSection={buttonSection}
    />
  );
};
