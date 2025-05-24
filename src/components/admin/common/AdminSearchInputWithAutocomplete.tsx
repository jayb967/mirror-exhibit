import { Fragment, useState, useRef, useEffect } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Option {
  id: string;
  label: string;
  value: string;
}

interface AdminSearchInputWithAutocompleteProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AdminSearchInputWithAutocomplete({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
}: AdminSearchInputWithAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onSearch) {
      onSearch(query);
    }
  }, [query, onSearch]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div>
      {label && (
        <label
          htmlFor="search-input"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
      )}
      <div className="mt-2">
        <Combobox
          value={selectedOption}
          onChange={(option) => onChange(option?.value || '')}
          as="div"
          className={`relative ${className}`}
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <Combobox.Input
              ref={inputRef}
              id="search-input"
              className={`
                block w-full rounded-md border-0 py-1.5 pl-10 pr-10 text-gray-900
                shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                focus:ring-2 focus:ring-inset focus:ring-primary-600
                sm:text-sm sm:leading-6
                ${error ? 'ring-red-300 focus:ring-red-500' : ''}
              `}
              placeholder={placeholder}
              displayValue={(option: Option) => option?.label || ''}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredOptions.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-primary-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-primary-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </Combobox>
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