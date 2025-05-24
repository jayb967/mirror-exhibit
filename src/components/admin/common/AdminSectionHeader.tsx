interface AdminSectionHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function AdminSectionHeader({
  title,
  description,
  action,
  className = '',
}: AdminSectionHeaderProps) {
  return (
    <div className={`sm:flex sm:items-center ${className}`}>
      <div className="sm:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        )}
      </div>
      {action && (
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={action.onClick}
            className="block px-3 py-2 text-center text-sm font-semibold text-white shadow-sm bg-black hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6A182]"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}