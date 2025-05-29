'use client';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import Search from "@/components/admin/svg/Search";
import SimpleAdminLayout from "@/components/admin/SimpleAdminLayout";
import UserModal from "@/components/admin/UserModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
  avatar: string;
  createdAt: string;
  emailVerified: boolean;
  banned: boolean;
  locked: boolean;
  twoFactorEnabled: boolean;
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        search: searchTerm,
        showInactive: showInactive.toString(),
        limit: '50',
        offset: '0'
      });

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, searchTerm ? 500 : 0); // 500ms delay for search, immediate for other changes

    return () => clearTimeout(timeoutId);
  }, [searchTerm, showInactive]);

  // Since we're filtering on the server side now, we don't need client-side filtering
  const filteredUsers = users;

  // Format date for better display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Toggle user status
  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const action = user.banned ? 'unban' : 'ban';

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      toast.success(`User ${action === 'ban' ? 'banned' : 'unbanned'} successfully!`);

      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'updateRole',
          role: newRole
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      toast.success('User role updated successfully!');

      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Modal functions
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalSave = () => {
    fetchUsers(); // Refresh the users list
    closeModal();
  };

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-bg-white tw-p-6 tw-shadow-sm">
      <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-6">
        <h1 className="tw-text-2xl tw-font-bold tw-mb-4 sm:tw-mb-0">User Management</h1>

        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-w-full sm:tw-w-auto">
          <div className="tw-relative tw-flex-1 sm:tw-flex-initial">
            <div className="tw-absolute tw-inset-y-0 tw-left-0 tw-pl-3 tw-flex tw-items-center tw-pointer-events-none">
              <Search className="tw-w-5 tw-h-5 tw-text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="tw-pl-10 tw-pr-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500 tw-w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            href="/admin/users/add"
            className="tw-bg-black hover:tw-bg-gray-800 tw-text-white tw-px-4 tw-py-2 tw-shadow-sm tw-text-sm tw-font-medium tw-flex tw-items-center tw-justify-center"
          >
            <span className="tw-mr-1">+</span>
            Add User
          </Link>
        </div>
      </div>

      <div className="tw-mb-4">
        <label className="tw-inline-flex tw-items-center">
          <input
            type="checkbox"
            className="tw-rounded tw-border-gray-300 tw-text-blue-600 tw-shadow-sm focus:tw-border-blue-300 focus:tw-ring focus:tw-ring-blue-200 focus:tw-ring-opacity-50"
            checked={showInactive}
            onChange={() => setShowInactive(!showInactive)}
          />
          <span className="tw-ml-2 tw-text-sm tw-text-gray-600">Show inactive users</span>
        </label>
      </div>

      {loading ? (
        // Loading skeleton
        <div className="tw-space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="tw-border tw-border-gray-200 tw-rounded-md tw-p-4 tw-animate-pulse">
              <div className="tw-flex tw-items-center tw-space-x-4">
                <div className="tw-rounded-full tw-bg-gray-200 tw-h-12 tw-w-12"></div>
                <div className="tw-flex-1">
                  <div className="tw-h-4 tw-bg-gray-200 tw-rounded tw-w-1/4 tw-mb-2"></div>
                  <div className="tw-h-3 tw-bg-gray-200 tw-rounded tw-w-1/3"></div>
                </div>
                <div className="tw-h-8 tw-bg-gray-200 tw-rounded tw-w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // User list
        <div className="tw-overflow-x-auto">
          <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
            <thead className="tw-bg-gray-50">
              <tr>
                <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  User
                </th>
                <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Role
                </th>
                <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Status
                </th>
                <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:tw-bg-gray-50">
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <div className="tw-flex tw-items-center">
                        <div className="tw-flex-shrink-0 tw-h-10 tw-w-10 tw-relative">
                          <Image
                            className="tw-rounded-full"
                            src={user.avatar}
                            alt={user.name}
                            fill
                          />
                        </div>
                        <div className="tw-ml-4">
                          <div className="tw-text-sm tw-font-medium tw-text-gray-900">{user.name}</div>
                          <div className="tw-text-sm tw-text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <div className="tw-text-sm tw-text-gray-900">{user.role}</div>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <span className={`tw-px-2 tw-inline-flex tw-text-xs tw-leading-5 tw-font-semibold tw-rounded-full ${user.status === 'active' ? 'tw-bg-green-100 tw-text-green-800' : 'tw-bg-red-100 tw-text-red-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                      <div className="tw-flex tw-justify-end tw-space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="tw-text-blue-600 hover:tw-text-blue-900 tw-px-2 tw-py-1 tw-border tw-border-blue-600 tw-rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`tw-px-2 tw-py-1 tw-border tw-rounded ${
                            user.banned
                              ? 'tw-text-green-600 hover:tw-text-green-900 tw-border-green-600'
                              : 'tw-text-red-600 hover:tw-text-red-900 tw-border-red-600'
                          }`}
                        >
                          {user.banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="tw-px-6 tw-py-4 tw-text-center tw-text-sm tw-text-gray-500">
                    No users found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
      </div>

      {/* User Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        user={editingUser}
        onClose={closeModal}
        onSave={handleModalSave}
      />
    </SimpleAdminLayout>
  );
}
