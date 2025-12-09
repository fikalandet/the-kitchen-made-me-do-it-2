import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import HeroSettings from './HeroSettings';
import HeroCards from './HeroCards';
import HeroPreview from './HeroPreview';
import CollapsibleCard from './CollapsibleCard';

export interface HeroCardData {
  id: string;
  heading: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
  cardBackgroundColor?: string;
  headingStyle?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    textColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    lineHeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  textStyle?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    textColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    lineHeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  horizontalPosition?: 'left' | 'center' | 'right';
  verticalPosition?: 'top' | 'center' | 'bottom';
  headingTextSpacing?: number;
  ctaLabel?: string;
  ctaLinkType?: 'internal' | 'external';
  ctaUrl?: string;
  ctaStyle?: {
    fontFamily?: string;
    fontSize?: string;
    textColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    hoverBackgroundColor?: string;
    borderRadius?: string;
  };
}

export interface HeroSettings {
  totalCards?: number;
  cardsPerRow?: number;
  sectionHeading?: string;
  sectionHeadingSize?: string;
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hero-sektion</h3>
          <p className="text-sm text-gray-600">Anpassad hero-sektion för startsidan</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-[#56c5c5] active:bg-[#56c5c5] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Öppna startsidan
        </Link>
      </div>

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

      <CollapsibleCard
        title="Preview - Så här ser det ut på startsidan"
        defaultExpanded={false}
      >
        <HeroPreview settings={settings} />
      </CollapsibleCard>
    </div>
  );
}
