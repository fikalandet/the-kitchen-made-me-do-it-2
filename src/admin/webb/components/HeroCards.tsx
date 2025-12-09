import { useState, useEffect } from 'react';
import { Plus, X, ChevronUp, ChevronDown, Image, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { HeroSettings, HeroCardData } from './HeroEditor';
import CollapsibleCard from './CollapsibleCard';
import HeroCardText from './HeroCardText';
import HeroCardButton from './HeroCardButton';

interface HeroCardsProps {
  settings: HeroSettings;
  onSettingsChange: (settings: HeroSettings) => void;
  activeCardId: string | null;
  onCardSelect: (id: string) => void;
}

export default function HeroCards({ settings, onSettingsChange, activeCardId, onCardSelect }: HeroCardsProps) {
  const { user } = useAuth();
  const cards = settings.cards || [];
  const totalCards = settings.totalCards || 3;
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);

  useEffect(() => {
    const currentCardCount = cards.length;
    if (currentCardCount < totalCards) {
      const newCards = [...cards];
      for (let i = currentCardCount; i < totalCards; i++) {
        newCards.push(createNewCard());
      }
      onSettingsChange({ ...settings, cards: newCards });
    } else if (currentCardCount > totalCards) {
      const trimmedCards = cards.slice(0, totalCards);
      onSettingsChange({ ...settings, cards: trimmedCards });
      if (activeCardId && !trimmedCards.find(c => c.id === activeCardId)) {
        onCardSelect(trimmedCards[0]?.id || '');
      }
    }
  }, [totalCards]);

  const createNewCard = (): HeroCardData => {
    return {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      heading: '',
      text: '',
      imageUrl: '',
      imageAlt: '',
      cardBackgroundColor: '#ffffff',
      headingStyle: {
        fontFamily: 'default',
        fontSize: 'lg',
        bold: true,
        textColor: '#000000',
        backgroundColor: 'transparent',
        lineHeight: '1.5',
        textAlign: 'left'
      },
      textStyle: {
        fontFamily: 'default',
        fontSize: 'md',
        bold: false,
        textColor: '#000000',
        backgroundColor: 'transparent',
        lineHeight: '1.5',
        textAlign: 'left'
      },
      position: 'left',
      ctaLabel: '',
      ctaLinkType: 'internal',
      ctaUrl: '',
      ctaStyle: {
        fontFamily: 'default',
        fontSize: 'md',
        textColor: '#ffffff',
        backgroundColor: '#56c5c5',
        hoverBackgroundColor: '#45b4b4',
        borderRadius: '8px'
      }
    };
  };

  const updateCard = (id: string, updates: Partial<HeroCardData>) => {
    const updatedCards = cards.map(c => c.id === id ? { ...c, ...updates } : c);
    onSettingsChange({ ...settings, cards: updatedCards });
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    const newCards = [...cards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;
    [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];
    onSettingsChange({ ...settings, cards: newCards });
  };

  const handleFileUpload = async (cardId: string, file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingCardId(cardId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateCard(cardId, { imageUrl: data.publicUrl });
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingCardId(null);
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
      handwritten: 'cursive',
      default: 'system-ui, sans-serif'
    };
    return fonts[font || 'default'] || fonts.default;
  };

  const renderCardColumn = (card: HeroCardData, index: number) => {
    const updateCardById = (updates: Partial<HeroCardData>) => {
      const updatedCards = cards.map(c =>
        c.id === card.id ? { ...c, ...updates } : c
      );
      onSettingsChange({ ...settings, cards: updatedCards });
    };

    const headingStyle = card.headingStyle || {};
    const textStyle = card.textStyle || {};
    const ctaStyle = card.ctaStyle || {};

    const getTextPositionStyle = () => {
      const position = card.position || 'left';
      if (position === 'center') return { justifyContent: 'center', textAlign: 'center' as const };
      if (position === 'right') return { justifyContent: 'flex-end', textAlign: 'right' as const };
      return { justifyContent: 'flex-start', textAlign: 'left' as const };
    };

    return (
      <div key={card.id} className="space-y-4">
        <div
          className={`border rounded-lg p-4 transition-all ${
            activeCardId === card.id ? 'border-[#56c5c5] bg-[#56c5c5]/5' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">Hero-kort {index + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveCard(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveCard(index, 'down')}
                disabled={index === cards.length - 1}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            onClick={() => onCardSelect(card.id)}
            className={`relative aspect-video rounded overflow-hidden cursor-pointer transition-shadow mb-3 ${
              activeCardId === card.id ? 'ring-2 ring-[#56c5c5] shadow-md' : 'hover:shadow-sm'
            }`}
            style={{
              backgroundColor: card.cardBackgroundColor || '#ffffff',
              backgroundImage: card.imageUrl ? `url(${card.imageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!card.imageUrl && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 text-sm">Ingen bild vald</span>
              </div>
            )}

            <div
              className="absolute inset-0 p-4 flex flex-col"
              style={getTextPositionStyle()}
            >
              {card.heading && (
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: headingStyle.backgroundColor && headingStyle.backgroundColor !== 'transparent'
                      ? headingStyle.backgroundColor
                      : 'transparent',
                    color: headingStyle.textColor || '#000000',
                    fontWeight: headingStyle.bold ? '700' : '400',
                    fontSize: headingStyle.fontSize === 'sm' ? '0.875rem' :
                             headingStyle.fontSize === 'lg' ? '1.25rem' :
                             headingStyle.fontSize === 'xl' ? '1.5rem' : '1rem',
                    fontFamily: getFontFamily(headingStyle.fontFamily),
                    lineHeight: headingStyle.lineHeight || '1.5',
                    textAlign: headingStyle.textAlign || 'left',
                    padding: headingStyle.backgroundColor && headingStyle.backgroundColor !== 'transparent' ? '0.5rem 0.75rem' : '0',
                    display: 'inline-block',
                    width: headingStyle.textAlign === 'center' ? 'auto' : '100%',
                    whiteSpace: headingStyle.textAlign === 'center' ? 'pre-line' : 'normal'
                  }}
                >
                  {card.heading}
                </div>
              )}

              {card.text && (
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: textStyle.backgroundColor && textStyle.backgroundColor !== 'transparent'
                      ? textStyle.backgroundColor
                      : 'transparent',
                    color: textStyle.textColor || '#000000',
                    fontWeight: textStyle.bold ? '700' : '400',
                    fontSize: textStyle.fontSize === 'sm' ? '0.75rem' :
                             textStyle.fontSize === 'lg' ? '1rem' :
                             textStyle.fontSize === 'xl' ? '1.25rem' : '0.875rem',
                    fontFamily: getFontFamily(textStyle.fontFamily),
                    lineHeight: textStyle.lineHeight || '1.5',
                    textAlign: textStyle.textAlign || 'left',
                    padding: textStyle.backgroundColor && textStyle.backgroundColor !== 'transparent' ? '0.5rem 0.75rem' : '0',
                    display: 'inline-block',
                    width: textStyle.textAlign === 'center' ? 'auto' : '100%',
                    whiteSpace: textStyle.textAlign === 'center' ? 'pre-line' : 'normal'
                  }}
                >
                  {card.text}
                </div>
              )}

              {card.ctaLabel && (
                <button
                  className="rounded transition-colors mt-auto"
                  style={{
                    backgroundColor: ctaStyle.backgroundColor || '#56c5c5',
                    color: ctaStyle.textColor || '#ffffff',
                    fontSize: ctaStyle.fontSize === 'sm' ? '0.875rem' :
                             ctaStyle.fontSize === 'lg' ? '1.125rem' :
                             ctaStyle.fontSize === 'xl' ? '1.25rem' : '1rem',
                    padding: '0.625rem 1.5rem',
                    fontFamily: getFontFamily(ctaStyle.fontFamily),
                    borderRadius: ctaStyle.borderRadius || '8px',
                    alignSelf: card.position === 'center' ? 'center' : card.position === 'right' ? 'flex-end' : 'flex-start',
                    display: 'inline-block'
                  }}
                >
                  {card.ctaLabel}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rubrik</label>
            <input
              type="text"
              value={card.heading}
              onChange={(e) => updateCard(card.id, { heading: e.target.value })}
              placeholder="T.ex. Vår specialmeny"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5]"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Brödtext</label>
            <textarea
              value={card.text}
              onChange={(e) => updateCard(card.id, { text: e.target.value })}
              placeholder="Beskrivning av hero-kortet"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5]"
            />
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`heading-bold-${card.id}`}
                checked={headingStyle.bold || false}
                onChange={(e) => updateCardById({ headingStyle: { ...headingStyle, bold: e.target.checked } })}
                className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
              />
              <label htmlFor={`heading-bold-${card.id}`} className="text-sm font-medium text-gray-700">
                Fet stil - rubrik
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`text-bold-${card.id}`}
                checked={textStyle.bold || false}
                onChange={(e) => updateCardById({ textStyle: { ...textStyle, bold: e.target.checked } })}
                className="w-4 h-4 text-[#56c5c5] border-gray-300 rounded focus:ring-[#56c5c5]"
              />
              <label htmlFor={`text-bold-${card.id}`} className="text-sm font-medium text-gray-700">
                Fet stil - brödtext
              </label>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justering av textposition
            </label>
            <select
              value={card.position || 'left'}
              onChange={(e) => updateCardById({ position: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5]"
            >
              <option value="left">Vänster</option>
              <option value="center">Centrerad</option>
              <option value="right">Höger</option>
            </select>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bakgrundsfärg för hero-kort</label>
            <input
              type="color"
              value={card.cardBackgroundColor || '#ffffff'}
              onChange={(e) => updateCard(card.id, { cardBackgroundColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bild</label>
            <div className="flex gap-2 mb-2">
              <input
                type="file"
                id={`file-${card.id}`}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(card.id, file);
                }}
                className="hidden"
              />
              <label
                htmlFor={`file-${card.id}`}
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  uploadingCardId === card.id ? 'opacity-50' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                {uploadingCardId === card.id ? 'Laddar upp...' : 'Ladda upp'}
              </label>
              {card.imageUrl && (
                <>
                  <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600 truncate">
                    {card.imageUrl}
                  </div>
                  <button
                    onClick={() => updateCard(card.id, { imageUrl: '' })}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt-text / beskrivning
            </label>
            <input
              type="text"
              value={card.imageAlt}
              onChange={(e) => updateCard(card.id, { imageAlt: e.target.value })}
              placeholder="Bra för SEO och tillgänglighet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5]"
            />
          </div>
        </div>

        <CollapsibleCard
          title={`Text-inställningar - Kort ${index + 1}`}
          defaultExpanded={false}
        >
          <HeroCardText
            card={card}
            onCardUpdate={updateCardById}
          />
        </CollapsibleCard>

        <CollapsibleCard
          title={`Knapp-inställningar - Kort ${index + 1}`}
          defaultExpanded={false}
        >
          <HeroCardButton
            card={card}
            onCardUpdate={updateCardById}
          />
        </CollapsibleCard>
      </div>
    );
  };

  if (cards.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-12 text-center text-gray-500">
        Ange antal hero-kort i inställningarna ovan.
      </div>
    );
  }

  const cardsPerRow = settings.cardsPerRow || 3;

  return (
    <div className="space-y-6">
      <div className={`grid gap-6 ${
        cardsPerRow === 1 ? 'grid-cols-1' :
        cardsPerRow === 2 ? 'grid-cols-1 lg:grid-cols-2' :
        cardsPerRow === 3 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' :
        'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
      }`}>
        {cards.map((card, idx) => renderCardColumn(card, idx))}
      </div>
    </div>
  );
}
