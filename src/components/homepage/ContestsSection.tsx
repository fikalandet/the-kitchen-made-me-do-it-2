import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { ContestCard } from './ContestCard';
import { EmptyState } from './EmptyState';

interface Contest {
  id: string;
  title: string;
  description: string;
  deadline_at: string;
  image_url?: string;
  prize?: string;
}

interface ContestsSectionProps {
  contests: Contest[];
}

export const ContestsSection: React.FC<ContestsSectionProps> = ({ contests }) => {
  return (
    <SectionWrapper title="Tävlingar" subtitle="Pågående tävlingar med fina priser">
      {contests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contests.map((contest) => (
            <ContestCard key={contest.id} {...contest} />
          ))}
        </div>
      ) : (
        <EmptyState text="Inget här ännu" />
      )}
    </SectionWrapper>
  );
};
