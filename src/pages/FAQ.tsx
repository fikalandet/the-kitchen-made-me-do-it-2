import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronDown } from 'lucide-react';

interface TextLines {
  lines: string[];
  rotate: boolean;
  interval_seconds: number;
  placement: string;
}

interface FAQPageData {
  title_text: string;
  title_font: string;
  title_weight: string;
  title_size: string;
  title_color: string;
  title_align: string;
  text_lines: TextLines;
  tagline_font: string;
  tagline_weight: string;
  tagline_size: string;
  tagline_color: string;
  tagline_align: string;
  ingress_text: string | null;
  ingress_font: string;
  ingress_weight: string;
  ingress_size: string;
  ingress_color: string;
  ingress_align: string;
  background_type: string;
  background_color: string;
  background_image: string | null;
}

interface FAQCategory {
  id: string;
  title: string;
  category_description: string | null;
  styles: {
    font: string;
    weight: string;
    size: string;
    color: string;
    align: string;
    background_color: string;
    icon: string | null;
  };
  header_background_color: string;
  header_title_font: string;
  header_title_weight: string;
  header_title_size: string;
  header_title_color: string;
  header_title_align: string;
  question_background_color: string;
  answer_background_color: string;
  question_font: string;
  question_weight: string;
  question_size: string;
  question_color: string;
  answer_font: string;
  answer_weight: string;
  answer_size: string;
  answer_color: string;
  order_index: number;
}

interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  order_index: number;
}

export function FAQ() {
  const [pageData, setPageData] = useState<FAQPageData | null>(null);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!pageData?.text_lines?.rotate || !pageData.text_lines.lines.length) return;

    const interval = setInterval(() => {
      setCurrentLineIndex(prev => (prev + 1) % pageData.text_lines.lines.length);
    }, (pageData.text_lines.interval_seconds || 10) * 1000);

    return () => clearInterval(interval);
  }, [pageData]);

  const fetchData = async () => {
    try {
      const [pageRes, categoriesRes, itemsRes] = await Promise.all([
        supabase.from('faq_page').select('*').maybeSingle(),
        supabase.from('faq_categories').select('*').eq('is_published', true).order('order_index'),
        supabase.from('faq_items').select('*').eq('is_published', true).order('order_index')
      ]);

      if (pageRes.error) throw pageRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (itemsRes.error) throw itemsRes.error;

      if (pageRes.data) setPageData(pageRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (itemsRes.data) setItems(itemsRes.data);
    } catch (err) {
      console.error('Error fetching FAQ data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFontFamily = (font: string) => {
    const fonts: Record<string, string> = {
      poppins: 'Poppins, sans-serif',
      lobster: 'Lobster, cursive',
      roboto: 'Roboto, sans-serif',
      open_sans: 'Open Sans, sans-serif',
      lato: 'Lato, sans-serif',
      playfair: 'Playfair Display, serif',
      montserrat: 'Montserrat, sans-serif',
      merriweather: 'Merriweather, serif',
      inter: 'Inter, sans-serif',
      default: 'system-ui, sans-serif'
    };
    return fonts[font] || fonts.default;
  };

  const getTextSize = (size: string) => {
    const sizes: Record<string, string> = {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    };
    return sizes[size] || sizes.md;
  };

  const getTitleSize = (size: string) => {
    const sizes: Record<string, string> = {
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
      '2xl': '4rem'
    };
    return sizes[size] || sizes.xl;
  };

  const getFontWeight = (weight: string) => {
    const weights: Record<string, string> = {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900'
    };
    return weights[weight] || weights.normal;
  };

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setOpenItem(null);
    } else {
      setActiveCategory(categoryId);
      setOpenItem(null);
    }
  };

  const toggleItem = (itemId: string) => {
    setOpenItem(openItem === itemId ? null : itemId);
  };

  const getCategoryItems = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId);
  };

  const activeCateg = categories.find(c => c.id === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6f2e0' }}>
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  const bgStyle: React.CSSProperties = pageData?.background_type === 'image' && pageData.background_image
    ? {
        backgroundImage: `url(${pageData.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : { backgroundColor: pageData?.background_color || '#f6f2e0' };

  const renderTextLines = () => {
    if (!pageData?.text_lines?.lines || pageData.text_lines.lines.length === 0) return null;

    const content = pageData.text_lines.rotate ? (
      <p className="animate-fadeIn">
        {pageData.text_lines.lines[currentLineIndex]}
      </p>
    ) : (
      pageData.text_lines.lines.map((line, idx) => (
        <p key={idx}>{line}</p>
      ))
    );

    return (
      <div
        className="transition-opacity duration-500"
        style={{
          fontFamily: getFontFamily(pageData.tagline_font),
          fontWeight: getFontWeight(pageData.tagline_weight),
          fontSize: getTextSize(pageData.tagline_size),
          color: pageData.tagline_color,
          textAlign: pageData.tagline_align as any
        }}
      >
        {content}
      </div>
    );
  };

  const shouldShowTextLinesAfter = pageData?.title_align === 'left';
  const shouldShowTextLinesBelow = pageData?.title_align === 'center';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f2e0' }}>
      <div style={bgStyle} className="py-24 md:py-32">
        <div className="max-w-[860px] mx-auto px-4">
          <div className="space-y-6 mb-12" style={{ textAlign: pageData?.title_align as any || 'center' }}>
            {shouldShowTextLinesAfter ? (
              <div className="flex items-center gap-4">
                <h1
                  style={{
                    fontFamily: getFontFamily(pageData?.title_font || 'lobster'),
                    fontWeight: getFontWeight(pageData?.title_weight || 'bold'),
                    fontSize: getTitleSize(pageData?.title_size || 'xl'),
                    color: pageData?.title_color || '#000000'
                  }}
                >
                  {pageData?.title_text || 'Vanliga frågor'}
                </h1>
                {renderTextLines()}
              </div>
            ) : (
              <>
                <h1
                  style={{
                    fontFamily: getFontFamily(pageData?.title_font || 'lobster'),
                    fontWeight: getFontWeight(pageData?.title_weight || 'bold'),
                    fontSize: getTitleSize(pageData?.title_size || 'xl'),
                    color: pageData?.title_color || '#000000'
                  }}
                >
                  {pageData?.title_text || 'Vanliga frågor'}
                </h1>
                {shouldShowTextLinesBelow && renderTextLines()}
              </>
            )}

            {pageData?.ingress_text && (
              <p
                style={{
                  fontFamily: getFontFamily(pageData.ingress_font),
                  fontWeight: getFontWeight(pageData.ingress_weight),
                  fontSize: getTextSize(pageData.ingress_size),
                  color: pageData.ingress_color,
                  textAlign: pageData.ingress_align as any
                }}
                className="max-w-[640px] mx-auto"
              >
                {pageData.ingress_text}
              </p>
            )}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Inga kategorier ännu.</p>
            </div>
          )}

          {categories.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                      activeCategory === category.id ? 'ring-4 ring-gray-900' : ''
                    }`}
                    style={{
                      backgroundColor: category.styles.background_color,
                      fontFamily: getFontFamily(category.styles.font),
                      fontWeight: getFontWeight(category.styles.weight),
                      fontSize: getTextSize(category.styles.size),
                      color: category.styles.color,
                      textAlign: category.styles.align as any,
                      opacity: activeCategory && activeCategory !== category.id ? 0.6 : 1
                    }}
                  >
                    {category.title}
                  </button>
                ))}
              </div>

              {activeCateg && (
                <div className="space-y-2 mb-12">
                  {getCategoryItems(activeCateg.id).length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      Inga frågor i denna kategori ännu.
                    </p>
                  ) : (
                    getCategoryItems(activeCateg.id).map(item => {
                      const isOpen = openItem === item.id;

                      return (
                        <div
                          key={item.id}
                          className="rounded-lg overflow-hidden shadow-sm"
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:opacity-90"
                            style={{
                              backgroundColor: activeCateg.question_background_color,
                              fontFamily: getFontFamily(activeCateg.question_font),
                              fontWeight: getFontWeight(activeCateg.question_weight),
                              fontSize: getTextSize(activeCateg.question_size),
                              color: activeCateg.question_color
                            }}
                          >
                            <span dangerouslySetInnerHTML={{ __html: item.question }} />
                            <ChevronDown
                              className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <div
                            className="overflow-hidden transition-all duration-300"
                            style={{
                              maxHeight: isOpen ? '1000px' : '0'
                            }}
                          >
                            <div
                              className="px-6 py-4"
                              style={{
                                backgroundColor: activeCateg.answer_background_color,
                                fontFamily: getFontFamily(activeCateg.answer_font),
                                fontWeight: getFontWeight(activeCateg.answer_weight),
                                fontSize: getTextSize(activeCateg.answer_size),
                                color: activeCateg.answer_color
                              }}
                              dangerouslySetInnerHTML={{ __html: item.answer }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
