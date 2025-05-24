'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { PackageDetails } from '@/services/shippingService';

interface ShippingLabelGeneratorProps {
  orderId: string;
  shippingAddress: {
    first_name: string;
    last_name: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
  };
  courierId?: string;
  onLabelGenerated: (labelUrl: string, trackingNumber: string) => void;
}

const ShippingLabelGenerator: React.FC<ShippingLabelGeneratorProps> = ({
  orderId,
  shippingAddress,
  courierId,
  onLabelGenerated
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState(courierId || '');
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    weight: 2,
    weight_unit: 'lb',
    length: 12,
    width: 12,
    height: 4,
    dimension_unit: 'in'
  });
  const [availableCouriers, setAvailableCouriers] = useState<Array<{id: string, name: string}>>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);

  // Fetch available couriers when component mounts
  React.useEffect(() => {
    fetchAvailableCouriers();
  }, []);

  const fetchAvailableCouriers = async () => {
    try {
      // Create shipping address in the format expected by the API
      const address = {
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postal_code,
        address: shippingAddress.address,
        address2: shippingAddress.apartment,
        name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        phone: shippingAddress.phone,
        email: shippingAddress.email
      };

      // Get shipping options
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          packages: [packageDetails]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available couriers');
      }

      const data = await response.json();
      
      // Extract unique couriers from the options
      const couriers = data.options.reduce((acc: any[], option: any) => {
        if (!acc.some(c => c.id === option.courier_id)) {
          acc.push({
            id: option.courier_id,
            name: option.courier_name
          });
        }
        return acc;
      }, []);
      
      setAvailableCouriers(couriers);
      
      // Set selected courier if not already set
      if (!selectedCourierId && couriers.length > 0) {
        setSelectedCourierId(couriers[0].id);
      }
    } catch (error) {
      console.error('Error fetching available couriers:', error);
      toast.error('Failed to fetch available couriers');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'courier') {
      setSelectedCourierId(value);
    } else {
      setPackageDetails(prev => ({
        ...prev,
        [name]: name === 'weight_unit' || name === 'dimension_unit' ? value : parseFloat(value)
      }));
    }
  };

  const generateLabel = async () => {
    if (!selectedCourierId) {
      toast.error('Please select a courier');
      return;
    }

    try {
      setLoading(true);

      // Create shipping address in the format expected by the API
      const address = {
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postal_code,
        address: shippingAddress.address,
        address2: shippingAddress.apartment,
        name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        phone: shippingAddress.phone,
        email: shippingAddress.email
      };

      // Generate shipping label
      const response = await fetch('/api/shipping/create-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          address,
          packages: [packageDetails],
          courierId: selectedCourierId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate shipping label');
      }

      const data = await response.json();
      
      // Call the callback with the label URL and tracking number
      onLabelGenerated(data.labelUrl, data.trackingNumber);
      
      toast.success('Shipping label generated successfully');
    } catch (error) {
      console.error('Error generating shipping label:', error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-4 tw-mb-4">
      <h3 className="tw-text-lg tw-font-semibold tw-mb-3">Generate Shipping Label</h3>
      
      <div className="tw-mb-4">
        <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Courier</label>
        <select
          name="courier"
          value={selectedCourierId}
          onChange={handleInputChange}
          className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
          disabled={loading}
        >
          <option value="">Select a courier</option>
          {availableCouriers.map(courier => (
            <option key={courier.id} value={courier.id}>
              {courier.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="tw-mb-4">
        <button
          type="button"
          onClick={() => setShowPackageForm(!showPackageForm)}
          className="tw-text-blue-600 tw-text-sm tw-underline"
        >
          {showPackageForm ? 'Hide package details' : 'Edit package details'}
        </button>
      </div>
      
      {showPackageForm && (
        <div className="tw-bg-gray-50 tw-p-4 tw-rounded tw-mb-4">
          <h4 className="tw-text-md tw-font-medium tw-mb-3">Package Details</h4>
          
          <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-4">
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Weight</label>
              <div className="tw-flex">
                <input
                  type="number"
                  name="weight"
                  value={packageDetails.weight}
                  onChange={handleInputChange}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded-l tw-px-3 tw-py-2"
                  min="0.1"
                  step="0.1"
                  disabled={loading}
                />
                <select
                  name="weight_unit"
                  value={packageDetails.weight_unit}
                  onChange={handleInputChange}
                  className="tw-border tw-border-gray-300 tw-rounded-r tw-px-3 tw-py-2 tw-bg-gray-50"
                  disabled={loading}
                >
                  <option value="lb">lb</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Dimensions Unit</label>
              <select
                name="dimension_unit"
                value={packageDetails.dimension_unit}
                onChange={handleInputChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                disabled={loading}
              >
                <option value="in">inches</option>
                <option value="cm">centimeters</option>
              </select>
            </div>
          </div>
          
          <div className="tw-grid tw-grid-cols-3 tw-gap-4">
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Length</label>
              <input
                type="number"
                name="length"
                value={packageDetails.length}
                onChange={handleInputChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                min="1"
                step="0.1"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Width</label>
              <input
                type="number"
                name="width"
                value={packageDetails.width}
                onChange={handleInputChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                min="1"
                step="0.1"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Height</label>
              <input
                type="number"
                name="height"
                value={packageDetails.height}
                onChange={handleInputChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                min="1"
                step="0.1"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}
      
      <button
        type="button"
        onClick={generateLabel}
        disabled={loading || !selectedCourierId}
        className="tw-w-full tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded tw-font-medium hover:tw-bg-blue-700 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
      >
        {loading ? 'Generating...' : 'Generate Shipping Label'}
      </button>
    </div>
  );
};

export default ShippingLabelGenerator;
