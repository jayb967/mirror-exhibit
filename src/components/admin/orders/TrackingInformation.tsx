'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface TrackingEvent {
  date: string;
  location: string;
  message: string;
  status: string;
}

interface TrackingInformationProps {
  trackingNumber: string;
  labelUrl?: string;
}

const TrackingInformation: React.FC<TrackingInformationProps> = ({
  trackingNumber,
  labelUrl
}) => {
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState<{
    status: string;
    estimatedDeliveryDate?: string;
    events: TrackingEvent[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingInfo();
    } else {
      setLoading(false);
    }
  }, [trackingNumber]);

  const fetchTrackingInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shipping/track/${trackingNumber}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tracking information');
      }

      const data = await response.json();
      setTrackingInfo(data);
    } catch (error) {
      console.error('Error fetching tracking information:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'tw-bg-green-100 tw-text-green-800';
      case 'in transit':
      case 'out for delivery':
        return 'tw-bg-blue-100 tw-text-blue-800';
      case 'pending':
      case 'info received':
        return 'tw-bg-yellow-100 tw-text-yellow-800';
      case 'failed':
      case 'exception':
        return 'tw-bg-red-100 tw-text-red-800';
      default:
        return 'tw-bg-gray-100 tw-text-gray-800';
    }
  };

  if (!trackingNumber) {
    return (
      <div className="tw-bg-gray-50 tw-p-4 tw-rounded tw-text-center">
        <p className="tw-text-gray-600">No tracking information available</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-4">
        <div className="tw-flex tw-justify-center tw-items-center tw-h-24">
          <div className="tw-animate-spin tw-rounded-full tw-h-6 tw-w-6 tw-border-b-2 tw-border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-4">
        <div className="tw-bg-red-50 tw-p-4 tw-rounded">
          <p className="tw-text-red-600">{error}</p>
          <button
            onClick={fetchTrackingInfo}
            className="tw-mt-2 tw-text-blue-600 tw-text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-4">
      <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
        <div>
          <h3 className="tw-text-lg tw-font-semibold">Tracking Information</h3>
          <p className="tw-text-gray-600">Tracking Number: {trackingNumber}</p>
        </div>
        <div className="tw-flex tw-space-x-2">
          {labelUrl && (
            <a
              href={labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tw-bg-blue-600 tw-text-white tw-px-3 tw-py-1 tw-rounded tw-text-sm"
            >
              View Label
            </a>
          )}
          <Link
            href={`/tracking/${trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tw-bg-gray-200 tw-text-gray-800 tw-px-3 tw-py-1 tw-rounded tw-text-sm"
          >
            Tracking Page
          </Link>
          <button
            onClick={fetchTrackingInfo}
            className="tw-bg-gray-200 tw-text-gray-800 tw-px-3 tw-py-1 tw-rounded tw-text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {trackingInfo ? (
        <div>
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
            <div>
              <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium ${getStatusColor(trackingInfo.status)}`}>
                {trackingInfo.status}
              </span>
              {trackingInfo.estimatedDeliveryDate && (
                <span className="tw-ml-4 tw-text-sm tw-text-gray-600">
                  Estimated Delivery: {formatDate(trackingInfo.estimatedDeliveryDate)}
                </span>
              )}
            </div>
          </div>

          {trackingInfo.events.length > 0 ? (
            <div className="tw-border tw-border-gray-200 tw-rounded-lg tw-overflow-hidden">
              <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th className="tw-px-4 tw-py-2 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Date
                    </th>
                    <th className="tw-px-4 tw-py-2 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Status
                    </th>
                    <th className="tw-px-4 tw-py-2 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Details
                    </th>
                    <th className="tw-px-4 tw-py-2 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                  {trackingInfo.events.map((event, index) => (
                    <tr key={index} className={index === 0 ? 'tw-bg-blue-50' : ''}>
                      <td className="tw-px-4 tw-py-2 tw-whitespace-nowrap tw-text-sm tw-text-gray-600">
                        {formatDate(event.date)}
                      </td>
                      <td className="tw-px-4 tw-py-2 tw-whitespace-nowrap">
                        <span className={`tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700">
                        {event.message}
                      </td>
                      <td className="tw-px-4 tw-py-2 tw-text-sm tw-text-gray-600">
                        {event.location || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="tw-bg-yellow-50 tw-p-4 tw-rounded tw-text-center">
              <p className="tw-text-yellow-700">No tracking events available yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="tw-bg-yellow-50 tw-p-4 tw-rounded tw-text-center">
          <p className="tw-text-yellow-700">No tracking information available yet.</p>
        </div>
      )}
    </div>
  );
};

export default TrackingInformation;
