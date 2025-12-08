import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { BoostWizard } from '../pages/chef-panel/marketing/BoostWizard';

interface BoostProductModalProps {
  productId: string;
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BoostProductModal: React.FC<BoostProductModalProps> = ({
  productId,
  productTitle,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ backgroundColor: '#ffffff' }}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#f6f2e0' }}>
          <div>
            <h2 className="font-lobster text-2xl text-gray-800">Boosta denna produkt</h2>
            <p className="text-sm text-gray-600 mt-1">{productTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#f6f2e0' }}>
            <p className="text-sm text-gray-700 mb-2">
              Du kan boosta denna produkt direkt här, eller öppna den fullständiga boost-sidan för fler alternativ.
            </p>
            <a
              href={`/chef-panel?tab=marketing&subtab=boost&productId=${productId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
              style={{ backgroundColor: '#56c5c5' }}
            >
              <ExternalLink size={16} />
              Öppna full boost-sida
            </a>
          </div>

          <BoostWizard preselectedProductId={productId} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
