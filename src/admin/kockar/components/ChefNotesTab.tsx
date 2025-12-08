import { useState } from 'react';
import { AdminCard } from '../../components';

interface ChefNotesTabProps {
  chefId: string;
}

export default function ChefNotesTab({ chefId }: ChefNotesTabProps) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = () => {
    setSaving(true);
    setMessage('Anteckningsfunktion implementeras senare.');

    setTimeout(() => {
      setSaving(false);
      setMessage('');
    }, 2000);
  };

  return (
    <AdminCard>
      <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
        Anteckningar
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Interna anteckningar om kocken
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-black resize-none"
            placeholder="Skriv anteckningar här..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Sparar...' : 'Spara anteckningar'}
        </button>

        {message && (
          <p className="text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </AdminCard>
  );
}
