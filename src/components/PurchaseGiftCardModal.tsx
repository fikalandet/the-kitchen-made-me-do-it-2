import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PurchaseGiftCardModalProps {
  chefId: string;
  chefName: string;
  chefAvatar?: string;
  onClose: () => void;
}

export function PurchaseGiftCardModal({ chefId, chefName, chefAvatar, onClose }: PurchaseGiftCardModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    template: 'Green',
    amount: '',
    greeting: '',
    recipient: '',
    deliveryMethod: 'email',
    heading: 'default'
  });

  const headingOptions = [
    {
      id: 'default',
      title: 'Gratis är alltid godast!',
      description: `Grattis, du har precis fått ett presentkort på gratis käk hos kocken ${chefName} på The Kitchen made me do it.`
    },
    {
      id: 'kitchen',
      title: 'Presentkort på The Kitchen-käk!',
      description: `Grattis, du har precis fått ett presentkort på gratis käk hos kocken ${chefName} på The Kitchen made me do it.`
    }
  ];

  const templates = [
    {
      id: 'Green',
      name: 'Grön',
      bgColor: '#a1c798',
      textColor: '#000000',
      logo: '/logotyp_plattformen_grön.png'
    },
    {
      id: 'Beige',
      name: 'Beige',
      bgColor: '#f6f2e0',
      textColor: '#000000',
      logo: '/Logotyp plattformen beige.png'
    }
  ];

  const selectedTemplate = templates.find(t => t.id === formData.template);
  const selectedHeading = headingOptions.find(h => h.id === formData.heading);

  const handlePurchase = async () => {
    const amount = parseFloat(formData.amount);
    if (amount < 50) {
      alert('Minsta belopp är 50 kr');
      return;
    }

    const chefAmount = amount * 0.85;
    const platformAmount = amount * 0.15;

    const code = `GIFT-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const { error } = await supabase
      .from('giftcard_redemptions')
      .insert({
        giftcard_id: null,
        code: code,
        sent_to: formData.recipient,
        delivery_method: formData.deliveryMethod,
        greeting_message: formData.greeting,
        heading: selectedHeading?.title,
        template: formData.template,
        amount: amount,
        payment_split_chef: chefAmount,
        payment_split_platform: platformAmount,
        link_url: `https://thekitchen.se/gift/${code}`
      });

    if (!error) {
      alert('Presentkort köpt! Det skickas nu till mottagaren.');
      onClose();
    } else {
      alert('Ett fel uppstod. Försök igen.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-3xl font-bold text-gray-900 flex-1 text-center" style={{ fontFamily: 'Lobster, cursive' }}>Köp presentkort</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 absolute right-6 top-6">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  1. Välj mall
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setFormData({ ...formData, template: template.id })}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.template === template.id
                          ? 'border-gray-900'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: template.bgColor }}
                    >
                      <div className="text-lg font-semibold" style={{ color: template.textColor }}>
                        {template.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  2. Välj rubrik
                </label>
                <div className="space-y-2">
                  {headingOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setFormData({ ...formData, heading: option.id })}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        formData.heading === option.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{option.title}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  3. Belopp (minst 50 kr)
                </label>
                <input
                  type="number"
                  min="50"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  4. Personlig hälsning (valfritt)
                </label>
                <textarea
                  value={formData.greeting}
                  onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Skriv en personlig hälsning..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  5. Mottagare
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setFormData({ ...formData, deliveryMethod: 'email' })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 ${
                      formData.deliveryMethod === 'email'
                        ? 'border-gray-900 bg-gray-100'
                        : 'border-gray-200'
                    }`}
                  >
                    E-post
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, deliveryMethod: 'sms' })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 ${
                      formData.deliveryMethod === 'sms'
                        ? 'border-gray-900 bg-gray-100'
                        : 'border-gray-200'
                    }`}
                  >
                    SMS
                  </button>
                </div>
                <input
                  type={formData.deliveryMethod === 'email' ? 'email' : 'tel'}
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder={formData.deliveryMethod === 'email' ? 'exempel@email.com' : '+46 70 123 45 67'}
                />
              </div>

            </div>

            <div>
              <div className="sticky top-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Förhandsgranskning</h4>
                <div
                  className="rounded-2xl shadow-lg relative overflow-hidden"
                  style={{
                    backgroundColor: selectedTemplate?.bgColor,
                    height: '420px',
                    border: '8px solid white'
                  }}
                >
                  <div
                    className="rounded-t-xl px-6 py-4"
                    style={{
                      backgroundColor: formData.template === 'Green' ? '#f6f2e0' : '#a1c798',
                      height: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <h2
                      className="text-3xl font-bold text-center"
                      style={{
                        fontFamily: 'Lobster, cursive',
                        color: selectedTemplate?.textColor
                      }}
                    >
                      {selectedHeading?.title || 'Presentkort på gott käk!'}
                    </h2>
                  </div>

                  <div className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <p className="text-2xl font-bold whitespace-nowrap" style={{ color: selectedTemplate?.textColor }}>
                        {formData.amount || '___'} kr
                      </p>
                      <p className="text-sm whitespace-nowrap" style={{ color: selectedTemplate?.textColor }}>hos vår kock</p>
                      <div className="w-12 h-12 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
                        {chefAvatar ? (
                          <img src={chefAvatar} alt={chefName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-xl">👨‍🍳</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm" style={{ color: selectedTemplate?.textColor }}>{chefName}</p>
                    </div>

                    {formData.greeting && (
                      <div
                        className="rounded-lg px-4 py-2 mb-4"
                        style={{ backgroundColor: formData.template === 'Green' ? '#f6f2e0' : '#a1c798' }}
                      >
                        <p className="text-xs text-center" style={{ color: selectedTemplate?.textColor }}>
                          <strong>Personlig hälsning:</strong> {formData.greeting}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                    <div className="w-16 h-16 bg-white rounded p-2 flex-shrink-0">
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                        QR
                      </div>
                    </div>
                    <div className="flex-1 px-4 space-y-0.5 text-center" style={{ color: selectedTemplate?.textColor }}>
                      <p className="text-xs">
                        Giltigt t.o.m: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE')}
                      </p>
                      <p className="text-xs font-mono">
                        Kod: GIFT-XXXX-YYYY
                      </p>
                    </div>
                    <img
                      src={selectedTemplate?.logo}
                      alt="Logo"
                      className="h-16 w-auto flex-shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Avbryt
            </button>
            <button
              onClick={handlePurchase}
              disabled={!formData.amount || !formData.recipient || parseFloat(formData.amount) < 50}
              className="px-6 py-3 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: '#56c5c5' }}
            >
              Köp presentkort
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
