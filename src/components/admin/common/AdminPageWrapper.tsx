import { ReactNode } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface AdminPageWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AdminPageWrapper({ children, title, description }: AdminPageWrapperProps) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/admin/login');
    } else if (session.user.user_metadata?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [session, router]);

  if (!session || session.user.user_metadata?.role !== 'admin') {
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