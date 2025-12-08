import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, TrendingUp, Calendar, AlertCircle, MoreVertical, Rocket, Clock, Flame, Snowflake, Tag, TestTube, Trophy, MapPin, Pause, Edit, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { MealBoxCollage } from './MealBoxCollage';
import { BoostProductModal } from './BoostProductModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  status: string;
  available: boolean;
  created_at: string;
  category: string;
  portions?: number;
  freezer_portions?: number;
  is_boosted?: boolean;
  is_pa_spisen_nu?: boolean;
  allergens?: string[];
  profiles?: {
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ProductTableProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onProductClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showBrattomkakModal, setShowBrattomkakModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [boostDuration, setBoostDuration] = useState<number>(24);
  const [deliveryMinutes, setDeliveryMinutes] = useState<number>(60);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [showFillFreezerModal, setShowFillFreezerModal] = useState(false);
  const [freezerPortionsToAdd, setFreezerPortionsToAdd] = useState<number>(0);
  const [productConnections, setProductConnections] = useState<any>(null);

  const productTypes = [
    { value: 'all', label: 'Alla produkttyper' },
    { value: 'dish', label: 'Maträtter' },
    { value: 'meal_box', label: 'Matlådekassar' },
    { value: 'subscription', label: 'Prenumerationer' },
    { value: 'diy_kit', label: 'Laga-själv-kit' },
    { value: 'hire_chef', label: 'Hyr mig' },
    { value: 'catering', label: 'Catering' },
    { value: 'recipe', label: 'Recept' },
    { value: 'video', label: 'Matlagningsvideos' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Alla statusar' },
    { value: 'active', label: 'Aktiva' },
    { value: 'paused', label: 'Pausade' },
    { value: 'out_of_stock', label: 'Slutsålda' }
  ];

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dish: 'Maträtt',
      meal_box: 'Matlådekasse',
      subscription: 'Prenumeration',
      diy_kit: 'Laga-själv-kit',
      hire_chef: 'Hyr mig',
      catering: 'Catering',
      recipe: 'Recept',
      video: 'Video'
    };
    return labels[type] || type;
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <TrendingUp className="w-4 h-4" />;
      case 'catering':
      case 'hire_chef':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || product.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return b.price - a.price;
      }
      return 0;
    });

  const togglePaSpisenNu = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_pa_spisen_nu: !product.is_pa_spisen_nu })
        .eq('id', product.id);

      if (error) throw error;

      window.location.reload();
    } catch (error) {
      console.error('Error toggling På spisen nu:', error);
      alert('Kunde inte uppdatera produkten. Försök igen.');
    }
  };

  const handleBoostProduct = async () => {
    if (!selectedProduct || !user) return;

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + boostDuration);

      const { error } = await supabase
        .from('products')
        .update({
          is_boosted: true,
          boost_expires_at: expiresAt.toISOString()
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      await supabase
        .from('product_boost_history')
        .insert([{
          product_id: selectedProduct.id,
          seller_id: user.id,
          boost_type: 'standard',
          boost_duration_hours: boostDuration,
          started_at: new Date().toISOString()
        }]);

      setShowBoostModal(false);
      setSelectedProduct(null);
      window.location.reload();
    } catch (error) {
      console.error('Error boosting product:', error);
      alert('Kunde inte boosta produkten. Försök igen.');
    }
  };

  const handleBrattomkak = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_brattomkak: true,
          brattomkak_delivery_minutes: deliveryMinutes
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setShowBrattomkakModal(false);
      setSelectedProduct(null);
      window.location.reload();
    } catch (error) {
      console.error('Error setting Bråttomkäk:', error);
      alert('Kunde inte aktivera Bråttomkäk. Försök igen.');
    }
  };

  const loadProductConnections = async (productId: string) => {
    try {
      const { data: liveData } = await supabase
        .from('products')
        .select('is_pa_spisen_nu')
        .eq('id', productId)
        .maybeSingle();

      const { data: batchData } = await supabase
        .from('cooking_schedule')
        .select('id')
        .eq('product_id', productId)
        .eq('status', 'planned');

      const { data: subData } = await supabase
        .from('subscription_details')
        .select('current_subscribers')
        .eq('product_id', productId)
        .maybeSingle();

      const { data: ingredientsData } = await supabase
        .from('product_recipe_ingredients')
        .select('id')
        .eq('product_id', productId)
        .limit(1);

      setProductConnections({
        onStove: liveData?.is_pa_spisen_nu || false,
        batchCount: batchData?.length || 0,
        subscriptionCount: subData?.current_subscribers || 0,
        hasIngredients: (ingredientsData?.length || 0) > 0
      });
    } catch (error) {
      console.error('Error loading product connections:', error);
    }
  };

  const handleRowClick = async (product: Product) => {
    if (expandedProductId === product.id) {
      setExpandedProductId(null);
      setProductConnections(null);
    } else {
      setExpandedProductId(product.id);
      await loadProductConnections(product.id);
    }
  };

  const handleFillFreezer = async () => {
    if (!selectedProduct || freezerPortionsToAdd <= 0) return;

    try {
      const currentPortions = selectedProduct.freezer_portions ?? 0;
      const newPortions = currentPortions + freezerPortionsToAdd;

      const { error } = await supabase
        .from('products')
        .update({ freezer_portions: newPortions })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setShowFillFreezerModal(false);
      setSelectedProduct(null);
      setFreezerPortionsToAdd(0);
      window.location.reload();
    } catch (error) {
      console.error('Error updating freezer portions:', error);
      alert('Kunde inte uppdatera frysen. Försök igen.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Sök produkter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {productTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="created_at">Senast skapad</option>
          <option value="name">Namn</option>
          <option value="price">Pris</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Inga produkter hittades</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produktnamn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pris
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-gray-50 transition-colors relative">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleRowClick(product)}
                            className="mr-2 p-1 hover:bg-gray-200 rounded"
                          >
                            {expandedProductId === product.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          {product.type === 'meal_box' ? (
                            <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                              <MealBoxCollage
                                mealBoxId={product.id}
                                chefInfo={product.profiles}
                                className="w-full h-full"
                              />
                            </div>
                          ) : product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover mr-3 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          {getProductTypeIcon(product.type)}
                          {getProductTypeLabel(product.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price ? `${product.price} kr` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.available ? 'Aktiv' : 'Pausad'}
                          </span>
                          {product.is_boosted && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Boostad
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {!product.image_url && product.type !== 'meal_box' && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>Saknar bild</span>
                            </div>
                          )}
                          {!product.description && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>Saknar beskrivning</span>
                            </div>
                          )}
                          {!product.price && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>Saknar pris</span>
                            </div>
                          )}
                          {product.allergens && product.allergens.length === 0 && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>Saknar allergener</span>
                            </div>
                          )}
                          {!product.image_url && !product.description && !product.price && product.allergens?.length === 0 ? (
                            <span className="text-xs text-gray-400">-</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ overflow: 'visible' }}>
                      <div className="relative" style={{ overflow: 'visible' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === product.id ? null : product.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {openMenuId === product.id && (
                          <>
                            <div
                              className="fixed inset-0"
                              style={{ zIndex: 999 }}
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2" style={{ zIndex: 1000 }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setSelectedProduct(product);
                                  setShowBoostModal(true);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Rocket className="w-4 h-4" />
                                <span className="text-sm">Boosta produkten</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setSelectedProduct(product);
                                  setShowBrattomkakModal(true);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Bråttomkäk</span>
                              </button>

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  await togglePaSpisenNu(product);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Flame className="w-4 h-4" />
                                <span className="text-sm">På spisen nu</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // TODO: Implement i frysen
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Snowflake className="w-4 h-4" />
                                <span className="text-sm">I frysen</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // TODO: Implement schyssta deals
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Tag className="w-4 h-4" />
                                <span className="text-sm">Schyssta deals</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // TODO: Implement testkäk
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <TestTube className="w-4 h-4" />
                                <span className="text-sm">Testkäk & Tyck till</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // TODO: Implement tävlingar (gold chefs only)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Trophy className="w-4 h-4" />
                                <span className="text-sm">Tävlingar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // TODO: Implement evenemang
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">Evenemang</span>
                              </button>

                              <div className="my-2 border-t border-gray-200" />

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  try {
                                    const { error } = await supabase
                                      .from('products')
                                      .update({ available: !product.available })
                                      .eq('id', product.id);

                                    if (error) throw error;
                                    window.location.reload();
                                  } catch (error) {
                                    console.error('Error toggling product availability:', error);
                                    alert('Kunde inte uppdatera produkten. Försök igen.');
                                  }
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Pause className="w-4 h-4" />
                                <span className="text-sm">{product.available ? 'Pausa' : 'Aktivera'}</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  navigate(`/products/edit/${product.id}`);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="text-sm">Redigera</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // TODO: Implement delete with confirmation
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Ta bort</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedProductId === product.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-2">Grundinfo</h4>
                            <div>
                              <p className="text-xs text-gray-500">Beskrivning</p>
                              <p className="text-sm text-gray-900">{product.description || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Pris</p>
                              <p className="text-sm text-gray-900">{product.price ? `${product.price} kr` : '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Typ</p>
                              <p className="text-sm text-gray-900">{getProductTypeLabel(product.type)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <p className="text-sm text-gray-900">{product.available ? 'Aktiv' : 'Pausad'}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-2">Lager och frysen</h4>
                            <div>
                              <p className="text-xs text-gray-500">Antal portioner i frysen</p>
                              <p className="text-sm text-gray-900 mb-2">{product.freezer_portions ?? 0} st</p>
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowFillFreezerModal(true);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white rounded-lg transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#56c5c5' }}
                              >
                                <Plus className="w-4 h-4" />
                                Fyll på frysen
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-2">Produktens kopplingar</h4>
                            {productConnections ? (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500">På spisen nu</p>
                                  <p className="text-sm text-gray-900">{productConnections.onStove ? 'Ja' : 'Nej'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Batch-tillagning</p>
                                  <p className="text-sm text-gray-900">{productConnections.batchCount} planerade</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Prenumerationer</p>
                                  <p className="text-sm text-gray-900">{productConnections.subscriptionCount} aktiva</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Inköpsunderlag</p>
                                  {productConnections.hasIngredients ? (
                                    <p className="text-sm font-medium text-green-600">Inköpsunderlag klart</p>
                                  ) : (
                                    <p className="text-sm font-medium text-orange-600">Inköpsunderlag saknas</p>
                                  )}
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500">Laddar...</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Visar {filteredProducts.length} av {products.length} produkter</span>
      </div>

      {showBoostModal && selectedProduct && (
        <BoostProductModal
          productId={selectedProduct.id}
          productTitle={selectedProduct.name}
          isOpen={showBoostModal}
          onClose={() => {
            setShowBoostModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showBrattomkakModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Aktivera Bråttomkäk</h3>
            <p className="text-gray-600 mb-4">
              Markera "{selectedProduct.name}" som snabb leverans för hungriga kunder som vill ha mat nu.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leveranstid (minuter)
              </label>
              <select
                value={deliveryMinutes}
                onChange={(e) => setDeliveryMinutes(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 minuter</option>
                <option value={45}>45 minuter</option>
                <option value={60}>60 minuter</option>
                <option value={90}>90 minuter</option>
              </select>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Se till att du kan leverera inom den valda tiden innan du aktiverar denna funktion.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBrattomkakModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleBrattomkak}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Aktivera
              </button>
            </div>
          </div>
        </div>
      )}

      {showFillFreezerModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Fyll på frysen</h3>
            <p className="text-gray-600 mb-4">
              Lägg till portioner av "{selectedProduct.name}" i frysen.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antal portioner att lägga till
              </label>
              <input
                type="number"
                min="1"
                value={freezerPortionsToAdd}
                onChange={(e) => setFreezerPortionsToAdd(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ange antal"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                Nuvarande lager: {selectedProduct.freezer_portions ?? 0} st<br />
                Efter påfyllning: {(selectedProduct.freezer_portions ?? 0) + freezerPortionsToAdd} st
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowFillFreezerModal(false);
                  setSelectedProduct(null);
                  setFreezerPortionsToAdd(0);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleFillFreezer}
                disabled={freezerPortionsToAdd <= 0}
                className="px-4 py-2 text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#56c5c5' }}
              >
                Spara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
