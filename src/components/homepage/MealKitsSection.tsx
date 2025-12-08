import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { DishCard } from './DishCard';
import { EmptyState } from './EmptyState';

interface MealKit {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface MealKitsSectionProps {
  mealKits: MealKit[];
}

export const MealKitsSection: React.FC<MealKitsSectionProps> = ({ mealKits }) => {
  return (
    <SectionWrapper
      title="Kylskåpsmeny"
      subtitle="Matlådekassar, laga-själv-kit och prenumerationer"
      showFilter
    >
      {mealKits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mealKits.map((kit) => (
            <DishCard
              key={kit.id}
              id={kit.id}
              name={kit.name}
              chef_name="Kock"
              price={kit.price || 0}
              image_url={kit.image_url}
            />
          ))}
        </div>
      ) : (
        <EmptyState text="Inget här ännu" />
      )}
    </SectionWrapper>
  );
};
