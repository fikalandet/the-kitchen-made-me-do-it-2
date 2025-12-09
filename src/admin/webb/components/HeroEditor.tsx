import { useState, useEffect } from 'react';
import HeroSettings from './HeroSettings';
import HeroCards from './HeroCards';
import CollapsibleCard from './CollapsibleCard';

export interface HeroCardData {
  id: string;
  heading: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
  textStyle?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    textColor?: string;
    backgroundColor?: string;
    lineHeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    position?: 'left' | 'center' | 'right';
  };
  ctaLabel?: string;
  ctaLinkType?: 'internal' | 'external';
  ctaUrl?: string;
  ctaStyle?: {
    fontFamily?: string;
    fontSize?: string;
    textColor?: string;
    backgroundColor?: string;
    hoverBackgroundColor?: string;
    borderRadius?: string;
  };
}

export interface HeroSettings {
  totalCards?: number;
  cardsPerRow?: number;
  sectionHeading?: string;
  sectionSubheading?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  paddingTop?: string;
  paddingBottom?: string;
  cards?: HeroCardData[];
}

interface HeroEditorProps {
  settings: HeroSettings;
  onSettingsChange: (settings: HeroSettings) => void;
}

export default function HeroEditor({ settings, onSettingsChange }: HeroEditorProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(
    settings.cards?.[0]?.id || null
  );

  const cards = settings.cards || [];

  useEffect(() => {
    if (cards.length > 0 && !activeCardId) {
      setActiveCardId(cards[0].id);
    }
  }, [cards, activeCardId]);

  const updateGlobalSetting = (key: keyof HeroSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <CollapsibleCard
        title="Hero-sektionsinställningar"
        defaultExpanded={true}
      >
        <HeroSettings
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      </CollapsibleCard>

      <CollapsibleCard
        title="Hero-kort"
        badge={cards.length}
        defaultExpanded={true}
      >
        <HeroCards
          settings={settings}
          onSettingsChange={onSettingsChange}
          activeCardId={activeCardId}
          onCardSelect={setActiveCardId}
        />
      </CollapsibleCard>
    </div>
  );
}
