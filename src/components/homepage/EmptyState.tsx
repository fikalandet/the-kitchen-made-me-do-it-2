import React from 'react';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  text?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ text = 'Inget här ännu' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Package size={48} className="mb-3" />
      <p className="text-lg">{text}</p>
    </div>
  );
};
