import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: {
    value: number;
    label: string;
  };
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

export default function AdminStatsCard({
  title,
  value,
  description,
  change,
  icon: Icon,
  className = '',
}: AdminStatsCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 ${className}`}
    >
      <dt>
        <div className="absolute rounded-md bg-primary-500 p-3">
          {Icon && <Icon className="h-6 w-6 text-white" aria-hidden="true" />}
        </div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500">
          {title}
        </p>
      </dt>
      <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <p
            className={`ml-2 flex items-baseline text-sm font-semibold ${
              change.value >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change.value >= 0 ? (
              <ArrowUpIcon
                className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                aria-hidden="true"
              />
            ) : (
              <ArrowDownIcon
                className="h-5 w-5 flex-shrink-0 self-center text-red-500"
                aria-hidden="true"
              />
            )}
            <span className="sr-only">
              {change.value >= 0 ? 'Increased' : 'Decreased'} by
            </span>
            {Math.abs(change.value)}%
          </p>
        )}
      </dd>
      {description && (
        <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {description}
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 