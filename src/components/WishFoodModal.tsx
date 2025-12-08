import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WishFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  infoText?: string;
  kitchenName: string;
}

export const WishFoodModal: React.FC<WishFoodModalProps> = ({ isOpen, onClose, infoText, kitchenName }) => {
  const [wishText, setWishText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!wishText.trim()) return;

    setSubmitting(true);

    // TODO: Save wish to database
    console.log('Wish submitted:', wishText);

    setTimeout(() => {
      setSubmitting(false);
      setWishText('');
      onClose();
      alert('Din önskan har skickats till kocken!');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-lobster text-2xl text-gray-800">
            Önska käk från {kitchenName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {infoText && infoText.trim() !== '' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">{infoText}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vad skulle du vilja beställa?
            </label>
            <textarea
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              placeholder="Beskriv din önskan så detaljerat som möjligt..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleSubmit}
            disabled={!wishText.trim() || submitting}
            className="px-6 py-2 rounded-lg text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#56c5c5' }}
          >
            {submitting ? 'Skickar...' : 'Skicka önskan'}
          </button>
        </div>
      </div>
    </div>
  );
};
