import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AdminPasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const AdminPasswordInput = forwardRef<HTMLInputElement, AdminPasswordInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            {label}
          </label>
        )}
        <div className="mt-2">
          <div className="relative">
            <input
              ref={ref}
              type={showPassword ? 'text' : 'password'}
              className={`
                block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm
                ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                focus:ring-2 focus:ring-inset focus:ring-primary-600
                sm:text-sm sm:leading-6
                ${error ? 'ring-red-300 focus:ring-red-500' : ''}
                pr-10
                ${className}
              `}
              {...props}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon
                  className="h-5 w-5 text-gray-400 hover:text-gray-500"
                  aria-hidden="true"
                />
              ) : (
                <EyeIcon
                  className="h-5 w-5 text-gray-400 hover:text-gray-500"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>
        {(error || helperText) && (
          <p
            className={`mt-2 text-sm ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

AdminPasswordInput.displayName = 'AdminPasswordInput';

export default AdminPasswordInput; 