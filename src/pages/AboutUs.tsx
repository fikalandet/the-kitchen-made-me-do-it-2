import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AboutPageData {
  background_type: string;
  background_color: string;
  background_image: string | null;
  title_text: string;
  title_font: string;
  title_weight: string;
  title_size: string;
  title_color: string;
  title_align: string;
  tagline_text: string | null;
  ingress_text: string | null;
  hero_image: string | null;
  hero_image_position: string;
  container_mode: string;
}

interface AboutPageRow {
  row_order: number;
  row_title: string;
  row_text: string;
  row_image: string | null;
  image_shape: string;
  image_border: boolean;
  image_border_color: string;
  row_layout: string;
}

interface SectionSettings {
  section_title: string;
  section_tagline: string | null;
  section_ingress: string | null;
  show_section: boolean;
  title_font: string;
  title_size: string;
  title_color: string;
  title_align: string;
}

interface HeroCard {
  card_order: number;
  settings: any;
}

export function AboutUs() {
  const [aboutPage, setAboutPage] = useState<AboutPageData | null>(null);
  const [rows, setRows] = useState<AboutPageRow[]>([]);
  const [valuesSettings, setValuesSettings] = useState<SectionSettings | null>(null);
  const [valuesCards, setValuesCards] = useState<HeroCard[]>([]);
  const [discoverSettings, setDiscoverSettings] = useState<SectionSettings | null>(null);
  const [discoverCards, setDiscoverCards] = useState<HeroCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const [aboutRes, rowsRes, valuesSettingsRes, valuesCardsRes, discoverSettingsRes, discoverCardsRes] = await Promise.all([
        supabase.from('about_page').select('*').maybeSingle(),
        supabase.from('about_page_rows').select('*').order('row_order'),
        supabase.from('about_page_sections_settings').select('*').eq('section_key', 'values').maybeSingle(),
        supabase.from('about_page_values_cards').select('*').order('card_order'),
        supabase.from('about_page_sections_settings').select('*').eq('section_key', 'discover').maybeSingle(),
        supabase.from('about_page_discover_cards').select('*').order('card_order')
      ]);

      if (aboutRes.data) setAboutPage(aboutRes.data);
      if (rowsRes.data) setRows(rowsRes.data);
      if (valuesSettingsRes.data) setValuesSettings(valuesSettingsRes.data);
      if (valuesCardsRes.data) setValuesCards(valuesCardsRes.data);
      if (discoverSettingsRes.data) setDiscoverSettings(discoverSettingsRes.data);
      if (discoverCardsRes.data) setDiscoverCards(discoverCardsRes.data);
    } catch (err) {
      console.error('Error fetching about page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFontFamily = (font?: string) => {
    const fonts: Record<string, string> = {
      poppins: 'Poppins, sans-serif',
      lobster: 'Lobster, cursive',
      roboto: 'Roboto, sans-serif',
      open_sans: 'Open Sans, sans-serif',
      lato: 'Lato, sans-serif',
      playfair: 'Playfair Display, serif',
      montserrat: 'Montserrat, sans-serif',
      default: 'system-ui, sans-serif'
    };
    return fonts[font || 'default'] || fonts.default;
  };

  const getTitleSize = (size?: string) => {
    const sizes: Record<string, string> = {
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
      '2xl': '4rem'
    };
    return sizes[size || 'xl'] || sizes.xl;
  };

  const hexToRgba = (hex: string, opacity: number = 100) => {
    if (hex === 'transparent') return 'transparent';
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    const alpha = opacity / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  const topBgStyle: React.CSSProperties = {
    backgroundColor: aboutPage?.background_type === 'color' ? (aboutPage?.background_color || '#f6f2e0') : 'transparent',
    backgroundImage: aboutPage?.background_type === 'image' && aboutPage?.background_image ? `url(${aboutPage.background_image})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f2e0' }}>
      <div style={topBgStyle} className="py-16">
        <div className={aboutPage?.container_mode === 'full-width' ? 'w-full px-4' : 'max-w-4xl mx-auto px-4'}>
          {aboutPage?.hero_image && aboutPage?.hero_image_position === 'above_title' && (
            <div className="mb-8 flex justify-center">
              <img src={aboutPage.hero_image} alt={aboutPage.title_text} className="max-w-md w-full h-auto rounded-lg shadow-lg" />
            </div>
          )}

          <h1
            className="mb-4"
            style={{
              fontFamily: getFontFamily(aboutPage?.title_font),
              fontWeight: aboutPage?.title_weight === 'bold' ? '700' : '400',
              fontSize: getTitleSize(aboutPage?.title_size),
              color: aboutPage?.title_color || '#000000',
              textAlign: (aboutPage?.title_align as any) || 'center'
            }}
          >
            {aboutPage?.title_text || 'Om oss'}
          </h1>

          {aboutPage?.tagline_text && (
            <p className="text-xl mb-4" style={{ textAlign: (aboutPage?.title_align as any) || 'center' }}>
              {aboutPage.tagline_text}
            </p>
          )}

          {aboutPage?.ingress_text && (
            <p className="text-lg text-gray-700 mb-8" style={{ textAlign: (aboutPage?.title_align as any) || 'center' }}>
              {aboutPage.ingress_text}
            </p>
          )}

          {aboutPage?.hero_image && aboutPage?.hero_image_position === 'below_title' && (
            <div className="mb-8 flex justify-center">
              <img src={aboutPage.hero_image} alt={aboutPage.title_text} className="max-w-md w-full h-auto rounded-lg shadow-lg" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {rows.map((row) => {
          const isImageLeft = row.row_order === 2;

          return (
            <div
              key={row.row_order}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${isImageLeft ? 'md:flex-row-reverse' : ''}`}
            >
              {isImageLeft ? (
                <>
                  <div className="order-2 md:order-1">
                    {row.row_image ? (
                      <img
                        src={row.row_image}
                        alt={row.row_title}
                        className={`w-full h-auto shadow-lg ${
                          row.image_shape === 'circle' ? 'rounded-full aspect-square object-cover' : 'rounded-lg'
                        }`}
                        style={{
                          border: row.image_border ? `4px solid ${row.image_border_color}` : 'none'
                        }}
                      />
                    ) : (
                      <div className={`w-full aspect-video bg-gray-200 flex items-center justify-center ${
                        row.image_shape === 'circle' ? 'rounded-full aspect-square' : 'rounded-lg'
                      }`}>
                        <span className="text-gray-500">Ingen bild</span>
                      </div>
                    )}
                  </div>
                  <div className="order-1 md:order-2">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{row.row_title}</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">{row.row_text}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{row.row_title}</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">{row.row_text}</p>
                  </div>
                  <div>
                    {row.row_image ? (
                      <img
                        src={row.row_image}
                        alt={row.row_title}
                        className={`w-full h-auto shadow-lg ${
                          row.image_shape === 'circle' ? 'rounded-full aspect-square object-cover' : 'rounded-lg'
                        }`}
                        style={{
                          border: row.image_border ? `4px solid ${row.image_border_color}` : 'none'
                        }}
                      />
                    ) : (
                      <div className={`w-full aspect-video bg-gray-200 flex items-center justify-center ${
                        row.image_shape === 'circle' ? 'rounded-full aspect-square' : 'rounded-lg'
                      }`}>
                        <span className="text-gray-500">Ingen bild</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {valuesSettings?.show_section && valuesCards.length > 0 && (
        <div className="w-full py-16" style={{ backgroundColor: '#a1c798' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                className="mb-2"
                style={{
                  fontFamily: getFontFamily(valuesSettings.title_font),
                  fontSize: getTitleSize(valuesSettings.title_size),
                  color: valuesSettings.title_color,
                  textAlign: (valuesSettings.title_align as any)
                }}
              >
                {valuesSettings.section_title}
              </h2>
              {valuesSettings.section_tagline && (
                <p className="text-lg text-gray-700">{valuesSettings.section_tagline}</p>
              )}
              {valuesSettings.section_ingress && (
                <p className="text-base text-gray-600 mt-2">{valuesSettings.section_ingress}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {valuesCards.map((card) => {
                const settings = card.settings;
                const headingStyle = settings.headingStyle || {};
                const textStyle = settings.textStyle || {};
                const ctaStyle = settings.ctaStyle || {};

                return (
                  <div
                    key={card.card_order}
                    className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all p-6 flex flex-col"
                    style={{
                      backgroundColor: settings.cardBackgroundColor || '#ffffff',
                      backgroundImage: settings.imageUrl ? `url(${settings.imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: '250px'
                    }}
                  >
                    {settings.heading && (
                      <h3
                        className="mb-3"
                        style={{
                          fontFamily: getFontFamily(headingStyle.fontFamily),
                          fontSize: headingStyle.fontSize === 'sm' ? '0.875rem' : headingStyle.fontSize === 'lg' ? '1.25rem' : headingStyle.fontSize === 'xl' ? '1.5rem' : '1rem',
                          fontWeight: headingStyle.bold ? '700' : '400',
                          color: headingStyle.textColor || '#000000',
                          textAlign: (headingStyle.textAlign as any) || 'center'
                        }}
                      >
                        {settings.heading}
                      </h3>
                    )}
                    {settings.text && (
                      <p
                        style={{
                          fontFamily: getFontFamily(textStyle.fontFamily),
                          fontSize: textStyle.fontSize === 'sm' ? '0.75rem' : textStyle.fontSize === 'lg' ? '1rem' : textStyle.fontSize === 'xl' ? '1.25rem' : '0.875rem',
                          fontWeight: textStyle.bold ? '700' : '400',
                          color: textStyle.textColor || '#000000',
                          textAlign: (textStyle.textAlign as any) || 'center'
                        }}
                      >
                        {settings.text}
                      </p>
                    )}
                    {settings.ctaLabel && settings.ctaUrl && (
                      <div className="mt-auto pt-4">
                        {settings.ctaLinkType === 'internal' ? (
                          <Link
                            to={settings.ctaUrl}
                            className="inline-block px-6 py-3 rounded transition-colors"
                            style={{
                              backgroundColor: hexToRgba(ctaStyle.backgroundColor || '#56c5c5', ctaStyle.backgroundOpacity || 100),
                              color: ctaStyle.textColor || '#ffffff',
                              borderRadius: ctaStyle.borderRadius || '8px',
                              textDecoration: 'none'
                            }}
                          >
                            {settings.ctaLabel}
                          </Link>
                        ) : (
                          <a
                            href={settings.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 rounded transition-colors"
                            style={{
                              backgroundColor: hexToRgba(ctaStyle.backgroundColor || '#56c5c5', ctaStyle.backgroundOpacity || 100),
                              color: ctaStyle.textColor || '#ffffff',
                              borderRadius: ctaStyle.borderRadius || '8px',
                              textDecoration: 'none'
                            }}
                          >
                            {settings.ctaLabel}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {discoverSettings?.show_section && discoverCards.length > 0 && (
        <div className="w-full py-16" style={{ backgroundColor: '#56c5c5' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                className="mb-2"
                style={{
                  fontFamily: getFontFamily(discoverSettings.title_font),
                  fontSize: getTitleSize(discoverSettings.title_size),
                  color: discoverSettings.title_color,
                  textAlign: (discoverSettings.title_align as any)
                }}
              >
                {discoverSettings.section_title}
              </h2>
              {discoverSettings.section_tagline && (
                <p className="text-lg text-gray-700">{discoverSettings.section_tagline}</p>
              )}
              {discoverSettings.section_ingress && (
                <p className="text-base text-gray-600 mt-2">{discoverSettings.section_ingress}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoverCards.map((card) => {
                const settings = card.settings;
                const headingStyle = settings.headingStyle || {};
                const textStyle = settings.textStyle || {};
                const ctaStyle = settings.ctaStyle || {};

                return (
                  <div
                    key={card.card_order}
                    className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all p-6 flex flex-col"
                    style={{
                      backgroundColor: settings.cardBackgroundColor || '#ffffff',
                      backgroundImage: settings.imageUrl ? `url(${settings.imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: '250px'
                    }}
                  >
                    {settings.heading && (
                      <h3
                        className="mb-3"
                        style={{
                          fontFamily: getFontFamily(headingStyle.fontFamily),
                          fontSize: headingStyle.fontSize === 'sm' ? '0.875rem' : headingStyle.fontSize === 'lg' ? '1.25rem' : headingStyle.fontSize === 'xl' ? '1.5rem' : '1rem',
                          fontWeight: headingStyle.bold ? '700' : '400',
                          color: headingStyle.textColor || '#000000',
                          textAlign: (headingStyle.textAlign as any) || 'center'
                        }}
                      >
                        {settings.heading}
                      </h3>
                    )}
                    {settings.text && (
                      <p
                        style={{
                          fontFamily: getFontFamily(textStyle.fontFamily),
                          fontSize: textStyle.fontSize === 'sm' ? '0.75rem' : textStyle.fontSize === 'lg' ? '1rem' : textStyle.fontSize === 'xl' ? '1.25rem' : '0.875rem',
                          fontWeight: textStyle.bold ? '700' : '400',
                          color: textStyle.textColor || '#000000',
                          textAlign: (textStyle.textAlign as any) || 'center'
                        }}
                      >
                        {settings.text}
                      </p>
                    )}
                    {settings.ctaLabel && settings.ctaUrl && (
                      <div className="mt-auto pt-4">
                        {settings.ctaLinkType === 'internal' ? (
                          <Link
                            to={settings.ctaUrl}
                            className="inline-block px-6 py-3 rounded transition-colors"
                            style={{
                              backgroundColor: hexToRgba(ctaStyle.backgroundColor || '#56c5c5', ctaStyle.backgroundOpacity || 100),
                              color: ctaStyle.textColor || '#ffffff',
                              borderRadius: ctaStyle.borderRadius || '8px',
                              textDecoration: 'none'
                            }}
                          >
                            {settings.ctaLabel}
                          </Link>
                        ) : (
                          <a
                            href={settings.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 rounded transition-colors"
                            style={{
                              backgroundColor: hexToRgba(ctaStyle.backgroundColor || '#56c5c5', ctaStyle.backgroundOpacity || 100),
                              color: ctaStyle.textColor || '#ffffff',
                              borderRadius: ctaStyle.borderRadius || '8px',
                              textDecoration: 'none'
                            }}
                          >
                            {settings.ctaLabel}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
