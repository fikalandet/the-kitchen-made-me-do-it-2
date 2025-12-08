import React, { useState } from 'react';
import { Building2, CreditCard, AlertCircle } from 'lucide-react';

export const KitchenBankTab: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [accountType, setAccountType] = useState<'f-skatt' | 'egenanstallning'>('f-skatt');
  const [formData, setFormData] = useState({
    orgNumber: '',
    companyName: '',
    iban: '',
    swish: '',
    klarnaEmail: '',
    employmentCompany: '',
    employmentId: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const isValid = () => {
    if (accountType === 'f-skatt') {
      return formData.orgNumber && formData.companyName && (formData.iban || formData.swish);
    } else {
      return formData.employmentCompany && formData.employmentId;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lobster text-3xl text-gray-800 mb-2">Bank & Företag</h2>
        <p className="text-gray-600">Hantera dina betalningsuppgifter</p>
      </div>

      <div className="rounded-lg shadow p-6 space-y-6" style={{ backgroundColor: '#f6f2e0' }}>
        <div>
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Typ av verksamhet</h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <input
                type="radio"
                name="accountType"
                checked={accountType === 'f-skatt'}
                onChange={() => {
                  setAccountType('f-skatt');
                  setHasChanges(true);
                }}
                className="w-5 h-5 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={20} />
                  <span className="font-medium text-gray-800">F-skatt</span>
                </div>
                <p className="text-sm text-gray-600">Eget företag med F-skattsedel</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <input
                type="radio"
                name="accountType"
                checked={accountType === 'egenanstallning'}
                onChange={() => {
                  setAccountType('egenanstallning');
                  setHasChanges(true);
                }}
                className="w-5 h-5 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={20} />
                  <span className="font-medium text-gray-800">Egenanställning</span>
                </div>
                <p className="text-sm text-gray-600">T.ex. Frilans Finans, Cool Company, Gigstr</p>
              </div>
            </label>
          </div>
        </div>

        {accountType === 'f-skatt' && (
          <div className="border-t border-gray-300 pt-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Företagsinformation</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organisationsnummer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.orgNumber}
                onChange={(e) => handleChange('orgNumber', e.target.value)}
                placeholder="123456-7890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Företagsnamn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Ditt Företag AB"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Betalningsalternativ</h4>
              <p className="text-sm text-gray-600 mb-4">Minst ett betalningssätt måste anges</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN / Kontonummer
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => handleChange('iban', e.target.value)}
                    placeholder="SE00 0000 0000 0000 0000 0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Swish
                  </label>
                  <input
                    type="text"
                    value={formData.swish}
                    onChange={(e) => handleChange('swish', e.target.value)}
                    placeholder="123 456 78 90"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Klarna (e-post)
                  </label>
                  <input
                    type="email"
                    value={formData.klarnaEmail}
                    onChange={(e) => handleChange('klarnaEmail', e.target.value)}
                    placeholder="din@email.se"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {accountType === 'egenanstallning' && (
          <div className="border-t border-gray-300 pt-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Egenanställningsföretag</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Välj företag <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.employmentCompany}
                onChange={(e) => handleChange('employmentCompany', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Välj...</option>
                <option value="frilans-finans">Frilans Finans</option>
                <option value="cool-company">Cool Company</option>
                <option value="gigstr">Gigstr</option>
                <option value="other">Annat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ditt ID-nummer hos företaget <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.employmentId}
                onChange={(e) => handleChange('employmentId', e.target.value)}
                placeholder="T.ex. FF123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Detta nummer hittar du i ditt konto hos egenanställningsföretaget
              </p>
            </div>
          </div>
        )}

        {!isValid() && (
          <div className="rounded-lg p-4 border-2 border-yellow-400 bg-yellow-50">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Ofullständig information</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Du måste fylla i alla obligatoriska fält innan du kan börja sälja
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving || !isValid()}
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
