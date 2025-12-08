import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MealBoxCollage } from '../components/MealBoxCollage';
import { RecipeFormSection } from '../components/RecipeFormSection';
import { RecipeIngredientsSection } from '../components/RecipeIngredientsSection';

const PRODUCT_TYPES = [
  { value: 'dish', label: 'Maträtt' },
  { value: 'meal_box', label: 'Matlådekasse' },
  { value: 'subscription', label: 'Prenumeration' },
  { value: 'diy_kit', label: 'Laga-själv-kit' },
  { value: 'hire_chef', label: 'Hyra kock' },
  { value: 'catering', label: 'Catering' },
  { value: 'recipe', label: 'Recept' },
  { value: 'video', label: 'Instruktionsvideo' }
];

const PRODUCT_CATEGORIES = [
  { value: 'pa_spisen_nu', label: 'På spisen nu' },
  { value: 'fran_frysen', label: 'Från frysen' },
  { value: 'matladekas', label: 'Matlådekassar' },
  { value: 'laga_sjalv_kit', label: 'Laga-själv-kit' },
  { value: 'brattomkak', label: 'Bråttomkäk' },
  { value: 'testkaka', label: 'Testkäka' }
];

const FOOD_TYPES = [
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

const ALLERGENS = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'skaldjur', label: 'Skaldjur' },
  { value: 'agg', label: 'Ägg' },
  { value: 'fisk', label: 'Fisk' },
  { value: 'jordnotter', label: 'Jordnötter' },
  { value: 'soja', label: 'Soja' },
  { value: 'mjolk', label: 'Mjölk' },
  { value: 'notter', label: 'Nötter' },
  { value: 'selleri', label: 'Selleri' },
  { value: 'senap', label: 'Senap' },
  { value: 'sesamfron', label: 'Sesamfrön' },
  { value: 'svaveldioxid', label: 'Svaveldioxid' },
  { value: 'lupin', label: 'Lupin' },
  { value: 'blotdjur', label: 'Blötdjur' }
];

const PORTION_SIZES = [
  { value: 'liten', label: 'Liten' },
  { value: 'standard', label: 'Standard' },
  { value: 'stor', label: 'Stor' }
];

export const ProductForm: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'dish' as string,
    description: '',
    price: '',
    ingredients: '',
    allergens: [] as string[],
    image_url: '',
    available: true,
    food_types: [] as string[],
    main_ingredients: [] as string[],
    cooking_methods: [] as string[],
    food_preferences: [] as string[],
    cuisine_types: [] as string[],
    accessories: '',
    price_small: '',
    price_standard: '',
    price_large: '',
    price_package: '',
    freezer_portions: '0'
  });

  const [myAccessories, setMyAccessories] = useState<any[]>([]);
  const [productAccessories, setProductAccessories] = useState<{
    accessory_id: string;
    included_in_price: boolean;
    default_quantity: number;
    max_quantity: number;
  }[]>([]);
  const [showNewAccessory, setShowNewAccessory] = useState(false);
  const [newAccessory, setNewAccessory] = useState({
    name: '',
    description: '',
    ingredients: '',
    price: ''
  });

  // Meal box specific state
  const [mealBoxTemplates, setMealBoxTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [templateSearch, setTemplateSearch] = useState<string>('');

  // Subscription templates
  const [subscriptionTemplates, setSubscriptionTemplates] = useState<any[]>([]);
  const [selectedSubscriptionTemplate, setSelectedSubscriptionTemplate] = useState<string>('');
  const [templateAppliedFeedback, setTemplateAppliedFeedback] = useState<{
    show: boolean;
    templateName: string;
    type: 'meal_box' | 'subscription';
    templateData?: any;
  }>({ show: false, templateName: '', type: 'meal_box', templateData: null });
  const [mealBoxDetails, setMealBoxDetails] = useState({
    total_dishes: 0,
    total_portions: 0,
    offers_pickup: true,
    offers_delivery: false,
    delivery_day: '',
    pickup_time_start: '',
    pickup_time_end: '',
    delivery_time_start: '',
    delivery_time_end: '',
    delivery_notes: '',
    has_capacity_limit: false,
    unlimited_capacity: true,
    show_remaining_spots: true,
    low_capacity_threshold: 3,
    use_custom_image: false
  });
  const [mealBoxDishes, setMealBoxDishes] = useState<{
    dish_id: string;
    portions_per_dish: number;
    sort_order: number;
  }[]>([]);
  const [myDishes, setMyDishes] = useState<any[]>([]);

  // Capacity management state
  const [recurringSchedule, setRecurringSchedule] = useState({
    is_recurring: false,
    recurrence_pattern: 'weekly' as 'weekly' | 'biweekly' | 'monthly',
    weekdays: [] as string[],
    default_capacity_per_slot: 10,
    auto_generate_weeks_ahead: 4,
    is_active: true
  });
  const [capacityPeriods, setCapacityPeriods] = useState<{
    id?: string;
    delivery_date: string;
    max_capacity: number;
    current_bookings?: number;
  }[]>([]);

  // Subscription specific state
  const [recipeIngredients, setRecipeIngredients] = useState<{
    id?: string;
    ingredient_name: string;
    quantity_per_portion: number;
    unit: string;
    category: string;
  }[]>([]);

  const [subscriptionDetails, setSubscriptionDetails] = useState({
    subscription_item_type: 'dish' as 'dish' | 'meal_box' | 'diy_kit',
    subscription_item_id: '',
    max_subscribers: 10,
    delivery_day: '',
    offers_pickup: true,
    pickup_time_start: '',
    pickup_time_end: '',
    offers_delivery: false,
    delivery_time_start: '',
    delivery_time_end: '',
    delivery_notes: '',
    frequency: 'weekly' as 'weekly' | 'biweekly' | 'monthly',
    binding_months: 1
  });
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  // DIY Kit specific state
  const [diyKitDetails, setDiyKitDetails] = useState({
    linked_recipe_id: '',
    portions: 4,
    shelf_life_days: 3,
    packaging_info: '',
    offers_pickup: true,
    offers_delivery: false,
    delivery_cost: ''
  });

  // Hire Chef specific state
  const [hireChefDetails, setHireChefDetails] = useState({
    occasion_type: '' as string,
    min_guests: 2,
    max_guests: 20,
    pricing_structure: 'per_person' as 'per_person' | 'fixed',
    location_area: '',
    requires_kitchen: true,
    chef_brings_equipment: false,
    sample_menu: '',
    time_required_hours: 4,
    preparation_requirements: '',
    extras: [] as string[],
    travel_cost_per_km: '',
    available_dates: [] as string[]
  });

  // Catering specific state
  const [cateringDetails, setCateringDetails] = useState({
    catering_type: '' as string,
    min_portions: 10,
    max_portions: 100,
    price_per_portion: '',
    menu_options: '',
    offers_pickup: true,
    offers_delivery: false,
    delivery_cost: '',
    advance_notice_days: 3,
    packaging_info: '',
    extras: ''
  });

  // Video specific state
  const [videoDetails, setVideoDetails] = useState({
    video_type: '' as string,
    video_url: '',
    video_length_minutes: 0,
    membership_level_required: 'free' as 'free' | 'silver' | 'gold',
    linked_recipe_id: '',
    tags: '',
    allow_comments: true,
    preview_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchMyAccessories();
      fetchMyDishes();
    }
    if (id) {
      fetchProduct();
      fetchProductAccessories();
      fetchMealBoxData();
      fetchRecurringSchedule();
      fetchCapacityPeriods();
      fetchSubscriptionData();
      fetchRecipeIngredients();
    }
    if (formData.type === 'subscription') {
      fetchAvailableItems();
    }
  }, [id, user]);

  useEffect(() => {
    fetchMealBoxTemplates();
    fetchSubscriptionTemplates();
  }, []);

  useEffect(() => {
    if (formData.type === 'subscription' || subscriptionDetails.subscription_item_type) {
      fetchAvailableItems();
    }
  }, [subscriptionDetails.subscription_item_type, formData.type]);

  const fetchMealBoxTemplates = async () => {
    const { data, error } = await supabase
      .from('meal_box_templates')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (!error && data) {
      setMealBoxTemplates(data);
    }
  };

  const fetchSubscriptionTemplates = async () => {
    const { data, error } = await supabase
      .from('subscription_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setSubscriptionTemplates(data);
    }
  };

  const fetchMyDishes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .eq('type', 'dish')
      .eq('available', true)
      .order('name');

    if (!error && data) {
      setMyDishes(data);
    }
  };

  const fetchMealBoxData = async () => {
    if (!id) return;

    // Fetch meal box details
    const { data: details, error: detailsError } = await supabase
      .from('meal_box_details')
      .select('*')
      .eq('product_id', id)
      .maybeSingle();

    if (!detailsError && details) {
      setMealBoxDetails({
        total_dishes: details.total_dishes || 0,
        total_portions: details.total_portions || 0,
        offers_pickup: details.offers_pickup ?? true,
        offers_delivery: details.offers_delivery ?? false,
        delivery_day: details.delivery_day || '',
        pickup_time_start: details.pickup_time_start || '',
        pickup_time_end: details.pickup_time_end || '',
        delivery_time_start: details.delivery_time_start || '',
        delivery_time_end: details.delivery_time_end || '',
        delivery_notes: details.delivery_notes || '',
        has_capacity_limit: details.has_capacity_limit || false,
        unlimited_capacity: details.unlimited_capacity ?? true,
        show_remaining_spots: details.show_remaining_spots ?? true,
        low_capacity_threshold: details.low_capacity_threshold || 3
      });
      if (details.template_id) {
        setSelectedTemplate(details.template_id);
      }
    }

    // Fetch meal box dishes
    const { data: dishes, error: dishesError } = await supabase
      .from('meal_box_dishes')
      .select('*')
      .eq('meal_box_id', id)
      .order('sort_order');

    if (!dishesError && dishes) {
      setMealBoxDishes(dishes);
    }
  };

  const fetchRecurringSchedule = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('meal_box_recurring_schedule')
      .select('*')
      .eq('product_id', id)
      .maybeSingle();

    if (!error && data) {
      setRecurringSchedule({
        is_recurring: data.is_recurring || false,
        recurrence_pattern: data.recurrence_pattern || 'weekly',
        weekdays: data.weekdays || [],
        default_capacity_per_slot: data.default_capacity_per_slot || 10,
        auto_generate_weeks_ahead: data.auto_generate_weeks_ahead || 4,
        is_active: data.is_active ?? true
      });
    }
  };

  const fetchCapacityPeriods = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('meal_box_capacity_periods')
      .select('*')
      .eq('product_id', id)
      .gte('delivery_date', new Date().toISOString().split('T')[0])
      .order('delivery_date');

    if (!error && data) {
      setCapacityPeriods(data.map(p => ({
        id: p.id,
        delivery_date: p.delivery_date,
        max_capacity: p.max_capacity,
        current_bookings: p.current_bookings
      })));
    }
  };

  const fetchSubscriptionData = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('subscription_details')
      .select('*')
      .eq('product_id', id)
      .maybeSingle();

    if (!error && data) {
      setSubscriptionDetails({
        subscription_item_type: data.subscription_item_type || 'dish',
        subscription_item_id: data.subscription_item_id || '',
        max_subscribers: data.max_subscribers || 10,
        delivery_day: data.delivery_day || '',
        delivery_time_start: data.delivery_time_start || '',
        delivery_time_end: data.delivery_time_end || '',
        delivery_method: data.delivery_method || 'pickup',
        delivery_notes: data.delivery_notes || ''
      });
    }
  };

  const fetchAvailableItems = async () => {
    if (!user) return;

    const itemType = subscriptionDetails.subscription_item_type;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .eq('type', itemType)
      .eq('available', true)
      .order('name');

    if (!error && data) {
      setAvailableItems(data);
    }
  };

  const fetchMyAccessories = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .eq('seller_id', user.id)
      .order('name');

    if (!error && data) {
      setMyAccessories(data);
    }
  };

  const fetchProductAccessories = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('product_accessories')
      .select('*')
      .eq('product_id', id);

    if (!error && data) {
      setProductAccessories(data);
    }
  };

  const fetchRecipeIngredients = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('product_recipe_ingredients')
      .select('*')
      .eq('product_id', id)
      .order('created_at');

    if (!error && data) {
      setRecipeIngredients(data);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      setError('Kunde inte ladda produkten');
      return;
    }

    if (data) {
      setFormData({
        name: data.name || '',
        type: data.type || 'dish',
        description: data.description || '',
        price: data.price?.toString() || '',
        ingredients: data.ingredients?.join(', ') || '',
        allergens: data.allergens || [],
        image_url: data.image_url || '',
        available: data.available ?? true,
        food_types: data.food_types || [],
        main_ingredients: data.main_ingredients || [],
        cooking_methods: data.cooking_methods || [],
        food_preferences: data.food_preferences || [],
        cuisine_types: data.cuisine_types || [],
        accessories: data.accessories || '',
        price_small: data.price_small?.toString() || '',
        price_standard: data.price_standard?.toString() || '',
        price_large: data.price_large?.toString() || '',
        price_package: data.price_package?.toString() || '',
        freezer_portions: data.freezer_portions?.toString() || '0'
      });
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Kunde inte ladda upp bild');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Du måste vara inloggad');
      setLoading(false);
      return;
    }

    if (formData.type === 'meal_box') {
      const totalPortionsInDishes = mealBoxDishes.reduce((sum, dish) => sum + dish.portions_per_dish, 0);
      if (totalPortionsInDishes !== mealBoxDetails.total_portions) {
        setError(`Portionerna stämmer inte! Du har angivit att kassen ska innehålla ${mealBoxDetails.total_portions} portioner totalt, men de valda maträtterna innehåller ${totalPortionsInDishes} portioner. Justera antingen "Totalt antal portioner" eller antalet portioner per maträtt.`);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const uploadedImageUrl = await uploadImage();
    if (imageFile && !uploadedImageUrl) {
      setLoading(false);
      return;
    }

    const baseProductData = {
      name: formData.name,
      type: formData.type,
      description: formData.description || null,
      price: formData.price ? parseFloat(formData.price) : null,
      ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : null,
      allergens: formData.allergens.length > 0 ? formData.allergens : null,
      image_url: uploadedImageUrl || null,
      available: formData.available,
      food_types: formData.food_types.length > 0 ? formData.food_types : null,
      main_ingredients: formData.main_ingredients.length > 0 ? formData.main_ingredients : null,
      cooking_methods: formData.cooking_methods.length > 0 ? formData.cooking_methods : null,
      food_preferences: formData.food_preferences.length > 0 ? formData.food_preferences : null,
      cuisine_types: formData.cuisine_types.length > 0 ? formData.cuisine_types : null,
      accessories: formData.accessories || null,
      price_small: formData.price_small ? parseFloat(formData.price_small) : null,
      price_standard: formData.price_standard ? parseFloat(formData.price_standard) : null,
      price_large: formData.price_large ? parseFloat(formData.price_large) : null,
      price_package: formData.price_package ? parseFloat(formData.price_package) : null,
      freezer_portions: formData.freezer_portions ? parseInt(formData.freezer_portions) : 0
    };

    try {
      let savedProductId = id;

      if (id) {
        const { error } = await supabase
          .from('products')
          .update(baseProductData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const productDataWithSeller = {
          ...baseProductData,
          seller_id: user.id
        };

        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productDataWithSeller])
          .select('id')
          .single();

        if (error) throw error;

        if (newProduct) {
          savedProductId = newProduct.id;
        }
      }

      // Save product accessories
      if (savedProductId) {
        // Delete existing product accessories
        await supabase
          .from('product_accessories')
          .delete()
          .eq('product_id', savedProductId);

        // Insert new product accessories
        if (productAccessories.length > 0) {
          await supabase
            .from('product_accessories')
            .insert(
              productAccessories.map(pa => ({
                product_id: savedProductId,
                accessory_id: pa.accessory_id,
                included_in_price: pa.included_in_price,
                default_quantity: pa.default_quantity,
                max_quantity: pa.max_quantity
              }))
            );
        }
      }

      // Save meal box specific data
      if (formData.type === 'meal_box' && savedProductId) {
        // Delete existing meal box details
        await supabase
          .from('meal_box_details')
          .delete()
          .eq('product_id', savedProductId);

        // Insert new meal box details
        await supabase
          .from('meal_box_details')
          .insert([{
            product_id: savedProductId,
            template_id: selectedTemplate || null,
            total_dishes: mealBoxDetails.total_dishes,
            total_portions: mealBoxDetails.total_portions,
            offers_pickup: mealBoxDetails.offers_pickup,
            offers_delivery: mealBoxDetails.offers_delivery,
            delivery_day: mealBoxDetails.delivery_day || null,
            pickup_time_start: mealBoxDetails.pickup_time_start || null,
            pickup_time_end: mealBoxDetails.pickup_time_end || null,
            delivery_time_start: mealBoxDetails.delivery_time_start || null,
            delivery_time_end: mealBoxDetails.delivery_time_end || null,
            delivery_notes: mealBoxDetails.delivery_notes || null,
            has_capacity_limit: mealBoxDetails.has_capacity_limit,
            unlimited_capacity: mealBoxDetails.unlimited_capacity,
            show_remaining_spots: mealBoxDetails.show_remaining_spots,
            low_capacity_threshold: mealBoxDetails.low_capacity_threshold,
            use_custom_image: mealBoxDetails.use_custom_image
          }]);

        // Delete existing meal box dishes
        await supabase
          .from('meal_box_dishes')
          .delete()
          .eq('meal_box_id', savedProductId);

        // Insert new meal box dishes
        if (mealBoxDishes.length > 0) {
          await supabase
            .from('meal_box_dishes')
            .insert(
              mealBoxDishes.map(dish => ({
                meal_box_id: savedProductId,
                dish_id: dish.dish_id,
                portions_per_dish: dish.portions_per_dish,
                sort_order: dish.sort_order
              }))
            );
        }

        // Save recurring schedule
        if (recurringSchedule.is_recurring) {
          await supabase
            .from('meal_box_recurring_schedule')
            .delete()
            .eq('product_id', savedProductId);

          await supabase
            .from('meal_box_recurring_schedule')
            .insert([{
              product_id: savedProductId,
              is_recurring: recurringSchedule.is_recurring,
              recurrence_pattern: recurringSchedule.recurrence_pattern,
              weekdays: recurringSchedule.weekdays,
              default_capacity_per_slot: recurringSchedule.default_capacity_per_slot,
              auto_generate_weeks_ahead: recurringSchedule.auto_generate_weeks_ahead,
              is_active: recurringSchedule.is_active
            }]);

          // Generate capacity periods for recurring schedule
          await supabase.rpc('generate_recurring_capacity_periods', {
            p_product_id: savedProductId,
            p_weeks_ahead: recurringSchedule.auto_generate_weeks_ahead
          });
        } else if (mealBoxDetails.has_capacity_limit && !mealBoxDetails.unlimited_capacity) {
          // Save manual capacity periods for one-time offerings
          await supabase
            .from('meal_box_capacity_periods')
            .delete()
            .eq('product_id', savedProductId);

          if (capacityPeriods.length > 0) {
            await supabase
              .from('meal_box_capacity_periods')
              .insert(
                capacityPeriods.map(cp => ({
                  product_id: savedProductId,
                  delivery_date: cp.delivery_date,
                  max_capacity: cp.max_capacity,
                  current_bookings: 0,
                  is_active: true
                }))
              );
          }
        }
      }

      // Save subscription specific data
      if (formData.type === 'subscription' && savedProductId) {
        await supabase
          .from('subscription_details')
          .delete()
          .eq('product_id', savedProductId);

        await supabase
          .from('subscription_details')
          .insert([{
            product_id: savedProductId,
            subscription_item_type: subscriptionDetails.subscription_item_type,
            subscription_item_id: subscriptionDetails.subscription_item_id || null,
            max_subscribers: subscriptionDetails.max_subscribers,
            delivery_day: subscriptionDetails.delivery_day || null,
            delivery_time_start: subscriptionDetails.delivery_time_start || null,
            delivery_time_end: subscriptionDetails.delivery_time_end || null,
            delivery_method: subscriptionDetails.delivery_method,
            delivery_notes: subscriptionDetails.delivery_notes || null,
            current_subscribers: 0,
            is_full: false
          }]);
      }

      // Save recipe ingredients
      if (savedProductId) {
        await supabase
          .from('product_recipe_ingredients')
          .delete()
          .eq('product_id', savedProductId);

        if (recipeIngredients.length > 0) {
          const validIngredients = recipeIngredients.filter(
            ing => ing.ingredient_name && ing.quantity_per_portion > 0
          );

          if (validIngredients.length > 0) {
            await supabase
              .from('product_recipe_ingredients')
              .insert(
                validIngredients.map(ing => ({
                  product_id: savedProductId,
                  ingredient_name: ing.ingredient_name,
                  quantity_per_portion: ing.quantity_per_portion,
                  unit: ing.unit,
                  category: ing.category || null
                }))
              );
          }
        }
      }

      alert('Produkten har sparats!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccessory = async () => {
    if (!user || !newAccessory.name || !newAccessory.price) {
      setError('Fyll i namn och pris för tillbehöret');
      return;
    }

    const { data, error } = await supabase
      .from('accessories')
      .insert([{
        seller_id: user.id,
        name: newAccessory.name,
        description: newAccessory.description || null,
        ingredients: newAccessory.ingredients ? newAccessory.ingredients.split(',').map(i => i.trim()) : null,
        price: parseFloat(newAccessory.price)
      }])
      .select()
      .single();

    if (error) {
      setError('Kunde inte skapa tillbehör');
      return;
    }

    if (data) {
      setMyAccessories([...myAccessories, data]);
      setNewAccessory({ name: '', description: '', ingredients: '', price: '' });
      setShowNewAccessory(false);
    }
  };

  const handleAddAccessoryToProduct = (accessoryId: string) => {
    if (productAccessories.some(pa => pa.accessory_id === accessoryId)) {
      return;
    }

    setProductAccessories([
      ...productAccessories,
      {
        accessory_id: accessoryId,
        included_in_price: false,
        default_quantity: 1,
        max_quantity: 10
      }
    ]);
  };

  const handleRemoveAccessoryFromProduct = (accessoryId: string) => {
    setProductAccessories(productAccessories.filter(pa => pa.accessory_id !== accessoryId));
  };

  const handleUpdateProductAccessory = (accessoryId: string, field: string, value: any) => {
    setProductAccessories(
      productAccessories.map(pa =>
        pa.accessory_id === accessoryId ? { ...pa, [field]: value } : pa
      )
    );
  };

  const handleAddDishToMealBox = (dishId: string) => {
    if (mealBoxDishes.some(d => d.dish_id === dishId)) {
      return;
    }

    setMealBoxDishes([
      ...mealBoxDishes,
      {
        dish_id: dishId,
        portions_per_dish: 2,
        sort_order: mealBoxDishes.length
      }
    ]);
    setMealBoxDetails({
      ...mealBoxDetails,
      total_dishes: mealBoxDetails.total_dishes + 1
    });
  };

  const handleRemoveDishFromMealBox = (dishId: string) => {
    setMealBoxDishes(mealBoxDishes.filter(d => d.dish_id !== dishId));
    setMealBoxDetails({
      ...mealBoxDetails,
      total_dishes: Math.max(0, mealBoxDetails.total_dishes - 1)
    });
  };

  const handleUpdateMealBoxDish = (dishId: string, field: string, value: any) => {
    setMealBoxDishes(
      mealBoxDishes.map(d =>
        d.dish_id === dishId ? { ...d, [field]: value } : d
      )
    );
  };

  const handleApplyTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = mealBoxTemplates.find(t => t.id === templateId);
    if (template) {
      // Intelligent copying from template
      const updates: any = {
        name: formData.name || `${template.name}`,
        description: template.description
      };

      // Apply suggested cuisine types if available
      if (template.suggested_cuisine_types && template.suggested_cuisine_types.length > 0) {
        updates.cuisine_types = template.suggested_cuisine_types;
      }

      // Apply suggested food preferences if available
      if (template.suggested_food_preferences && template.suggested_food_preferences.length > 0) {
        updates.food_preferences = template.suggested_food_preferences;
      }

      setFormData({
        ...formData,
        ...updates
      });

      // Apply smart defaults for meal box details
      const mealBoxUpdates: any = {};

      if (template.suggested_delivery_days && template.suggested_delivery_days.length > 0) {
        mealBoxUpdates.delivery_day = template.suggested_delivery_days[0];
      }

      if (template.suggested_total_portions) {
        mealBoxUpdates.total_portions = template.suggested_total_portions;
      }

      setMealBoxDetails({
        ...mealBoxDetails,
        ...mealBoxUpdates
      });

      // Track template usage
      if (user) {
        await supabase
          .from('template_usage_stats')
          .insert([{
            template_id: templateId,
            template_type: 'meal_box',
            chef_id: user.id,
            product_id: id || null,
            was_published: false
          }]);

        // Increment usage count on template
        await supabase
          .from('meal_box_templates')
          .update({ usage_count: (template.usage_count || 0) + 1 })
          .eq('id', templateId);
      }

      // Show feedback to user
      setTemplateAppliedFeedback({
        show: true,
        templateName: template.name,
        type: 'meal_box',
        templateData: template
      });

      // Close the templates section after selection
      setShowTemplates(false);
    }
  };

  const getTemplatesByCategory = () => {
    const categories = {
      klassiska_matladekassar: { label: 'Klassiska matlådekassar', icon: '🛍️', templates: [] as any[] },
      specialkassar_kost_livsstil: { label: 'Specialkassar efter kost & livsstil', icon: '🌱', templates: [] as any[] },
      temakassar: { label: 'Temakassar', icon: '🍜', templates: [] as any[] },
      livssituation_malgrupp: { label: 'Livssituation & målgrupp', icon: '💚', templates: [] as any[] },
      kurrkok_signatur: { label: 'Kurr-kockens signaturkasse', icon: '👨‍🍳', templates: [] as any[] },
      tillfalliga_tematiska: { label: 'Tillfälliga/tematiska kassar', icon: '🎁', templates: [] as any[] }
    };

    // Filter templates by search term
    const filteredTemplates = mealBoxTemplates.filter(template => {
      if (!templateSearch.trim()) return true;

      const searchLower = templateSearch.toLowerCase();
      return (
        template.name?.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.target_audience?.toLowerCase().includes(searchLower)
      );
    });

    filteredTemplates.forEach(template => {
      const category = template.category || 'klassiska_matladekassar';
      if (categories[category as keyof typeof categories]) {
        categories[category as keyof typeof categories].templates.push(template);
      }
    });

    return categories;
  };

  const handleApplySubscriptionTemplate = async (templateId: string) => {
    setSelectedSubscriptionTemplate(templateId);
    const template = subscriptionTemplates.find(t => t.id === templateId);
    if (template) {
      // Intelligent copying from template
      const updates: any = {
        name: formData.name || `${template.name}`,
        description: template.description
      };

      setFormData({
        ...formData,
        ...updates
      });

      // Apply suggested item type and other smart defaults
      const subscriptionUpdates: any = {};
      if (template.suggested_item_type) {
        subscriptionUpdates.subscription_item_type = template.suggested_item_type;
      }

      // Set reasonable defaults based on template
      if (template.target_audience?.toLowerCase().includes('famil')) {
        subscriptionUpdates.max_subscribers = 20; // Higher capacity for family-oriented subscriptions
      } else if (template.target_audience?.toLowerCase().includes('student')) {
        subscriptionUpdates.max_subscribers = 30; // Students often have flexible schedules
      }

      setSubscriptionDetails({
        ...subscriptionDetails,
        ...subscriptionUpdates
      });

      // Track template usage
      if (user) {
        await supabase
          .from('template_usage_stats')
          .insert([{
            template_id: templateId,
            template_type: 'subscription',
            chef_id: user.id,
            product_id: id || null,
            was_published: false
          }]);

        // Increment usage count on template
        await supabase
          .from('subscription_templates')
          .update({ usage_count: (template.usage_count || 0) + 1 })
          .eq('id', templateId);
      }

      // Show feedback to user
      setTemplateAppliedFeedback({
        show: true,
        templateName: template.name,
        type: 'subscription',
        templateData: template
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox' && name !== 'available') {
      const checked = (e.target as HTMLInputElement).checked;
      const checkboxValue = (e.target as HTMLInputElement).value;

      setFormData(prev => {
        const currentArray = prev[name as keyof typeof prev] as string[];
        return {
          ...prev,
          [name]: checked
            ? [...currentArray, checkboxValue]
            : currentArray.filter((v: string) => v !== checkboxValue)
        };
      });
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          to="/chef-panel"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Tillbaka till kockpanelen
        </Link>
        <h1 className="font-lobster text-4xl text-gray-800 text-center font-bold">
          {id ? 'Redigera produkt' : 'Skapa ny produkt'}
        </h1>
      </div>

      <div className="rounded-lg shadow p-8" style={{ backgroundColor: '#f6f2e0' }}>
        {/* Template Applied Feedback */}
        {templateAppliedFeedback.show && (
          <div className="mb-6 p-5 border-2 rounded-lg shadow-md" style={{ backgroundColor: '#a1c798', borderColor: '#56c5c5' }}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#56c5c5' }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Mall tillämpad: {templateAppliedFeedback.templateName}
                </h4>

                <div className="bg-white p-4 rounded-lg mb-3 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    ✓ Följande har förfyllts automatiskt:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Produktnamn och beskrivning</span>
                    </li>
                    {templateAppliedFeedback.type === 'meal_box' && (
                      <>
                        {templateAppliedFeedback.templateData?.suggested_total_portions && (
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5" style={{ color: '#56c5c5' }}>•</span>
                            <span><strong>Antal portioner: {templateAppliedFeedback.templateData.suggested_total_portions} portioner</strong></span>
                          </li>
                        )}
                        {templateAppliedFeedback.templateData?.suggested_delivery_days && templateAppliedFeedback.templateData.suggested_delivery_days.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5" style={{ color: '#56c5c5' }}>•</span>
                            <span>Leveransdag: {templateAppliedFeedback.templateData.suggested_delivery_days[0]}</span>
                          </li>
                        )}
                        {templateAppliedFeedback.templateData?.suggested_cuisine_types && templateAppliedFeedback.templateData.suggested_cuisine_types.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5" style={{ color: '#56c5c5' }}>•</span>
                            <span>Föreslagna köksstilar</span>
                          </li>
                        )}
                        {templateAppliedFeedback.templateData?.suggested_food_preferences && templateAppliedFeedback.templateData.suggested_food_preferences.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5" style={{ color: '#56c5c5' }}>•</span>
                            <span>Föreslagna matpreferenser</span>
                          </li>
                        )}
                      </>
                    )}
                    {templateAppliedFeedback.type === 'subscription' && (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>Prenumerationstyp</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>Kapacitetsinställningar baserat på målgrupp</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {templateAppliedFeedback.templateData?.suggested_price_range && (
                  <div className="p-4 rounded-lg mb-3 border" style={{ backgroundColor: '#e0f2f2', borderColor: '#56c5c5' }}>
                    <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      Prisrekommendation:
                    </p>
                    <p className="text-sm text-gray-800">
                      {templateAppliedFeedback.templateData.suggested_price_range}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-lg border border-gray-300" style={{ backgroundColor: '#f6f2e0' }}>
                  <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Nästa steg:
                  </p>
                  <ul className="text-sm text-gray-800 space-y-1">
                    {templateAppliedFeedback.type === 'meal_box' && (
                      <>
                        <li>1. Välj maträtter och ange antal portioner per maträtt (totalt {templateAppliedFeedback.templateData?.suggested_total_portions || 'X'} portioner)</li>
                        <li>2. Sätt pris för hela kassen (se rekommendation ovan)</li>
                        <li>3. Lägg till bild och eventuella tillbehör</li>
                        <li>4. Granska leveransinställningar</li>
                      </>
                    )}
                    {templateAppliedFeedback.type === 'subscription' && (
                      <>
                        <li>1. Välj vilken produkt kunden ska prenumerera på</li>
                        <li>2. Sätt pris per leverans (se rekommendation ovan)</li>
                        <li>3. Ange leveransdag och tid</li>
                        <li>4. Lägg till bild för prenumerationen</li>
                      </>
                    )}
                  </ul>
                </div>

                <p className="text-xs text-gray-600 mt-3 italic">
                  💡 Alla fält kan redigeras efter behov. Detta är bara förslag baserat på mallen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTemplateAppliedFeedback({ show: false, templateName: '', type: 'meal_box', templateData: null })}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'recipe' ? 'Recepttitel *' : 'Produktnamn *'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#56c5c5' } as any}
                placeholder={formData.type === 'recipe' ? 't.ex. Krämig laxpasta' : ''}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produkttyp *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#56c5c5' } as any}
                required
              >
                {PRODUCT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivning
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#56c5c5' } as any}
            />
          </div>

          {formData.type === 'dish' && (
            <div className="border-t border-gray-300 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Matdetaljer</h3>

              {/* Portionsstorlekar och priser */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Portionsstorlekar och priser
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Liten (SEK)
                    </label>
                    <input
                      type="number"
                      name="price_small"
                      value={formData.price_small}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard (SEK)
                    </label>
                    <input
                      type="number"
                      name="price_standard"
                      value={formData.price_standard}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stor (SEK)
                    </label>
                    <input
                      type="number"
                      name="price_large"
                      value={formData.price_large}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paketpris (SEK)
                    </label>
                    <input
                      type="number"
                      name="price_package"
                      value={formData.price_package}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                </div>
              </div>

              {/* Tillbehör */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded">
                    Tillbehör
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowNewAccessory(!showNewAccessory)}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white transition-colors"
                    style={{ backgroundColor: '#56c5c5' }}
                  >
                    <Plus size={16} />
                    {showNewAccessory ? 'Avbryt' : 'Skapa nytt tillbehör'}
                  </button>
                </div>

                {showNewAccessory && (
                  <div className="mb-6 p-4 border-2 border-[#56c5c5] rounded-lg bg-white">
                    <h5 className="font-medium text-gray-900 mb-3">Skapa nytt tillbehör</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Namn *</label>
                        <input
                          type="text"
                          value={newAccessory.name}
                          onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
                          placeholder="t.ex. Extra sås, Sallad"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#56c5c5' } as any}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pris (SEK) *</label>
                        <input
                          type="number"
                          value={newAccessory.price}
                          onChange={(e) => setNewAccessory({ ...newAccessory, price: e.target.value })}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#56c5c5' } as any}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Beskrivning</label>
                      <textarea
                        value={newAccessory.description}
                        onChange={(e) => setNewAccessory({ ...newAccessory, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#56c5c5' } as any}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ingredienser (separera med komma)</label>
                      <input
                        type="text"
                        value={newAccessory.ingredients}
                        onChange={(e) => setNewAccessory({ ...newAccessory, ingredients: e.target.value })}
                        placeholder="t.ex. olivolja, vitlök, citron"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#56c5c5' } as any}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateAccessory}
                      className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                      style={{ backgroundColor: '#56c5c5' }}
                    >
                      Spara tillbehör
                    </button>
                  </div>
                )}

                {/* List of available accessories to add */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Välj tillbehör från ditt bibliotek
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myAccessories.map(acc => {
                      const isAdded = productAccessories.some(pa => pa.accessory_id === acc.id);
                      return (
                        <div
                          key={acc.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors bg-white ${
                            isAdded
                              ? 'border-[#56c5c5] bg-[#56c5c5] bg-opacity-10'
                              : 'border-gray-300 hover:border-[#56c5c5]'
                          }`}
                          onClick={() => !isAdded && handleAddAccessoryToProduct(acc.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{acc.name}</p>
                              <p className="text-sm text-gray-600">{acc.price} SEK</p>
                              {acc.description && (
                                <p className="text-xs text-gray-500 mt-1">{acc.description}</p>
                              )}
                            </div>
                            {isAdded && (
                              <span className="text-[#56c5c5] text-sm font-medium">✓ Tillagd</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {myAccessories.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Inga tillbehör skapade än. Klicka på "Skapa nytt tillbehör" för att börja.</p>
                  )}
                </div>

                {/* Selected accessories configuration */}
                {productAccessories.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Valda tillbehör för denna produkt</h5>
                    <div className="space-y-3">
                      {productAccessories.map(pa => {
                        const acc = myAccessories.find(a => a.id === pa.accessory_id);
                        if (!acc) return null;
                        return (
                          <div key={pa.accessory_id} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium text-gray-900">{acc.name}</p>
                                <p className="text-sm text-gray-600">{acc.price} SEK</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAccessoryFromProduct(pa.accessory_id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={pa.included_in_price}
                                  onChange={(e) =>
                                    handleUpdateProductAccessory(pa.accessory_id, 'included_in_price', e.target.checked)
                                  }
                                  className="mr-2"
                                />
                                <label className="text-sm text-gray-700">Ingår i priset</label>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Standard antal
                                </label>
                                <input
                                  type="number"
                                  value={pa.default_quantity}
                                  onChange={(e) =>
                                    handleUpdateProductAccessory(pa.accessory_id, 'default_quantity', parseInt(e.target.value) || 1)
                                  }
                                  min="1"
                                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                                  style={{ '--tw-ring-color': '#56c5c5' } as any}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Max antal
                                </label>
                                <input
                                  type="number"
                                  value={pa.max_quantity}
                                  onChange={(e) =>
                                    handleUpdateProductAccessory(pa.accessory_id, 'max_quantity', parseInt(e.target.value) || 1)
                                  }
                                  min="1"
                                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                                  style={{ '--tw-ring-color': '#56c5c5' } as any}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mattyp */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Mattyp (välj alla som passar)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FOOD_TYPES.map(type => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="food_types"
                        value={type.value}
                        checked={formData.food_types.includes(type.value)}
                        onChange={handleChange}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Huvudingredienser */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Huvudingredienser (välj alla som passar)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MAIN_INGREDIENTS.map((group) => (
                    <div key={group.category}>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">{group.category}</h5>
                      <div className="space-y-2">
                        {group.items.map(item => (
                          <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="main_ingredients"
                              value={item.value}
                              checked={formData.main_ingredients.includes(item.value)}
                              onChange={handleChange}
                              className="rounded text-blue-600"
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tillagningssätt */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Tillagningssätt (välj alla som passar)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COOKING_METHODS.map(method => (
                    <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="cooking_methods"
                        value={method.value}
                        checked={formData.cooking_methods.includes(method.value)}
                        onChange={handleChange}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Matkultur */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Matkultur (välj alla som passar)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CUISINE_TYPES.map(cuisine => (
                    <label key={cuisine.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="cuisine_types"
                        value={cuisine.value}
                        checked={formData.cuisine_types.includes(cuisine.value)}
                        onChange={handleChange}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{cuisine.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Matpreferenser */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Matpreferenser (välj alla som passar)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FOOD_PREFERENCES.map(pref => (
                    <label key={pref.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="food_preferences"
                        value={pref.value}
                        checked={formData.food_preferences.includes(pref.value)}
                        onChange={handleChange}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergener */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Allergener (välj alla som finns i rätten)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ALLERGENS.map(allergen => (
                    <label key={allergen.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="allergens"
                        value={allergen.value}
                        checked={formData.allergens.includes(allergen.value)}
                        onChange={handleChange}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{allergen.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recipe Ingredients */}
              <div className="mb-8">
                <RecipeIngredientsSection
                  ingredients={recipeIngredients}
                  onChange={setRecipeIngredients}
                />
              </div>
            </div>
          )}

          {formData.type === 'meal_box' && (
            <div className="border-t border-gray-300 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Matlådekasse-detaljer</h3>

              {/* Meal Box Templates */}
              <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">💡</span>
                  <h3 className="text-2xl font-bold text-gray-900 italic">Inspiration för matlådekassar</h3>
                </div>
                <p className="text-gray-600 mb-6">Välj en typ av kasse som inspiration för att komma igång snabbare!</p>

                {!showTemplates ? (
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="w-full bg-[#a1c798] hover:bg-[#8fb886] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Visa inspirationsmallar
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Search bar */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Sök mallar efter namn, beskrivning eller målgrupp..."
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#56c5c5] transition-colors"
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {templateSearch && (
                        <button
                          type="button"
                          onClick={() => setTemplateSearch('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {Object.entries(getTemplatesByCategory()).map(([categoryKey, categoryData]) => {
                      if (categoryData.templates.length === 0) return null;

                      return (
                        <div key={categoryKey} className="bg-white rounded-lg overflow-hidden shadow-sm">
                          <div
                            onClick={() => setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{categoryData.icon}</span>
                              <span className="font-semibold text-gray-900">{categoryData.label}</span>
                            </div>
                            <span className="text-gray-500 font-medium">{categoryData.templates.length}</span>
                          </div>

                          {expandedCategory === categoryKey && (
                            <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
                              {categoryData.templates.map(template => (
                                <div
                                  key={template.id}
                                  className={`bg-white p-4 rounded-lg border-2 transition-colors ${
                                    selectedTemplate === template.id
                                      ? 'border-[#56c5c5] bg-[#56c5c5] bg-opacity-10'
                                      : 'border-gray-200 hover:border-[#56c5c5]'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{template.icon_emoji || '📦'}</span>
                                        <h5 className="font-semibold text-gray-900">{template.name}</h5>
                                        {template.usage_count && template.usage_count >= 5 && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            Populär
                                          </span>
                                        )}
                                        {selectedTemplate === template.id && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#56c5c5] text-white text-xs font-medium rounded-full">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Vald
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {template.suggested_total_portions && (
                                          <span className="inline-flex items-center px-2 py-1 text-white text-xs font-bold rounded" style={{ backgroundColor: '#56c5c5' }}>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                            </svg>
                                            {template.suggested_total_portions} portioner
                                          </span>
                                        )}
                                        {template.target_audience && (
                                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                            </svg>
                                            {template.target_audience}
                                          </span>
                                        )}
                                        {template.suggested_price_range && (
                                          <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                            {template.suggested_price_range}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleApplyTemplate(template.id)}
                                      className="px-4 py-2 bg-white border-2 border-gray-300 hover:border-[#56c5c5] hover:bg-[#56c5c5] hover:bg-opacity-10 text-gray-700 font-medium rounded-lg transition-all whitespace-nowrap"
                                    >
                                      Välj
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button
                      onClick={() => setShowTemplates(false)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors mt-4"
                    >
                      Stäng mallar
                    </button>
                  </div>
                )}
              </div>

              {/* Total Portions */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Totalt antal portioner i kassen
                </h4>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hur många portioner ska kassen innehålla totalt? *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={mealBoxDetails.total_portions}
                    onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, total_portions: parseInt(e.target.value) || 0 })}
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Detta är det totala antalet portioner kunden får i kassen. T.ex. 8 portioner betyder att kassen innehåller mat för 8 portioner totalt.
                  </p>
                </div>
                {mealBoxDishes.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900">
                      📊 Status: {mealBoxDishes.reduce((sum, dish) => sum + dish.portions_per_dish, 0)} av {mealBoxDetails.total_portions} portioner fördelade
                    </p>
                    {mealBoxDishes.reduce((sum, dish) => sum + dish.portions_per_dish, 0) !== mealBoxDetails.total_portions && (
                      <p className="text-xs text-blue-700 mt-1">
                        ⚠️ Totala antalet portioner i maträtterna måste summera till {mealBoxDetails.total_portions} portioner
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Price for Meal Box */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Pris för kassen
                </h4>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pris (SEK) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                    placeholder="t.ex. 350"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Detta är priset kunden betalar för hela kassen med {mealBoxDetails.total_portions} portioner.
                    {mealBoxDetails.total_portions > 0 && formData.price && (
                      <span className="font-medium text-gray-700">
                        {' '}≈ {(parseFloat(formData.price) / mealBoxDetails.total_portions).toFixed(0)} SEK/portion
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Select Dishes */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Välj maträtter för kassen
                </h4>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tillgängliga maträtter
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded">
                    {myDishes.map(dish => {
                      const isAdded = mealBoxDishes.some(d => d.dish_id === dish.id);
                      return (
                        <div
                          key={dish.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isAdded
                              ? 'border-[#a1c798] bg-[#c4ddb8]'
                              : 'bg-white border-gray-300 hover:border-[#56c5c5]'
                          }`}
                          onClick={() => !isAdded && handleAddDishToMealBox(dish.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{dish.name}</p>
                              {dish.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dish.description}</p>
                              )}
                            </div>
                            {isAdded && (
                              <span className="text-[#56c5c5] text-sm font-medium ml-2">✓ Tillagd</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {myDishes.length === 0 && (
                    <p className="text-sm text-gray-500 italic mt-2">
                      Du har inga maträtter än. Skapa maträtter först innan du skapar en matlådekasse.
                    </p>
                  )}
                </div>

                {/* Selected Dishes Configuration */}
                {mealBoxDishes.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">
                      Valda maträtter ({mealBoxDishes.length} st)
                    </h5>
                    <div className="space-y-3">
                      {mealBoxDishes.map(mealBoxDish => {
                        const dish = myDishes.find(d => d.id === mealBoxDish.dish_id);
                        if (!dish) return null;
                        return (
                          <div key={mealBoxDish.dish_id} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium text-gray-900">{dish.name}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDishFromMealBox(mealBoxDish.dish_id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Antal portioner per maträtt
                                </label>
                                <input
                                  type="number"
                                  value={mealBoxDish.portions_per_dish}
                                  onChange={(e) =>
                                    handleUpdateMealBoxDish(mealBoxDish.dish_id, 'portions_per_dish', parseInt(e.target.value) || 1)
                                  }
                                  min="1"
                                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                                  style={{ '--tw-ring-color': '#56c5c5' } as any}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Collage Preview and Custom Image Toggle */}
              {mealBoxDishes.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                    Produktbild för kassen
                  </h4>

                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mealBoxDetails.use_custom_image}
                        onChange={(e) => setMealBoxDetails({
                          ...mealBoxDetails,
                          use_custom_image: e.target.checked
                        })}
                        className="rounded text-[#56c5c5]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Använd egen uploadad bild istället för automatiskt kollage
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Som standard skapas ett automatiskt kollage av alla maträtter i kassen
                    </p>
                  </div>

                  {!mealBoxDetails.use_custom_image && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Förhandsvisning av automatiskt kollage
                      </label>
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ height: '300px' }}>
                        <MealBoxCollage
                          mealBoxId={id}
                          dishes={!id ? mealBoxDishes.map(mbd => {
                            const dish = myDishes.find(d => d.id === mbd.dish_id);
                            return {
                              id: mbd.dish_id,
                              name: dish?.name || '',
                              image_url: dish?.image_url || null,
                              sort_order: mbd.sort_order
                            };
                          }).sort((a, b) => a.sort_order - b.sort_order) : undefined}
                          chefInfo={{
                            display_name: user?.user_metadata?.display_name || null,
                            full_name: user?.user_metadata?.full_name || null,
                            avatar_url: user?.user_metadata?.avatar_url || null
                          }}
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Kollagt visar automatiskt alla maträtter du valt, med din profilbild och köksnamn i högra hörnet.
                      </p>
                    </div>
                  )}

                  {mealBoxDetails.use_custom_image && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ladda upp egen produktbild
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Denna bild kommer att användas istället för det automatiska kollagt
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Capacity Management */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Kapacitetshantering
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mealBoxDetails.has_capacity_limit}
                        onChange={(e) => setMealBoxDetails({
                          ...mealBoxDetails,
                          has_capacity_limit: e.target.checked,
                          unlimited_capacity: !e.target.checked
                        })}
                        className="rounded text-[#56c5c5]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Aktivera kapacitetsgräns (begränsa antal beställningar)
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      När aktiverad kan du ange max antal beställningar per leveranstillfälle
                    </p>
                  </div>

                  {mealBoxDetails.has_capacity_limit && !mealBoxDetails.unlimited_capacity && (
                    <>
                      <div className="pl-6 border-l-2 border-[#56c5c5] space-y-4">
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={recurringSchedule.is_recurring}
                              onChange={(e) => setRecurringSchedule({
                                ...recurringSchedule,
                                is_recurring: e.target.checked
                              })}
                              className="rounded text-[#56c5c5]"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Återkommande matlådekasse (veckovis)
                            </span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1 ml-6">
                            Systemet genererar automatiskt leveransdagar framåt i tiden
                          </p>
                        </div>

                        {recurringSchedule.is_recurring ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vilka veckodagar levererar du?
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                  const dayLabels: Record<string, string> = {
                                    monday: 'Måndag',
                                    tuesday: 'Tisdag',
                                    wednesday: 'Onsdag',
                                    thursday: 'Torsdag',
                                    friday: 'Fredag',
                                    saturday: 'Lördag',
                                    sunday: 'Söndag'
                                  };
                                  return (
                                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={recurringSchedule.weekdays.includes(day)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setRecurringSchedule({
                                              ...recurringSchedule,
                                              weekdays: [...recurringSchedule.weekdays, day]
                                            });
                                          } else {
                                            setRecurringSchedule({
                                              ...recurringSchedule,
                                              weekdays: recurringSchedule.weekdays.filter(d => d !== day)
                                            });
                                          }
                                        }}
                                        className="rounded text-[#56c5c5]"
                                      />
                                      <span className="text-sm text-gray-700">{dayLabels[day]}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Standard kapacitet per leveransdag
                                </label>
                                <input
                                  type="number"
                                  value={recurringSchedule.default_capacity_per_slot}
                                  onChange={(e) => setRecurringSchedule({
                                    ...recurringSchedule,
                                    default_capacity_per_slot: parseInt(e.target.value) || 10
                                  })}
                                  min="1"
                                  placeholder="10"
                                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                                  style={{ '--tw-ring-color': '#56c5c5' } as any}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Max antal beställningar per leveransdag
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Generera veckor framåt
                                </label>
                                <input
                                  type="number"
                                  value={recurringSchedule.auto_generate_weeks_ahead}
                                  onChange={(e) => setRecurringSchedule({
                                    ...recurringSchedule,
                                    auto_generate_weeks_ahead: parseInt(e.target.value) || 4
                                  })}
                                  min="1"
                                  max="12"
                                  placeholder="4"
                                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                                  style={{ '--tw-ring-color': '#56c5c5' } as any}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Hur många veckor framåt ska systemet skapa leveransdagar?
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Engångsleveranser med specifika datum
                              </label>
                              <p className="text-xs text-gray-500 mb-3">
                                Lägg till de specifika datum då du vill leverera denna matlådekasse
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  setCapacityPeriods([
                                    ...capacityPeriods,
                                    {
                                      delivery_date: tomorrow.toISOString().split('T')[0],
                                      max_capacity: 10
                                    }
                                  ]);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white transition-colors"
                                style={{ backgroundColor: '#56c5c5' }}
                              >
                                <Plus size={16} />
                                Lägg till leveransdatum
                              </button>
                            </div>

                            {capacityPeriods.length > 0 && (
                              <div className="space-y-3">
                                {capacityPeriods.map((period, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Leveransdatum
                                      </label>
                                      <input
                                        type="date"
                                        value={period.delivery_date}
                                        onChange={(e) => {
                                          const updated = [...capacityPeriods];
                                          updated[index].delivery_date = e.target.value;
                                          setCapacityPeriods(updated);
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                                        style={{ '--tw-ring-color': '#56c5c5' } as any}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Max kapacitet
                                      </label>
                                      <input
                                        type="number"
                                        value={period.max_capacity}
                                        onChange={(e) => {
                                          const updated = [...capacityPeriods];
                                          updated[index].max_capacity = parseInt(e.target.value) || 1;
                                          setCapacityPeriods(updated);
                                        }}
                                        min="1"
                                        placeholder="10"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                                        style={{ '--tw-ring-color': '#56c5c5' } as any}
                                      />
                                    </div>
                                    {period.current_bookings !== undefined && (
                                      <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Bokade
                                        </label>
                                        <div className="text-sm text-gray-600 py-2">
                                          {period.current_bookings} / {period.max_capacity}
                                        </div>
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCapacityPeriods(capacityPeriods.filter((_, i) => i !== index));
                                      }}
                                      className="text-red-600 hover:text-red-800 transition-colors self-end pb-2"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mealBoxDetails.show_remaining_spots}
                                onChange={(e) => setMealBoxDetails({
                                  ...mealBoxDetails,
                                  show_remaining_spots: e.target.checked
                                })}
                                className="rounded text-[#56c5c5]"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Visa återstående platser för kunder
                              </span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tröskelvärde för "nästan fullt"
                            </label>
                            <input
                              type="number"
                              value={mealBoxDetails.low_capacity_threshold}
                              onChange={(e) => setMealBoxDetails({
                                ...mealBoxDetails,
                                low_capacity_threshold: parseInt(e.target.value) || 3
                              })}
                              min="1"
                              max="10"
                              placeholder="3"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                              style={{ '--tw-ring-color': '#56c5c5' } as any}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Visa varning när färre än detta antal platser kvar
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Leverans och upphämtning
                </h4>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Välj vilket alternativ du vill erbjuda dina kunder *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:border-[#56c5c5]"
                        style={{
                          borderColor: mealBoxDetails.offers_pickup ? '#56c5c5' : '#d1d5db',
                          backgroundColor: mealBoxDetails.offers_pickup ? '#f0fafa' : 'white'
                        }}>
                        <input
                          type="checkbox"
                          checked={mealBoxDetails.offers_pickup}
                          onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, offers_pickup: e.target.checked })}
                          className="mt-1"
                          style={{ accentColor: '#56c5c5' }}
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">Kunden kan hämta</span>
                          <p className="text-xs text-gray-600 mt-1">Kunden hämtar maten hos dig under ett tidsintervall</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:border-[#56c5c5]"
                        style={{
                          borderColor: mealBoxDetails.offers_delivery ? '#56c5c5' : '#d1d5db',
                          backgroundColor: mealBoxDetails.offers_delivery ? '#f0fafa' : 'white'
                        }}>
                        <input
                          type="checkbox"
                          checked={mealBoxDetails.offers_delivery}
                          onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, offers_delivery: e.target.checked })}
                          className="mt-1"
                          style={{ accentColor: '#56c5c5' }}
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">Du kör ut</span>
                          <p className="text-xs text-gray-600 mt-1">Du levererar maten till kunden under ett tidsintervall</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leverans-/hämtningsdag
                      </label>
                      <input
                        type="text"
                        value={mealBoxDetails.delivery_day}
                        onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, delivery_day: e.target.value })}
                        placeholder="t.ex. Måndagar, Tisdagar och Torsdagar"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#56c5c5' } as any}
                      />
                    </div>
                  </div>

                  {mealBoxDetails.offers_pickup && (
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Upphämtningstider
                      </h5>
                      <p className="text-sm text-gray-700 mb-3">När kan kunden hämta sin beställning?</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Från tid (t.ex. 16:00)
                          </label>
                          <input
                            type="time"
                            value={mealBoxDetails.pickup_time_start}
                            onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, pickup_time_start: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#56c5c5' } as any}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Till tid (t.ex. 19:00)
                          </label>
                          <input
                            type="time"
                            value={mealBoxDetails.pickup_time_end}
                            onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, pickup_time_end: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#56c5c5' } as any}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {mealBoxDetails.offers_delivery && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                        Utkörning
                      </h5>
                      <p className="text-sm text-gray-700 mb-3">När kommer du köra ut beställningarna?</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Från tid (t.ex. 17:00)
                          </label>
                          <input
                            type="time"
                            value={mealBoxDetails.delivery_time_start}
                            onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, delivery_time_start: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#56c5c5' } as any}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Till tid (t.ex. 20:00)
                          </label>
                          <input
                            type="time"
                            value={mealBoxDetails.delivery_time_end}
                            onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, delivery_time_end: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#56c5c5' } as any}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leverans-/hämtningsnoteringar
                    </label>
                    <textarea
                      value={mealBoxDetails.delivery_notes}
                      onChange={(e) => setMealBoxDetails({ ...mealBoxDetails, delivery_notes: e.target.value })}
                      rows={3}
                      placeholder="t.ex. Leverans endast inom 5km radie. Vid upphämtning, ring på dörren."
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'subscription' && (
            <div className="border-t border-gray-300 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Prenumerationsdetaljer</h3>

              {/* Subscription Templates */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                  Välj mall (valfritt - för inspiration)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptionTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleApplySubscriptionTemplate(template.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSubscriptionTemplate === template.id
                          ? 'border-[#56c5c5] bg-[#56c5c5] bg-opacity-10'
                          : 'border-gray-300 hover:border-[#56c5c5]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-gray-900">{template.name}</h5>
                          {template.usage_count && template.usage_count >= 5 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Populär
                            </span>
                          )}
                        </div>
                        {selectedSubscriptionTemplate === template.id && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#56c5c5] text-white text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Vald
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          {template.target_audience}
                        </span>
                        {template.suggested_item_type && (
                          <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            {template.suggested_item_type === 'dish' ? 'Maträtt' : template.suggested_item_type === 'meal_box' ? 'Matlådekasse' : 'Laga-själv-kit'}
                          </span>
                        )}
                        {template.suggested_price_range && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            {template.suggested_price_range}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Välj vad kunden prenumererar på *
                  </label>
                  <select
                    value={subscriptionDetails.subscription_item_type}
                    onChange={(e) => {
                      const newType = e.target.value as 'dish' | 'meal_box' | 'diy_kit';
                      setSubscriptionDetails({
                        ...subscriptionDetails,
                        subscription_item_type: newType,
                        subscription_item_id: ''
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  >
                    <option value="dish">Enskild maträtt</option>
                    <option value="meal_box">Matlådekasse</option>
                    <option value="diy_kit">Laga-själv-kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Välj specifik {subscriptionDetails.subscription_item_type === 'dish' ? 'maträtt' : subscriptionDetails.subscription_item_type === 'meal_box' ? 'matlådekasse' : 'laga-själv-kit'}
                  </label>
                  <select
                    value={subscriptionDetails.subscription_item_id}
                    onChange={(e) => setSubscriptionDetails({
                      ...subscriptionDetails,
                      subscription_item_id: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  >
                    <option value="">Välj...</option>
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {availableItems.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Du har inga tillgängliga produkter av denna typ. Skapa en {subscriptionDetails.subscription_item_type === 'dish' ? 'maträtt' : subscriptionDetails.subscription_item_type === 'meal_box' ? 'matlådekasse' : 'laga-själv-kit'} först.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antal prenumerationsplatser *
                  </label>
                  <input
                    type="number"
                    value={subscriptionDetails.max_subscribers}
                    onChange={(e) => setSubscriptionDetails({
                      ...subscriptionDetails,
                      max_subscribers: parseInt(e.target.value) || 10
                    })}
                    min="1"
                    placeholder="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max antal kunder som kan prenumerera
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leveransdag
                  </label>
                  <input
                    type="text"
                    value={subscriptionDetails.delivery_day}
                    onChange={(e) => setSubscriptionDetails({
                      ...subscriptionDetails,
                      delivery_day: e.target.value
                    })}
                    placeholder="t.ex. Varje måndag"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leveransalternativ *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subscriptionDetails.offers_pickup}
                        onChange={(e) => setSubscriptionDetails({
                          ...subscriptionDetails,
                          offers_pickup: e.target.checked
                        })}
                        className="rounded text-[#56c5c5]"
                      />
                      <span className="text-sm text-gray-700">Kunden kan hämta</span>
                    </label>
                    {subscriptionDetails.offers_pickup && (
                      <div className="ml-6 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Upphämtning från kl
                          </label>
                          <input
                            type="time"
                            value={subscriptionDetails.pickup_time_start}
                            onChange={(e) => setSubscriptionDetails({
                              ...subscriptionDetails,
                              pickup_time_start: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#56c5c5' } as any}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Till kl
                          </label>
                          <input
                            type="time"
                            value={subscriptionDetails.pickup_time_end}
                            onChange={(e) => setSubscriptionDetails({
                              ...subscriptionDetails,
                              pickup_time_end: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#56c5c5' } as any}
                          />
                        </div>
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subscriptionDetails.offers_delivery}
                        onChange={(e) => setSubscriptionDetails({
                          ...subscriptionDetails,
                          offers_delivery: e.target.checked
                        })}
                        className="rounded text-[#56c5c5]"
                      />
                      <span className="text-sm text-gray-700">Jag kör ut</span>
                    </label>
                    {subscriptionDetails.offers_delivery && (
                      <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Utkörning från kl
                            </label>
                            <input
                              type="time"
                              value={subscriptionDetails.delivery_time_start}
                              onChange={(e) => setSubscriptionDetails({
                                ...subscriptionDetails,
                                delivery_time_start: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2"
                              style={{ '--tw-ring-color': '#56c5c5' } as any}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Till kl
                            </label>
                            <input
                              type="time"
                              value={subscriptionDetails.delivery_time_end}
                              onChange={(e) => setSubscriptionDetails({
                                ...subscriptionDetails,
                                delivery_time_end: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2"
                              style={{ '--tw-ring-color': '#56c5c5' } as any}
                            />
                          </div>
                        </div>
                        {/* TODO: Add route planning for gold members */}
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs text-yellow-800">
                            💡 <strong>Guldmedlemmar:</strong> Ruttplanering för miljövänlig utkörning kommer snart!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frekvens *
                    </label>
                    <select
                      value={subscriptionDetails.frequency}
                      onChange={(e) => setSubscriptionDetails({
                        ...subscriptionDetails,
                        frequency: e.target.value as 'weekly' | 'biweekly' | 'monthly'
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    >
                      <option value="weekly">Varje vecka</option>
                      <option value="biweekly">Varannan vecka</option>
                      <option value="monthly">Varje månad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minsta bindningstid *
                    </label>
                    <select
                      value={subscriptionDetails.binding_months}
                      onChange={(e) => setSubscriptionDetails({
                        ...subscriptionDetails,
                        binding_months: parseInt(e.target.value)
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    >
                      <option value="1">1 månad</option>
                      <option value="3">3 månader</option>
                      <option value="6">6 månader</option>
                      <option value="12">12 månader</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Noteringar
                  </label>
                  <textarea
                    value={subscriptionDetails.delivery_notes}
                    onChange={(e) => setSubscriptionDetails({
                      ...subscriptionDetails,
                      delivery_notes: e.target.value
                    })}
                    rows={3}
                    placeholder="t.ex. Avbokningsvillkor, särskild information"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'diy_kit' && (
            <div className="border-t border-gray-300 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Laga-själv-kit detaljer</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Koppling till recept (valfritt)
                  </label>
                  <select
                    value={diyKitDetails.linked_recipe_id}
                    onChange={(e) => setDiyKitDetails({
                      ...diyKitDetails,
                      linked_recipe_id: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  >
                    <option value="">Inget recept</option>
                    {myDishes.filter(d => d.type === 'recipe').map(recipe => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Koppla kitet till ett av dina recept för att förifylla ingredienserna
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Antal portioner *
                    </label>
                    <input
                      type="number"
                      value={diyKitDetails.portions}
                      onChange={(e) => setDiyKitDetails({
                        ...diyKitDetails,
                        portions: parseInt(e.target.value) || 1
                      })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hållbarhet (dagar) *
                    </label>
                    <input
                      type="number"
                      value={diyKitDetails.shelf_life_days}
                      onChange={(e) => setDiyKitDetails({
                        ...diyKitDetails,
                        shelf_life_days: parseInt(e.target.value) || 1
                      })}
                      min="1"
                      placeholder="t.ex. 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förpackningsinformation
                  </label>
                  <textarea
                    value={diyKitDetails.packaging_info}
                    onChange={(e) => setDiyKitDetails({
                      ...diyKitDetails,
                      packaging_info: e.target.value
                    })}
                    rows={3}
                    placeholder="Hur maten är förpackad och levereras"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leveransalternativ *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={diyKitDetails.offers_pickup}
                        onChange={(e) => setDiyKitDetails({
                          ...diyKitDetails,
                          offers_pickup: e.target.checked
                        })}
                        className="rounded text-[#56c5c5]"
                      />
                      <span className="text-sm text-gray-700">Upphämtning</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={diyKitDetails.offers_delivery}
                        onChange={(e) => setDiyKitDetails({
                          ...diyKitDetails,
                          offers_delivery: e.target.checked
                        })}
                        className="rounded text-[#56c5c5]"
                      />
                      <span className="text-sm text-gray-700">Utkörning</span>
                    </label>
                  </div>
                </div>

                {diyKitDetails.offers_delivery && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Utkörningskostnad (kr)
                    </label>
                    <input
                      type="number"
                      value={diyKitDetails.delivery_cost}
                      onChange={(e) => setDiyKitDetails({
                        ...diyKitDetails,
                        delivery_cost: e.target.value
                      })}
                      min="0"
                      placeholder="t.ex. 50"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.type === 'hire_chef' && (
            <div className="border-t border-gray-300 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Hyra kock - detaljer</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ av tillfälle *
                  </label>
                  <select
                    value={hireChefDetails.occasion_type}
                    onChange={(e) => setHireChefDetails({
                      ...hireChefDetails,
                      occasion_type: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  >
                    <option value="">Välj tillfälle...</option>
                    <option value="middag">Middag</option>
                    <option value="fest">Fest</option>
                    <option value="brollop">Bröllop</option>
                    <option value="foretagsevent">Företagsevent</option>
                    <option value="annat">Annat</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minsta antal gäster *
                    </label>
                    <input
                      type="number"
                      value={hireChefDetails.min_guests}
                      onChange={(e) => setHireChefDetails({
                        ...hireChefDetails,
                        min_guests: parseInt(e.target.value) || 1
                      })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Största antal gäster *
                    </label>
                    <input
                      type="number"
                      value={hireChefDetails.max_guests}
                      onChange={(e) => setHireChefDetails({
                        ...hireChefDetails,
                        max_guests: parseInt(e.target.value) || 1
                      })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prisstruktur *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={hireChefDetails.pricing_structure === 'per_person'}
                        onChange={() => setHireChefDetails({
                          ...hireChefDetails,
                          pricing_structure: 'per_person'
                        })}
                        className="text-[#56c5c5]"
                      />
                      <span className="text-sm text-gray-700">Pris per person</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={hireChefDetails.pricing_structure === 'fixed'}
                        onChange={() => setHireChefDetails({
                          ...hireChefDetails,
                          pricing_structure: 'fixed'
                        })}
                        className="text-[#56c5c5]"
                      />
                      <span className="text-sm text-gray-700">Fast totalpris</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plats/område *
                  </label>
                  <input
                    type="text"
                    value={hireChefDetails.location_area}
                    onChange={(e) => setHireChefDetails({
                      ...hireChefDetails,
                      location_area: e.target.value
                    })}
                    placeholder="t.ex. inom 2 mil från Stockholm"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hireChefDetails.requires_kitchen}
                      onChange={(e) => setHireChefDetails({
                        ...hireChefDetails,
                        requires_kitchen: e.target.checked
                      })}
                      className="rounded text-[#56c5c5]"
                    />
                    <span className="text-sm text-gray-700">Kunden har kök</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hireChefDetails.chef_brings_equipment}
                      onChange={(e) => setHireChefDetails({
                        ...hireChefDetails,
                        chef_brings_equipment: e.target.checked
                      })}
                      className="rounded text-[#56c5c5]"
                    />
                    <span className="text-sm text-gray-700">Kocken tar med utrustning</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exempelmeny / Menyförslag
                  </label>
                  <textarea
                    value={hireChefDetails.sample_menu}
                    onChange={(e) => setHireChefDetails({
                      ...hireChefDetails,
                      sample_menu: e.target.value
                    })}
                    rows={5}
                    placeholder="Beskriv menyalternativ eller exempel på vad du kan laga"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tidsåtgång (timmar) *
                    </label>
                    <input
                      type="number"
                      value={hireChefDetails.time_required_hours}
                      onChange={(e) => setHireChefDetails({
                        ...hireChefDetails,
                        time_required_hours: parseFloat(e.target.value) || 1
                      })}
                      min="0.5"
                      step="0.5"
                      placeholder="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ca tidåtgång inklusive servering
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resekostnad (kr/km)
                    </label>
                    <input
                      type="number"
                      value={hireChefDetails.travel_cost_per_km}
                      onChange={(e) => setHireChefDetails({
                        ...hireChefDetails,
                        travel_cost_per_km: e.target.value
                      })}
                      min="0"
                      placeholder="t.ex. 10"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förberedelser / Krav
                  </label>
                  <textarea
                    value={hireChefDetails.preparation_requirements}
                    onChange={(e) => setHireChefDetails({
                      ...hireChefDetails,
                      preparation_requirements: e.target.value
                    })}
                    rows={3}
                    placeholder="t.ex. Tillgång till ugn och rinnande vatten krävs"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tillval
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Dryckespaket', 'Dessert', 'Dukning', 'Disk', 'Serveringspersonal', 'Förrätt'].map(extra => (
                      <label key={extra} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hireChefDetails.extras.includes(extra)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setHireChefDetails({
                                ...hireChefDetails,
                                extras: [...hireChefDetails.extras, extra]
                              });
                            } else {
                              setHireChefDetails({
                                ...hireChefDetails,
                                extras: hireChefDetails.extras.filter(ex => ex !== extra)
                              });
                            }
                          }}
                          className="rounded text-[#56c5c5]"
                        />
                        <span className="text-sm text-gray-700">{extra}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'catering' && (
            <div className="border-t border-gray-300 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Catering - detaljer</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ av catering *
                  </label>
                  <select
                    value={cateringDetails.catering_type}
                    onChange={(e) => setCateringDetails({
                      ...cateringDetails,
                      catering_type: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  >
                    <option value="">Välj typ...</option>
                    <option value="buffe">Buffé</option>
                    <option value="lunchladder">Lunchlådor</option>
                    <option value="plockmat">Plockmat</option>
                    <option value="fika">Fika</option>
                    <option value="dryck">Dryck</option>
                    <option value="annat">Annat</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minsta antal portioner *
                    </label>
                    <input
                      type="number"
                      value={cateringDetails.min_portions}
                      onChange={(e) => setCateringDetails({
                        ...cateringDetails,
                        min_portions: parseInt(e.target.value) || 1
                      })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Största antal portioner *
                    </label>
                    <input
                      type="number"
                      value={cateringDetails.max_portions}
                      onChange={(e) => setCateringDetails({
                        ...cateringDetails,
                        max_portions: parseInt(e.target.value) || 1
                      })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pris per portion / person (kr) *
                  </label>
                  <input
                    type="number"
                    value={cateringDetails.price_per_portion}
                    onChange={(e) => setCateringDetails({
                      ...cateringDetails,
                      price_per_portion: e.target.value
                    })}
                    min="0"
                    placeholder="t.ex. 150"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menyalternativ
                  </label>
                  <textarea
                    value={cateringDetails.menu_options}
                    onChange={(e) => setCateringDetails({
                      ...cateringDetails,
                      menu_options: e.target.value
                    })}
                    rows={5}
                    placeholder="Lista över rätter, ingredienser och alternativ"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leveransalternativ *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cateringDetails.offers_pickup}
                        onChange={(e) => setCateringDetails({
                          ...cateringDetails,
                          offers_pickup: e.target.checked
                        })}
                        className="rounded text-[#56c5c5]"
                      />
                      <span className="text-sm text-gray-700">Upphämtning</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cateringDetails.offers_delivery}
                        onChange={(e) => setCateringDetails({
                          ...cateringDetails,
                          offers_delivery: e.target.checked
                        })}
                        className="rounded text-[#56c5c5]"
                      />
                      <span className="text-sm text-gray-700">Utkörning</span>
                    </label>
                  </div>
                </div>

                {cateringDetails.offers_delivery && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Utkörningskostnad (kr)
                    </label>
                    <input
                      type="number"
                      value={cateringDetails.delivery_cost}
                      onChange={(e) => setCateringDetails({
                        ...cateringDetails,
                        delivery_cost: e.target.value
                      })}
                      min="0"
                      placeholder="Per km eller fastpris"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#56c5c5' } as any}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förbeställningstid (dagar i förväg) *
                  </label>
                  <input
                    type="number"
                    value={cateringDetails.advance_notice_days}
                    onChange={(e) => setCateringDetails({
                      ...cateringDetails,
                      advance_notice_days: parseInt(e.target.value) || 1
                    })}
                    min="1"
                    placeholder="t.ex. 3"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förpackning / Servering
                  </label>
                  <textarea
                    value={cateringDetails.packaging_info}
                    onChange={(e) => setCateringDetails({
                      ...cateringDetails,
                      packaging_info: e.target.value
                    })}
                    rows={3}
                    placeholder="Hur maten levereras och serveras"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tillval
                  </label>
                  <textarea
                    value={cateringDetails.extras}
                    onChange={(e) => setCateringDetails({
                      ...cateringDetails,
                      extras: e.target.value
                    })}
                    rows={3}
                    placeholder="t.ex. Dryck, Efterrätt, Extra portioner"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'video' && (
            <div className="border-t border-gray-300 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Matlagningsvideo - detaljer</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ av video *
                  </label>
                  <select
                    value={videoDetails.video_type}
                    onChange={(e) => setVideoDetails({
                      ...videoDetails,
                      video_type: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  >
                    <option value="">Välj typ...</option>
                    <option value="tipsvideo">Tipsvideo</option>
                    <option value="instruktion">Instruktion</option>
                    <option value="receptvideo">Receptvideo</option>
                    <option value="kurs">Kurs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video-länk (YouTube/Vimeo) *
                  </label>
                  <input
                    type="url"
                    value={videoDetails.video_url}
                    onChange={(e) => setVideoDetails({
                      ...videoDetails,
                      video_url: e.target.value
                    })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Klistra in länk till YouTube eller Vimeo video
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Videolängd (minuter) *
                  </label>
                  <input
                    type="number"
                    value={videoDetails.video_length_minutes}
                    onChange={(e) => setVideoDetails({
                      ...videoDetails,
                      video_length_minutes: parseInt(e.target.value) || 0
                    })}
                    min="0"
                    step="0.5"
                    placeholder="t.ex. 15"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tillgångsnivå *
                  </label>
                  <select
                    value={videoDetails.membership_level_required}
                    onChange={(e) => setVideoDetails({
                      ...videoDetails,
                      membership_level_required: e.target.value as 'free' | 'silver' | 'gold'
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  >
                    <option value="free">Gratis</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Guld</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Vem har tillgång till videon?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Koppling till recept (valfritt)
                  </label>
                  <select
                    value={videoDetails.linked_recipe_id}
                    onChange={(e) => setVideoDetails({
                      ...videoDetails,
                      linked_recipe_id: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  >
                    <option value="">Inget recept</option>
                    {myDishes.filter(d => d.type === 'recipe').map(recipe => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taggar / Tema
                  </label>
                  <input
                    type="text"
                    value={videoDetails.tags}
                    onChange={(e) => setVideoDetails({
                      ...videoDetails,
                      tags: e.target.value
                    })}
                    placeholder="t.ex. Bakning, Grill, Sparsmakad (kommaseparerade)"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={videoDetails.allow_comments}
                      onChange={(e) => setVideoDetails({
                        ...videoDetails,
                        allow_comments: e.target.checked
                      })}
                      className="rounded text-[#56c5c5]"
                    />
                    <span className="text-sm text-gray-700">Tillåt kommentarer och feedback</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förhandsvisning URL (valfritt)
                  </label>
                  <input
                    type="url"
                    value={videoDetails.preview_url}
                    onChange={(e) => setVideoDetails({
                      ...videoDetails,
                      preview_url: e.target.value
                    })}
                    placeholder="https://... (kort förhandstitt, 15 sek)"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#56c5c5' } as any}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'recipe' && user && (
            <RecipeFormSection
              productId={id}
              membershipLevel={(user as any)?.user_metadata?.membership_level || 'free'}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {formData.type !== 'meal_box' && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white bg-[#a1c798] px-4 py-2 rounded mb-4">
                Produktbild
              </h4>
              <div className="space-y-4">
                {(formData.image_url || imagePreview) && (
                  <div className="relative w-full max-w-md">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Product preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image_url: '' });
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <div>
                  <label className="block cursor-pointer">
                    <div className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#56c5c5] transition-colors">
                      <div className="space-y-2 text-center">
                        <div className="flex justify-center">
                          <Package size={32} className="text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-[#56c5c5]">Klicka för att ladda upp</span>
                          <span> eller dra och släpp</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG upp till 5MB
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Bilden är för stor. Max 5MB.');
                            return;
                          }
                          setImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}


          <div className="flex items-center">
            <input
              type="checkbox"
              name="available"
              id="available"
              checked={formData.available}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              Produkten är tillgänglig för köp
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: '#56c5c5' }}
            >
              <Save size={20} />
              {uploading ? 'Laddar upp bild...' : loading ? 'Sparar...' : id ? 'Uppdatera produkt' : 'Skapa produkt'}
            </button>
            <Link
              to="/chef-panel"
              className="px-6 py-3 rounded-lg font-medium text-white bg-black hover:bg-gray-800 transition-colors"
            >
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
