'use client';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';


import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  bio: string;
  phone: string;
  profileImage: string;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  
  // Initialize with mock data
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@mirrorexhibit.com",
    role: "Administrator",
    bio: "Art enthusiast with over 10 years of experience in gallery management and curation.",
    phone: "+1 (555) 987-6543",
    profileImage: "https://randomuser.me/api/portraits/men/41.jpg",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, this would upload to a server and get back a URL
      // Here we're just creating a local object URL for demonstration
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData((prev) => ({
        ...prev,
        profileImage: url,
      }));
      toast.info("Image updated! In a real app, this would be uploaded to the server.");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow-sm">
      <h1 className="tw-text-2xl tw-font-bold tw-mb-6">My Profile</h1>
      
      <form onSubmit={handleSubmit} className="tw-space-y-6">
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-8">
          {/* Profile Image Section */}
          <div className="tw-flex tw-flex-col tw-items-center tw-space-y-4">
            <div 
              className="tw-w-40 tw-h-40 tw-relative tw-cursor-pointer tw-rounded-full tw-overflow-hidden tw-border-4 tw-border-gray-200 hover:tw-border-blue-500 tw-transition-all"
              onClick={handleImageClick}
            >
              <Image 
                src={formData.profileImage} 
                alt="Profile" 
                fill
                className="tw-object-cover"
              />
              <div className="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-20 tw-flex tw-items-center tw-justify-center tw-opacity-0 hover:tw-opacity-100 tw-transition-opacity">
                <span className="tw-text-white tw-font-medium">Change Photo</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="tw-hidden"
              accept="image/*"
            />
            <p className="tw-text-sm tw-text-gray-500">Click on the image to upload a new photo</p>
          </div>
          
          {/* Profile Details Section */}
          <div className="tw-flex-1">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="tw-mb-4">
                <label htmlFor="firstName" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                  required
                />
              </div>
              
              <div className="tw-mb-4">
                <label htmlFor="lastName" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                  required
                />
              </div>
              
              <div className="tw-mb-4">
                <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                  required
                />
              </div>
              
              <div className="tw-mb-4">
                <label htmlFor="phone" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                />
              </div>
            </div>
            
            <div className="tw-mb-4">
              <label htmlFor="role" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Role
              </label>
              <input
                id="role"
                name="role"
                type="text"
                value={formData.role}
                onChange={handleInputChange}
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500 tw-bg-gray-50"
                readOnly
              />
              <p className="tw-text-sm tw-text-gray-500 tw-mt-1">Your role can only be changed by a super admin</p>
            </div>
            
            <div className="tw-mb-4">
              <label htmlFor="bio" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="tw-flex tw-justify-end tw-mt-6">
          <button
            type="submit"
            disabled={loading}
            className="tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500 disabled:tw-opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
      
      <div className="tw-mt-10 tw-pt-6 tw-border-t tw-border-gray-200">
        <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Change Password</h2>
        
        <form className="tw-space-y-4">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
            <div className="tw-mb-4">
              <label htmlFor="currentPassword" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                required
              />
            </div>
            
            <div className="tw-mb-4">
              <label htmlFor="newPassword" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                required
              />
            </div>
            
            <div className="tw-mb-4">
              <label htmlFor="confirmPassword" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="tw-flex tw-justify-end">
            <button
              type="submit"
              className="tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
