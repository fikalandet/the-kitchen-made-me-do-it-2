interface AdminSectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminSectionHeader({ title, subtitle }: AdminSectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold text-black" style={{ fontFamily: 'Lobster, cursive' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-700 mt-2">{subtitle}</p>
      )}
    </div>
  );
}
