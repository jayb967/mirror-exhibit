import { ReactNode, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AdminPageWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AdminPageWrapper({ children, title, description }: AdminPageWrapperProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/admin/login');
    } else if (isLoaded && user && user.privateMetadata?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || !user || user.privateMetadata?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        {children}
      </div>
    </div>
  );
}