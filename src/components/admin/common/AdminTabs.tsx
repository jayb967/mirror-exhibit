import { Tab } from '@headlessui/react';
import { Fragment } from 'react';

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface AdminTabsProps {
  items: TabItem[];
  className?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminTabs({ items, className = '' }: AdminTabsProps) {
  return (
    <Tab.Group>
      <Tab.List
        className={`flex space-x-1 rounded-xl bg-gray-100 p-1 ${className}`}
      >
        {items.map((item) => (
          <Tab
            key={item.label}
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary-600'
              )
            }
          >
            {item.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        {items.map((item) => (
          <Tab.Panel
            key={item.label}
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2'
            )}
          >
            {item.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
} 