"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export default function AddUserPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserForm>({
    firstName: "",
    lastName: "",
    email: "",
    role: "Editor",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("User added successfully!");
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "Editor",
        password: "",
        confirmPassword: "",
      });
    }, 1000);
  };

  return (
    <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow-sm">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h1 className="tw-text-2xl tw-font-bold">Add New User</h1>
        <Link 
          href="/admin/users"
          className="tw-text-blue-600 hover:tw-text-blue-800 tw-flex tw-items-center"
        >
          &larr; Back to Users
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="tw-space-y-6">
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
          <div>
            <label htmlFor="firstName" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              First Name <span className="tw-text-red-500">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Last Name <span className="tw-text-red-500">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
            Email Address <span className="tw-text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="role" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
            Role <span className="tw-text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleInputChange}
            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
          >
            <option value="Administrator">Administrator</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
          <p className="tw-text-sm tw-text-gray-500 tw-mt-1">
            <strong>Administrator:</strong> Full access to all features<br />
            <strong>Editor:</strong> Can manage content but not users or settings<br />
            <strong>Viewer:</strong> Read-only access to content
          </p>
        </div>
        
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
          <div>
            <label htmlFor="password" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Password <span className="tw-text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
              minLength={8}
            />
            <p className="tw-text-sm tw-text-gray-500 tw-mt-1">
              Must be at least 8 characters long
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Confirm Password <span className="tw-text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
              minLength={8}
            />
          </div>
        </div>
        
        <div className="tw-flex tw-justify-between tw-items-center tw-pt-4">
          <div className="tw-text-sm tw-text-gray-500">
            <span className="tw-text-red-500">*</span> Required fields
          </div>
          <div className="tw-flex tw-space-x-3">
            <Link
              href="/admin/users"
              className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500 disabled:tw-opacity-50"
            >
              {loading ? "Adding User..." : "Add User"}
            </button>
          </div>
        </div>
      </form>
      
      <div className="tw-mt-8 tw-pt-6 tw-border-t tw-border-gray-200">
        <h2 className="tw-text-lg tw-font-semibold tw-mb-3">User Permissions by Role</h2>
        <div className="tw-overflow-x-auto">
          <table className="tw-min-w-full tw-bg-white tw-border tw-border-gray-200">
            <thead>
              <tr className="tw-bg-gray-50">
                <th className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-left">Feature</th>
                <th className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">Administrator</th>
                <th className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">Editor</th>
                <th className="tw-py-2 tw-px-4 tw-border-b tw-text-center">Viewer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r">View Content</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">✓</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">✓</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-text-center">✓</td>
              </tr>
              <tr>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r">Edit Content</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">✓</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">✓</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-text-center">-</td>
              </tr>
              <tr>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r">Manage Users</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">✓</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">-</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-text-center">-</td>
              </tr>
              <tr>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r">System Settings</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">✓</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-border-r tw-text-center">-</td>
                <td className="tw-py-2 tw-px-4 tw-border-b tw-text-center">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 