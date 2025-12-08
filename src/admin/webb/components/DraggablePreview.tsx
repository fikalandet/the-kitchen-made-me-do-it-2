import { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Move } from 'lucide-react';
import { SlideData } from './BildspelEditor';

interface DraggablePreviewProps {
  slide: SlideData;
  onUpdateSlide: (updates: Partial<SlideData>) => void;
}

export default function DraggablePreview({ slide, onUpdateSlide }: DraggablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isDraggingCta, setIsDraggingCta] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const textLocked = slide.textStyle?.positionLocked || false;
  const ctaLocked = slide.ctaStyle?.positionLocked || false;

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

  const getInitialPosition = (
    customPos?: { x: number; y: number },
    vertical?: string,
    horizontal?: string,
    isButton?: boolean
  ) => {
    if (customPos) return customPos;

    if (isButton) {
      const pos = slide.ctaStyle?.position || 'bottom-right';
      if (pos === 'top-left') return { x: 5, y: 5 };
      if (pos === 'top-center') return { x: 50, y: 5 };
      if (pos === 'top-right') return { x: 95, y: 5 };
      if (pos === 'center-left') return { x: 5, y: 50 };
      if (pos === 'center-center') return { x: 50, y: 50 };
      if (pos === 'center-right') return { x: 95, y: 50 };
      if (pos === 'bottom-left') return { x: 5, y: 90 };
      if (pos === 'bottom-center') return { x: 50, y: 90 };
      return { x: 95, y: 90 };
    }

    const y = vertical === 'top' ? 10 : vertical === 'center' ? 50 : 90;
    const x = horizontal === 'center' ? 50 : horizontal === 'right' ? 90 : 10;
    return { x, y };
  };

  const textPos = getInitialPosition(
    slide.textStyle?.customPosition,
    slide.textStyle?.verticalAlign,
    slide.textStyle?.horizontalAlign
  );

  const ctaPos = getInitialPosition(
    slide.ctaStyle?.customPosition,
    undefined,
    undefined,
    true
  );

  const handleMouseDown = (e: React.MouseEvent, type: 'text' | 'cta') => {
    if ((type === 'text' && textLocked) || (type === 'cta' && ctaLocked)) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const currentPos = type === 'text' ? textPos : ctaPos;

    const elementX = (currentPos.x / 100) * rect.width;
    const elementY = (currentPos.y / 100) * rect.height;

    setDragOffset({
      x: e.clientX - rect.left - elementX,
      y: e.clientY - rect.top - elementY
    });

    if (type === 'text') {
      setIsDraggingText(true);
    } else {
      setIsDraggingCta(true);
    }

    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingText && !isDraggingCta) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (isDraggingText) {
      onUpdateSlide({
        textStyle: {
          ...slide.textStyle,
          customPosition: { x: clampedX, y: clampedY }
        }
      });
    } else if (isDraggingCta) {
      onUpdateSlide({
        ctaStyle: {
          ...slide.ctaStyle,
          customPosition: { x: clampedX, y: clampedY }
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingText(false);
    setIsDraggingCta(false);
  };

  useEffect(() => {
    if (isDraggingText || isDraggingCta) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingText, isDraggingCta, dragOffset]);

  const toggleTextLock = () => {
    onUpdateSlide({
      textStyle: {
        ...slide.textStyle,
        positionLocked: !textLocked
      }
    });
  };

  const toggleCtaLock = () => {
    onUpdateSlide({
      ctaStyle: {
        ...slide.ctaStyle,
        positionLocked: !ctaLocked
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="text-center mb-2">
        <p className="text-sm text-gray-600">Dra elementen fritt, sedan lås fast dem med låsikonen</p>
      </div>

      <div
        ref={containerRef}
        className="relative bg-gray-200 rounded overflow-hidden aspect-video select-none"
      >
        {slide.mediaUrl ? (
          <img
            src={slide.mediaUrl}
            alt={slide.alt}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">Ingen bild vald</span>
          </div>
        )}

        {slide.text && (
          <>
            <div
              className={`absolute cursor-move group ${
                isDraggingText ? 'z-50' : 'z-10'
              } ${textLocked ? 'cursor-default' : ''}`}
              style={{
                left: `${textPos.x}%`,
                top: `${textPos.y}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '80%'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'text')}
            >
              <div
                className={`rounded relative ${
                  !textLocked ? 'ring-2 ring-[#56c5c5] ring-opacity-0 group-hover:ring-opacity-100' : ''
                }`}
                style={{
                  backgroundColor:
                    slide.textStyle?.backgroundColor && slide.textStyle.backgroundColor !== 'transparent'
                      ? hexToRgba(slide.textStyle.backgroundColor, slide.textStyle.backgroundOpacity ?? 100)
                      : 'transparent',
                  color: slide.textStyle?.textColor || '#000000',
                  fontWeight: slide.textStyle?.bold ? '700' : '400',
                  fontSize:
                    slide.textStyle?.fontSize === 'sm'
                      ? '0.75rem'
                      : slide.textStyle?.fontSize === 'lg'
                      ? '1.125rem'
                      : slide.textStyle?.fontSize === 'xl'
                      ? '1.5rem'
                      : '1rem',
                  fontFamily: getFontFamily(slide.textStyle?.fontFamily),
                  textAlign: (slide.textStyle?.textAlign as any) || 'left',
                  padding:
                    slide.textStyle?.backgroundColor && slide.textStyle.backgroundColor !== 'transparent'
                      ? '0.5rem 0.75rem'
                      : '0',
                  display: 'inline-block',
                  whiteSpace: slide.text.includes('\n') ? 'pre-line' : 'nowrap'
                }}
              >
                {slide.text}
                {!textLocked && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Move className="w-4 h-4 text-[#56c5c5]" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={toggleTextLock}
              className="absolute top-2 left-2 z-20 p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-sm"
              title={textLocked ? 'Lås upp text' : 'Lås fast text'}
            >
              {textLocked ? (
                <Lock className="w-4 h-4 text-gray-700" />
              ) : (
                <Unlock className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </>
        )}

        {slide.ctaLabel && (
          <>
            <div
              className={`absolute cursor-move group ${
                isDraggingCta ? 'z-50' : 'z-10'
              } ${ctaLocked ? 'cursor-default' : ''}`}
              style={{
                left: `${ctaPos.x}%`,
                top: `${ctaPos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'cta')}
            >
              <button
                className={`rounded-lg transition-colors relative ${
                  !ctaLocked ? 'ring-2 ring-[#a1c798] ring-opacity-0 group-hover:ring-opacity-100' : ''
                }`}
                style={{
                  backgroundColor: slide.ctaStyle?.backgroundColor
                    ? hexToRgba(slide.ctaStyle.backgroundColor, slide.ctaStyle.backgroundOpacity ?? 100)
                    : '#56c5c5',
                  color: slide.ctaStyle?.textColor || '#ffffff',
                  fontWeight: slide.ctaStyle?.bold ? '700' : '500',
                  fontSize:
                    slide.ctaStyle?.fontSize === 'sm'
                      ? '0.875rem'
                      : slide.ctaStyle?.fontSize === 'lg'
                      ? '1.125rem'
                      : slide.ctaStyle?.fontSize === 'xl'
                      ? '1.25rem'
                      : '1rem',
                  padding:
                    slide.ctaStyle?.size === 'sm'
                      ? '0.5rem 1rem'
                      : slide.ctaStyle?.size === 'lg'
                      ? '0.75rem 2rem'
                      : slide.ctaStyle?.size === 'xl'
                      ? '1rem 2.5rem'
                      : '0.625rem 1.5rem',
                  fontFamily: getFontFamily(slide.ctaStyle?.fontFamily),
                  pointerEvents: 'none'
                }}
              >
                {slide.ctaLabel}
                {!ctaLocked && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Move className="w-4 h-4 text-[#a1c798]" />
                  </div>
                )}
              </button>
            </div>

            <button
              onClick={toggleCtaLock}
              className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-sm"
              title={ctaLocked ? 'Lås upp knapp' : 'Lås fast knapp'}
            >
              {ctaLocked ? (
                <Lock className="w-4 h-4 text-gray-700" />
              ) : (
                <Unlock className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </>
        )}
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        {!textLocked && slide.text && (
          <p>• Text: Dra för att flytta, klicka på låsikonen för att låsa fast</p>
        )}
        {!ctaLocked && slide.ctaLabel && (
          <p>• Knapp: Dra för att flytta, klicka på låsikonen för att låsa fast</p>
        )}
        {textLocked && ctaLocked && slide.text && slide.ctaLabel && (
          <p className="text-green-700">✓ Text och knapp är låsta</p>
        )}
      </div>
    </div>
  );
}
