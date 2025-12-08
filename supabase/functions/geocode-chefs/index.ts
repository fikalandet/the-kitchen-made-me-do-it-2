import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GeocodeResult {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  success: boolean;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mapboxToken = Deno.env.get('MAPBOX_TOKEN')!;

    if (!mapboxToken) {
      throw new Error('MAPBOX_TOKEN is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: chefs, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, kitchen_name, address, postal_code, city, country, latitude, longitude')
      .eq('role', 'seller')
      .is('latitude', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!chefs || chefs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No chefs need geocoding',
          results: [],
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const results: GeocodeResult[] = [];

    for (const chef of chefs) {
      const addressParts = [
        chef.address,
        chef.postal_code,
        chef.city,
        chef.country,
      ].filter(Boolean);

      if (addressParts.length === 0) {
        results.push({
          id: chef.id,
          name: chef.full_name || chef.kitchen_name || 'Unknown',
          address: 'No address available',
          latitude: null,
          longitude: null,
          success: false,
          error: 'No address data available',
        });
        continue;
      }

      const addressString = addressParts.join(', ');

      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressString)}.json?access_token=${mapboxToken}&limit=1`;
        const geocodeResponse = await fetch(geocodeUrl);

        if (!geocodeResponse.ok) {
          throw new Error(`Mapbox API error: ${geocodeResponse.status}`);
        }

        const geocodeData = await geocodeResponse.json();

        if (geocodeData.features && geocodeData.features.length > 0) {
          const [longitude, latitude] = geocodeData.features[0].center;

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ latitude, longitude })
            .eq('id', chef.id);

          if (updateError) {
            throw updateError;
          }

          results.push({
            id: chef.id,
            name: chef.full_name || chef.kitchen_name || 'Unknown',
            address: addressString,
            latitude,
            longitude,
            success: true,
          });
        } else {
          results.push({
            id: chef.id,
            name: chef.full_name || chef.kitchen_name || 'Unknown',
            address: addressString,
            latitude: null,
            longitude: null,
            success: false,
            error: 'No geocoding results found',
          });
        }
      } catch (error) {
        results.push({
          id: chef.id,
          name: chef.full_name || chef.kitchen_name || 'Unknown',
          address: addressString,
          latitude: null,
          longitude: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Geocoded ${successCount} chefs successfully, ${failureCount} failed`,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in geocode-chefs function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});