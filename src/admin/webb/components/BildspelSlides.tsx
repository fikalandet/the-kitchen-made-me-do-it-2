import { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown, Image, Video, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { BildspelSettings, SlideData } from './BildspelEditor';
import CollapsibleCard from './CollapsibleCard';
import DraggablePreview from './DraggablePreview';
import BildspelText from './BildspelText';
import BildspelButtons from './BildspelButtons';

interface BildspelSlidesProps {
  settings: BildspelSettings;
  onSettingsChange: (settings: BildspelSettings) => void;
  activeSlideId: string | null;
  onSlideSelect: (id: string) => void;
}

export default function BildspelSlides({ settings, onSettingsChange, activeSlideId, onSlideSelect }: BildspelSlidesProps) {
  const { user } = useAuth();
  const slides = settings.slides || [];
  const slidesPerView = settings.slidesPerView || 1;
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(slides.length / slidesPerView);
  const currentSlides = slides.slice(
    currentPage * slidesPerView,
    (currentPage + 1) * slidesPerView
  );

  const addSlide = () => {
    const newSlide: SlideData = {
      id: `slide-${Date.now()}`,
      mediaType: 'image',
      mediaUrl: '',
      alt: '',
      text: '',
      textStyle: {
        fontFamily: 'default',
        fontSize: 'md',
        bold: false,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        verticalAlign: 'bottom',
        horizontalAlign: 'left',
        textAlign: 'left'
      },
      ctaLabel: '',
      ctaLinkType: 'internal',
      ctaUrl: '',
      ctaStyle: {
        fontFamily: 'default',
        fontSize: 'md',
        textColor: '#ffffff',
        backgroundColor: '#56c5c5',
        size: 'md',
        position: 'bottom-right'
      }
    };
    const updatedSlides = [...slides, newSlide];
    onSettingsChange({ ...settings, slides: updatedSlides });
    onSlideSelect(newSlide.id);
  };

  const removeSlide = (id: string) => {
    const updatedSlides = slides.filter(s => s.id !== id);
    onSettingsChange({ ...settings, slides: updatedSlides });
    if (activeSlideId === id && updatedSlides.length > 0) {
      onSlideSelect(updatedSlides[0].id);
    }
  };

  const updateSlide = (id: string, key: keyof SlideData, value: any) => {
    const updatedSlides = slides.map(s => s.id === id ? { ...s, [key]: value } : s);
    onSettingsChange({ ...settings, slides: updatedSlides });
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    onSettingsChange({ ...settings, slides: newSlides });
  };

  const handleFileUpload = async (slideId: string, file: File) => {
    if (!user) {
      alert('Du måste vara inloggad för att ladda upp filer');
      return;
    }

    setUploadingSlideId(slideId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bildspel-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/bildspel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateSlide(slideId, 'mediaUrl', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploadingSlideId(null);
    }
  };

  const getPositionClasses = (position?: string) => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right': return 'top-4 right-4';
      case 'center-left': return 'top-1/2 left-4 -translate-y-1/2';
      case 'center-center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'center-right': return 'top-1/2 right-4 -translate-y-1/2';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'bottom-4 right-4';
    }
  };

  const getTextPosition = (v?: string, h?: string) => {
    const vertical = v === 'top' ? 'top-4' : v === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-4';
    const horizontal = h === 'center' ? 'left-1/2 -translate-x-1/2' : h === 'right' ? 'right-4' : 'left-4';
    return `${vertical} ${horizontal}`;
  };

  const hexToRgba = (hex?: string, opacity: number = 100) => {
    if (!hex || hex === 'transparent') return 'transparent';

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
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

  const renderSlideColumn = (slide: SlideData, index: number) => {
    const updateSlideById = (updates: Partial<SlideData>) => {
      const updatedSlides = slides.map(s =>
        s.id === slide.id ? { ...s, ...updates } : s
      );
      onSettingsChange({ ...settings, slides: updatedSlides });
    };

    return (
      <div key={slide.id} className="space-y-4">
        <div
          className={`border rounded-lg p-4 transition-all ${
            activeSlideId === slide.id ? 'border-[#56c5c5] bg-[#56c5c5]/5' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {slide.mediaType === 'image' ? (
                <Image className="w-5 h-5 text-gray-500" />
              ) : (
                <Video className="w-5 h-5 text-gray-500" />
              )}
              <span className="font-medium text-gray-900">Slide {index + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveSlide(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveSlide(index, 'down')}
                disabled={index === slides.length - 1}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeSlide(slide.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            onClick={() => onSlideSelect(slide.id)}
            className={`relative aspect-video bg-gray-200 rounded overflow-hidden cursor-pointer transition-shadow mb-3 ${
              activeSlideId === slide.id ? 'ring-2 ring-[#56c5c5] shadow-md' : 'hover:shadow-sm'
            }`}
          >
            {slide.mediaUrl ? (
              slide.mediaType === 'image' ? (
                <img src={slide.mediaUrl} alt={slide.alt} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <Video className="w-8 h-8 text-gray-600" />
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 text-sm">Ingen bild vald</span>
              </div>
            )}

            {slide.text && (
              <div
                className={`absolute ${getTextPosition(slide.textStyle?.verticalAlign, slide.textStyle?.horizontalAlign)}`}
                style={{ maxWidth: '80%' }}
              >
                <div
                  className="rounded"
                  style={{
                    backgroundColor: slide.textStyle?.backgroundColor && slide.textStyle.backgroundColor !== 'transparent'
                      ? hexToRgba(slide.textStyle.backgroundColor, slide.textStyle.backgroundOpacity ?? 100)
                      : 'transparent',
                    color: slide.textStyle?.textColor || '#000000',
                    fontWeight: slide.textStyle?.bold ? '700' : '400',
                    fontSize: slide.textStyle?.fontSize === 'sm' ? '0.75rem' :
                             slide.textStyle?.fontSize === 'lg' ? '1.125rem' :
                             slide.textStyle?.fontSize === 'xl' ? '1.5rem' : '1rem',
                    fontFamily: getFontFamily(slide.textStyle?.fontFamily),
                    textAlign: slide.textStyle?.textAlign as any || 'left',
                    padding: slide.textStyle?.backgroundColor && slide.textStyle.backgroundColor !== 'transparent' ? '0.5rem 0.75rem' : '0',
                    display: 'inline-block',
                    whiteSpace: slide.text.includes('\n') ? 'pre-line' : 'nowrap'
                  }}
                >
                  {slide.text}
                </div>
              </div>
            )}

            {slide.ctaLabel && (
              <div className={`absolute ${getPositionClasses(slide.ctaStyle?.position)}`}>
                <button
                  className="rounded-lg transition-colors"
                  style={{
                    backgroundColor: slide.ctaStyle?.backgroundColor
                      ? hexToRgba(slide.ctaStyle.backgroundColor, slide.ctaStyle.backgroundOpacity ?? 100)
                      : '#56c5c5',
                    color: slide.ctaStyle?.textColor || '#ffffff',
                    fontWeight: slide.ctaStyle?.bold ? '700' : '500',
                    fontSize: slide.ctaStyle?.fontSize === 'sm' ? '0.875rem' :
                             slide.ctaStyle?.fontSize === 'lg' ? '1.125rem' :
                             slide.ctaStyle?.fontSize === 'xl' ? '1.25rem' : '1rem',
                    padding: slide.ctaStyle?.size === 'sm' ? '0.5rem 1rem' :
                            slide.ctaStyle?.size === 'lg' ? '0.75rem 2rem' :
                            slide.ctaStyle?.size === 'xl' ? '1rem 2.5rem' : '0.625rem 1.5rem',
                    fontFamily: getFontFamily(slide.ctaStyle?.fontFamily)
                  }}
                >
                  {slide.ctaLabel}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mediatyp</label>
              <select
                value={slide.mediaType}
                onChange={(e) => updateSlide(slide.id, 'mediaType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5]"
              >
                <option value="image">Bild</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
            <div className="flex gap-2">
              <input
                type="file"
                id={`file-${slide.id}`}
                accept={slide.mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(slide.id, file);
                }}
                className="hidden"
              />
              <label
                htmlFor={`file-${slide.id}`}
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  uploadingSlideId === slide.id ? 'opacity-50' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                {uploadingSlideId === slide.id ? 'Laddar upp...' : 'Ladda upp'}
              </label>
              {slide.mediaUrl && (
                <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600 truncate">
                  {slide.mediaUrl}
                </div>
              )}
            </div>
            {slide.mediaUrl && slide.mediaType === 'image' && (
              <div className="mt-2">
                <img src={slide.mediaUrl} alt={slide.alt} className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt-text / beskrivning
            </label>
            <input
              type="text"
              value={slide.alt}
              onChange={(e) => updateSlide(slide.id, 'alt', e.target.value)}
              placeholder="Bra för SEO och tillgänglighet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#56c5c5]"
            />
          </div>
        </div>

        <CollapsibleCard
          title={`Positionering - Slide ${index + 1}`}
          defaultExpanded={false}
        >
          <DraggablePreview
            slide={slide}
            onUpdateSlide={updateSlideById}
          />
        </CollapsibleCard>

        <CollapsibleCard
          title={`Text - Slide ${index + 1}`}
          defaultExpanded={false}
        >
          <BildspelText
            slide={slide}
            slideNumber={index + 1}
            onSlideUpdate={updateSlideById}
          />
        </CollapsibleCard>

        <CollapsibleCard
          title={`Knappar - Slide ${index + 1}`}
          defaultExpanded={false}
        >
          <BildspelButtons
            slide={slide}
            slideNumber={index + 1}
            onSlideUpdate={updateSlideById}
          />
        </CollapsibleCard>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={addSlide}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-[#56c5c5] active:bg-[#56c5c5] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Lägg till slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-12 text-center text-gray-500">
          Lägg till slides för att komma igång.
        </div>
      ) : (
        <>
          <div className={`grid gap-6 ${
            slidesPerView === 1 ? 'grid-cols-1' :
            slidesPerView === 2 ? 'grid-cols-1 lg:grid-cols-2' :
            slidesPerView === 3 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' :
            'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
          }`}>
            {currentSlides.map((slide, idx) => {
              const globalIndex = currentPage * slidesPerView + idx;
              return renderSlideColumn(slide, globalIndex);
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Föregående
              </button>
              <span className="text-sm text-gray-600">
                Sida {currentPage + 1} av {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Nästa
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
