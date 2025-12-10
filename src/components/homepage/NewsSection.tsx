import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from './EmptyState';

interface NewsSettings {
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingColor?: string;
  headingBold?: boolean;
  headingAlignment?: 'left' | 'center';
  headingEmojiPrefix?: string;
  headingEmojiSuffix?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  backgroundColor?: string;
  displayMode?: 'standard' | 'hero' | 'three-cards';
  newsToShow?: number;
  layoutForm?: 'grid' | 'horizontal';
  featuredCardLarger?: boolean;
  featuredCardSize?: '1.5x' | '2x';
  ctaButtons?: Array<{
    text: string;
    link: string;
    color: string;
    size: string;
    font: string;
    placement: 'left' | 'center' | 'right';
  }>;
  sectionPaddingTop?: number;
  sectionPaddingBottom?: number;
}

interface NewsSectionProps {
  settings: NewsSettings;
}

interface NewsArticle {
  id: string;
  title: string;
  ingress?: string;
  main_image_url?: string;
  full_text?: string;
  link_url?: string;
  category_tag?: string;
  is_featured: boolean;
  created_at: string;
}

export function NewsSection({ settings }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [settings.newsToShow]);

  useEffect(() => {
    const subtitleTexts = settings.subtitleTexts || [];
    if (subtitleTexts.length <= 1) return;

    const rotationInterval = settings.subtitleRotationInterval || 10000;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSubtitleIndex((prev) => (prev + 1) % subtitleTexts.length);
        setFadeIn(true);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [settings.subtitleTexts, settings.subtitleRotationInterval]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_hidden', false)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(settings.newsToShow || 6);

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const subtitleTexts = settings.subtitleTexts || [];
  const headingFontClass = settings.headingFont === 'lobster' ? 'font-lobster' : '';
  const headingFontFamily =
    settings.headingFont === 'serif' ? 'serif' :
    settings.headingFont === 'sans' ? 'sans-serif' :
    undefined;

  const subtitleFontClass = settings.subtitleFont === 'lobster' ? 'font-lobster' : '';
  const subtitleFontFamily =
    settings.subtitleFont === 'serif' ? 'serif' :
    settings.subtitleFont === 'sans' ? 'sans-serif' :
    undefined;

  const displayMode = settings.displayMode || 'standard';

  const renderHeading = () => (
    <div
      className={`mb-8 ${
        settings.headingAlignment === 'center' || !settings.headingAlignment
          ? 'text-center'
          : 'text-left'
      }`}
    >
      {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
        <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
          {settings.headingEmojiPrefix && (
            <span className="text-3xl">{settings.headingEmojiPrefix}</span>
          )}
          <h2
            className={`text-3xl ${headingFontClass} ${settings.headingBold ? 'font-bold' : ''}`}
            style={{
              fontFamily: headingFontFamily,
              fontSize: `${settings.headingFontSize || 32}px`,
              color: settings.headingColor || '#374151'
            }}
          >
            {settings.heading || 'Nyheter'}
          </h2>
          {settings.headingEmojiSuffix && (
            <span className="text-3xl">{settings.headingEmojiSuffix}</span>
          )}
          {subtitleTexts.length > 0 && subtitleTexts[0] && (
            <>
              <span className="text-gray-400 text-2xl">|</span>
              <div className="min-h-[24px] flex items-center">
                <p
                  className={`transition-opacity duration-300 ${subtitleFontClass} ${settings.subtitleBold ? 'font-bold' : ''} ${settings.subtitleItalic ? 'italic' : ''}`}
                  style={{
                    opacity: fadeIn ? 1 : 0,
                    fontFamily: subtitleFontFamily,
                    fontSize: `${settings.subtitleFontSize || 16}px`,
                    color: settings.subtitleColor || '#6b7280'
                  }}
                >
                  {subtitleTexts[currentSubtitleIndex]}
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
            {settings.headingEmojiPrefix && (
              <span className="text-3xl">{settings.headingEmojiPrefix}</span>
            )}
            <h2
              className={`text-3xl ${headingFontClass} ${settings.headingBold ? 'font-bold' : ''}`}
              style={{
                fontFamily: headingFontFamily,
                fontSize: `${settings.headingFontSize || 32}px`,
                color: settings.headingColor || '#374151'
              }}
            >
              {settings.heading || 'Nyheter'}
            </h2>
            {settings.headingEmojiSuffix && (
              <span className="text-3xl">{settings.headingEmojiSuffix}</span>
            )}
          </div>
          {subtitleTexts.length > 0 && subtitleTexts[currentSubtitleIndex] && (
            <div className={`min-h-[24px] flex items-center mt-2 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
              <p
                className={`transition-opacity duration-300 ${subtitleFontClass} ${settings.subtitleBold ? 'font-bold' : ''} ${settings.subtitleItalic ? 'italic' : ''}`}
                style={{
                  opacity: fadeIn ? 1 : 0,
                  fontFamily: subtitleFontFamily,
                  fontSize: `${settings.subtitleFontSize || 16}px`,
                  color: settings.subtitleColor || '#6b7280'
                }}
              >
                {subtitleTexts[currentSubtitleIndex]}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderHeroMode = () => {
    const article = articles[0];
    if (!article) return <EmptyState text="Inga nyheter att visa" />;

    return (
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden group cursor-pointer">
        {article.main_image_url && (
          <img
            src={article.main_image_url}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
          {article.category_tag && (
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4 w-fit">
              {article.category_tag}
            </span>
          )}
          <h3 className="text-4xl font-bold mb-3">{article.title}</h3>
          {article.ingress && (
            <p className="text-lg text-white/90 mb-6 max-w-3xl">{article.ingress}</p>
          )}
          {article.link_url && (
            <a
              href={article.link_url}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors w-fit"
            >
              Läs mer
              <ArrowRight className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    );
  };

  const renderThreeCards = () => {
    const displayArticles = articles.slice(0, 3);
    if (displayArticles.length === 0) return <EmptyState text="Inga nyheter att visa" />;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
          >
            {article.main_image_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.main_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {article.category_tag && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800">
                    {article.category_tag}
                  </span>
                )}
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>
              {article.ingress && (
                <p className="text-gray-600 mb-4 line-clamp-3">{article.ingress}</p>
              )}
              {article.link_url && (
                <a
                  href={article.link_url}
                  className="inline-flex items-center gap-2 text-[#a1c798] hover:text-[#8fb386] font-medium transition-colors"
                >
                  Läs mer
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStandardMode = () => {
    const featuredArticle = articles.find(a => a.is_featured);
    const otherArticles = articles.filter(a => !a.is_featured);

    if (articles.length === 0) return <EmptyState text="Inga nyheter att visa" />;

    const layoutClass = settings.layoutForm === 'horizontal'
      ? 'flex overflow-x-auto gap-6 pb-4'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

    return (
      <div className="space-y-6">
        {featuredArticle && settings.featuredCardLarger !== false && (
          <div
            className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group ${
              settings.featuredCardSize === '2x' ? 'grid md:grid-cols-2 gap-6' : ''
            }`}
            style={settings.featuredCardSize === '1.5x' ? { minHeight: '400px' } : undefined}
          >
            {featuredArticle.main_image_url && (
              <div className={`relative overflow-hidden ${settings.featuredCardSize === '2x' ? 'h-full' : 'h-64'}`}>
                <img
                  src={featuredArticle.main_image_url}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {featuredArticle.category_tag && (
                  <span className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800">
                    {featuredArticle.category_tag}
                  </span>
                )}
              </div>
            )}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {featuredArticle.title}
                </h3>
                {featuredArticle.ingress && (
                  <p className="text-lg text-gray-600 mb-4">{featuredArticle.ingress}</p>
                )}
              </div>
              {featuredArticle.link_url && (
                <a
                  href={featuredArticle.link_url}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#a1c798] text-white rounded-lg font-medium hover:bg-[#8fb386] transition-colors w-fit"
                >
                  Läs mer
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}

        {otherArticles.length > 0 && (
          <div className={layoutClass}>
            {otherArticles.map((article) => (
              <div
                key={article.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group ${
                  settings.layoutForm === 'horizontal' ? 'flex-shrink-0 w-80' : ''
                }`}
              >
                {article.main_image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.main_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {article.category_tag && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800">
                        {article.category_tag}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.ingress && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{article.ingress}</p>
                  )}
                  {article.link_url && (
                    <a
                      href={article.link_url}
                      className="inline-flex items-center gap-2 text-[#a1c798] hover:text-[#8fb386] font-medium transition-colors"
                    >
                      Läs mer
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCtaButtons = () => {
    if (!settings.ctaButtons || settings.ctaButtons.length === 0) return null;

    return (
      <div className="mt-8 flex gap-4 justify-center">
        {settings.ctaButtons.map((button, index) => {
          const justifyClass =
            button.placement === 'left' ? 'justify-start' :
            button.placement === 'right' ? 'justify-end' :
            'justify-center';

          const sizeClass =
            button.size === 'small' ? 'px-4 py-2 text-sm' :
            button.size === 'large' ? 'px-8 py-4 text-lg' :
            'px-6 py-3 text-base';

          const fontClass =
            button.font === 'lobster' ? 'font-lobster' :
            button.font === 'serif' ? 'font-serif' :
            'font-sans';

          return (
            <div key={index} className={`flex ${justifyClass}`}>
              <a
                href={button.link}
                className={`${sizeClass} ${fontClass} rounded-lg font-medium hover:opacity-80 transition-opacity`}
                style={{ backgroundColor: button.color, color: '#ffffff' }}
              >
                {button.text}
              </a>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: settings.backgroundColor || '#ffffff',
        paddingTop: `${settings.sectionPaddingTop || 12}rem`,
        paddingBottom: `${settings.sectionPaddingBottom || 12}rem`
      }}
    >
      <div className="max-w-7xl mx-auto">
        {renderHeading()}

        {displayMode === 'hero' && renderHeroMode()}
        {displayMode === 'three-cards' && renderThreeCards()}
        {displayMode === 'standard' && renderStandardMode()}

        {renderCtaButtons()}
      </div>
    </section>
  );
}
