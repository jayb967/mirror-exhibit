import { ButtonHTMLAttributes, ReactNode } from 'react';
import AdminLoadingSpinner from './AdminLoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-black text-white hover:bg-gray-800 focus-visible:outline-[#A6A182]',
  secondary: 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
  outline: 'bg-transparent text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
};

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

export default function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: AdminButtonProps) {
  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center rounded-md font-semibold shadow-sm
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <AdminLoadingSpinner size="sm" color="white" className="mr-2" />
          Processing...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}