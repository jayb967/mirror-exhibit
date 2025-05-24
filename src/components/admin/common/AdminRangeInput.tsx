import { InputHTMLAttributes, forwardRef } from 'react';

interface AdminRangeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
}

const AdminRangeInput = forwardRef<HTMLInputElement, AdminRangeInputProps>(
  ({ label, error, helperText, min, max, step, showValue = true, className = '', ...props }, ref) => {
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
              type="range"
              min={min}
              max={max}
              step={step}
              className={`
                h-2 w-full cursor-pointer appearance-none rounded-lg
                bg-gray-200 accent-primary-600
                ${error ? 'bg-red-200' : ''}
                ${className}
              `}
              {...props}
            />
            {showValue && (
              <span className="min-w-[3rem] text-sm text-gray-900">
                {props.value}
              </span>
            )}
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

AdminRangeInput.displayName = 'AdminRangeInput';

export default AdminRangeInput; 