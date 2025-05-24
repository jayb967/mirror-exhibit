import { InputHTMLAttributes, forwardRef } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface AdminNumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  showControls?: boolean;
}

const AdminNumberInput = forwardRef<HTMLInputElement, AdminNumberInputProps>(
  ({ label, error, helperText, min, max, step, showControls = true, className = '', ...props }, ref) => {
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
              type="number"
              min={min}
              max={max}
              step={step}
              className={`
                block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm
                ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                focus:ring-2 focus:ring-inset focus:ring-primary-600
                sm:text-sm sm:leading-6
                ${error ? 'ring-red-300 focus:ring-red-500' : ''}
                ${showControls ? 'pr-8' : ''}
                ${className}
              `}
              {...props}
            />
            {showControls && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <div className="flex flex-col">
                  <button
                    type="button"
                    className="h-4 w-4 text-gray-400 hover:text-gray-500"
                    onClick={() => {
                      const input = ref as React.RefObject<HTMLInputElement>;
                      if (input.current) {
                        const currentValue = Number(input.current.value) || 0;
                        const newValue = currentValue + (step || 1);
                        if (!max || newValue <= max) {
                          input.current.value = String(newValue);
                          input.current.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                      }
                    }}
                  >
                    <ChevronUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="h-4 w-4 text-gray-400 hover:text-gray-500"
                    onClick={() => {
                      const input = ref as React.RefObject<HTMLInputElement>;
                      if (input.current) {
                        const currentValue = Number(input.current.value) || 0;
                        const newValue = currentValue - (step || 1);
                        if (!min || newValue >= min) {
                          input.current.value = String(newValue);
                          input.current.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                      }
                    }}
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
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

AdminNumberInput.displayName = 'AdminNumberInput';

export default AdminNumberInput; 