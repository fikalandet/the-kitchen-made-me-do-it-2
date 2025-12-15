import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard, AdminButton } from '../../components';
import { ArrowLeft, Save, Eye, Plus, Trash2, ChevronUp, ChevronDown, Edit } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ColorPicker from '../components/ColorPicker';
import TextLinesEditor from '../components/TextLinesEditor';
import { TextLines } from '../../../lib/types/landingPage';

interface FAQPageData {
  id?: string;
  title_text: string;
  title_font: string;
  title_weight: string;
  title_size: string;
  title_color: string;
  title_align: string;
  text_lines: TextLines;
  tagline_font: string;
  tagline_weight: string;
  tagline_size: string;
  tagline_color: string;
  tagline_align: string;
  ingress_text: string | null;
  ingress_font: string;
  ingress_weight: string;
  ingress_size: string;
  ingress_color: string;
  ingress_align: string;
  background_type: string;
  background_color: string;
  background_image: string | null;
}

interface FAQCategory {
  id?: string;
  title: string;
  styles: {
    font: string;
    weight: string;
    size: string;
    color: string;
    align: string;
    background_color: string;
    icon: string | null;
  };
  question_background_color: string;
  answer_background_color: string;
  question_font: string;
  question_weight: string;
  question_size: string;
  question_color: string;
  answer_font: string;
  answer_weight: string;
  answer_size: string;
  answer_color: string;
  order_index: number;
  is_published: boolean;
}

interface FAQItem {
  id?: string;
  category_id: string;
  question: string;
  answer: string;
  order_index: number;
  is_published: boolean;
}

export default function FAQEditor() {
  const [pageData, setPageData] = useState<FAQPageData>({
    title_text: 'Vanliga frågor',
    title_font: 'lobster',
    title_weight: 'bold',
    title_size: 'xl',
    title_color: '#000000',
    title_align: 'center',
    text_lines: {
      lines: [],
      rotate: false,
      interval_seconds: 10,
      placement: 'after_heading'
    },
    tagline_font: 'poppins',
    tagline_weight: 'normal',
    tagline_size: 'lg',
    tagline_color: '#374151',
    tagline_align: 'center',
    ingress_text: null,
    ingress_font: 'poppins',
    ingress_weight: 'normal',
    ingress_size: 'lg',
    ingress_color: '#374151',
    ingress_align: 'center',
    background_type: 'color',
    background_color: '#f6f2e0',
    background_image: null
  });

  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [items, setItems] = useState<FAQItem[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pageRes, categoriesRes, itemsRes] = await Promise.all([
        supabase.from('faq_page').select('*').maybeSingle(),
        supabase.from('faq_categories').select('*').order('order_index'),
        supabase.from('faq_items').select('*').order('order_index')
      ]);

      if (pageRes.data) setPageData(pageRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (itemsRes.data) setItems(itemsRes.data);
    } catch (err) {
      console.error('Error fetching FAQ data:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('faq_page')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          ...pageData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Sidan har sparats!');
    } catch (err) {
      console.error('Error saving page:', err);
      alert('Ett fel uppstod vid sparande.');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async () => {
    const newCategory: FAQCategory = {
      title: 'Ny kategori',
      styles: {
        font: 'poppins',
        weight: 'semibold',
        size: 'lg',
        color: '#000000',
        align: 'center',
        background_color: '#ffffff',
        icon: null
      },
      question_background_color: '#f9fafb',
      answer_background_color: '#ffffff',
      question_font: 'poppins',
      question_weight: 'semibold',
      question_size: 'base',
      question_color: '#000000',
      answer_font: 'poppins',
      answer_weight: 'normal',
      answer_size: 'base',
      answer_color: '#374151',
      order_index: categories.length,
      is_published: true
    };

    try {
      const { data, error } = await supabase
        .from('faq_categories')
        .insert(newCategory)
        .select()
        .single();

      if (error) throw error;
      if (data) setCategories([...categories, data]);
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Ett fel uppstod.');
    }
  };

  const saveCategory = async (category: FAQCategory) => {
    try {
      const { error } = await supabase
        .from('faq_categories')
        .update(category)
        .eq('id', category.id);

      if (error) throw error;
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Ett fel uppstod.');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna kategori?')) return;

    try {
      const { error } = await supabase
        .from('faq_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Ett fel uppstod.');
    }
  };

  const moveCategoryUp = async (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];

    try {
      const updates = newCategories.map((cat, idx) => ({
        id: cat.id,
        order_index: idx
      }));

      for (const update of updates) {
        await supabase
          .from('faq_categories')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      fetchData();
    } catch (err) {
      console.error('Error moving category:', err);
    }
  };

  const moveCategoryDown = async (index: number) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];

    try {
      const updates = newCategories.map((cat, idx) => ({
        id: cat.id,
        order_index: idx
      }));

      for (const update of updates) {
        await supabase
          .from('faq_categories')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      fetchData();
    } catch (err) {
      console.error('Error moving category:', err);
    }
  };

  const addItem = async (categoryId: string) => {
    const categoryItems = items.filter(item => item.category_id === categoryId);
    const newItem: FAQItem = {
      category_id: categoryId,
      question: 'Ny fråga',
      answer: 'Nytt svar',
      order_index: categoryItems.length,
      is_published: true
    };

    try {
      const { data, error } = await supabase
        .from('faq_items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      if (data) setItems([...items, data]);
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Ett fel uppstod.');
    }
  };

  const saveItem = async (item: FAQItem) => {
    try {
      const { error } = await supabase
        .from('faq_items')
        .update(item)
        .eq('id', item.id);

      if (error) throw error;
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Ett fel uppstod.');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna fråga?')) return;

    try {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Ett fel uppstod.');
    }
  };

  const moveItemUp = async (categoryId: string, index: number) => {
    const categoryItems = items.filter(item => item.category_id === categoryId);
    if (index === 0) return;

    const newItems = [...categoryItems];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];

    try {
      const updates = newItems.map((item, idx) => ({
        id: item.id,
        order_index: idx
      }));

      for (const update of updates) {
        await supabase
          .from('faq_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      fetchData();
    } catch (err) {
      console.error('Error moving item:', err);
    }
  };

  const moveItemDown = async (categoryId: string, index: number) => {
    const categoryItems = items.filter(item => item.category_id === categoryId);
    if (index === categoryItems.length - 1) return;

    const newItems = [...categoryItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

    try {
      const updates = newItems.map((item, idx) => ({
        id: item.id,
        order_index: idx
      }));

      for (const update of updates) {
        await supabase
          .from('faq_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      fetchData();
    } catch (err) {
      console.error('Error moving item:', err);
    }
  };

  if (loading) {
    return <div className="p-8">Laddar...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/webb/sidor">
            <AdminButton variant="outline" icon={ArrowLeft}>
              Tillbaka
            </AdminButton>
          </Link>
          <h1 className="text-2xl font-bold">FAQ-editor</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/faq" target="_blank">
            <AdminButton variant="outline" icon={Eye}>
              Förhandsgranska
            </AdminButton>
          </Link>
          <AdminButton onClick={savePage} disabled={saving} icon={Save}>
            {saving ? 'Sparar...' : 'Spara sida'}
          </AdminButton>
        </div>
      </div>

      <div className="space-y-6">
        <AdminCard title="Rubrik">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
              <input
                type="text"
                value={pageData.title_text}
                onChange={(e) => setPageData({ ...pageData, title_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={pageData.title_font}
                  onChange={(e) => setPageData({ ...pageData, title_font: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="poppins">Poppins</option>
                  <option value="lobster">Lobster</option>
                  <option value="inter">Inter</option>
                  <option value="merriweather">Merriweather</option>
                  <option value="roboto">Roboto</option>
                  <option value="playfair">Playfair</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="lato">Lato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                <select
                  value={pageData.title_weight}
                  onChange={(e) => setPageData({ ...pageData, title_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="thin">Tunn</option>
                  <option value="light">Lätt</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Fet</option>
                  <option value="black">Svart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                <select
                  value={pageData.title_size}
                  onChange={(e) => setPageData({ ...pageData, title_size: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="sm">Liten</option>
                  <option value="md">Medium</option>
                  <option value="lg">Stor</option>
                  <option value="xl">XL</option>
                  <option value="2xl">2XL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Färg"
                value={pageData.title_color}
                onChange={(color) => setPageData({ ...pageData, title_color: color })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                <select
                  value={pageData.title_align}
                  onChange={(e) => setPageData({ ...pageData, title_align: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Vänster</option>
                  <option value="center">Centrerad</option>
                  <option value="right">Höger</option>
                </select>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Textrader">
          <TextLinesEditor
            value={pageData.text_lines}
            onChange={(textLines) => setPageData({ ...pageData, text_lines: textLines })}
            fontValue={pageData.tagline_font}
            onFontChange={(font) => setPageData({ ...pageData, tagline_font: font })}
            weightValue={pageData.tagline_weight}
            onWeightChange={(weight) => setPageData({ ...pageData, tagline_weight: weight })}
            sizeValue={pageData.tagline_size}
            onSizeChange={(size) => setPageData({ ...pageData, tagline_size: size })}
            colorValue={pageData.tagline_color}
            onColorChange={(color) => setPageData({ ...pageData, tagline_color: color })}
            alignValue={pageData.tagline_align}
            onAlignChange={(align) => setPageData({ ...pageData, tagline_align: align })}
          />
        </AdminCard>

        <AdminCard title="Ingress">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingress</label>
              <textarea
                value={pageData.ingress_text || ''}
                onChange={(e) => setPageData({ ...pageData, ingress_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                <select
                  value={pageData.ingress_font}
                  onChange={(e) => setPageData({ ...pageData, ingress_font: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="poppins">Poppins</option>
                  <option value="lobster">Lobster</option>
                  <option value="inter">Inter</option>
                  <option value="merriweather">Merriweather</option>
                  <option value="roboto">Roboto</option>
                  <option value="playfair">Playfair</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="lato">Lato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                <select
                  value={pageData.ingress_weight}
                  onChange={(e) => setPageData({ ...pageData, ingress_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="thin">Tunn</option>
                  <option value="light">Lätt</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Fet</option>
                  <option value="black">Svart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                <select
                  value={pageData.ingress_size}
                  onChange={(e) => setPageData({ ...pageData, ingress_size: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="sm">Liten</option>
                  <option value="md">Medium</option>
                  <option value="lg">Stor</option>
                  <option value="xl">XL</option>
                  <option value="2xl">2XL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Färg"
                value={pageData.ingress_color}
                onChange={(color) => setPageData({ ...pageData, ingress_color: color })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placering</label>
                <select
                  value={pageData.ingress_align}
                  onChange={(e) => setPageData({ ...pageData, ingress_align: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Vänster</option>
                  <option value="center">Centrerad</option>
                  <option value="right">Höger</option>
                </select>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Bakgrund">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bakgrundstyp</label>
              <select
                value={pageData.background_type}
                onChange={(e) => setPageData({ ...pageData, background_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="color">Färg</option>
                <option value="image">Bild</option>
              </select>
            </div>

            {pageData.background_type === 'color' ? (
              <ColorPicker
                label="Bakgrundsfärg"
                value={pageData.background_color}
                onChange={(color) => setPageData({ ...pageData, background_color: color })}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bakgrundsbild URL</label>
                <input
                  type="text"
                  value={pageData.background_image || ''}
                  onChange={(e) => setPageData({ ...pageData, background_image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        </AdminCard>

        <AdminCard title="Kategorier">
          <div className="space-y-4">
            <AdminButton onClick={addCategory} icon={Plus}>
              Lägg till kategori
            </AdminButton>

            {categories.map((category, index) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                {editingCategory === category.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategorinamn</label>
                      <input
                        type="text"
                        value={category.title}
                        onChange={(e) => {
                          const updated = categories.map(cat =>
                            cat.id === category.id ? { ...cat, title: e.target.value } : cat
                          );
                          setCategories(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Typsnitt</label>
                        <select
                          value={category.styles.font}
                          onChange={(e) => {
                            const updated = categories.map(cat =>
                              cat.id === category.id
                                ? { ...cat, styles: { ...cat.styles, font: e.target.value } }
                                : cat
                            );
                            setCategories(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="poppins">Poppins</option>
                          <option value="lobster">Lobster</option>
                          <option value="inter">Inter</option>
                          <option value="merriweather">Merriweather</option>
                          <option value="roboto">Roboto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stil</label>
                        <select
                          value={category.styles.weight}
                          onChange={(e) => {
                            const updated = categories.map(cat =>
                              cat.id === category.id
                                ? { ...cat, styles: { ...cat.styles, weight: e.target.value } }
                                : cat
                            );
                            setCategories(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="normal">Normal</option>
                          <option value="medium">Medium</option>
                          <option value="semibold">Semibold</option>
                          <option value="bold">Fet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Storlek</label>
                        <select
                          value={category.styles.size}
                          onChange={(e) => {
                            const updated = categories.map(cat =>
                              cat.id === category.id
                                ? { ...cat, styles: { ...cat.styles, size: e.target.value } }
                                : cat
                            );
                            setCategories(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="sm">Liten</option>
                          <option value="md">Medium</option>
                          <option value="lg">Stor</option>
                          <option value="xl">XL</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Textfärg</label>
                        <input
                          type="color"
                          value={category.styles.color}
                          onChange={(e) => {
                            const updated = categories.map(cat =>
                              cat.id === category.id
                                ? { ...cat, styles: { ...cat.styles, color: e.target.value } }
                                : cat
                            );
                            setCategories(updated);
                          }}
                          className="w-full h-10 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bakgrundsfärg</label>
                        <input
                          type="color"
                          value={category.styles.background_color}
                          onChange={(e) => {
                            const updated = categories.map(cat =>
                              cat.id === category.id
                                ? { ...cat, styles: { ...cat.styles, background_color: e.target.value } }
                                : cat
                            );
                            setCategories(updated);
                          }}
                          className="w-full h-10 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Frågor & svar-styling</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fråga bakgrund</label>
                          <input
                            type="color"
                            value={category.question_background_color}
                            onChange={(e) => {
                              const updated = categories.map(cat =>
                                cat.id === category.id
                                  ? { ...cat, question_background_color: e.target.value }
                                  : cat
                              );
                              setCategories(updated);
                            }}
                            className="w-full h-10 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Svar bakgrund</label>
                          <input
                            type="color"
                            value={category.answer_background_color}
                            onChange={(e) => {
                              const updated = categories.map(cat =>
                                cat.id === category.id
                                  ? { ...cat, answer_background_color: e.target.value }
                                  : cat
                              );
                              setCategories(updated);
                            }}
                            className="w-full h-10 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Frågor i denna kategori</h4>
                      <AdminButton onClick={() => addItem(category.id!)} icon={Plus} variant="outline" className="mb-4">
                        Lägg till fråga
                      </AdminButton>

                      {items
                        .filter(item => item.category_id === category.id)
                        .map((item, itemIndex) => (
                          <div key={item.id} className="border border-gray-200 rounded p-3 mb-2">
                            {editingItem === item.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Fråga</label>
                                  <input
                                    type="text"
                                    value={item.question}
                                    onChange={(e) => {
                                      const updated = items.map(i =>
                                        i.id === item.id ? { ...i, question: e.target.value } : i
                                      );
                                      setItems(updated);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Svar</label>
                                  <textarea
                                    value={item.answer}
                                    onChange={(e) => {
                                      const updated = items.map(i =>
                                        i.id === item.id ? { ...i, answer: e.target.value } : i
                                      );
                                      setItems(updated);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveItem(item)}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                  >
                                    Spara
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                                  >
                                    Avbryt
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">{item.question}</p>
                                  <p className="text-sm text-gray-600 line-clamp-1">{item.answer}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => moveItemUp(category.id!, itemIndex)}
                                    disabled={itemIndex === 0}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => moveItemDown(category.id!, itemIndex)}
                                    disabled={itemIndex === items.filter(i => i.category_id === category.id).length - 1}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(item.id!)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteItem(item.id!)}
                                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => saveCategory(category)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                      >
                        Spara kategori
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{category.title}</h3>
                      <p className="text-sm text-gray-600">
                        {items.filter(item => item.category_id === category.id).length} frågor
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveCategoryUp(index)}
                        disabled={index === 0}
                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => moveCategoryDown(index)}
                        disabled={index === categories.length - 1}
                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(category.id!)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id!)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
