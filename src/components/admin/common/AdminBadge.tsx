type BadgeVariant = 'success' | 'error' | 'warning' | 'info';

interface AdminBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses = {
  success: 'bg-green-50 text-green-700 ring-green-600/20',
  error: 'bg-red-50 text-red-700 ring-red-600/20',
  warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
};

export default function AdminBadge({
  label,
  variant = 'info',
  className = '',
}: AdminBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
} 