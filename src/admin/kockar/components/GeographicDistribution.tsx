import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Search, X, MapPin, Navigation } from 'lucide-react';
import { AdminSectionHeader, AdminTable, AdminCard, AdminButton } from '../../components';
import AdminChefsMap from './AdminChefsMap';

interface ChefGeographic {
  id: string;
  full_name: string;
  email: string;
  kitchen_name: string;
  country: string;
  region: string;
  city: string;
  postal_code: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export default function GeographicDistribution() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<ChefGeographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedChefId, setSelectedChefId] = useState<string | null>(null);

  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    fetchChefs();
  }, []);

  useEffect(() => {
    updateFilters();
  }, [chefs, countryFilter, regionFilter]);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, kitchen_name, country, region, city, postal_code, address, latitude, longitude')
        .eq('role', 'seller')
        .order('full_name', { ascending: true });

      if (error) throw error;

      setChefs(data || []);
    } catch (error) {
      console.error('Error fetching chefs geographic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = () => {
    const countries = Array.from(new Set(chefs.map(c => c.country).filter(Boolean)));
    setAvailableCountries(countries);

    let regionsToShow = chefs;
    if (countryFilter !== 'all') {
      regionsToShow = chefs.filter(c => c.country === countryFilter);
    }
    const regions = Array.from(new Set(regionsToShow.map(c => c.region).filter(Boolean))).sort();
    setAvailableRegions(regions);

    let citiesToShow = chefs;
    if (countryFilter !== 'all') {
      citiesToShow = citiesToShow.filter(c => c.country === countryFilter);
    }
    if (regionFilter !== 'all') {
      citiesToShow = citiesToShow.filter(c => c.region === regionFilter);
    }
    const cities = Array.from(new Set(citiesToShow.map(c => c.city).filter(Boolean))).sort();
    setAvailableCities(cities);
  };

  const filteredChefs = chefs.filter(chef => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      chef.full_name?.toLowerCase().includes(query) ||
      chef.email?.toLowerCase().includes(query) ||
      chef.kitchen_name?.toLowerCase().includes(query)
    );

    const matchesCountry = countryFilter === 'all' || chef.country === countryFilter;
    const matchesRegion = regionFilter === 'all' || chef.region === regionFilter;
    const matchesCity = !cityFilter || chef.city?.toLowerCase().includes(cityFilter.toLowerCase());

    return matchesSearch && matchesCountry && matchesRegion && matchesCity;
  });

  const sortedChefs = [...filteredChefs].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'full_name':
        aVal = a.full_name?.toLowerCase() || '';
        bVal = b.full_name?.toLowerCase() || '';
        break;
      case 'country':
        aVal = a.country?.toLowerCase() || '';
        bVal = b.country?.toLowerCase() || '';
        break;
      case 'region':
        aVal = a.region?.toLowerCase() || '';
        bVal = b.region?.toLowerCase() || '';
        break;
      case 'city':
        aVal = a.city?.toLowerCase() || '';
        bVal = b.city?.toLowerCase() || '';
        break;
      case 'postal_code':
        aVal = a.postal_code || '';
        bVal = b.postal_code || '';
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCountryFilter('all');
    setRegionFilter('all');
    setCityFilter('');
  };

  const handleGeocodeChefs = async () => {
    setGeocoding(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geocode-chefs`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const result = await response.json();
      alert(`Geokodning klar: ${result.message}`);

      await fetchChefs();
    } catch (error) {
      console.error('Error geocoding chefs:', error);
      alert('Ett fel uppstod vid geokodning');
    } finally {
      setGeocoding(false);
    }
  };

  const handleChefClickOnMap = (chefId: string) => {
    setSelectedChefId(chefId);

    const tableRow = document.getElementById(`chef-row-${chefId}`);
    if (tableRow) {
      tableRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      tableRow.classList.add('bg-yellow-100');
      setTimeout(() => {
        tableRow.classList.remove('bg-yellow-100');
      }, 2000);
    }
  };

  const getCityDistribution = () => {
    const cityCount: Record<string, number> = {};
    filteredChefs.forEach(chef => {
      if (chef.city) {
        cityCount[chef.city] = (cityCount[chef.city] || 0) + 1;
      }
    });
    return Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const getRegionDistribution = () => {
    const regionCount: Record<string, number> = {};
    chefs.forEach(chef => {
      if (chef.region) {
        regionCount[chef.region] = (regionCount[chef.region] || 0) + 1;
      }
    });
    return Object.entries(regionCount).sort((a, b) => b[1] - a[1]);
  };

  const getCountryDistribution = () => {
    const countryCount: Record<string, number> = {};
    chefs.forEach(chef => {
      if (chef.country) {
        countryCount[chef.country] = (countryCount[chef.country] || 0) + 1;
      }
    });
    return Object.entries(countryCount);
  };

  const topCities = getCityDistribution();
  const regionDistribution = getRegionDistribution();
  const countryDistribution = getCountryDistribution();

  const stats = {
    totalChefs: chefs.length,
    chefsInSelectedCountry: countryFilter === 'all' ? chefs.length : chefs.filter(c => c.country === countryFilter).length,
    regionWithMost: regionDistribution.length > 0 ? regionDistribution[0] : null,
    regionWithLeast: regionDistribution.length > 0 ? regionDistribution[regionDistribution.length - 1] : null,
    averagePerRegion: regionDistribution.length > 0
      ? Math.round((chefs.length / regionDistribution.length) * 10) / 10
      : 0,
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      type="button"
      className="flex items-center gap-1 text-left w-full cursor-pointer hover:opacity-80 select-none"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field && (
        <span className="text-black">{sortDirection === 'asc' ? '▲' : '▼'}</span>
      )}
    </button>
  );

  return (
    <div>
      <AdminSectionHeader title="Kockar – Geografisk spridning (översikt)" />

      <div className="mb-6 space-y-4">
        <AdminCard>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[280px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Sök kock
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Namn, e-post eller kök..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[160px] max-w-[200px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Land
                </label>
                <select
                  value={countryFilter}
                  onChange={(e) => {
                    setCountryFilter(e.target.value);
                    setRegionFilter('all');
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="all">Alla</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[240px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Region / Län
                </label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  disabled={countryFilter === 'all' && availableRegions.length === 0}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">Alla</option>
                  {availableRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[240px]">
                <label className="block text-sm font-medium text-black mb-1.5">
                  Stad / Kommun
                </label>
                <input
                  type="text"
                  placeholder="Filtrera på stad..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">Rensa</span>
                </button>
                <button
                  onClick={handleGeocodeChefs}
                  disabled={geocoding}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {geocoding ? 'Geokodning pågår...' : 'Geokoda saknade positioner'}
                  </span>
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-700 font-medium">
              {filteredChefs.length} kockar hittades
            </div>
          </div>
        </AdminCard>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg p-5">
            <div className="text-sm font-medium text-blue-900 mb-1">Antal kockar totalt</div>
            <div className="text-3xl font-bold text-blue-900">{stats.totalChefs}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-400 rounded-lg p-5">
            <div className="text-sm font-medium text-purple-900 mb-1">
              Kockar i {countryFilter === 'all' ? 'alla länder' : countryFilter}
            </div>
            <div className="text-3xl font-bold text-purple-900">{stats.chefsInSelectedCountry}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-5">
            <div className="text-sm font-medium text-green-900 mb-1">Region med flest</div>
            <div className="text-lg font-bold text-green-900">
              {stats.regionWithMost ? `${stats.regionWithMost[0]} (${stats.regionWithMost[1]})` : '—'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400 rounded-lg p-5">
            <div className="text-sm font-medium text-orange-900 mb-1">Genomsnitt per region</div>
            <div className="text-3xl font-bold text-orange-900">{stats.averagePerRegion}</div>
          </div>
        </div>

        {topCities.length > 0 && (
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-300 rounded-lg p-5">
            <h4 className="text-sm font-bold text-teal-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Topp 3 städer
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {topCities.map(([city, count], index) => (
                <div key={city} className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-teal-900">#{index + 1}</span>
                  <div>
                    <div className="text-sm font-bold text-teal-900">{city}</div>
                    <div className="text-xs text-teal-700">{count} kockar</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {countryDistribution.length > 1 && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-5">
            <h4 className="text-sm font-bold text-black mb-3">Fördelning per land</h4>
            <div className="flex flex-wrap gap-3">
              {countryDistribution.map(([country, count]) => (
                <div key={country} className="px-4 py-2 bg-white rounded-lg border border-gray-300">
                  <span className="font-bold text-black">{country}:</span>
                  <span className="ml-2 text-gray-700">{count} kockar</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.regionWithLeast && regionDistribution.length > 1 && (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 rounded-lg p-4">
            <div className="text-sm text-yellow-900">
              <span className="font-bold">Region med minst antal:</span>
              <span className="ml-2">{stats.regionWithLeast[0]} ({stats.regionWithLeast[1]} kockar)</span>
            </div>
          </div>
        )}

        <AdminCard>
          <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
            Karta över kockar
          </h3>
          <AdminChefsMap
            chefs={sortedChefs
              .filter(chef => chef.latitude != null && chef.longitude != null)
              .map(chef => ({
                id: chef.id,
                full_name: chef.full_name,
                kitchen_name: chef.kitchen_name,
                latitude: chef.latitude!,
                longitude: chef.longitude!,
                city: chef.city,
                country: chef.country,
              }))}
            onChefClick={handleChefClickOnMap}
          />
        </AdminCard>
      </div>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Geografisk fördelning
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-700">Läser in...</div>
        ) : (
          <AdminTable
            headers={[
              <SortableHeader key="name" field="full_name">Kock</SortableHeader>,
              'E-post',
              <SortableHeader key="country" field="country">Land</SortableHeader>,
              <SortableHeader key="region" field="region">Region / Län</SortableHeader>,
              <SortableHeader key="city" field="city">Stad / Kommun</SortableHeader>,
              <SortableHeader key="postal" field="postal_code">Postnummer</SortableHeader>,
              'Åtgärder',
            ]}
          >
            {sortedChefs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-700">
                  Inga kockar hittades
                </td>
              </tr>
            ) : (
              sortedChefs.map(chef => (
                <tr
                  key={chef.id}
                  id={`chef-row-${chef.id}`}
                  className={`transition-colors duration-300 ${selectedChefId === chef.id ? 'bg-yellow-100' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">{chef.full_name || 'Ej angivet'}</div>
                      {chef.kitchen_name && (
                        <div className="text-sm text-gray-700">{chef.kitchen_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.country || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.region || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.city || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {chef.postal_code || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AdminButton
                      variant="secondary"
                      onClick={() => navigate(`/admin/kockar/${chef.id}`)}
                      className="text-sm py-1.5 px-4"
                    >
                      Öppna kock
                    </AdminButton>
                  </td>
                </tr>
              ))
            )}
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
