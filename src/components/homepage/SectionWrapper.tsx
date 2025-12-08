import React from 'react';

interface SectionWrapperProps {
  title?: string;
  subtitle?: string;
  showFilter?: boolean;
  onFilterChange?: (value: string) => void;
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  subtitle,
  showFilter,
  onFilterChange,
  children,
}) => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {(title || showFilter) && (
          <div className="flex items-center justify-between mb-6">
            <div>
              {title && (
                <div className="flex items-center gap-3">
                  <h2 className="font-lobster text-3xl text-gray-800 font-bold">{title}</h2>
                  {subtitle && (
                    <>
                      <span className="text-gray-400 text-2xl">|</span>
                      <p className="text-gray-700">{subtitle}</p>
                    </>
                  )}
                </div>
              )}
            </div>
            {showFilter && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={(e) => onFilterChange?.(e.target.checked ? 'local' : 'all')}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-700">Visa i mitt område</span>
              </label>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};
