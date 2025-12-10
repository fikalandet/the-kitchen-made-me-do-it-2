import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, Trash2, MoveUp, MoveDown, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface EditorialCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  background_color: string;
}

interface EditorialArticle {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  ingress: string;
  body: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  display_order: number;
}

export function EditorialCategory() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [category, setCategory] = useState<EditorialCategory | null>(null);
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<Partial<EditorialArticle> | null>(null);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchData();
    checkAdminStatus();
  }, [slug]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setIsAdmin(data.is_admin || false);
    }
  };

  const fetchData = async () => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('editorial_categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!categoryData) return;

      setCategory(categoryData);

      const { data: articlesData, error: articlesError } = await supabase
        .from('editorial_articles')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('display_order', { ascending: true });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user || !editingArticle) return;
    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `article-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/editorial/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setEditingArticle({ ...editingArticle, image_url: data.publicUrl });
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Kunde inte ladda upp. Försök igen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!editingArticle || !editingArticle.title || !category) {
      alert('Titel är obligatorisk');
      return;
    }

    const articleSlug = editingArticle.slug || editingArticle.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9-]/g, '');

    try {
      if (editingArticle.id) {
        const { error } = await supabase
          .from('editorial_articles')
          .update({
            ...editingArticle,
            slug: articleSlug,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingArticle.id);

        if (error) throw error;
      } else {
        const maxOrder = articles.length > 0 ? Math.max(...articles.map(a => a.display_order)) : 0;
        const { error } = await supabase
          .from('editorial_articles')
          .insert({
            ...editingArticle,
            category_id: category.id,
            slug: articleSlug,
            display_order: maxOrder + 1
          });

        if (error) throw error;
      }

      setEditingArticle(null);
      fetchData();
    } catch (err) {
      console.error('Error saving article:', err);
      alert('Kunde inte spara. Försök igen.');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Ta bort artikel?')) return;

    try {
      const { error } = await supabase
        .from('editorial_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error:', err);
      alert('Kunde inte ta bort.');
    }
  };

  const handleMoveArticle = async (article: EditorialArticle, direction: 'up' | 'down') => {
    const currentIndex = articles.findIndex(a => a.id === article.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === articles.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetArticle = articles[targetIndex];

    try {
      await Promise.all([
        supabase
          .from('editorial_articles')
          .update({ display_order: targetArticle.display_order })
          .eq('id', article.id),
        supabase
          .from('editorial_articles')
          .update({ display_order: article.display_order })
          .eq('id', targetArticle.id)
      ]);

      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-[#f6f2e0] flex items-center justify-center">
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f2e0]">
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: category.image_url ? `url(${category.image_url})` : 'none',
          backgroundColor: category.background_color || '#ffffff'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Tillbaka till startsidan
          </Link>
          <h1 className="text-5xl font-bold text-white mb-4">{category.title}</h1>
          <p className="text-xl text-white max-w-2xl">{category.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {isAdmin && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Hantera artiklar</h2>
              <button
                onClick={() => setEditingArticle({
                  title: '',
                  slug: '',
                  ingress: '',
                  body: '',
                  image_url: '',
                  cta_text: '',
                  cta_link: ''
                })}
                className="flex items-center gap-2 px-4 py-2 bg-[#56c5c5] text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Ny artikel
              </button>
            </div>

            {editingArticle && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 mb-4">
                <h3 className="font-medium">{editingArticle.id ? 'Redigera' : 'Ny'} artikel</h3>

                <input
                  type="text"
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="Titel"
                  className="w-full px-3 py-2 border rounded"
                />

                <textarea
                  value={editingArticle.ingress || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, ingress: e.target.value })}
                  placeholder="Ingress"
                  rows={2}
                  className="w-full px-3 py-2 border rounded"
                />

                <textarea
                  value={editingArticle.body || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, body: e.target.value })}
                  placeholder="Brödtext"
                  rows={6}
                  className="w-full px-3 py-2 border rounded"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bild</label>
                  <input
                    type="file"
                    id="article-image-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="article-image-upload"
                    className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-gray-50 ${
                      uploadingImage ? 'opacity-50' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Laddar...' : 'Ladda upp'}
                  </label>
                  {editingArticle.image_url && (
                    <img
                      src={editingArticle.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded mt-2"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveArticle}
                    className="px-4 py-2 bg-[#a1c798] text-white rounded"
                  >
                    Spara
                  </button>
                  <button
                    onClick={() => setEditingArticle(null)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {articles.map((article, index) => (
                <div key={article.id} className="flex items-center gap-3 p-3 bg-white border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-gray-600">{article.ingress}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveArticle(article, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveArticle(article, 'down')}
                      disabled={index === articles.length - 1}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-8">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h2>
                <p className="text-xl text-gray-700 mb-6">{article.ingress}</p>
                {expandedArticleId === article.id ? (
                  <>
                    <p className="text-gray-600 mb-6 whitespace-pre-line">{article.body}</p>
                    <button
                      onClick={() => setExpandedArticleId(null)}
                      className="text-[#a1c798] hover:text-[#8fb386] font-medium"
                    >
                      Visa mindre
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setExpandedArticleId(article.id)}
                    className="text-[#a1c798] hover:text-[#8fb386] font-medium"
                  >
                    Läs mer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {articles.length === 0 && !isAdmin && (
          <div className="text-center py-12">
            <p className="text-gray-600">Inga artiklar tillgängliga ännu</p>
          </div>
        )}
      </div>
    </div>
  );
}
