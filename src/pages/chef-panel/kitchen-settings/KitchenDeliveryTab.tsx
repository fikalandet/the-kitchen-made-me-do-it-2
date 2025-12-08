import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Truck, Home, MapPin, Plus, X } from 'lucide-react';

interface DistanceRange {
  min: number;
  max: number;
  price: number;
}

export const KitchenDeliveryTab: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [deliverySettings, setDeliverySettings] = useState({
    pickup: false,
    delivery: false,
    maxDistance: 10,
    pricePerKm: 15,
    freeDeliveryThreshold: 500,
    customerNotes: '',
    pricingType: 'per_km' as 'per_km' | 'distance_range',
  });

  const [distanceRanges, setDistanceRanges] = useState<DistanceRange[]>([]);

  useEffect(() => {
    if (user) {
      fetchDeliverySettings();
    }
  }, [user]);

  const fetchDeliverySettings = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('pickup_available, delivery_available, max_delivery_distance, delivery_price_per_km, free_delivery_threshold, delivery_customer_notes, delivery_pricing_type, delivery_distance_ranges')
      .eq('id', user?.id)
      .single();

    if (data) {
      setDeliverySettings({
        pickup: data.pickup_available || false,
        delivery: data.delivery_available || false,
        maxDistance: data.max_delivery_distance || 10,
        pricePerKm: data.delivery_price_per_km || 15,
        freeDeliveryThreshold: data.free_delivery_threshold || 500,
        customerNotes: data.delivery_customer_notes || '',
        pricingType: data.delivery_pricing_type || 'per_km',
      });
      setDistanceRanges(data.delivery_distance_ranges || []);
    }
  };

  const handleChange = (field: string, value: any) => {
    setDeliverySettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const addDistanceRange = () => {
    const lastRange = distanceRanges[distanceRanges.length - 1];
    const newMin = lastRange ? lastRange.max + 1 : 1;
    setDistanceRanges([...distanceRanges, { min: newMin, max: newMin + 10, price: 40 }]);
    setHasChanges(true);
  };

  const updateDistanceRange = (index: number, field: keyof DistanceRange, value: number) => {
    const updated = [...distanceRanges];
    updated[index] = { ...updated[index], [field]: value };
    setDistanceRanges(updated);
    setHasChanges(true);
  };

  const removeDistanceRange = (index: number) => {
    setDistanceRanges(distanceRanges.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          pickup_available: deliverySettings.pickup,
          delivery_available: deliverySettings.delivery,
          max_delivery_distance: deliverySettings.maxDistance,
          delivery_price_per_km: deliverySettings.pricePerKm,
          free_delivery_threshold: deliverySettings.freeDeliveryThreshold,
          delivery_customer_notes: deliverySettings.customerNotes,
          delivery_pricing_type: deliverySettings.pricingType,
          delivery_distance_ranges: distanceRanges,
        })
        .eq('id', user?.id);

      if (error) throw error;

      setHasChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      alert('Kunde inte spara. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lobster text-3xl text-gray-800 mb-2">Leveranssätt</h2>
        <p className="text-gray-600">Välj hur kunder kan ta emot sina beställningar</p>
      </div>

      <div className="rounded-lg shadow p-6 space-y-6" style={{ backgroundColor: '#f6f2e0' }}>
        <div>
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Leveransalternativ</h3>
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <input
                type="checkbox"
                checked={deliverySettings.pickup}
                onChange={(e) => handleChange('pickup', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Home size={20} />
                  <span className="font-medium text-gray-800">Upphämtning</span>
                </div>
                <p className="text-sm text-gray-600">Kunden hämtar sin beställning hos dig</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <input
                type="checkbox"
                checked={deliverySettings.delivery}
                onChange={(e) => handleChange('delivery', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Truck size={20} />
                  <span className="font-medium text-gray-800">Utkörning</span>
                </div>
                <p className="text-sm text-gray-600">Du levererar beställningen till kunden</p>
              </div>
            </label>
          </div>
        </div>

        {deliverySettings.delivery && (
          <div className="border-t border-gray-300 pt-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <MapPin size={20} />
              Leveransinställningar
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maxavstånd för leverans (km)
              </label>
              <input
                type="number"
                value={deliverySettings.maxDistance}
                onChange={(e) => handleChange('maxDistance', parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kunder inom {deliverySettings.maxDistance} km kan beställa utkörning
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prissättning
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={deliverySettings.pricingType === 'per_km'}
                    onChange={() => handleChange('pricingType', 'per_km')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Pris per kilometer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={deliverySettings.pricingType === 'distance_range'}
                    onChange={() => handleChange('pricingType', 'distance_range')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Fastpris per avståndsintervall</span>
                </label>
              </div>
            </div>

            {deliverySettings.pricingType === 'per_km' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pris per kilometer (SEK)
                </label>
                <input
                  type="number"
                  value={deliverySettings.pricePerKm}
                  onChange={(e) => handleChange('pricePerKm', parseInt(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leveranskostnad beräknas automatiskt baserat på avstånd
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Avståndsintervall
                  </label>
                  <button
                    onClick={addDistanceRange}
                    className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg text-white"
                    style={{ backgroundColor: '#56c5c5' }}
                  >
                    <Plus size={16} />
                    Lägg till
                  </button>
                </div>
                {distanceRanges.length === 0 ? (
                  <p className="text-sm text-gray-600">Inga intervall tillagda ännu. Klicka på "Lägg till" för att skapa ett.</p>
                ) : (
                  <div className="space-y-2">
                    {distanceRanges.map((range, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Från (km)</label>
                            <input
                              type="number"
                              value={range.min}
                              onChange={(e) => updateDistanceRange(index, 'min', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Till (km)</label>
                            <input
                              type="number"
                              value={range.max}
                              onChange={(e) => updateDistanceRange(index, 'max', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Pris (SEK)</label>
                            <input
                              type="number"
                              value={range.price}
                              onChange={(e) => updateDistanceRange(index, 'price', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeDistanceRange(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fri leverans vid order över (SEK)
              </label>
              <input
                type="number"
                value={deliverySettings.freeDeliveryThreshold}
                onChange={(e) => handleChange('freeDeliveryThreshold', parseInt(e.target.value))}
                min="0"
                step="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ange 0 för att aldrig erbjuda fri leverans
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-300 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kommentar till kunder
          </label>
          <textarea
            value={deliverySettings.customerNotes}
            onChange={(e) => handleChange('customerNotes', e.target.value)}
            placeholder="T.ex. 'Kontakta mig för exakt leveranstid' eller 'Upphämtning mellan 16-18'"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Denna text visas för kunder när de beställer
          </p>
        </div>

        <div className="border-t border-gray-300 pt-6">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#56c5c5', color: 'white' }}>
            <h4 className="font-semibold mb-2">Aktiva leveranssätt</h4>
            <ul className="space-y-1 text-sm">
              {deliverySettings.pickup && <li>✓ Upphämtning</li>}
              {deliverySettings.delivery && (
                <li>
                  ✓ Utkörning (max {deliverySettings.maxDistance} km
                  {deliverySettings.pricingType === 'per_km'
                    ? `, ${deliverySettings.pricePerKm} SEK/km`
                    : `, ${distanceRanges.length} prisintervall`})
                </li>
              )}
              {!deliverySettings.pickup && !deliverySettings.delivery && (
                <li className="text-yellow-200">⚠ Inga leveranssätt valda</li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving || (!deliverySettings.pickup && !deliverySettings.delivery)}
            className="px-6 py-2 rounded-lg text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#56c5c5' }}
          >
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-lg shadow-lg p-4 animate-fade-in" style={{ backgroundColor: '#56c5c5' }}>
          <p className="text-white font-medium">✓ Sparat!</p>
        </div>
      )}
    </div>
  );
};
