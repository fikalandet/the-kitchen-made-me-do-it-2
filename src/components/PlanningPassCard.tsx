import React, { ReactNode } from 'react';
import { Save, Trash2 } from 'lucide-react';

interface PlanningPassCardProps {
  children: ReactNode;
  isSaved?: boolean;
  onSave: () => void;
  onDelete: () => void;
  saving?: boolean;
  borderColor?: string;
  backgroundColor?: string;
}

export const PlanningPassCard: React.FC<PlanningPassCardProps> = ({
  children,
  isSaved = false,
  onSave,
  onDelete,
  saving = false,
  borderColor = '#a1c798',
  backgroundColor = 'white',
}) => {
  return (
    <div
      className="rounded-lg shadow-sm relative"
      style={{
        borderWidth: '2px',
        borderColor,
        backgroundColor
      }}
    >
      <div className="absolute top-3 left-3 z-10">
        {isSaved ? (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded border border-green-300">
            Sparat
          </span>
        ) : (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded border border-orange-300">
            Ej sparad
          </span>
        )}
      </div>

      <div className="p-4 pt-12">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {children}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="p-2 bg-black text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              title="Spara"
            >
              <Save size={18} />
            </button>
            <button
              onClick={onDelete}
              disabled={saving}
              className="p-2 text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
              title="Ta bort pass"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
