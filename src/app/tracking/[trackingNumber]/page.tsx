'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface TrackingEvent {
  date: string;
  location: string;
  message: string;
  status: string;
}

interface TrackingInfo {
  status: string;
  estimatedDeliveryDate?: string;
  events: TrackingEvent[];
}

const TrackingPage = () => {
  const { trackingNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingNumber) {
      setError('Tracking number is required');
      setLoading(false);
      return;
    }

    fetchTrackingInfo();
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-12">
        <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-12">
        <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-6 tw-text-center">
          <h1 className="tw-text-2xl tw-font-bold tw-text-red-700 tw-mb-4">Tracking Error</h1>
          <p className="tw-text-red-600 tw-mb-6">{error}</p>
          <Link href="/" className="tw-bg-blue-600 tw-text-white tw-px-6 tw-py-2 tw-rounded-md tw-font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-12">
        <div className="tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg tw-p-6 tw-text-center">
          <h1 className="tw-text-2xl tw-font-bold tw-text-yellow-700 tw-mb-4">No Tracking Information</h1>
          <p className="tw-text-yellow-600 tw-mb-6">
            We couldn't find any tracking information for the number: {trackingNumber}
          </p>
          <Link href="/" className="tw-bg-blue-600 tw-text-white tw-px-6 tw-py-2 tw-rounded-md tw-font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-12">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden">
        <div className="tw-p-6 tw-border-b tw-border-gray-200">
          <h1 className="tw-text-2xl tw-font-bold tw-mb-2">Tracking Information</h1>
          <p className="tw-text-gray-600">Tracking Number: {trackingNumber}</p>
        </div>

        <div className="tw-p-6 tw-border-b tw-border-gray-200">
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
            <h2 className="tw-text-xl tw-font-semibold">Status</h2>
            <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium ${getStatusColor(trackingInfo.status)}`}>
              {trackingInfo.status}
            </span>
          </div>

          {trackingInfo.estimatedDeliveryDate && (
            <div className="tw-mb-4">
              <p className="tw-text-gray-600">
                Estimated Delivery: {formatDate(trackingInfo.estimatedDeliveryDate)}
              </p>
            </div>
          )}
        </div>

        <div className="tw-p-6">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Tracking History</h2>

          {trackingInfo.events.length === 0 ? (
            <p className="tw-text-gray-600">No tracking events available yet.</p>
          ) : (
            <div className="tw-relative">
              {/* Timeline line */}
              <div className="tw-absolute tw-left-3 tw-top-0 tw-bottom-0 tw-w-0.5 tw-bg-gray-200"></div>

              {/* Timeline events */}
              <div className="tw-space-y-6">
                {trackingInfo.events.map((event, index) => (
                  <div key={index} className="tw-relative tw-pl-10">
                    {/* Timeline dot */}
                    <div className={`tw-absolute tw-left-0 tw-top-1.5 tw-w-6 tw-h-6 tw-rounded-full tw-flex tw-items-center tw-justify-center ${
                      index === 0 ? 'tw-bg-blue-600' : 'tw-bg-gray-200'
                    }`}>
                      <div className={`tw-w-3 tw-h-3 tw-rounded-full ${
                        index === 0 ? 'tw-bg-white' : 'tw-bg-gray-400'
                      }`}></div>
                    </div>

                    {/* Event content */}
                    <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4">
                      <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                        <span className={`tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <span className="tw-text-sm tw-text-gray-500">{formatDate(event.date)}</span>
                      </div>
                      <p className="tw-text-gray-700">{event.message}</p>
                      {event.location && (
                        <p className="tw-text-sm tw-text-gray-500 tw-mt-1">Location: {event.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="tw-p-6 tw-bg-gray-50 tw-flex tw-justify-between tw-items-center">
          <Link href="/" className="tw-text-blue-600 hover:tw-text-blue-800 tw-font-medium">
            Return to Home
          </Link>
          <button
            onClick={fetchTrackingInfo}
            className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-font-medium hover:tw-bg-blue-700"
          >
            Refresh Tracking
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
