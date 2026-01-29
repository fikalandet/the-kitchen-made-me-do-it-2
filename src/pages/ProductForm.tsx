import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { handleChange } from '../components/ProductForm/utils/handleChange';
import { handleSubmit } from '../components/ProductForm/utils/handleSubmit';
import {
  fetchMealBoxTemplates,
  fetchSubscriptionTemplates,
  fetchMyDishes,
  fetchMealBoxData,
  fetchRecurringSchedule,
  fetchCapacityPeriods,
  fetchSubscriptionData,
  fetchAvailableItems,
  fetchMyAccessories,
  fetchProductAccessories,
  fetchRecipeIngredients,
  fetchPricingTiers,
  fetchProduct
} from '../components/ProductForm/utils/fetchers';
import {
  handleCreateAccessory,
  handleAddAccessoryToProduct,
  handleRemoveAccessoryFromProduct,
  handleUpdateProductAccessory
} from '../components/ProductForm/utils/accessories';
import {
  handleAddDishToMealBox,
  handleRemoveDishFromMealBox,
  handleUpdateMealBoxDish
} from '../components/ProductForm/utils/mealBoxDishes';
import {
  handleApplyTemplate,
  getTemplatesByCategory as getTemplatesByCategoryUtil,
  handleApplySubscriptionTemplate
} from '../components/ProductForm/utils/templates';
import { ProductFormLayout } from '../components/ProductForm/ProductFormLayout';

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

  // Pricing tiers state (for catering and hire_chef)
  const [pricingTiers, setPricingTiers] = useState<{
    id?: string;
    min_guests: number;
    max_guests: number;
    price_per_portion: number;
  }[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyAccessories(user, setMyAccessories);
      fetchMyDishes(user, setMyDishes);
    }
    if (id) {
      fetchProduct(id, setFormData, setImagePreview, setError);
      fetchProductAccessories(id, setProductAccessories);
      fetchMealBoxData(id, setMealBoxDetails, setSelectedTemplate, setMealBoxDishes);
      fetchRecurringSchedule(id, setRecurringSchedule);
      fetchCapacityPeriods(id, setCapacityPeriods);
      fetchSubscriptionData(id, setSubscriptionDetails);
      fetchRecipeIngredients(id, setRecipeIngredients);
      fetchPricingTiers(id, setPricingTiers);
    }
    if (formData.type === 'subscription') {
      fetchAvailableItems(user, subscriptionDetails.subscription_item_type, setAvailableItems);
    }
  }, [id, user]);

  useEffect(() => {
    fetchMealBoxTemplates(setMealBoxTemplates);
    fetchSubscriptionTemplates(setSubscriptionTemplates);
  }, []);

  useEffect(() => {
    if (formData.type === 'subscription' || subscriptionDetails.subscription_item_type) {
      fetchAvailableItems(user, subscriptionDetails.subscription_item_type, setAvailableItems);
    }
  }, [subscriptionDetails.subscription_item_type, formData.type]);

  return (
    <ProductFormLayout
      id={id}
      formData={formData}
      handleChangeHandler={handleChange(setFormData)}
      handleSubmitHandler={(e: React.FormEvent) => {
        handleSubmit({
          e,
          user,
          formData,
          mealBoxDetails,
          mealBoxDishes,
          recurringSchedule,
          capacityPeriods,
          subscriptionDetails,
          recipeIngredients,
          pricingTiers,
          productAccessories,
          imageFile,
          id,
          selectedTemplate,
          setError,
          setLoading,
          setUploading
        });
      }}
      templateAppliedFeedback={templateAppliedFeedback}
      setTemplateAppliedFeedback={setTemplateAppliedFeedback}
      showNewAccessory={showNewAccessory}
      setShowNewAccessory={setShowNewAccessory}
      newAccessory={newAccessory}
      setNewAccessory={setNewAccessory}
      handleCreateAccessory={() => handleCreateAccessory(
        user,
        newAccessory,
        myAccessories,
        setMyAccessories,
        setNewAccessory,
        setShowNewAccessory,
        setError
      )}
      myAccessories={myAccessories}
      productAccessories={productAccessories}
      handleAddAccessoryToProduct={(accessoryId: string) => handleAddAccessoryToProduct(
        accessoryId,
        productAccessories,
        setProductAccessories
      )}
      handleRemoveAccessoryFromProduct={(accessoryId: string) => handleRemoveAccessoryFromProduct(
        accessoryId,
        productAccessories,
        setProductAccessories
      )}
      handleUpdateProductAccessory={(accessoryId: string, field: string, value: any) => handleUpdateProductAccessory(
        accessoryId,
        field,
        value,
        productAccessories,
        setProductAccessories
      )}
      recipeIngredients={recipeIngredients}
      setRecipeIngredients={setRecipeIngredients}
      showTemplates={showTemplates}
      setShowTemplates={setShowTemplates}
      templateSearch={templateSearch}
      setTemplateSearch={setTemplateSearch}
      expandedCategory={expandedCategory}
      setExpandedCategory={setExpandedCategory}
      selectedTemplate={selectedTemplate}
      getTemplatesByCategory={() => getTemplatesByCategoryUtil(
        mealBoxTemplates,
        templateSearch
      )}
      handleApplyTemplate={async (templateId: string) => handleApplyTemplate(
        templateId,
        setSelectedTemplate,
        mealBoxTemplates,
        formData,
        setFormData,
        mealBoxDetails,
        setMealBoxDetails,
        user,
        id,
        setTemplateAppliedFeedback,
        setShowTemplates
      )}
      mealBoxDetails={mealBoxDetails}
      setMealBoxDetails={setMealBoxDetails}
      mealBoxDishes={mealBoxDishes}
      myDishes={myDishes}
      handleAddDishToMealBox={(dishId: string) => handleAddDishToMealBox(
        dishId,
        mealBoxDishes,
        setMealBoxDishes,
        mealBoxDetails,
        setMealBoxDetails
      )}
      handleRemoveDishFromMealBox={(dishId: string) => handleRemoveDishFromMealBox(
        dishId,
        mealBoxDishes,
        setMealBoxDishes,
        mealBoxDetails,
        setMealBoxDetails
      )}
      handleUpdateMealBoxDish={(dishId: string, field: string, value: any) => handleUpdateMealBoxDish(
        dishId,
        field,
        value,
        mealBoxDishes,
        setMealBoxDishes
      )}
      user={user}
      recurringSchedule={recurringSchedule}
      setRecurringSchedule={setRecurringSchedule}
      capacityPeriods={capacityPeriods}
      setCapacityPeriods={setCapacityPeriods}
      subscriptionTemplates={subscriptionTemplates}
      selectedSubscriptionTemplate={selectedSubscriptionTemplate}
      handleApplySubscriptionTemplate={async (templateId: string) => handleApplySubscriptionTemplate(
        templateId,
        setSelectedSubscriptionTemplate,
        subscriptionTemplates,
        formData,
        setFormData,
        subscriptionDetails,
        setSubscriptionDetails,
        user,
        id,
        setTemplateAppliedFeedback
      )}
      subscriptionDetails={subscriptionDetails}
      setSubscriptionDetails={setSubscriptionDetails}
      availableItems={availableItems}
      diyKitDetails={diyKitDetails}
      setDiyKitDetails={setDiyKitDetails}
      hireChefDetails={hireChefDetails}
      setHireChefDetails={setHireChefDetails}
      pricingTiers={pricingTiers}
      setPricingTiers={setPricingTiers}
      cateringDetails={cateringDetails}
      setCateringDetails={setCateringDetails}
      videoDetails={videoDetails}
      setVideoDetails={setVideoDetails}
      imagePreview={imagePreview}
      imageFile={imageFile}
      setImageFile={setImageFile}
      setImagePreview={setImagePreview}
      setFormData={setFormData}
      setError={setError}
      error={error}
      loading={loading}
      uploading={uploading}
    />
  );
};
