import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { ChefCard } from './ChefCard';
import { EmptyState } from './EmptyState';

interface Chef {
  id: string;
  display_name: string;
  bio?: string;
  city?: string;
  rating?: number;
  membership_level?: string;
  avatar_url?: string;
}

interface ChefSpotlightSectionProps {
  chef: Chef | null;
}

export const ChefSpotlightSection: React.FC<ChefSpotlightSectionProps> = ({ chef }) => {
  return (
    <SectionWrapper title="Kock i fokus" subtitle="Denna veckans utvalda kock">
      {chef ? (
        <div className="max-w-md mx-auto">
          <ChefCard
            name={chef.display_name}
            bio={chef.bio}
            city={chef.city}
            rating={chef.rating}
            membership_level={chef.membership_level}
            avatar_url={chef.avatar_url}
          />
        </div>
      ) : (
        <EmptyState text="Inget här ännu" />
      )}
    </SectionWrapper>
  );
};
