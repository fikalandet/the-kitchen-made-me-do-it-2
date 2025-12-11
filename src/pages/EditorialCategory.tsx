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
  hero_image_size: string;
  hero_image_position: string;
  hero_wave_style: string;
  trivia_layout: string;
  trivia_position: string;
  trivia_column1: string;
  trivia_column2: string;
  cta_primary_text: string;
  cta_primary_bg_color: string;
  cta_primary_text_color: string;
  cta_primary_bg_opacity: number;
  cta_primary_font: string;
  cta_primary_placement: string;
  cta_secondary_text: string;
  cta_secondary_bg_color: string;
  cta_secondary_text_color: string;
  cta_secondary_bg_opacity: number;
  cta_secondary_font: string;
  cta_secondary_placement: string;
  cta_secondary_chef_id: string | null;
  cta_text: string;
  cta_link: string;
  display_order: number;
}

interface Profile {
  id: string;
  kitchen_name: string | null;
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
  const [chefProfiles, setChefProfiles] = useState<Record<string, Profile>>({});

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

      const chefIds = articlesData?.filter(a => a.cta_secondary_chef_id).map(a => a.cta_secondary_chef_id) || [];
      if (chefIds.length > 0) {
        const { data: chefsData } = await supabase
          .from('profiles')
          .select('id, kitchen_name')
          .in('id', chefIds);

        if (chefsData) {
          const chefsMap = chefsData.reduce((acc, chef) => {
            acc[chef.id] = chef;
            return acc;
          }, {} as Record<string, Profile>);
          setChefProfiles(chefsMap);
        }
      }
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
          {articles.map((article) => {
            const imageSizeClasses = {
              medium: 'h-64',
              large: 'h-96',
              full: 'h-screen'
            };
            const imagePositionClasses = {
              top: 'object-top',
              center: 'object-center',
              bottom: 'object-bottom'
            };
            const wavePathClasses = {
              wave1: 'M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z',
              wave2: 'M0,64L48,85.3C96,107,192,149,288,154.7C384,160,480,128,576,128C672,128,768,160,864,154.7C960,149,1056,107,1152,80C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z',
              wave3: 'M0,32L48,48C96,64,192,96,288,101.3C384,107,480,85,576,69.3C672,53,768,43,864,58.7C960,75,1056,117,1152,133.3C1248,149,1344,139,1392,133.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'
            };
            const fontFamilyMap = {
              lobster: 'Lobster',
              poppins: 'Poppins, sans-serif',
              sans: 'sans-serif',
              serif: 'serif'
            };

            const triviaBox = (article.trivia_column1 || article.trivia_column2) && (
              <div className="bg-[#f6f2e0] rounded-lg p-6 my-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kuriosa</h3>
                <div className={`${article.trivia_layout === 'double' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                  {article.trivia_column1 && (
                    <div className={article.trivia_layout === 'double' ? 'pr-6 border-r border-gray-300' : ''}>
                      <p className="text-gray-700 whitespace-pre-line">{article.trivia_column1}</p>
                    </div>
                  )}
                  {article.trivia_layout === 'double' && article.trivia_column2 && (
                    <div>
                      <p className="text-gray-700 whitespace-pre-line">{article.trivia_column2}</p>
                    </div>
                  )}
                </div>
              </div>
            );

            return (
              <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {article.image_url && (
                  <div className="relative">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className={`w-full ${imageSizeClasses[article.hero_image_size as keyof typeof imageSizeClasses] || 'h-96'} ${imagePositionClasses[article.hero_image_position as keyof typeof imagePositionClasses] || 'object-center'} object-cover`}
                    />
                    {article.hero_wave_style && article.hero_wave_style !== 'none' && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <svg
                          viewBox="0 0 1440 160"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-full h-auto"
                        >
                          <path
                            d={wavePathClasses[article.hero_wave_style as keyof typeof wavePathClasses]}
                            fill="white"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-8">
                  {article.trivia_position === 'below_image' && triviaBox}

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h2>
                  <p className="text-xl text-gray-700 mb-6">{article.ingress}</p>

                  {expandedArticleId === article.id ? (
                    <>
                      <p className="text-gray-600 mb-6 whitespace-pre-line">{article.body}</p>

                      {article.trivia_position === 'sidebar' && triviaBox}

                      <div
                        className="flex flex-wrap gap-4 mt-8"
                        style={{
                          justifyContent: article.cta_primary_placement === 'center'
                            ? 'center'
                            : article.cta_primary_placement === 'right'
                            ? 'flex-end'
                            : 'flex-start'
                        }}
                      >
                        <button
                          onClick={() => setExpandedArticleId(null)}
                          style={{
                            fontFamily: fontFamilyMap[article.cta_primary_font as keyof typeof fontFamilyMap] || 'sans-serif',
                            backgroundColor: article.cta_primary_bg_color,
                            color: article.cta_primary_text_color,
                            opacity: (article.cta_primary_bg_opacity || 100) / 100
                          }}
                          className="px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                          {article.cta_primary_text}
                        </button>

                        {article.cta_secondary_chef_id && chefProfiles[article.cta_secondary_chef_id] && (
                          <Link
                            to={`/chef/${article.cta_secondary_chef_id}`}
                            style={{
                              fontFamily: fontFamilyMap[article.cta_secondary_font as keyof typeof fontFamilyMap] || 'sans-serif',
                              backgroundColor: article.cta_secondary_bg_color,
                              color: article.cta_secondary_text_color,
                              opacity: (article.cta_secondary_bg_opacity || 100) / 100
                            }}
                            className="px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity inline-block"
                          >
                            {article.cta_secondary_text}
                          </Link>
                        )}
                      </div>
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
            );
          })}
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
