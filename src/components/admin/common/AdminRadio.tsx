import { InputHTMLAttributes, forwardRef } from 'react';

interface AdminRadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const AdminRadio = forwardRef<HTMLInputElement, AdminRadioProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div>
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              ref={ref}
              type="radio"
              className={`
                h-4 w-4 border-gray-300 text-primary-600
                focus:ring-primary-600
                ${error ? 'border-red-300 text-red-600 focus:ring-red-600' : ''}
                ${className}
              `}
              {...props}
            />
          </div>
          {label && (
            <div className="ml-3 text-sm leading-6">
              <label
                htmlFor={props.id}
                className="font-medium text-gray-900"
              >
                {label}
              </label>
            </div>
          )}
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

AdminRadio.displayName = 'AdminRadio';

export default AdminRadio; 