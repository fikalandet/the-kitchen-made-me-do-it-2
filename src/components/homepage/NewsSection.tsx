import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from './EmptyState';

interface NewsSettings {
  backgroundColor?: string;
  backgroundOpacity?: number;
  sectionPaddingTop?: number;
  sectionPaddingBottom?: number;
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingColor?: string;
  headingBold?: boolean;
  headingItalic?: boolean;
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
  displayMode?: 'big-image-text' | 'card-flow';
  imageBlockPlacement?: 'left' | 'right';
  imageLayout?: 'layered' | 'grid';
  imageBorderColor?: string;
  imageBorderWidth?: number;
  textSectionBackgroundColor?: string;
  textSectionBackgroundOpacity?: number;
  textSectionPadding?: number;
  textSectionHeading?: string;
  textSectionHeadingFont?: string;
  textSectionHeadingSize?: number;
  textSectionHeadingBold?: boolean;
  textSectionHeadingAlign?: 'left' | 'center' | 'right';
  textSectionIngress?: string;
  textSectionIngressFont?: string;
  textSectionIngressSize?: number;
  textSectionIngressBold?: boolean;
  textSectionIngressAlign?: 'left' | 'center' | 'right';
  textSectionBody?: string;
  textSectionBodyFont?: string;
  textSectionBodySize?: number;
  textSectionBodyBold?: boolean;
  textSectionBodyAlign?: 'left' | 'center' | 'right';
  textSectionCtaText?: string;
  textSectionCtaLink?: string;
  textSectionCtaLinkType?: 'internal' | 'external';
  textSectionCtaColor?: string;
  cardType?: 'product' | 'editorial';
  cardLayout?: 'horizontal' | 'grid';
  cardSize?: 'small' | 'normal' | 'large';
  cardsVisible?: number;
  [key: string]: any;
}

interface NewsSectionProps {
  settings: NewsSettings;
}

interface ImageItem {
  id: string;
  image_url: string;
  display_order: number;
  z_index: number;
  position_preset: string;
  offset_x: number;
  offset_y: number;
  rotation: number;
  scale: number;
  shape: string;
}

interface EditorialCard {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
  cta_link_type?: string;
  background_color: string;
  opacity: number;
  border_radius: number;
  padding: number;
  is_hero: boolean;
  display_order: number;
}

export function NewsSection({ settings }: NewsSectionProps) {
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [editorialCards, setEditorialCards] = useState<EditorialCard[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    fetchData();
  }, [settings.displayMode, settings.cardType]);

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

  const fetchData = async () => {
    try {
      if (settings.displayMode === 'big-image-text' || !settings.displayMode) {
        const { data } = await supabase
          .from('news_image_items')
          .select('*')
          .order('display_order', { ascending: true });

        if (data) setImageItems(data);
      }

      if (settings.displayMode === 'card-flow') {
        if (settings.cardType === 'editorial') {
          const { data } = await supabase
            .from('news_editorial_cards')
            .select('*')
            .eq('is_hidden', false)
            .order('is_hero', { ascending: false })
            .order('display_order', { ascending: true })
            .limit(settings.cardsVisible || 6);

          if (data) setEditorialCards(data);
        } else {
          const { data } = await supabase
            .from('products')
            .select('*')
            .eq('available', true)
            .order('created_at', { ascending: false })
            .limit(settings.cardsVisible || 6);

          if (data) setProducts(data);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const getPositionStyle = (preset: string, offsetX: number, offsetY: number) => {
    const basePositions: Record<string, any> = {
      'top-left': { top: '10%', left: '10%' },
      'top-right': { top: '10%', right: '10%' },
      'bottom-left': { bottom: '10%', left: '10%' },
      'bottom-right': { bottom: '10%', right: '10%' },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    };

    const base = basePositions[preset] || basePositions['center'];

    if (preset === 'center') {
      return {
        ...base,
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`
      };
    }

    return {
      ...base,
      transform: `translate(${offsetX}px, ${offsetY}px)`
    };
  };

  const getShapeClass = (shape: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-2xl';
      default:
        return 'rounded-lg';
    }
  };

  const renderHeading = () => {
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

    return (
      <div
        className={`mb-8 ${
          settings.headingAlignment === 'center' || !settings.headingAlignment
            ? 'text-center'
            : 'text-left'
        }`}
      >
        {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
          <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
            {settings.headingEmojiPrefix && <span className="text-3xl">{settings.headingEmojiPrefix}</span>}
            <h2
              className={`text-3xl ${headingFontClass} ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
              style={{
                fontFamily: headingFontFamily,
                fontSize: `${settings.headingFontSize || 32}px`,
                color: settings.headingColor || '#374151'
              }}
            >
              {settings.heading || 'Nyheter'}
            </h2>
            {settings.headingEmojiSuffix && <span className="text-3xl">{settings.headingEmojiSuffix}</span>}
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
              {settings.headingEmojiPrefix && <span className="text-3xl">{settings.headingEmojiPrefix}</span>}
              <h2
                className={`text-3xl ${headingFontClass} ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: headingFontFamily,
                  fontSize: `${settings.headingFontSize || 32}px`,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Nyheter'}
              </h2>
              {settings.headingEmojiSuffix && <span className="text-3xl">{settings.headingEmojiSuffix}</span>}
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
  };

  const renderBigImageText = () => {
    const isImageLeft = settings.imageBlockPlacement === 'left' || !settings.imageBlockPlacement;

    return (
      <div className={`grid md:grid-cols-2 gap-12 items-center ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>
        <div className={`relative h-[500px] ${isImageLeft ? 'order-1' : 'order-2'}`}>
          {settings.imageLayout === 'grid' && imageItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              {imageItems.slice(0, 4).map((image) => (
                <div
                  key={image.id}
                  className={`relative overflow-hidden ${getShapeClass(image.shape)}`}
                  style={{
                    transform: `rotate(${image.rotation}deg) scale(${image.scale})`,
                    border: `${settings.imageBorderWidth || 0}px solid ${settings.imageBorderColor || '#ffffff'}`
                  }}
                >
                  <img
                    src={image.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative w-full h-full">
              {imageItems.map((image) => (
                <div
                  key={image.id}
                  className={`absolute overflow-hidden ${getShapeClass(image.shape)}`}
                  style={{
                    ...getPositionStyle(image.position_preset, image.offset_x, image.offset_y),
                    width: '300px',
                    height: '300px',
                    zIndex: image.z_index,
                    transform: `${getPositionStyle(image.position_preset, image.offset_x, image.offset_y).transform} rotate(${image.rotation}deg) scale(${image.scale})`,
                    border: `${settings.imageBorderWidth || 0}px solid ${settings.imageBorderColor || '#ffffff'}`
                  }}
                >
                  <img
                    src={image.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          {imageItems.length === 0 && (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              Inga bilder uppladdade
            </div>
          )}
        </div>

        <div className={isImageLeft ? 'order-2' : 'order-1'}>
          <div
            className="rounded-lg"
            style={{
              backgroundColor: (() => {
                const hex = settings.textSectionBackgroundColor || '#f9fafb';
                const opacity = (settings.textSectionBackgroundOpacity || 100) / 100;
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${opacity})`;
              })(),
              padding: `${settings.textSectionPadding || 24}px`
            }}
          >
            {settings.textSectionHeading && (
              <h3
                className={`mb-4 ${settings.textSectionHeadingBold ? 'font-bold' : 'font-semibold'} ${
                  settings.textSectionHeadingFont === 'lobster' ? 'font-lobster' : ''
                }`}
                style={{
                  fontSize: `${settings.textSectionHeadingSize || 30}px`,
                  textAlign: settings.textSectionHeadingAlign || 'left',
                  fontFamily: settings.textSectionHeadingFont === 'poppins' ? 'Poppins' :
                              settings.textSectionHeadingFont === 'lobster' ? 'Lobster' :
                              settings.textSectionHeadingFont === 'serif' ? 'serif' :
                              'sans-serif'
                }}
              >
                {settings.textSectionHeading}
              </h3>
            )}
            {settings.textSectionIngress && (
              <p
                className={`mb-4 ${settings.textSectionIngressBold ? 'font-bold' : ''} ${
                  settings.textSectionIngressFont === 'lobster' ? 'font-lobster' : ''
                }`}
                style={{
                  fontSize: `${settings.textSectionIngressSize || 18}px`,
                  textAlign: settings.textSectionIngressAlign || 'left',
                  fontFamily: settings.textSectionIngressFont === 'poppins' ? 'Poppins' :
                              settings.textSectionIngressFont === 'lobster' ? 'Lobster' :
                              settings.textSectionIngressFont === 'serif' ? 'serif' :
                              'sans-serif'
                }}
              >
                {settings.textSectionIngress}
              </p>
            )}
            {settings.textSectionBody && (
              <p
                className={`mb-6 ${settings.textSectionBodyBold ? 'font-bold' : ''} ${
                  settings.textSectionBodyFont === 'lobster' ? 'font-lobster' : ''
                }`}
                style={{
                  fontSize: `${settings.textSectionBodySize || 16}px`,
                  textAlign: settings.textSectionBodyAlign || 'left',
                  fontFamily: settings.textSectionBodyFont === 'poppins' ? 'Poppins' :
                              settings.textSectionBodyFont === 'lobster' ? 'Lobster' :
                              settings.textSectionBodyFont === 'serif' ? 'serif' :
                              'sans-serif'
                }}
              >
                {settings.textSectionBody}
              </p>
            )}
            {settings.textSectionCtaText && settings.textSectionCtaLink && (
              settings.textSectionCtaLinkType === 'internal' ? (
                <Link
                  to={settings.textSectionCtaLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: settings.textSectionCtaColor || '#a1c798'
                  }}
                >
                  {settings.textSectionCtaText}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <a
                  href={settings.textSectionCtaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: settings.textSectionCtaColor || '#a1c798'
                  }}
                >
                  {settings.textSectionCtaText}
                  <ArrowRight className="w-5 h-5" />
                </a>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCardFlow = () => {
    if (settings.cardType === 'editorial') {
      const cardSizeClass =
        settings.cardSize === 'small' ? 'w-64' :
        settings.cardSize === 'large' ? 'w-96' :
        'w-80';

      const layoutClass = settings.cardLayout === 'horizontal'
        ? 'flex overflow-x-auto gap-6 pb-4'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

      return (
        <div className={layoutClass}>
          {editorialCards.map((card) => (
            <div
              key={card.id}
              className={`${settings.cardLayout === 'horizontal' ? `flex-shrink-0 ${cardSizeClass}` : ''} bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
                card.is_hero ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              style={{
                backgroundColor: card.background_color,
                opacity: card.opacity / 100,
                borderRadius: `${card.border_radius}px`,
                padding: `${card.padding}px`
              }}
            >
              {card.image_url && (
                <div className={`relative overflow-hidden ${card.is_hero ? 'h-96' : 'h-48'}`}>
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {card.is_hero && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-white rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <h3 className={`font-bold text-gray-900 mb-2 ${card.is_hero ? 'text-3xl' : 'text-xl'}`}>
                  {card.title}
                </h3>
                {card.subtitle && (
                  <p className="text-gray-600 mb-4">{card.subtitle}</p>
                )}
                {card.cta_text && card.cta_link && (
                  card.cta_link_type === 'internal' ? (
                    <Link
                      to={card.cta_link}
                      className="inline-flex items-center gap-2 text-[#a1c798] hover:text-[#8fb386] font-medium transition-colors"
                    >
                      {card.cta_text}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <a
                      href={card.cta_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#a1c798] hover:text-[#8fb386] font-medium transition-colors"
                    >
                      {card.cta_text}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
          {editorialCards.length === 0 && (
            <EmptyState text="Inga kort att visa" />
          )}
        </div>
      );
    }

    const cardSizeClass =
      settings.cardSize === 'small' ? 'w-64' :
      settings.cardSize === 'large' ? 'w-96' :
      'w-80';

    const layoutClass = settings.cardLayout === 'horizontal'
      ? 'flex overflow-x-auto gap-6 pb-4'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

    return (
      <div className={layoutClass}>
        {products.map((product) => (
          <div
            key={product.id}
            className={`${settings.cardLayout === 'horizontal' ? `flex-shrink-0 ${cardSizeClass}` : ''} bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow`}
          >
            {product.image_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {product.name}
              </h3>
              {product.price && (
                <p className="text-lg font-semibold text-[#a1c798] mb-4">
                  {product.price} kr
                </p>
              )}
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <EmptyState text="Inga produkter att visa" />
        )}
      </div>
    );
  };

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: settings.backgroundColor || '#ffffff',
        opacity: (settings.backgroundOpacity || 100) / 100,
        paddingTop: `${settings.sectionPaddingTop || 12}rem`,
        paddingBottom: `${settings.sectionPaddingBottom || 12}rem`
      }}
    >
      <div className="max-w-7xl mx-auto">
        {renderHeading()}

        {(settings.displayMode === 'big-image-text' || !settings.displayMode) && renderBigImageText()}
        {settings.displayMode === 'card-flow' && renderCardFlow()}
      </div>
    </section>
  );
}
