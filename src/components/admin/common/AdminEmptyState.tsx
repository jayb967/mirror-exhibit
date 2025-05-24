import { InboxIcon } from '@heroicons/react/24/outline';

interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function AdminEmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="text-center">
      <Icon
        className="mx-auto h-12 w-12 text-gray-400"
        aria-hidden="true"
      />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
} 