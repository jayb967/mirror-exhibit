'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';

/**
 * A test component to verify Cloudinary configuration
 */
const CloudinaryTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCloudinaryConfig = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Check if environment variables are set
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      const uploadUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;

      if (!cloudName || !apiKey || !uploadUrl) {
        throw new Error('Cloudinary environment variables are not properly configured');
      }

      // Test the API endpoint
      const response = await fetch('/api/cloudinary/test', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test Cloudinary configuration');
      }

      const data = await response.json();
      setResult(data);
      toast.success('Cloudinary configuration is working correctly!');
    } catch (error) {
      console.error('Error testing Cloudinary:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to test Cloudinary configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
      <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Cloudinary Configuration Test</h2>

      <div className="tw-mb-4">
        <p className="tw-text-gray-600">
          This component tests if your Cloudinary configuration is working correctly.
        </p>
      </div>

      <button
        onClick={testCloudinaryConfig}
        disabled={isLoading}
        className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-blue-700 disabled:tw-bg-blue-400"
      >
        {isLoading ? 'Testing...' : 'Test Cloudinary Configuration'}
      </button>

      {error && (
        <div className="tw-mt-4 tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-md">
          <h3 className="tw-text-red-800 tw-font-medium">Error</h3>
          <p className="tw-text-red-700">{error}</p>
          <div className="tw-mt-2">
            <p className="tw-text-sm tw-text-red-600">
              Make sure you have set the following environment variables:
            </p>
            <ul className="tw-list-disc tw-pl-5 tw-mt-1 tw-text-sm tw-text-red-600">
              <li>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</li>
              <li>NEXT_PUBLIC_CLOUDINARY_API_KEY</li>
              <li>CLOUDINARY_API_SECRET</li>
              <li>NEXT_PUBLIC_CLOUDINARY_URL</li>
            </ul>
          </div>
        </div>
      )}

      {result && (
        <div className="tw-mt-4 tw-p-4 tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-md">
          <h3 className="tw-text-green-800 tw-font-medium">Success!</h3>
          <p className="tw-text-green-700">Cloudinary configuration is working correctly.</p>
          <div className="tw-mt-2 tw-overflow-x-auto">
            <pre className="tw-text-sm tw-bg-gray-100 tw-p-2 tw-rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryTest;
