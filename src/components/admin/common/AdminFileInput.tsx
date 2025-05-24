import { InputHTMLAttributes, forwardRef, useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface AdminFileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  onFileChange?: (files: FileList | null) => void;
}

const AdminFileInput = forwardRef<HTMLInputElement, AdminFileInputProps>(
  ({ label, error, helperText, accept, multiple, onFileChange, className = '', ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onFileChange) {
        onFileChange(e.target.files);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

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
          <div
            className={`
              relative block w-full rounded-lg border-2 border-dashed
              border-gray-300 p-12 text-center hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary-600
              focus:ring-offset-2
              ${error ? 'border-red-300 focus:ring-red-500' : ''}
              ${className}
            `}
          >
            <input
              ref={(node) => {
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
                inputRef.current = node;
              }}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              {...props}
            />
            <PhotoIcon
              className="mx-auto h-12 w-12 text-gray-400"
              aria-hidden="true"
            />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor={props.id}
                className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500"
              >
                <span>Upload a file</span>
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              {accept ? `Accepted formats: ${accept}` : 'Any file type'}
            </p>
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

AdminFileInput.displayName = 'AdminFileInput';

export default AdminFileInput; 