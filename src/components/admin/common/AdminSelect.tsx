import { SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
  label: string;
  value: string;
}

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  placeholder?: string;
}

const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, helperText, options, placeholder, className = '', ...props }, ref) => {
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
          <select
            ref={ref}
            className={`
              block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm
              ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset
              focus:ring-primary-600 sm:text-sm sm:leading-6
              ${error ? 'ring-red-300 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

AdminSelect.displayName = 'AdminSelect';

export default AdminSelect; 