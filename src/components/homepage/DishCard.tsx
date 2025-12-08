import React from 'react';
import { DishCardBase } from '../cards/DishCardBase';
import { Calendar, Package } from 'lucide-react';

interface DishCardProps {
  id: string;
  name: string;
  chef_name?: string;
  chef_avatar?: string;
  price: number;
  image_url?: string;
  rating?: number;
  is_new?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  frozen_available?: number;
  subscription_seats_left?: number;
  pickup_available?: boolean;
  pickup_times?: string[];
  delivery_available?: boolean;
  delivery_fee?: number;
}

export const DishCard: React.FC<DishCardProps> = ({
  name,
  chef_name,
  chef_avatar,
  price,
  image_url,
  rating,
  is_new,
  is_vegan,
  is_gluten_free,
  frozen_available,
  subscription_seats_left,
  pickup_available,
  pickup_times,
  delivery_available,
  delivery_fee,
}) => {
  const badges = (
    <>
      {is_new && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Ny
        </div>
      )}
      {is_vegan && (
        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
          Vegansk
        </div>
      )}
      {is_gluten_free && (
        <div className="absolute top-12 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
          GF
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
      {frozen_available && frozen_available > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package size={16} />
          <span>🧊 I frysen: {frozen_available}</span>
        </div>
      )}
      <div className="flex gap-2">
        <button
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
        >
          <Calendar size={14} />
          Förbeställ
        </button>
        {subscription_seats_left && subscription_seats_left > 0 && (
          <button
            className="flex-1 px-3 py-2 text-white rounded-lg text-sm hover:opacity-90"
            style={{ backgroundColor: '#56c5c5' }}
          >
            Prenumerera
          </button>
        )}
      </div>
    </div>
  );

  const deliverySection = (
    <div className="mb-3 flex items-center justify-center gap-4 text-sm">
      {pickup_available && (
        <div className="text-center">
          <span className="font-medium">Upphämtning</span>
          {pickup_times && pickup_times.length > 0 && (
            <div className="text-xs text-gray-600">{pickup_times.join(', ')}</div>
          )}
        </div>
      )}
      {delivery_available && (
        <div className="text-center">
          <span className="font-medium">Utkörning</span>
          {delivery_fee !== undefined && (
            <div className="text-xs text-gray-600">{delivery_fee > 0 ? `${delivery_fee} kr` : 'Gratis'}</div>
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
        Köp
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
