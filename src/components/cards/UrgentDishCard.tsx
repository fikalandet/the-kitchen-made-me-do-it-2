import React from 'react';
import { DishCardBase } from './DishCardBase';
import { Clock, MapPin, Truck } from 'lucide-react';

interface UrgentDishCardProps {
  id: string;
  name: string;
  chef_name: string;
  chef_avatar?: string;
  original_price: number;
  discount_percent: number;
  image_url?: string;
  rating?: number;
  expires_date: string;
  portions_left?: number;
  subscription_seats_left?: number;
  pickup_available?: boolean;
  delivery_available?: boolean;
  delivery_fee?: number;
}

export const UrgentDishCard: React.FC<UrgentDishCardProps> = ({
  name,
  chef_name,
  chef_avatar,
  original_price,
  discount_percent,
  image_url,
  rating,
  expires_date,
  portions_left,
  subscription_seats_left,
  pickup_available,
  delivery_available,
  delivery_fee,
}) => {
  const discounted_price = Math.round(original_price * (1 - discount_percent / 100));

  const badges = (
    <>
      <div
        className="absolute top-2 right-2 text-white px-3 py-1 rounded-full text-xs font-bold"
        style={{ backgroundColor: '#ff8a00' }}
      >
        -{discount_percent}%
      </div>
      {portions_left && portions_left < 5 && (
        <div className="absolute top-12 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          {portions_left} kvar
        </div>
      )}
      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
        Kort datum
      </div>
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

  const priceSection = (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm line-through text-gray-400">{original_price} kr</span>
      <span className="text-xl font-bold" style={{ color: '#ff8a00' }}>
        {discounted_price} kr
      </span>
    </div>
  );

  const availabilitySection = (
    <div className="mb-3 space-y-2">
      <div className="flex items-center gap-2 text-sm text-red-600">
        <Clock size={16} />
        <span>Bäst före: {expires_date}</span>
      </div>
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
        Köp nu
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white">
      <div className="relative h-48">
        {image_url ? (
          <img src={image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        {badges}
        {chef_avatar && (
          <div className="absolute bottom-2 left-2">
            <img
              src={chef_avatar}
              alt={chef_name}
              className="w-16 h-16 rounded-full border-2 border-white object-cover"
            />
          </div>
        )}
      </div>
      <div className="p-4">
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600">{rating}</span>
          </div>
        )}
        <h3 className="font-semibold text-lg text-gray-800 mb-2">{name}</h3>
        {chef_name && <p className="text-sm text-gray-600 mb-2">av {chef_name}</p>}
        {priceSection}
        {subscriptionPill}
        {availabilitySection}
        {deliverySection}
        {buttonSection}
      </div>
    </div>
  );
};
