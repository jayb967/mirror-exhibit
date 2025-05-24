import { ReactNode } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

interface AdminFormProps<T extends Record<string, any>> {
  onSubmit: (data: T) => Promise<void>;
  form: UseFormReturn<T>;
  children: ReactNode;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function AdminForm<T extends Record<string, any>>({
  onSubmit,
  form,
  children,
  submitLabel = 'Submit',
  isLoading = false
}: AdminFormProps<T>) {
  const { handleSubmit } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {children}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A6A182] ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

interface AdminFormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function AdminFormField({ label, error, children }: AdminFormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface AdminFormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AdminFormInput({ label, error, ...props }: AdminFormInputProps) {
  return (
    <AdminFormField label={label} error={error}>
      <input
        type="text"
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          error ? 'border-red-300' : ''
        }`}
        {...props}
      />
    </AdminFormField>
  );
}

interface AdminFormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function AdminFormTextarea({ label, error, ...props }: AdminFormTextareaProps) {
  return (
    <AdminFormField label={label} error={error}>
      <textarea
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          error ? 'border-red-300' : ''
        }`}
        rows={3}
        {...props}
      />
    </AdminFormField>
  );
}

interface AdminFormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function AdminFormSelect({ label, error, options, ...props }: AdminFormSelectProps) {
  return (
    <AdminFormField label={label} error={error}>
      <select
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          error ? 'border-red-300' : ''
        }`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </AdminFormField>
  );
}