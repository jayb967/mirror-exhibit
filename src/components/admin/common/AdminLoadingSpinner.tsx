interface AdminLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const colorClasses = {
  primary: 'border-primary-600',
  white: 'border-white',
};

export default function AdminLoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
}: AdminLoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
} 