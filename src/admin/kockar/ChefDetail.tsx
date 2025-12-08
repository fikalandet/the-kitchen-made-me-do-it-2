import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { AdminCard, AdminSectionHeader } from '../components';
import ChefOverviewTab from './components/ChefOverviewTab';
import ChefPointsTab from './components/ChefPointsTab';
import ChefProvisionTab from './components/ChefProvisionTab';
import ChefLogTab from './components/ChefLogTab';
import ChefMembershipTab from './components/ChefMembershipTab';
import ChefWarningsTab from './components/ChefWarningsTab';
import ChefStatisticsTab from './components/ChefStatisticsTab';
import ChefReviewsTab from './components/ChefReviewsTab';
import ChefNotesTab from './components/ChefNotesTab';
import ChefDocumentsTab from './components/ChefDocumentsTab';
import ChefProductsTab from './components/ChefProductsTab';

type DetailTabType = 'oversikt' | 'logg' | 'medlemskap' | 'poang' | 'provision' | 'varningar' | 'statistik' | 'kundomdomen' | 'anteckningar' | 'dokument' | 'produkter';

interface ChefDetails {
  id: string;
  full_name: string;
  email: string;
  city: string;
  is_verified: boolean;
  membership_level: string;
  kitchen_name: string;
  phone: string;
  address: string;
  postal_code: string;
  bio: string;
  profile_image_url: string;
  banner_image_url: string;
  created_at: string;
}

export default function ChefDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as DetailTabType | null;
  const [activeTab, setActiveTab] = useState<DetailTabType>(tabParam || 'oversikt');
  const [chef, setChef] = useState<ChefDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (id) {
      fetchChefDetails();
    }
  }, [id]);

  const fetchChefDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'seller')
        .maybeSingle();

      if (error) throw error;
      setChef(data);
    } catch (error) {
      console.error('Error fetching chef details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Väntar</span>;
  };

  const getMembershipBadge = (level: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      silver: 'bg-gray-300 text-gray-900',
      gold: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level] || colors.free}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: 'oversikt', label: 'Översikt' },
    { id: 'logg', label: 'Logg' },
    { id: 'medlemskap', label: 'Medlemskap' },
    { id: 'poang', label: 'Poäng' },
    { id: 'provision', label: 'Provision' },
    { id: 'varningar', label: 'Varningar' },
    { id: 'statistik', label: 'Statistik' },
    { id: 'kundomdomen', label: 'Kundomdömen' },
    { id: 'produkter', label: 'Produkter' },
    { id: 'anteckningar', label: 'Anteckningar' },
    { id: 'dokument', label: 'Dokument' },
  ];

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-700">
        Läser in kock...
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-700 mb-4">Kocken hittades inte</p>
        <Link to="/admin/kockar" className="text-black hover:text-gray-700 underline">
          Tillbaka till kockregister
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/kockar"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-black mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till kockregister
        </Link>

        <AdminCard>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black mb-2" style={{ fontFamily: 'Lobster, cursive' }}>
                {chef.full_name || 'Ej angivet'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                <span>{chef.email}</span>
                {chef.city && (
                  <>
                    <span>•</span>
                    <span>{chef.city}</span>
                  </>
                )}
              </div>
              {chef.kitchen_name && (
                <p className="text-sm text-gray-800 mb-3">
                  <span className="font-medium">Köknamn:</span> {chef.kitchen_name}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {getStatusBadge(chef.is_verified)}
              {getMembershipBadge(chef.membership_level)}
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="mb-6 border-b border-gray-300">
        <nav className="-mb-px flex gap-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DetailTabType)}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'oversikt' && (
        <ChefOverviewTab
          chefId={chef.id}
          chefData={{
            full_name: chef.full_name,
            email: chef.email,
            phone: chef.phone,
            city: chef.city,
            address: chef.address,
            postal_code: chef.postal_code,
            kitchen_name: chef.kitchen_name,
            profile_image_url: chef.profile_image_url,
            banner_image_url: chef.banner_image_url,
            is_verified: chef.is_verified,
            membership_level: chef.membership_level,
            created_at: chef.created_at,
          }}
        />
      )}

      {activeTab === 'logg' && <ChefLogTab chefId={chef.id} />}

      {activeTab === 'medlemskap' && (
        <ChefMembershipTab chefId={chef.id} currentLevel={chef.membership_level} />
      )}

      {activeTab === 'poang' && <ChefPointsTab chefId={chef.id} />}

      {activeTab === 'provision' && <ChefProvisionTab chefId={chef.id} />}

      {activeTab === 'varningar' && <ChefWarningsTab chefId={chef.id} />}

      {activeTab === 'statistik' && <ChefStatisticsTab chefId={chef.id} />}

      {activeTab === 'kundomdomen' && <ChefReviewsTab chefId={chef.id} />}

      {activeTab === 'produkter' && <ChefProductsTab chefId={chef.id} />}

      {activeTab === 'anteckningar' && <ChefNotesTab chefId={chef.id} />}

      {activeTab === 'dokument' && <ChefDocumentsTab chefId={chef.id} />}
    </div>
  );
}
