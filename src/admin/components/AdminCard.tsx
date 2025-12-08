interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCard({ children, className = '' }: AdminCardProps) {
  return (
    <div className={`bg-[#a1c798] rounded-xl shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}
