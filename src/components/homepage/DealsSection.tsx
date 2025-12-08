import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { DealCard } from './DealCard';
import { EmptyState } from './EmptyState';

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  ends_at: string;
  image_url?: string;
}

interface DealsSectionProps {
  deals: Deal[];
}

export const DealsSection: React.FC<DealsSectionProps> = ({ deals }) => {
  return (
    <SectionWrapper title="Schyssta deals" subtitle="Kampanjer och rabatter" showFilter>
      {deals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      ) : (
        <EmptyState text="Inget här ännu" />
      )}
    </SectionWrapper>
  );
};
