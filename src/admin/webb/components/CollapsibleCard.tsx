import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AdminCard } from '../../components';

interface CollapsibleCardProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  badge?: string | number;
}

export default function CollapsibleCard({
  title,
  children,
  defaultExpanded = false,
  badge
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <AdminCard>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {badge !== undefined && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 group-hover:text-gray-700">
            {isExpanded ? 'Stäng' : 'Öppna'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </AdminCard>
  );
}
