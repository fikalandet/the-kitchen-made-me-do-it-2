import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { AdminCard } from '../../components';
import { GripVertical, Eye, EyeOff, Edit, Loader, Save } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  slug: string;
  visible: boolean;
  order_index: number;
}

export default function Ordning() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_sections')
        .select('id, name, slug, visible, order_index')
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      setSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError('Kunde inte hämta sektioner från databasen.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('site_sections')
        .update({ visible: !currentVisible })
        .eq('id', id);

      if (updateError) throw updateError;

      setSections(sections.map(s =>
        s.id === id ? { ...s, visible: !currentVisible } : s
      ));
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert('Kunde inte uppdatera synlighet. Försök igen.');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];

    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);

    setSections(newSections);
    setDraggedIndex(index);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const saveOrder = async () => {
    try {
      setSaving(true);
      setError(null);

      const updates = sections.map((section, index) => ({
        id: section.id,
        order_index: index + 1
      }));

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('site_sections')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (updateError) throw updateError;
      }

      setHasChanges(false);
      alert('Ordningen har sparats!');
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Kunde inte spara ordningen. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Startsidan – ordning & synlighet</h2>
        <AdminCard>
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-[#a1c798]" />
            <span className="ml-3 text-gray-600">Laddar sektioner...</span>
          </div>
        </AdminCard>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Startsidan – ordning & synlighet</h2>
        <AdminCard>
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        </AdminCard>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Startsidan – ordning & synlighet</h2>
          <p className="text-gray-600">
            Dra sektioner för att ändra ordning. Klicka på ögat för att visa/dölja sektioner.
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={saveOrder}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] disabled:opacity-50 transition-colors"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Sparar...' : 'Spara ordning'}
          </button>
        )}
      </div>

      <AdminCard>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-4 p-4 bg-white border rounded-lg transition-all cursor-move hover:shadow-md ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${
                !section.visible ? 'opacity-60' : ''
              }`}
            >
              <div className="cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex-1">
                <h3 className={`font-medium ${!section.visible ? 'text-gray-500' : 'text-gray-900'}`}>
                  {section.name}
                </h3>
                <p className="text-sm text-gray-500">{section.slug}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleVisibility(section.id, section.visible)}
                  className={`p-2 rounded-lg transition-colors ${
                    section.visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={section.visible ? 'Dölj sektion' : 'Visa sektion'}
                >
                  {section.visible ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>

                <Link
                  to={`/admin/webb/startsida/sektioner/${section.slug}`}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  title="Redigera sektion"
                >
                  <Edit className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      {hasChanges && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Du har osparade ändringar. Klicka på "Spara ordning" för att spara.
          </p>
        </div>
      )}
    </div>
  );
}
