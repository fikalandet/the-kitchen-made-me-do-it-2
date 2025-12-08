import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { WishCard } from './WishCard';
import { EmptyState } from './EmptyState';

interface Wish {
  id: string;
  dish_name: string;
  description: string;
  customer_name: string;
  likes_count: number;
  comments_count: number;
}

interface WishesSectionProps {
  wishes: Wish[];
}

export const WishesSection: React.FC<WishesSectionProps> = ({ wishes }) => {
  return (
    <SectionWrapper title="Önska käk" subtitle="Kunder önskar rätter, kockar kan svara">
      {wishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishes.map((wish) => (
            <WishCard key={wish.id} {...wish} />
          ))}
        </div>
      ) : (
        <EmptyState text="Inget här ännu" />
      )}
    </SectionWrapper>
  );
};
