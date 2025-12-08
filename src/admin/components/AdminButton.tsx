interface AdminButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}

export function AdminButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false
}: AdminButtonProps) {
  const baseStyles = "px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-[#56c5c5] text-white hover:bg-[#4ab3b3]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
