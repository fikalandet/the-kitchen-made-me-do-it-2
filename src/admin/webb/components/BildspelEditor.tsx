import { useState, useEffect } from 'react';
import BildspelSettings from './BildspelSettings';
import BildspelSlides from './BildspelSlides';
import BildspelText from './BildspelText';
import BildspelButtons from './BildspelButtons';
import DraggablePreview from './DraggablePreview';
import CollapsibleCard from './CollapsibleCard';

export interface SlideData {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  alt: string;
  crop?: any;
  text?: string;
  textStyle?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    textColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    verticalAlign?: 'top' | 'center' | 'bottom';
    horizontalAlign?: 'left' | 'center' | 'right';
    textAlign?: 'left' | 'center' | 'right';
    customPosition?: { x: number; y: number };
    positionLocked?: boolean;
  };
  ctaLabel?: string;
  ctaLinkType?: 'internal' | 'external';
  ctaUrl?: string;
  ctaStyle?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    textColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    size?: string;
    position?: string;
    customPosition?: { x: number; y: number };
    positionLocked?: boolean;
  };
}

export interface BildspelSettings {
  autoplay?: boolean;
  autoplaySpeedMs?: number;
  navigationType?: 'arrows' | 'dots' | 'arrows_and_dots' | 'none';
  slidesPerView?: number;
  height?: number;
  slides?: SlideData[];
}

interface BildspelEditorProps {
  settings: BildspelSettings;
  onSettingsChange: (settings: BildspelSettings) => void;
}

export default function BildspelEditor({ settings, onSettingsChange }: BildspelEditorProps) {
  const [activeSlideId, setActiveSlideId] = useState<string | null>(
    settings.slides?.[0]?.id || null
  );
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    settings: true,
    slides: true,
    preview: false,
    text: false,
    buttons: false
  });

  const slides = settings.slides || [];
  const activeSlide = slides.find(s => s.id === activeSlideId);
  const activeSlideNumber = slides.findIndex(s => s.id === activeSlideId) + 1;

  useEffect(() => {
    setExpandedSections(prev => ({
      ...prev,
      preview: false,
      text: false,
      buttons: false
    }));
  }, [activeSlideId]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateGlobalSetting = (key: keyof BildspelSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateSlide = (id: string, updates: Partial<SlideData>) => {
    const updatedSlides = slides.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    updateGlobalSetting('slides', updatedSlides);
  };

  return (
    <div className="space-y-6">
      <CollapsibleCard
        title="Bildspelsinställningar"
        defaultExpanded={expandedSections.settings}
      >
        <BildspelSettings
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      </CollapsibleCard>

      <CollapsibleCard
        title="Slides"
        badge={slides.length}
        defaultExpanded={expandedSections.slides}
      >
        <BildspelSlides
          settings={settings}
          onSettingsChange={onSettingsChange}
          activeSlideId={activeSlideId}
          onSlideSelect={setActiveSlideId}
        />
      </CollapsibleCard>
    </div>
  );
}
