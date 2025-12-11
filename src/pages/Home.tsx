import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ImageCarousel } from '../components/ImageCarousel';
import { HeroSection } from '../components/homepage/HeroSection';
import { SectionWrapper } from '../components/homepage/SectionWrapper';
import { OnStoveNowSection } from '../components/homepage/OnStoveNowSection';
import { PopularSection } from '../components/homepage/PopularSection';
import { NewMenuSection } from '../components/homepage/NewMenuSection';
import { FridgeMenuSection } from '../components/homepage/FridgeMenuSection';
import { WeeklyChefsSection } from '../components/homepage/WeeklyChefsSection';
import { EmptyState } from '../components/homepage/EmptyState';
import { MealKitsSection } from '../components/homepage/MealKitsSection';
import { DealsSection } from '../components/homepage/DealsSection';
import { BrattomkakSection } from '../components/homepage/BrattomkakSection';
import { TjuvkikSection } from '../components/homepage/TjuvkikSection';
import { TasteTagsSection } from '../components/homepage/TasteTagsSection';
import { NewsSection } from '../components/homepage/NewsSection';
import { ContestsSection } from '../components/homepage/ContestsSection';
import { FeedbackDishesSection } from '../components/homepage/FeedbackDishesSection';
import { WishFoodSection } from '../components/homepage/WishFoodSection';
import { TestEatSection } from '../components/homepage/TestEatSection';
import { EventsSection } from '../components/homepage/EventsSection';
import { ChefSpotlightSection } from '../components/homepage/ChefSpotlightSection';
import { MoodDishesSection } from '../components/homepage/MoodDishesSection';
import { HoroscopeSection } from '../components/homepage/HoroscopeSection';
import { EditorialCategoriesSection } from '../components/homepage/EditorialCategoriesSection';
import { TestimonialsSection } from '../components/homepage/TestimonialsSection';
import { BecomeChefSection } from '../components/homepage/BecomeChefSection';
import { OnStoveNowCard } from '../components/CardKit/variants/OnStoveNowCard';
import { PopularNewMoodCard } from '../components/CardKit/variants/PopularNewMoodCard';
import { ChefOfWeekCard } from '../components/CardKit/variants/ChefOfWeekCard';
import { BundleCard } from '../components/CardKit/variants/BundleCard';
import { EventCard } from '../components/CardKit/variants/EventCard';
import { TestEatCard } from '../components/CardKit/variants/TestEatCard';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { transformToOnStoveNowProps, transformChef, createCommonProps } from '../lib/adapters/cardKitAdapters';

interface Dish {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  seller_id: string;
  created_at: string;
  available: boolean;
}

interface Chef {
  id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  membership_level?: string;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [onStoveNowSettings, setOnStoveNowSettings] = useState<any>({});
  const [popularSettings, setPopularSettings] = useState<any>({});
  const [newMenuSettings, setNewMenuSettings] = useState<any>({});
  const [fridgeMenuSettings, setFridgeMenuSettings] = useState<any>({});
  const [weeklyChefsSettings, setWeeklyChefsSettings] = useState<any>({});
  const [brattomkakSettings, setBrattomkakSettings] = useState<any>({});
  const [tjuvkikSettings, setTjuvkikSettings] = useState<any>({});
  const [dealsSettings, setDealsSettings] = useState<any>({});
  const [eventsSettings, setEventsSettings] = useState<any>({});
  const [contestsSettings, setContestsSettings] = useState<any>({});
  const [wishFoodSettings, setWishFoodSettings] = useState<any>({});
  const [testEatSettings, setTestEatSettings] = useState<any>({});
  const [tasteTagsSettings, setTasteTagsSettings] = useState<any>({});
  const [newsSettings, setNewsSettings] = useState<any>({});
  const [editorialCategoriesSettings, setEditorialCategoriesSettings] = useState<any>({});
  const [chefSpotlightSettings, setChefSpotlightSettings] = useState<any>({});
  const [testimonialsSettings, setTestimonialsSettings] = useState<any>({});
  const [becomeChefSettings, setBecomeChefSettings] = useState<any>({});
  const [liveDishes, setLiveDishes] = useState<any[]>([]);
  const [brattomDishes, setBrattomDishes] = useState<any[]>([]);
  const [tjuvkikDishes, setTjuvkikDishes] = useState<any[]>([]);
  const [fridgeMenuProducts, setFridgeMenuProducts] = useState<any[]>([]);
  const [weeklyChefs, setWeeklyChefs] = useState<any[]>([]);
  const [liveChefs, setLiveChefs] = useState<{[key: string]: any}>({});
  const [popularDishes, setPopularDishes] = useState<Dish[]>([]);
  const [newDishes, setNewDishes] = useState<Dish[]>([]);
  const [mealKits, setMealKits] = useState<any[]>([]);
  const [featuredChefs, setFeaturedChefs] = useState<Chef[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [feedbackDishes, setFeedbackDishes] = useState<Dish[]>([]);
  const [wishes, setWishes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [spotlightChef, setSpotlightChef] = useState<Chef | null>(null);
  const [moodDishes, setMoodDishes] = useState<Dish[]>([]);
  const [horoscopes, setHoroscopes] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data: onStoveNowSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'pa-spisen-nu')
      .maybeSingle();

    if (onStoveNowSection) {
      setOnStoveNowSettings(onStoveNowSection.settings || {});
    }

    const { data: popularSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'populart-kak')
      .maybeSingle();

    if (popularSection) {
      setPopularSettings(popularSection.settings || {});
    }

    const { data: newMenuSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'nytt-pa-menyn')
      .maybeSingle();

    if (newMenuSection) {
      setNewMenuSettings(newMenuSection.settings || {});
    }

    const { data: fridgeMenuSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'kylskapsmeny')
      .maybeSingle();

    if (fridgeMenuSection) {
      setFridgeMenuSettings(fridgeMenuSection.settings || {});
    }

    const { data: weeklyChefsSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'veckans-kockar')
      .maybeSingle();

    if (weeklyChefsSection) {
      setWeeklyChefsSettings(weeklyChefsSection.settings || {});
    }

    const { data: brattomkakSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'brattomkak')
      .maybeSingle();

    if (brattomkakSection) {
      setBrattomkakSettings(brattomkakSection.settings || {});
    }

    const { data: tjuvkikSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'tjuvkik-i-koket')
      .maybeSingle();

    if (tjuvkikSection) {
      setTjuvkikSettings(tjuvkikSection.settings || {});
    }

    const { data: dealsSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'schyssta-deals')
      .maybeSingle();

    if (dealsSection) {
      setDealsSettings(dealsSection.settings || {});
    }

    const { data: eventsSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'evenemang')
      .maybeSingle();

    if (eventsSection) {
      setEventsSettings(eventsSection.settings || {});
    }

    const { data: contestsSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'tavlingar')
      .maybeSingle();

    if (contestsSection) {
      setContestsSettings(contestsSection.settings || {});
    }

    const { data: wishFoodSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'onska-kak')
      .maybeSingle();

    if (wishFoodSection) {
      setWishFoodSettings(wishFoodSection.settings || {});
    }

    const { data: testEatSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'testkaka-tyck-till')
      .maybeSingle();

    if (testEatSection) {
      setTestEatSettings(testEatSection.settings || {});
    }

    const { data: tasteTagsSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'smaketiketter')
      .maybeSingle();

    if (tasteTagsSection) {
      setTasteTagsSettings(tasteTagsSection.settings || {});
    }

    const { data: newsSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'nyheter')
      .maybeSingle();

    if (newsSection) {
      setNewsSettings(newsSection.settings || {});
    }

    const { data: editorialCategoriesSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'redaktionella-kategorier')
      .maybeSingle();

    if (editorialCategoriesSection) {
      setEditorialCategoriesSettings(editorialCategoriesSection.settings || {});
    }

    const { data: chefSpotlightSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'kock-i-fokus')
      .maybeSingle();

    if (chefSpotlightSection) {
      setChefSpotlightSettings(chefSpotlightSection.settings || {});
    }

    const { data: testimonialsSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'kundernas-tyckande')
      .maybeSingle();

    if (testimonialsSection) {
      setTestimonialsSettings(testimonialsSection.settings || {});
    }

    const { data: becomeChefSection } = await supabase
      .from('site_sections')
      .select('settings')
      .eq('slug', 'bli-en-kitchen-kock')
      .maybeSingle();

    if (becomeChefSection) {
      setBecomeChefSettings(becomeChefSection.settings || {});
    }

    const mockChef = {
      id: 'chef1',
      display_name: 'Sofia Andersson',
      avatar_url: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=200',
      membership_level: 'gold',
      kitchen_open_status: 'open',
      bio: 'Passionerad kock med kärlek för italiensk matlagning'
    };

    const mockLiveDishes = [
      {
        cook_date: today,
        portions_available: 8,
        portions_booked: 2,
        cook_time_start: '17:00',
        cook_time_end: '19:00',
        product: {
          id: '1',
          name: 'Krämig laxpasta',
          price: 149,
          image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
          seller_id: 'chef1',
          available: true,
          pickup_enabled: true,
          pickup_hours: '17:00-19:00',
          delivery_enabled: true,
          delivery_hours: '18:00-20:00'
        }
      },
      {
        cook_date: today,
        portions_available: 3,
        portions_booked: 7,
        cook_time_start: '16:00',
        cook_time_end: '18:00',
        product: {
          id: '2',
          name: 'Thai-gryta med kyckling',
          price: 129,
          image_url: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
          seller_id: 'chef1',
          available: true,
          pickup_enabled: true,
          delivery_enabled: true
        }
      },
      {
        cook_date: today,
        portions_available: 6,
        portions_booked: 4,
        cook_time_start: '18:00',
        cook_time_end: '20:00',
        product: {
          id: '3',
          name: 'Lasagne bolognese',
          price: 139,
          image_url: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=800',
          seller_id: 'chef1',
          available: true,
          pickup_enabled: true,
          delivery_enabled: false
        }
      },
      {
        cook_date: today,
        portions_available: 5,
        portions_booked: 5,
        cook_time_start: '17:30',
        cook_time_end: '19:30',
        product: {
          id: '4',
          name: 'Vegetarisk curry',
          price: 119,
          image_url: 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=800',
          seller_id: 'chef1',
          available: true,
          pickup_enabled: true,
          delivery_enabled: true
        }
      }
    ];

    setLiveDishes(mockLiveDishes);
    setLiveChefs({ 'chef1': mockChef });

    const { data: scheduledDishes } = await supabase
      .from('dish_schedule')
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          image_url,
          seller_id,
          created_at,
          available,
          pickup_enabled,
          pickup_hours,
          delivery_enabled,
          delivery_hours
        )
      `)
      .gte('cook_date', today)
      .lte('cook_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('cook_date', { ascending: true })
      .limit(4);

    if (scheduledDishes && scheduledDishes.length > 0) {
      setLiveDishes(scheduledDishes);

      const sellerIds = scheduledDishes.map(s => s.product?.seller_id).filter(Boolean);
      if (sellerIds.length > 0) {
        const { data: chefData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', sellerIds);

        if (chefData) {
          const chefMap: {[key: string]: any} = {};
          chefData.forEach(chef => {
            chefMap[chef.id] = chef;
          });
          setLiveChefs(chefMap);
        }
      }
    }

    const mockPopular = [
      {
        id: 'pop1',
        name: 'Krämig laxpasta',
        price: 149,
        image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString(),
        pickup_enabled: true,
        delivery_enabled: true
      },
      {
        id: 'pop2',
        name: 'Hemlagad lasagne',
        price: 139,
        image_url: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString(),
        pickup_enabled: true,
        delivery_enabled: true
      },
      {
        id: 'pop3',
        name: 'Thai-gryta',
        price: 129,
        image_url: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString(),
        pickup_enabled: true,
        delivery_enabled: false
      },
      {
        id: 'pop4',
        name: 'Vegansk buddha bowl',
        price: 119,
        image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString(),
        pickup_enabled: true,
        delivery_enabled: true
      }
    ];

    const mockNewDishes = [
      {
        id: 'new1',
        name: 'Sushi-platta',
        price: 189,
        image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString(),
        pickup_enabled: true,
        delivery_enabled: true
      },
      {
        id: 'new2',
        name: 'Indisk tikka masala',
        price: 135,
        image_url: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString(),
        pickup_enabled: true,
        delivery_enabled: true
      },
      {
        id: 'new3',
        name: 'Gourmet hamburgare',
        price: 159,
        image_url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString(),
        pickup_enabled: true,
        delivery_enabled: true
      },
      {
        id: 'new4',
        name: 'Medelhavspizza',
        price: 145,
        image_url: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString(),
        pickup_enabled: true,
        delivery_enabled: false
      }
    ];

    const mockChefs = [
      {
        id: 'chef1',
        display_name: 'Sofia Andersson',
        bio: 'Passionerad kock med kärlek för italiensk matlagning',
        avatar_url: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=200',
        membership_level: 'gold'
      },
      {
        id: 'chef2',
        display_name: 'Marcus Berg',
        bio: 'Mästerkock med asiatisk specialitet',
        avatar_url: 'https://images.pexels.com/photos/3748221/pexels-photo-3748221.jpeg?auto=compress&cs=tinysrgb&w=200',
        membership_level: 'silver'
      },
      {
        id: 'chef3',
        display_name: 'Emma Nilsson',
        bio: 'Vegansk matlagning med smak',
        avatar_url: 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=200',
        membership_level: 'free'
      }
    ];

    setPopularDishes(mockPopular);
    setNewDishes(mockNewDishes);
    setFeaturedChefs(mockChefs);
    setWeeklyChefs(mockChefs);

    const featuredChefIds = weeklyChefsSettings?.featuredChefs?.map((fc: any) => fc.chefId) || [];
    if (featuredChefIds.length > 0) {
      const { data: selectedChefs } = await supabase
        .from('profiles')
        .select('*')
        .in('id', featuredChefIds);

      if (selectedChefs && selectedChefs.length > 0) {
        setWeeklyChefs(selectedChefs);
      }
    }

    const { data: popular } = await supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false })
      .limit(4);

    if (popular && popular.length > 0) {
      setPopularDishes(popular);
    }

    const { data: recent } = await supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false })
      .limit(4);

    if (recent && recent.length > 0) {
      setNewDishes(recent);
    }

    const { data: chefs } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'chef')
      .limit(3);

    if (chefs && chefs.length > 0) {
      setFeaturedChefs(chefs);
    }

    const { data: featuredChef } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'chef')
      .eq('featured', true)
      .limit(1)
      .maybeSingle();

    if (featuredChef) {
      setSpotlightChef(featuredChef);
    }

    const now = new Date().toISOString();

    const { data: dealsData } = await supabase
      .from('promotions')
      .select('*')
      .gt('ends_at', now)
      .limit(8);

    if (dealsData) {
      setDeals(dealsData);
    }

    const { data: contestsData } = await supabase
      .from('contests')
      .select('*')
      .gt('deadline_at', now)
      .limit(8);

    if (contestsData) {
      setContests(contestsData);
    }

    const { data: wishesData } = await supabase
      .from('wishes')
      .select('*')
      .eq('status', 'open')
      .limit(12);

    if (wishesData) {
      setWishes(wishesData);
    }

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .gt('start_time', now)
      .limit(8);

    if (eventsData) {
      setEvents(eventsData);
    }

    const { data: reelsData } = await supabase
      .from('reels')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (reelsData) {
      setReels(reelsData);
    }

    const { data: moodDishesData } = await supabase
      .from('products')
      .select('*')
      .not('mood_tag', 'is', null)
      .limit(8);

    if (moodDishesData) {
      setMoodDishes(moodDishesData);
    }

    const mockFeedback = [
      {
        id: 'feedback1',
        name: 'Ny vegetarisk köttfärssås',
        price: 99,
        image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'feedback2',
        name: 'Testrecept: Asiatisk fusion',
        price: 89,
        image_url: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'feedback3',
        name: 'Prova min nya sushirulle',
        price: 79,
        image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        available: true,
        created_at: new Date().toISOString()
      }
    ];

    const mockEvents = [
      {
        id: 'event1',
        name: 'Italiensk matlagningskurs',
        description: 'Lär dig laga autentisk italiensk pasta från grunden',
        price: 650,
        image_url: 'https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=800',
        location: 'Stockholm, Södermalm',
        address: 'Götgatan 45, 118 26 Stockholm',
        date: '2024-12-15',
        time: '18:00',
        spots: 12,
        attending_yes: 8,
        attending_maybe: 3,
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'event2',
        name: 'Sushi-workshop',
        description: 'Mästarklass i att rulla perfekta sushirullar',
        price: 550,
        image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
        location: 'Göteborg, Centrum',
        address: 'Avenyn 12, 411 36 Göteborg',
        date: '2024-12-20',
        time: '17:00',
        spots: 8,
        attending_yes: 5,
        attending_maybe: 2,
        start_time: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'event3',
        name: 'Vegansk matlagningsmiddag',
        description: 'En kväll med gröna smaker och nya vänner',
        price: 450,
        image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
        location: 'Malmö, Västra Hamnen',
        address: 'Varvsgatan 3, 211 19 Malmö',
        date: '2024-12-18',
        time: '19:00',
        spots: 15,
        attending_yes: 12,
        attending_maybe: 4,
        start_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const mockMealKits = [
      {
        id: 'kit1',
        title: 'Italiensk matlådekasse',
        description: 'Fem färdiga italienska middagar för hela veckan',
        price: 899,
        image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        pickup_enabled: true,
        delivery_enabled: true,
        pickup_hours: '15:00-18:00',
        delivery_hours: '17:00-20:00'
      },
      {
        id: 'kit2',
        title: 'Laga-själv sushi-kit',
        description: 'Allt du behöver för att göra sushi hemma - ingredienser och instruktioner',
        price: 449,
        image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        pickup_enabled: true,
        delivery_enabled: true,
        pickup_hours: '10:00-19:00',
        delivery_hours: '12:00-20:00'
      },
      {
        id: 'kit3',
        title: 'Vegansk matlådekasse',
        description: 'Hälsosamma och goda veganska rätter, färdiga att äta',
        price: 799,
        image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        pickup_enabled: true,
        delivery_enabled: false,
        pickup_hours: '14:00-17:00'
      },
      {
        id: 'sub1',
        title: 'Veckolunch-prenumeration',
        description: 'Få färdiga lunchrätter levererade varje måndag',
        price: 1299,
        image_url: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        pickup_enabled: false,
        delivery_enabled: true,
        delivery_hours: 'Måndagar 08:00-10:00'
      },
      {
        id: 'kit4',
        title: 'Laga-själv pasta-kit',
        description: 'Färsk pasta, sås och tillbehör - bara att värma och njuta',
        price: 349,
        image_url: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        pickup_enabled: true,
        delivery_enabled: true,
        pickup_hours: '11:00-20:00',
        delivery_hours: '15:00-21:00'
      },
      {
        id: 'sub2',
        title: 'Månadsprenumeration - Familjen',
        description: 'Tre middagar per vecka för hela familjen',
        price: 2499,
        image_url: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=800',
        seller_id: 'chef1',
        pickup_enabled: true,
        delivery_enabled: true,
        pickup_hours: 'Tis/Tor/Lör 16:00-18:00',
        delivery_hours: 'Tis/Tor/Lör 17:00-19:00'
      }
    ];

    setFeedbackDishes(mockFeedback);
    setEvents(mockEvents);
    setMealKits(mockMealKits);

    const { data: mealBoxesData } = await supabase
      .from('meal_boxes')
      .select('*')
      .limit(8);

    if (mealBoxesData && mealBoxesData.length > 0) {
      setMealKits(mealBoxesData);
    }

    const { data: fridgeMenuProductsData } = await supabase
      .from('products')
      .select('*')
      .in('type', ['meal_box', 'cooking_kit', 'subscription'])
      .eq('available', true)
      .limit(8);

    if (fridgeMenuProductsData && fridgeMenuProductsData.length > 0) {
      setFridgeMenuProducts(fridgeMenuProductsData);
    }

    const horoscopeData = [
      { sign: 'Väduren', symbol: '♈', prediction: 'En dag full av matglädje väntar!' },
      { sign: 'Oxen', symbol: '♉', prediction: 'Prova något nytt idag!' },
      { sign: 'Tvillingarna', symbol: '♊', prediction: 'Dela en måltid med någon du tycker om.' },
      { sign: 'Kräftan', symbol: '♋', prediction: 'Hemlagad mat ger dig styrka.' },
      { sign: 'Lejonet', symbol: '♌', prediction: 'Du strålar när du lagar mat!' },
      { sign: 'Jungfrun', symbol: '♍', prediction: 'Perfektion ligger i detaljerna.' },
      { sign: 'Vågen', symbol: '♎', prediction: 'Balans är nyckeln till lycka.' },
      { sign: 'Skorpionen', symbol: '♏', prediction: 'Intensiva smaker kallar på dig.' },
      { sign: 'Skytten', symbol: '♐', prediction: 'Utforska nya kulinariska äventyr!' },
      { sign: 'Stenbocken', symbol: '♑', prediction: 'Hårt arbete ger smakrika resultat.' },
      { sign: 'Vattumannen', symbol: '♒', prediction: 'Innovation i köket gynnar dig.' },
      { sign: 'Fiskarna', symbol: '♓', prediction: 'Låt kreativiteten flöda i dina rätter.' },
    ];
    setHoroscopes(horoscopeData);
  };

  const handleFindFood = () => {
    setShowFoodModal(true);
  };

  const handleMataMig = () => {
    navigate('/hitta-kak');
    setShowFoodModal(false);
  };

  const handleFilterFram = () => {
    navigate('/filtrera-fram');
    setShowFoodModal(false);
  };


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#a1c798' }}>
      <ImageCarousel />

      <HeroSection />

      <OnStoveNowSection
        settings={onStoveNowSettings}
        liveDishes={liveDishes}
        liveChefs={liveChefs}
      />

      <PopularSection
        settings={popularSettings}
        dishes={popularDishes}
      />

      <NewMenuSection
        settings={newMenuSettings}
        dishes={newDishes}
      />

      <FridgeMenuSection
        settings={fridgeMenuSettings}
        products={fridgeMenuProducts}
      />

      <WeeklyChefsSection
        settings={weeklyChefsSettings}
        chefs={weeklyChefs}
      />

      <BrattomkakSection
        settings={brattomkakSettings}
        dishes={brattomDishes}
      />

      <DealsSection
        settings={dealsSettings}
        dishes={deals}
      />

      <TjuvkikSection
        settings={tjuvkikSettings}
        dishes={tjuvkikDishes}
      />

      <TasteTagsSection settings={tasteTagsSettings} />

      <NewsSection settings={newsSettings} />

      <EditorialCategoriesSection settings={editorialCategoriesSettings} />

      <ContestsSection
        settings={contestsSettings}
        contests={contests}
      />

      <WishFoodSection settings={wishFoodSettings} />

      <TestEatSection settings={testEatSettings} />

      <EventsSection
        settings={eventsSettings}
        events={events}
      />

      <ChefSpotlightSection settings={chefSpotlightSettings} />

      <MoodDishesSection dishes={moodDishes} />

      <TestimonialsSection settings={testimonialsSettings} />

      <BecomeChefSection settings={becomeChefSettings} />

      <HoroscopeSection horoscopes={horoscopes} />

      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowFoodModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-lobster text-3xl text-gray-800 mb-6 text-center">
              Välj hur du vill hitta käk
            </h2>

            <div className="space-y-4">
              <button
                onClick={handleMataMig}
                className="w-full p-6 rounded-xl text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-[#56c5c5]"
                style={{ backgroundColor: '#f6f2e0' }}
              >
                <h3 className="font-lobster text-xl text-gray-800 mb-2">Mata mig</h3>
                <p className="text-sm text-gray-600">
                  Låt oss överraska dig med något gott baserat på tillgängliga rätter
                </p>
              </button>

              <button
                onClick={handleFilterFram}
                className="w-full p-6 rounded-xl text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-[#56c5c5]"
                style={{ backgroundColor: '#f6f2e0' }}
              >
                <h3 className="font-lobster text-xl text-gray-800 mb-2">Filtrera fram</h3>
                <p className="text-sm text-gray-600">
                  Använd våra filter för att hitta exakt vad du har lust på
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface HeroCardProps {
  title: string;
  description: string;
  link: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ title, description, link }) => (
  <Link
    to={link}
    className="rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-105 text-center"
    style={{ backgroundColor: 'white' }}
  >
    <h3 className="font-lobster text-xl text-gray-800 mb-2 font-bold">
      {title}
    </h3>
    <p className="text-gray-600 text-sm">
      {description}
    </p>
  </Link>
);
