'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';
import StaticNavigation from '@/components/admin/StaticNavigation';

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="tw-min-h-screen tw-bg-[#F8F8F8]">
      <ToastContainer />
      
      {/* Navigation */}
      <StaticNavigation currentPath={pathname} />
      
      {/* Main content */}
      <div className="tw-md:ml-64 tw-p-4 tw-pt-8">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Users</h1>
        
        {loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="tw-bg-white tw-shadow-md tw-p-6">
            <p className="tw-text-center tw-text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="tw-bg-white tw-shadow-md tw-overflow-hidden">
            <div className="tw-overflow-x-auto">
              <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Name
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Email
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Joined
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Orders
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <div className="tw-flex tw-items-center">
                          <div className="tw-h-10 tw-w-10 tw-bg-gray-200 tw-rounded-full tw-flex-shrink-0"></div>
                          <div className="tw-ml-4">
                            <div className="tw-text-sm tw-font-medium tw-text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {user.email}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {user.order_count || 0}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium">
                        <a href={`/admin-static/users/${user.id}`} className="tw-text-[#A6A182] hover:tw-text-black tw-mr-3">
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
