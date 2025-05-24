interface AdminCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function AdminCard({
  title,
  children,
  className = '',
}: AdminCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5 ${className}`}
    >
      {title && (
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {title}
          </h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
} 