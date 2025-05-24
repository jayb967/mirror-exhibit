import { InputHTMLAttributes, forwardRef } from 'react';

interface AdminColorInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const AdminColorInput = forwardRef<HTMLInputElement, AdminColorInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
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
          <div className="flex items-center gap-x-3">
            <input
              ref={ref}
              type="color"
              className={`
                h-10 w-10 rounded-md border-0 p-0
                ring-1 ring-inset ring-gray-300
                focus:ring-2 focus:ring-inset focus:ring-primary-600
                ${error ? 'ring-red-300 focus:ring-red-500' : ''}
                ${className}
              `}
              {...props}
            />
            <input
              type="text"
              value={props.value}
              onChange={props.onChange}
              className={`
                block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm
                ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                focus:ring-2 focus:ring-inset focus:ring-primary-600
                sm:text-sm sm:leading-6
                ${error ? 'ring-red-300 focus:ring-red-500' : ''}
              `}
            />
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

AdminColorInput.displayName = 'AdminColorInput';

export default AdminColorInput; 