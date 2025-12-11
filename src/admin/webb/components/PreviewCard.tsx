import { ReactNode } from 'react';
import CollapsibleCard from './CollapsibleCard';

interface PreviewCardProps {
  title?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export default function PreviewCard({
  title = "Preview",
  defaultExpanded = true,
  children
}: PreviewCardProps) {
  return (
    <CollapsibleCard title={title} defaultExpanded={defaultExpanded}>
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
        {children}
      </div>
    </CollapsibleCard>
  );
}
