import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  label: string;
  value: string;
}

interface AdminFilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValue?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function AdminFilterDropdown({
  label,
  options,
  selectedValue,
  onChange,
  className = '',
}: AdminFilterDropdownProps) {
  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <FunnelIcon
            className="-ml-0.5 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          {label}
          <span className="ml-2 text-gray-500">
            {selectedOption ? `: ${selectedOption.label}` : ''}
          </span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.value)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } ${
                      selectedValue === option.value
                        ? 'bg-gray-50 text-primary-600'
                        : ''
                    } block w-full px-4 py-2 text-left text-sm`}
                  >
                    {option.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 