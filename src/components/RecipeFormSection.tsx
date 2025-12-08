import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Eye } from 'lucide-react';
import RecipeTemplateModal from './RecipeTemplateModal';

interface RecipeFormSectionProps {
  productId?: string;
  membershipLevel: string;
  formData: any;
  setFormData: (data: any) => void;
}

interface RecipeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  membership_level: string;
  difficulty: string;
  cuisine_type: string;
  meal_type: string;
}

interface RecipeIngredient {
  id?: string;
  amount: string;
  unit: string;
  ingredient_name: string;
  ingredient_category?: string;
  notes?: string;
  sort_order: number;
}

interface RecipeStep {
  id?: string;
  step_number: number;
  instruction: string;
  time_minutes?: number;
  tips?: string;
  sort_order: number;
}

export const RecipeFormSection: React.FC<RecipeFormSectionProps> = ({ productId, membershipLevel, formData, setFormData }) => {
  const [templates, setTemplates] = useState<RecipeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openTemplateModal, setOpenTemplateModal] = useState<{ template: RecipeTemplate; index: number } | null>(null);

  const [recipeDetails, setRecipeDetails] = useState({
    recipe_title: '',
    category: '',
    meal_types: [] as string[],
    cuisine_types: [] as string[],
    cooking_methods: [] as string[],
    description_story: '',
    difficulty: 'medel' as 'enkel' | 'medel' | 'avancerad',
    cooking_time_minutes: 30,
    prep_time_minutes: 15,
    servings: 4,
    price_per_recipe: 0,
    is_premium: false,
    is_public: true,
    tags: [] as string[],
    season: '',
    occasion: '',
    main_ingredients: [] as string[],
    food_preferences: [] as string[]
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [steps, setSteps] = useState<RecipeStep[]>([]);

  const [nutrition, setNutrition] = useState({
    calories_per_serving: 0,
    protein_g: 0,
    fat_g: 0,
    carbs_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    salt_g: 0
  });

  const [allergens, setAllergens] = useState<string[]>([]);
  const [allowComments, setAllowComments] = useState(true);

  const EU_ALLERGENS = [
    { value: 'gluten', label: 'Spannmål (gluten)' },
    { value: 'skaldjur', label: 'Skaldjur' },
    { value: 'agg', label: 'Ägg' },
    { value: 'fisk', label: 'Fisk' },
    { value: 'jordnotter', label: 'Jordnötter' },
    { value: 'soja', label: 'Sojabönor' },
    { value: 'mjolk', label: 'Mjölk (inkl. laktos)' },
    { value: 'notter', label: 'Nötter (mandel, hassel, valnöt m.fl.)' },
    { value: 'selleri', label: 'Selleri' },
    { value: 'senap', label: 'Senap' },
    { value: 'sesamfron', label: 'Sesamfrön' },
    { value: 'svaveldioxid', label: 'Svaveldioxid och sulfit' },
    { value: 'lupin', label: 'Lupin' },
    { value: 'blotdjur', label: 'Blötdjur' }
  ];

  const CATEGORIES = [
    { value: 'forratt', label: 'Förrätt' },
    { value: 'huvudratt', label: 'Huvudrätt' },
    { value: 'efterratt', label: 'Efterrätt' },
    { value: 'dryck', label: 'Dryck' },
    { value: 'mellanmal', label: 'Mellanmål' },
    { value: 'frukost', label: 'Frukost' }
  ];

  const MEAL_TYPES = [
    { value: 'frukost', label: 'Frukost' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'middag', label: 'Middag' },
    { value: 'efterratt', label: 'Efterrätt' },
    { value: 'mellanmal', label: 'Mellanmål' },
    { value: 'barnvanligt', label: 'Barnvänligt' },
    { value: 'brunch', label: 'Brunch' },
    { value: 'festmat', label: 'Festmat' },
    { value: 'gryta', label: 'Gryta' },
    { value: 'husmanskost', label: 'Husmanskost' },
    { value: 'picknick', label: 'Picknick' },
    { value: 'romantisk_middag', label: 'Romantisk middag' },
    { value: 'soppa', label: 'Soppa' },
    { value: 'street_food', label: 'Street food' },
    { value: 'studentmat', label: 'Studentmat' },
    { value: 'halsokak', label: 'Hälsokäk' },
    { value: 'ata_i_bilen', label: 'Äta i bilen' }
  ];

  const MAIN_INGREDIENTS = [
    { value: 'fagel', label: 'Fågel' },
    { value: 'fisk', label: 'Fisk' },
    { value: 'flaskap', label: 'Fläsk' },
    { value: 'notkott', label: 'Nötkött' },
    { value: 'kyckling', label: 'Kyckling' },
    { value: 'lamm', label: 'Lamm' },
    { value: 'skaldjur', label: 'Skaldjur' },
    { value: 'vilt', label: 'Vilt' },
    { value: 'agg', label: 'Ägg' },
    { value: 'bonor', label: 'Bönor' },
    { value: 'fron', label: 'Frön' },
    { value: 'kikartor', label: 'Kikärtor' },
    { value: 'linser', label: 'Linser' },
    { value: 'notter', label: 'Nötter' },
    { value: 'quinoa', label: 'Quinoa' },
    { value: 'tofu', label: 'Tofu' },
    { value: 'tempeh', label: 'Tempeh' },
    { value: 'soja', label: 'Soja' },
    { value: 'quorn', label: 'Quorn' },
    { value: 'brod', label: 'Bröd' },
    { value: 'bulgur', label: 'Bulgur' },
    { value: 'couscous', label: 'Couscous' },
    { value: 'havregron', label: 'Havregrön' },
    { value: 'nudlar', label: 'Nudlar' },
    { value: 'pasta', label: 'Pasta' },
    { value: 'potatis', label: 'Potatis' },
    { value: 'ris', label: 'Ris' },
    { value: 'polenta', label: 'Polenta' },
    { value: 'bar', label: 'Bär' },
    { value: 'frukt', label: 'Frukt' },
    { value: 'gradde', label: 'Grädde' },
    { value: 'gronsaker', label: 'Grönsaker' },
    { value: 'mjolk', label: 'Mjölk' },
    { value: 'ost', label: 'Ost' },
    { value: 'svamp', label: 'Svamp' },
    { value: 'yoghurt', label: 'Yoghurt' }
  ];

  const CUISINE_TYPES = [
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

  const COOKING_METHODS = [
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

  const FOOD_PREFERENCES = [
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

  const SEASONS = [
    { value: 'var', label: 'Vår' },
    { value: 'sommar', label: 'Sommar' },
    { value: 'host', label: 'Höst' },
    { value: 'vinter', label: 'Vinter' },
    { value: 'jul', label: 'Jul' },
    { value: 'pask', label: 'Påsk' },
    { value: 'midsommar', label: 'Midsommar' }
  ];

  const OCCASIONS = [
    { value: 'lunch', label: 'Lunch' },
    { value: 'middag', label: 'Middag' },
    { value: 'fika', label: 'Fika' },
    { value: 'buffe', label: 'Buffé' },
    { value: 'fest', label: 'Fest' },
    { value: 'brunch', label: 'Brunch' }
  ];

  const INGREDIENT_CATEGORIES = [
    { value: 'bas', label: 'Bas' },
    { value: 'gronsak', label: 'Grönsak' },
    { value: 'kott', label: 'Kött' },
    { value: 'krydda', label: 'Krydda' },
    { value: 'mejeri', label: 'Mejeri' },
    { value: 'fisk_skaldjur', label: 'Fisk & Skaldjur' }
  ];

  const UNITS = ['g', 'kg', 'ml', 'dl', 'l', 'msk', 'tsk', 'st', 'krm', 'styck'];

  useEffect(() => {
    fetchTemplates();
    if (productId) {
      fetchRecipeData();
    }
  }, [productId, membershipLevel]);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('recipe_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data) {
      setTemplates(data);
    }
  };

  const fetchRecipeData = async () => {
    if (!productId) return;

    const { data: details } = await supabase
      .from('recipe_details')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle();

    if (details) {
      setRecipeDetails({
        recipe_title: details.recipe_title || '',
        category: details.category || '',
        meal_types: details.meal_types || [],
        cuisine_types: details.cuisine_types || [],
        cooking_methods: details.cooking_methods || [],
        description_story: details.description_story || '',
        difficulty: details.difficulty || 'medel',
        cooking_time_minutes: details.cooking_time_minutes || 30,
        prep_time_minutes: details.prep_time_minutes || 15,
        servings: details.servings || 4,
        price_per_recipe: details.price_per_recipe || 0,
        is_premium: details.is_premium || false,
        is_public: details.is_public ?? true,
        tags: details.tags || [],
        season: details.season || '',
        occasion: details.occasion || '',
        main_ingredients: details.main_ingredients || [],
        food_preferences: details.food_preferences || []
      });
      if (details.template_id) {
        setSelectedTemplate(details.template_id);
      }
    }

    const { data: ingredientsData } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_detail_id', details?.id)
      .order('sort_order');

    if (ingredientsData) {
      setIngredients(ingredientsData);
    }

    const { data: stepsData } = await supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_detail_id', details?.id)
      .order('sort_order');

    if (stepsData) {
      setSteps(stepsData);
    }

    const { data: nutritionData } = await supabase
      .from('recipe_nutrition')
      .select('*')
      .eq('recipe_detail_id', details?.id)
      .maybeSingle();

    if (nutritionData) {
      setNutrition({
        calories_per_serving: nutritionData.calories_per_serving || 0,
        protein_g: nutritionData.protein_g || 0,
        fat_g: nutritionData.fat_g || 0,
        carbs_g: nutritionData.carbs_g || 0,
        fiber_g: nutritionData.fiber_g || 0,
        sugar_g: nutritionData.sugar_g || 0,
        salt_g: nutritionData.salt_g || 0
      });
    }
  };

  const handleOpenTemplate = (template: RecipeTemplate, index: number) => {
    setOpenTemplateModal({ template, index });
  };

  const handleApplyTemplate = (data: any) => {
    setRecipeDetails({
      ...recipeDetails,
      ...data
    });
    setOpenTemplateModal(null);
    setShowTemplates(false);
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        amount: '',
        unit: 'g',
        ingredient_name: '',
        ingredient_category: '',
        notes: '',
        sort_order: ingredients.length
      }
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_number: steps.length + 1,
        instruction: '',
        time_minutes: 0,
        tips: '',
        sort_order: steps.length
      }
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      step_number: i + 1,
      sort_order: i
    })));
  };

  const updateStep = (index: number, field: keyof RecipeStep, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const getTemplateCount = () => {
    return 20;
  };

  const canUseTemplates = () => {
    return true;
  };

  const toggleArrayValue = (arr: string[], value: string) => {
    if (arr.includes(value)) {
      return arr.filter(v => v !== value);
    } else {
      return [...arr, value];
    }
  };

  return (
    <>
      {openTemplateModal && (
        <RecipeTemplateModal
          template={openTemplateModal.template}
          templateIndex={openTemplateModal.index}
          onClose={() => setOpenTemplateModal(null)}
          onSave={handleApplyTemplate}
        />
      )}

      <div className="border-t border-gray-300 pt-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Receptdetaljer</h3>

      {/* Recipe Templates Button - Always visible */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📖</span>
          <h3 className="text-2xl font-bold text-gray-900 italic">Receptmallar</h3>
        </div>

        <p className="text-gray-600 mb-2">
          Du har tillgång till {getTemplateCount()} receptmallar!
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Välj en mall för att komma igång snabbare med förifyllda inställningar.
        </p>

        {!showTemplates ? (
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="w-full bg-[#a1c798] hover:bg-[#8fb886] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Se receptmallar (20 st)
          </button>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-2">
              {templates.map((template, index) => {
                const isLocked = false;
                const cardStyles = [
                  { bg: '#a1c798', emoji: '🍳', font: 'font-serif' },
                  { bg: '#8fb886', emoji: '👨‍🍳', font: 'font-sans' },
                  { bg: '#a1c798', emoji: '🥘', font: 'font-mono' },
                  { bg: '#7da876', emoji: '🍽️', font: 'font-serif' },
                  { bg: '#a1c798', emoji: '🥗', font: 'font-sans' },
                  { bg: '#8fb886', emoji: '🍲', font: 'font-serif' },
                  { bg: '#a1c798', emoji: '🥙', font: 'font-mono' },
                  { bg: '#7da876', emoji: '🍛', font: 'font-sans' },
                  { bg: '#a1c798', emoji: '🌮', font: 'font-serif' },
                  { bg: '#8fb886', emoji: '💰', font: 'font-sans' },
                  { bg: '#a1c798', emoji: '📦', font: 'font-serif' },
                  { bg: '#7da876', emoji: '🔥', font: 'font-mono' },
                  { bg: '#a1c798', emoji: '☕', font: 'font-sans' },
                  { bg: '#8fb886', emoji: '🧁', font: 'font-serif' },
                  { bg: '#a1c798', emoji: '🎉', font: 'font-mono' },
                  { bg: '#7da876', emoji: '💪', font: 'font-sans' },
                  { bg: '#a1c798', emoji: '👶', font: 'font-serif' },
                  { bg: '#8fb886', emoji: '♻️', font: 'font-sans' },
                  { bg: '#a1c798', emoji: '📚', font: 'font-mono' },
                  { bg: '#7da876', emoji: '🍰', font: 'font-serif' }
                ];
                const style = cardStyles[index % cardStyles.length];

                return (
                  <div
                    key={template.id}
                    className={`relative p-6 rounded-xl shadow-lg transition-all hover:shadow-2xl hover:scale-105 ${
                      isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{ backgroundColor: style.bg }}
                    onClick={() => handleOpenTemplate(template, index)}
                  >
                    {isLocked && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                        <span className="text-lg">🔒</span>
                      </div>
                    )}
                    <div className="text-center mb-3">
                      <span className="text-4xl">{style.emoji}</span>
                    </div>
                    <h5 className={`${style.font} text-white font-bold text-lg mb-2 text-center`}>
                      {template.name}
                    </h5>
                    <p className="text-white text-sm mb-3 text-center opacity-90">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs mb-3">
                      <span className="px-3 py-1 bg-white bg-opacity-30 text-white rounded-full">
                        {template.category}
                      </span>
                      <span className="px-3 py-1 bg-white bg-opacity-30 text-white rounded-full">
                        {template.difficulty}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTemplate(template, index);
                      }}
                      className="w-full bg-white text-[#a1c798] font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      Öppna mall
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowTemplates(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Stäng mallar
            </button>
          </div>
        )}
      </div>


      {/* Basic Recipe Info */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Grundinformation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              value={recipeDetails.category}
              onChange={(e) => setRecipeDetails({ ...recipeDetails, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
              required
            >
              <option value="">Välj kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Svårighetsgrad *
            </label>
            <select
              value={recipeDetails.difficulty}
              onChange={(e) => setRecipeDetails({ ...recipeDetails, difficulty: e.target.value as 'enkel' | 'medel' | 'avancerad' })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
              required
            >
              <option value="enkel">Enkel</option>
              <option value="medel">Medel</option>
              <option value="avancerad">Avancerad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tillagningstid (minuter) *
            </label>
            <input
              type="number"
              value={recipeDetails.cooking_time_minutes}
              onChange={(e) => setRecipeDetails({ ...recipeDetails, cooking_time_minutes: parseInt(e.target.value) || 0 })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antal portioner *
            </label>
            <input
              type="number"
              value={recipeDetails.servings}
              onChange={(e) => setRecipeDetails({ ...recipeDetails, servings: parseInt(e.target.value) || 4 })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Säsong / Tema
            </label>
            <select
              value={recipeDetails.season}
              onChange={(e) => setRecipeDetails({ ...recipeDetails, season: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            >
              <option value="">Välj säsong</option>
              {SEASONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passar till
            </label>
            <select
              value={recipeDetails.occasion}
              onChange={(e) => setRecipeDetails({ ...recipeDetails, occasion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            >
              <option value="">Välj tillfälle</option>
              {OCCASIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beskrivning / Story
          </label>
          <textarea
            value={recipeDetails.description_story}
            onChange={(e) => setRecipeDetails({ ...recipeDetails, description_story: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#56c5c5' } as any}
            placeholder="Berätta om receptets bakgrund eller känsla..."
          />
        </div>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recipeDetails.is_premium}
              onChange={(e) => setRecipeDetails({ ...recipeDetails, is_premium: e.target.checked })}
              className="rounded text-[#56c5c5]"
            />
            <span className="text-sm font-medium text-gray-700">
              Detta är ett premiumrecept (till försäljning)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recipeDetails.is_public}
              onChange={(e) => setRecipeDetails({ ...recipeDetails, is_public: e.target.checked })}
              className="rounded text-[#56c5c5]"
            />
            <span className="text-sm font-medium text-gray-700">
              Synligt för alla (avmarkera för endast utkast)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              className="rounded text-[#56c5c5]"
            />
            <span className="text-sm font-medium text-gray-700">
              Tillåt kommentarer på receptet
            </span>
          </label>
        </div>

        {recipeDetails.is_premium && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pris (SEK)
            </label>
            <input
              type="number"
              value={recipeDetails.price_per_recipe}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                setRecipeDetails({ ...recipeDetails, price_per_recipe: price });
                setFormData({ ...formData, price: price.toString() });
              }}
              min="0"
              step="0.01"
              className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>
        )}
      </div>

      {/* Mattyp */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Mattyp (för filtrering)
        </h4>
        <p className="text-sm text-gray-600 mb-3">Välj alla som passar - används för sökning och filtrering</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MEAL_TYPES.map(mt => (
            <label key={mt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recipeDetails.meal_types.includes(mt.value)}
                onChange={() => setRecipeDetails({
                  ...recipeDetails,
                  meal_types: toggleArrayValue(recipeDetails.meal_types, mt.value)
                })}
                className="rounded text-[#56c5c5]"
              />
              <span className="text-sm text-gray-700">{mt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Ingredients */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Huvudingredienser (för filtrering)
        </h4>
        <p className="text-sm text-gray-600 mb-3">Välj alla som passar - används för sökning och filtrering</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MAIN_INGREDIENTS.map(ing => (
            <label key={ing.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recipeDetails.main_ingredients.includes(ing.value)}
                onChange={() => setRecipeDetails({
                  ...recipeDetails,
                  main_ingredients: toggleArrayValue(recipeDetails.main_ingredients, ing.value)
                })}
                className="rounded text-[#56c5c5]"
              />
              <span className="text-sm text-gray-700">{ing.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Matkultur */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Matkultur (för filtrering)
        </h4>
        <p className="text-sm text-gray-600 mb-3">Välj alla som passar - används för sökning och filtrering</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CUISINE_TYPES.map(ct => (
            <label key={ct.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recipeDetails.cuisine_types.includes(ct.value)}
                onChange={() => setRecipeDetails({
                  ...recipeDetails,
                  cuisine_types: toggleArrayValue(recipeDetails.cuisine_types, ct.value)
                })}
                className="rounded text-[#56c5c5]"
              />
              <span className="text-sm text-gray-700">{ct.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tillagningssätt */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Tillagningssätt (för filtrering)
        </h4>
        <p className="text-sm text-gray-600 mb-3">Välj alla som passar - används för sökning och filtrering</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COOKING_METHODS.map(cm => (
            <label key={cm.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recipeDetails.cooking_methods.includes(cm.value)}
                onChange={() => setRecipeDetails({
                  ...recipeDetails,
                  cooking_methods: toggleArrayValue(recipeDetails.cooking_methods, cm.value)
                })}
                className="rounded text-[#56c5c5]"
              />
              <span className="text-sm text-gray-700">{cm.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Food Preferences */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Matpreferenser (för filtrering)
        </h4>
        <p className="text-sm text-gray-600 mb-3">Välj alla som passar - används för sökning och filtrering</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {FOOD_PREFERENCES.map(pref => (
            <label key={pref.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recipeDetails.food_preferences.includes(pref.value)}
                onChange={() => setRecipeDetails({
                  ...recipeDetails,
                  food_preferences: toggleArrayValue(recipeDetails.food_preferences, pref.value)
                })}
                className="rounded text-[#56c5c5]"
              />
              <span className="text-sm text-gray-700">{pref.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Ingredienser
        </h4>
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                placeholder="Mängd"
                value={ingredient.amount}
                onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                className="w-20 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#56c5c5' } as any}
              />
              <select
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                className="w-20 px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#56c5c5' } as any}
              >
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Ingrediens"
                value={ingredient.ingredient_name}
                onChange={(e) => updateIngredient(index, 'ingredient_name', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#56c5c5' } as any}
              />
              <select
                value={ingredient.ingredient_category || ''}
                onChange={(e) => updateIngredient(index, 'ingredient_category', e.target.value)}
                className="w-32 px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#56c5c5' } as any}
              >
                <option value="">Kategori</option>
                {INGREDIENT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Kommentar"
                value={ingredient.notes || ''}
                onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#56c5c5' } as any}
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#56c5c5' }}
        >
          <Plus size={16} />
          Lägg till ingrediens
        </button>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Steg-för-steg-instruktioner
        </h4>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">Steg {step.step_number}</h5>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <textarea
                placeholder="Instruktion..."
                value={step.instruction}
                onChange={(e) => updateStep(index, 'instruction', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 mb-2"
                style={{ '--tw-ring-color': '#56c5c5' } as any}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tid (minuter)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={step.time_minutes || ''}
                    onChange={(e) => updateStep(index, 'time_minutes', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tips / varning
                  </label>
                  <input
                    type="text"
                    placeholder="Valfritt..."
                    value={step.tips || ''}
                    onChange={(e) => updateStep(index, 'tips', e.target.value)}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#56c5c5' }}
        >
          <Plus size={16} />
          Lägg till steg
        </button>
      </div>

      {/* EU Allergens */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          ⚠️ Allergener (EU:s 14 lagstadgade)
        </h4>
        <p className="text-sm text-gray-600 mb-3">Markera alla allergener som ingår i receptet:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EU_ALLERGENS.map(allergen => (
            <label key={allergen.value} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={allergens.includes(allergen.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAllergens([...allergens, allergen.value]);
                  } else {
                    setAllergens(allergens.filter(a => a !== allergen.value));
                  }
                }}
                className="rounded text-[#56c5c5]"
              />
              <span className="text-sm text-gray-700">{allergen.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Näringsvärden per portion (valfritt)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Energi (kcal)
            </label>
            <input
              type="number"
              value={nutrition.calories_per_serving || ''}
              onChange={(e) => setNutrition({ ...nutrition, calories_per_serving: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              value={nutrition.protein_g || ''}
              onChange={(e) => setNutrition({ ...nutrition, protein_g: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fett (g)
            </label>
            <input
              type="number"
              value={nutrition.fat_g || ''}
              onChange={(e) => setNutrition({ ...nutrition, fat_g: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Kolhydrater (g)
            </label>
            <input
              type="number"
              value={nutrition.carbs_g || ''}
              onChange={(e) => setNutrition({ ...nutrition, carbs_g: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fiber (g)
            </label>
            <input
              type="number"
              value={nutrition.fiber_g || ''}
              onChange={(e) => setNutrition({ ...nutrition, fiber_g: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Socker (g)
            </label>
            <input
              type="number"
              value={nutrition.sugar_g || ''}
              onChange={(e) => setNutrition({ ...nutrition, sugar_g: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Salt (g)
            </label>
            <input
              type="number"
              value={nutrition.salt_g || ''}
              onChange={(e) => setNutrition({ ...nutrition, salt_g: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>
        </div>
      </div>

      {/* Preview Button */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
          Förhandsgranskning
        </h4>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
        >
          <Eye size={20} />
          Förhandsgranska recept
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Se hur receptet ser ut för kunder innan du publicerar
        </p>
      </div>

      {/* Preview Modal (placeholder) */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Förhandsgranskning</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-xl font-semibold mb-2">{recipeDetails.recipe_title || 'Recepttitel'}</h3>
              <p className="text-gray-600 mb-4">{recipeDetails.description_story || 'Beskrivning saknas'}</p>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><strong>Portioner:</strong> {recipeDetails.servings}</div>
                <div><strong>Tid:</strong> {recipeDetails.cooking_time_minutes} min</div>
                <div><strong>Svårighet:</strong> {recipeDetails.difficulty}</div>
                {recipeDetails.cuisine_type && <div><strong>Matkultur:</strong> {recipeDetails.cuisine_type}</div>}
              </div>
              {ingredients.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Ingredienser:</h4>
                  <ul className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <li key={i} className="flex flex-col">
                        <span className="font-medium">• {ing.amount} {ing.unit} {ing.ingredient_name}</span>
                        {ing.notes && (
                          <span className="text-sm text-gray-600 ml-4 italic">{ing.notes}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {steps.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Instruktioner:</h4>
                  <ol className="space-y-3">
                    {steps.map((step, i) => (
                      <li key={i} className="flex flex-col">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">{i + 1}.</span>
                          <div className="flex-1">
                            <p>{step.instruction}</p>
                            {step.time_minutes && step.time_minutes > 0 && (
                              <p className="text-sm text-gray-600 mt-1">⏱️ {step.time_minutes} min</p>
                            )}
                            {step.tips && (
                              <p className="text-sm text-amber-700 mt-1 bg-amber-50 px-2 py-1 rounded">💡 {step.tips}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
