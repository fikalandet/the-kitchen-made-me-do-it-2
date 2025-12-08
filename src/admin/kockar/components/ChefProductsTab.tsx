import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Eye, AlertCircle, Image as ImageIcon, MoreVertical, Pause, Edit2, Trash2, Zap, Play, X, Package } from 'lucide-react';
import { AdminCard } from '../../components';
import { BoostWizard } from '../../../pages/chef-panel/marketing/BoostWizard';
import { MealBoxCollage } from '../../../components/MealBoxCollage';

type ProductCategory = 'all' | 'dish' | 'meal_box' | 'catering' | 'chef_missions' | 'recipes' | 'subscriptions' | 'videos' | 'gift_cards' | 'diy_kits' | 'other';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_small?: number;
  price_standard?: number;
  price_large?: number;
  image_url: string;
  allergens: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
  type: string;
  status?: string;
  is_boosted?: boolean;
}

interface ChefProductsTabProps {
  chefId: string;
}

export default function ChefProductsTab({ chefId }: ChefProductsTabProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [boostingProduct, setBoostingProduct] = useState<Product | null>(null);

  const categories = [
    { id: 'all', label: 'Alla produkter', typeFilter: null },
    { id: 'dish', label: 'Maträtter', typeFilter: 'dish' },
    { id: 'meal_box', label: 'Matlådekassar', typeFilter: 'meal_box' },
    { id: 'catering', label: 'Catering', typeFilter: 'catering' },
    { id: 'chef_missions', label: 'Kockuppdrag', typeFilter: 'chef_missions' },
    { id: 'diy_kits', label: 'Laga-själv-kit', typeFilter: 'diy_kits' },
    { id: 'gift_cards', label: 'Presentkort', typeFilter: 'gift_cards' },
    { id: 'videos', label: 'Matvideos', typeFilter: 'videos' },
    { id: 'other', label: 'Andra produkter', typeFilter: 'other' },
    { id: 'recipes', label: 'Recept', typeFilter: 'recipes' },
    { id: 'subscriptions', label: 'Prenumerationer', typeFilter: 'subscriptions' },
  ].sort((a, b) => a.label.localeCompare(b.label, 'sv'));

  useEffect(() => {
    fetchProducts();
  }, [chefId, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('seller_id', chefId);

      if (selectedCategory !== 'all') {
        const categoryData = categories.find(c => c.id === selectedCategory);
        if (categoryData?.typeFilter) {
          query = query.eq('type', categoryData.typeFilter);
        }
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const hasIssues = (product: Product) => {
    const issues = [];
    if (!product.image_url && product.type !== 'meal_box') issues.push('Saknar bild');
    if (!product.allergens || product.allergens.length === 0) issues.push('Saknar allergener');
    if (!product.price && !product.price_small && !product.price_standard && !product.price_large) {
      issues.push('Saknar pris');
    }
    if (product.status === 'draft') issues.push('Ej godkänd');
    return issues;
  };

  const isNew = (product: Product) => {
    const daysSinceCreated = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 7;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      dish: 'Maträtt',
      meal_box: 'Matlådekasse',
      subscription: 'Prenumeration',
      diy_kit: 'Laga-själv-kit',
      hire_chef: 'Hyr mig',
      catering: 'Catering',
      recipe: 'Recept',
      video: 'Video',
      gift_cards: 'Presentkort',
      chef_missions: 'Kockuppdrag'
    };
    return labels[type] || type;
  };

  const getDisplayPrice = (product: Product): string => {
    if (product.price) return `${product.price} kr`;
    if (product.price_small) return `Från ${product.price_small} kr`;
    if (product.price_standard) return `Från ${product.price_standard} kr`;
    if (product.price_large) return `Från ${product.price_large} kr`;
    return '-';
  };

  const handleTogglePause = async (productId: string, currentStatus: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Du måste vara inloggad');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-product-update`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            updates: { available: !currentStatus }
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Update failed');
      }

      setOpenActionMenu(null);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Ett fel uppstod när produkten skulle uppdateras');
    }
  };

  const handleEdit = (productId: string) => {
    setOpenActionMenu(null);
    navigate(`/products/edit/${productId}`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna produkt? Detta går inte att ångra.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      setOpenActionMenu(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ett fel uppstod när produkten skulle tas bort');
    }
  };

  const handleBoost = (product: Product) => {
    setOpenActionMenu(null);
    setBoostingProduct(product);
  };

  const handleCloseBoostModal = () => {
    setBoostingProduct(null);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Produkttyp:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {products.length} produkt{products.length !== 1 ? 'er' : ''}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">
            Laddar produkter...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">Inga produkter hittades</p>
            <p className="text-sm text-gray-500">
              Kocken har inga {categories.find(c => c.id === selectedCategory)?.label.toLowerCase()} ännu
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Produktnamn</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Typ</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Pris</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Problem</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Visa</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => {
                  const issues = hasIssues(product);
                  const productIsNew = isNew(product);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {product.type === 'meal_box' ? (
                            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                              <MealBoxCollage
                                mealBoxId={product.id}
                                className="w-full h-full"
                              />
                            </div>
                          ) : product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                            {productIsNew && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                Ny
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm text-gray-900">
                          {getProductTypeLabel(product.type)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {getDisplayPrice(product)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          {product.available ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              Aktiv
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                              Pausad
                            </span>
                          )}
                          {product.is_boosted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              <Zap className="w-3 h-3" />
                              Boostad
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {issues.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {issues.map((issue, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs rounded"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {issue}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => setViewingProduct(product)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors inline-flex items-center justify-center"
                          title="Visa produkt"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center relative">
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === product.id ? null : product.id)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors inline-flex items-center justify-center"
                          title="Åtgärder"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {openActionMenu === product.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenActionMenu(null)}
                            />
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                            <button
                              onClick={() => handleTogglePause(product.id, product.available)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              {product.available ? (
                                <>
                                  <Pause className="w-4 h-4" />
                                  Pausa
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  Återaktivera
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(product.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Redigera
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Ta bort
                            </button>
                            <button
                              onClick={() => handleBoost(product)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Zap className="w-4 h-4" />
                              Boosta
                            </button>
                          </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {viewingProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setViewingProduct(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{viewingProduct.name}</h2>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {viewingProduct.image_url && (
                <img
                  src={viewingProduct.image_url}
                  alt={viewingProduct.name}
                  className="w-full h-64 object-cover rounded mb-4"
                />
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Beskrivning:</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingProduct.description || 'Ingen beskrivning'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Pris:</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {getDisplayPrice(viewingProduct)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingProduct.available ? 'Aktiv' : 'Pausad'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Allergener:</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingProduct.allergens && viewingProduct.allergens.length > 0
                      ? viewingProduct.allergens.join(', ')
                      : 'Inga allergener angivna'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Skapad:</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(viewingProduct.created_at)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Senast uppdaterad:</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(viewingProduct.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {boostingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCloseBoostModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              title="Stäng"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Boosta produkt: {boostingProduct.name}</h2>
              <BoostWizard
                preselectedProductId={boostingProduct.id}
                chefId={chefId}
                isAdminMode={true}
                onClose={handleCloseBoostModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
