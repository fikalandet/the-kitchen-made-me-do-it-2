import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  food_types?: string[];
  main_ingredients?: string[];
  cooking_method?: string;
  cooking_methods?: string[];
  food_preferences?: string[];
  cuisine_type?: string;
  product_category?: string;
  city?: string;
  seller_id: string;
}

interface Filters {
  searchTerm: string;
  productCategories: string[];
  foodTypes: string[];
  mainIngredients: string[];
  cookingMethods: string[];
  foodPreferences: string[];
  cuisineTypes: string[];
  maxDistance: number;
}

export const MarketplaceFilter: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    categories: true,
    foodType: false,
    mainIngredient: false,
    cookingMethod: false,
    preferences: false,
    cuisine: false
  });

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    productCategories: [],
    foodTypes: [],
    mainIngredients: [],
    cookingMethods: [],
    foodPreferences: [],
    cuisineTypes: [],
    maxDistance: 50
  });

  const productCategoryOptions = [
    { value: 'pa_spisen_nu', label: 'På spisen nu' },
    { value: 'fran_frysen', label: 'Från frysen' },
    { value: 'matladekas', label: 'Matlådekassar' },
    { value: 'laga_sjalv_kit', label: 'Laga-själv-kit' },
    { value: 'brattomkak', label: 'Bråttomkäk' },
    { value: 'testkaka', label: 'Testkäka' }
  ];

  const foodTypeOptions = [
    { value: 'frukost', label: 'Frukost' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'middag', label: 'Middag' },
    { value: 'efterratt', label: 'Efterrätt' },
    { value: 'mellanmal', label: 'Mellanmål' },
    { value: 'barnmat', label: 'Barnmat' },
    { value: 'brunch', label: 'Brunch' },
    { value: 'festmat', label: 'Festmat' },
    { value: 'husmanskost', label: 'Husmanskost' },
    { value: 'picknick', label: 'Picknick' },
    { value: 'romantisk_middag', label: 'Romantisk middag' },
    { value: 'street_food', label: 'Street food' },
    { value: 'studentmat', label: 'Studentmat' },
    { value: 'halsokak', label: 'Hälsokäk' },
    { value: 'ata_i_bilen', label: 'Äta i bilen' }
  ];

  const mainIngredientOptions = [
    { category: 'Animalistiskt protein', items: [
      { value: 'fagel', label: 'Fågel' },
      { value: 'fisk', label: 'Fisk' },
      { value: 'flaskap', label: 'Fläsk' },
      { value: 'notkott', label: 'Nötkött' },
      { value: 'kyckling', label: 'Kyckling' },
      { value: 'lamm', label: 'Lamm' },
      { value: 'skaldjur', label: 'Skaldjur' },
      { value: 'vilt', label: 'Vilt' },
      { value: 'agg', label: 'Ägg' }
    ]},
    { category: 'Vegetabiliskt protein', items: [
      { value: 'bonor', label: 'Bönor' },
      { value: 'fron', label: 'Frön' },
      { value: 'kikartor', label: 'Kikärtor' },
      { value: 'linser', label: 'Linser' },
      { value: 'notter', label: 'Nötter' },
      { value: 'quinoa', label: 'Quinoa' },
      { value: 'tofu', label: 'Tofu' },
      { value: 'tempeh', label: 'Tempeh' },
      { value: 'soja', label: 'Soja' },
      { value: 'quorn', label: 'Quorn' }
    ]},
    { category: 'Kolhydratbas', items: [
      { value: 'brod', label: 'Bröd' },
      { value: 'bulgur', label: 'Bulgur' },
      { value: 'couscous', label: 'Couscous' },
      { value: 'havregron', label: 'Havregrön' },
      { value: 'nudlar', label: 'Nudlar' },
      { value: 'pasta', label: 'Pasta' },
      { value: 'potatis', label: 'Potatis' },
      { value: 'ris', label: 'Ris' },
      { value: 'polenta', label: 'Polenta' }
    ]},
    { category: 'Övrigt baslivsmedel', items: [
      { value: 'bar', label: 'Bär' },
      { value: 'frukt', label: 'Frukt' },
      { value: 'gradde', label: 'Grädde' },
      { value: 'gronsaker', label: 'Grönsaker' },
      { value: 'mjolk', label: 'Mjölk' },
      { value: 'ost', label: 'Ost' },
      { value: 'svamp', label: 'Svamp' },
      { value: 'yoghurt', label: 'Yoghurt' }
    ]}
  ];

  const cookingMethodOptions = [
    { value: 'bakning', label: 'Bakning' },
    { value: 'bbq', label: 'BBQ' },
    { value: 'fermentering', label: 'Fermentering' },
    { value: 'friterad', label: 'Friterad' },
    { value: 'grillad', label: 'Grillad' },
    { value: 'halstrad', label: 'Halstrad' },
    { value: 'inlagd', label: 'Inlagd' },
    { value: 'kokt', label: 'Kokt' },
    { value: 'marinerad', label: 'Marinerad' },
    { value: 'picklad', label: 'Picklad' },
    { value: 'ragout', label: 'Ragout' },
    { value: 'rokt', label: 'Rökt' },
    { value: 'rostad', label: 'Rostad' },
    { value: 'saltad', label: 'Saltad' },
    { value: 'sous_vide', label: 'Sous vide' },
    { value: 'stekt', label: 'Stekt' },
    { value: 'stuvad', label: 'Stuvad' },
    { value: 'ugn', label: 'Ugn' },
    { value: 'wok', label: 'Wok' },
    { value: 'angkokt', label: 'Ångkokt' }
  ];

  const foodPreferenceOptions = [
    { value: 'alkalisk', label: 'Alkalisk' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'ekologisk', label: 'Ekologisk' },
    { value: 'familjevanlig', label: 'Familjevänlig' },
    { value: 'glutenfri', label: 'Glutenfri' },
    { value: 'halal', label: 'Halal' },
    { value: 'histaminfri', label: 'Histaminfri' },
    { value: 'keto', label: 'Keto' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'laktosfri', label: 'Laktosfri' },
    { value: 'lchf', label: 'LCHF' },
    { value: 'majsfri', label: 'Majsfri' },
    { value: 'mjolkproteinfri', label: 'Mjölkproteinfri' },
    { value: 'narproducerat', label: 'Närproducerat' },
    { value: 'notfri', label: 'Nötfri' },
    { value: 'rawfood', label: 'Rawfood' },
    { value: 'sockerfri', label: 'Sockerfri' },
    { value: 'sojafri', label: 'Sojafri' },
    { value: 'vegansk', label: 'Vegansk' },
    { value: 'vegetarisk', label: 'Vegetarisk' },
    { value: 'aggfri', label: 'Äggfri' }
  ];

  const cuisineTypeOptions = [
    { value: 'svensk', label: 'Svensk' },
    { value: 'italiensk', label: 'Italiensk' },
    { value: 'fransk', label: 'Fransk' },
    { value: 'asiatisk', label: 'Asiatisk' },
    { value: 'kinesisk', label: 'Kinesisk' },
    { value: 'japansk', label: 'Japansk' },
    { value: 'thailandsk', label: 'Thailändsk' },
    { value: 'indisk', label: 'Indisk' },
    { value: 'mellanostern', label: 'Mellanöstern' },
    { value: 'mexikansk', label: 'Mexikansk' },
    { value: 'spansk', label: 'Spansk' },
    { value: 'grekisk', label: 'Grekisk' },
    { value: 'amerikansk', label: 'Amerikansk' },
    { value: 'fusion', label: 'Fusion' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .eq('status', 'active');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    if (filters.productCategories.length > 0) {
      filtered = filtered.filter(p =>
        p.product_category && filters.productCategories.includes(p.product_category)
      );
    }

    if (filters.foodTypes.length > 0) {
      filtered = filtered.filter(p =>
        p.food_types && filters.foodTypes.some(type =>
          p.food_types?.includes(type as any)
        )
      );
    }

    if (filters.mainIngredients.length > 0) {
      filtered = filtered.filter(p =>
        p.main_ingredients && filters.mainIngredients.some(ing =>
          p.main_ingredients?.includes(ing as any)
        )
      );
    }

    if (filters.cookingMethods.length > 0) {
      filtered = filtered.filter(p => {
        if (p.cooking_methods && p.cooking_methods.length > 0) {
          return filters.cookingMethods.some(method =>
            p.cooking_methods?.includes(method as any)
          );
        }
        return p.cooking_method && filters.cookingMethods.includes(p.cooking_method);
      });
    }

    if (filters.foodPreferences.length > 0) {
      filtered = filtered.filter(p =>
        p.food_preferences && filters.foodPreferences.some(pref =>
          p.food_preferences?.includes(pref as any)
        )
      );
    }

    if (filters.cuisineTypes.length > 0) {
      filtered = filtered.filter(p =>
        p.cuisine_type && filters.cuisineTypes.includes(p.cuisine_type)
      );
    }

    setFilteredProducts(filtered);
  };

  const toggleFilter = (filterType: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterType] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];

      return { ...prev, [filterType]: newArray };
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      productCategories: [],
      foodTypes: [],
      mainIngredients: [],
      cookingMethods: [],
      foodPreferences: [],
      cuisineTypes: [],
      maxDistance: 50
    });
  };

  const FilterSection: React.FC<{
    title: string;
    sectionKey: string;
    options: { value: string; label: string }[];
    filterKey: keyof Filters;
  }> = ({ title, sectionKey, options, filterKey }) => (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            expandedSections[sectionKey] ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
          {options.map(option => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters[filterKey] as string[]).includes(option.value)}
                onChange={() => toggleFilter(filterKey, option.value)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const GroupedFilterSection: React.FC<{
    title: string;
    sectionKey: string;
    groups: { category: string; items: { value: string; label: string }[] }[];
    filterKey: keyof Filters;
  }> = ({ title, sectionKey, groups, filterKey }) => (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            expandedSections[sectionKey] ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4 max-h-96 overflow-y-auto">
          {groups.map((group, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{group.category}</h4>
              <div className="space-y-2">
                {group.items.map(item => (
                  <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(filters[filterKey] as string[]).includes(item.value)}
                      onChange={() => toggleFilter(filterKey, item.value)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Filtrera fram din perfekta måltid</h1>
          <p className="text-gray-600">Använd filtren nedan för att hitta exakt vad du söker</p>
        </div>

        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow sticky top-4">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filter
                </h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Rensa alla
                </button>
              </div>

              <div className="border-b border-gray-200 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Sök..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('location')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Plats & avstånd
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedSections.location ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSections.location && (
                  <div className="px-4 pb-4">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={filters.maxDistance}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Inom {filters.maxDistance} km</p>
                  </div>
                )}
              </div>

              <FilterSection
                title="Kategorier"
                sectionKey="categories"
                options={productCategoryOptions}
                filterKey="productCategories"
              />

              <FilterSection
                title="Mattyp"
                sectionKey="foodType"
                options={foodTypeOptions}
                filterKey="foodTypes"
              />

              <GroupedFilterSection
                title="Huvudingredienser"
                sectionKey="mainIngredient"
                groups={mainIngredientOptions}
                filterKey="mainIngredients"
              />

              <FilterSection
                title="Tillagningssätt"
                sectionKey="cookingMethod"
                options={cookingMethodOptions}
                filterKey="cookingMethods"
              />

              <FilterSection
                title="Preferenser"
                sectionKey="preferences"
                options={foodPreferenceOptions}
                filterKey="foodPreferences"
              />

              <FilterSection
                title="Matkultur"
                sectionKey="cuisine"
                options={cuisineTypeOptions}
                filterKey="cuisineTypes"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {loading ? 'Laddar...' : `${filteredProducts.length} produkter hittades`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Ingen bild</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">{product.price} kr</span>
                      {product.city && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {product.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">Inga produkter matchade dina filter. Prova att ändra dina sökkriterier.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
