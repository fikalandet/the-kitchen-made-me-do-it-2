import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { ReelCard } from './ReelCard';
import { EmptyState } from './EmptyState';

interface Reel {
  id: string;
  title: string;
  thumbnail_url?: string;
  chef_name: string;
  views_count: number;
}

interface ReelsSectionProps {
  reels: Reel[];
}

export const ReelsSection: React.FC<ReelsSectionProps> = ({ reels }) => {
  return (
    <SectionWrapper title="Tjuvkik i köket" subtitle="Korta videos från våra kockar">
      {reels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reels.map((reel) => (
            <ReelCard key={reel.id} {...reel} />
          ))}
        </div>
      ) : (
        <EmptyState text="Inget här ännu" />
      )}
    </SectionWrapper>
  );
};
