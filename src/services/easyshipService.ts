/**
 * Easyship API Service
 * Handles integration with Easyship for shipping rates, label generation, and tracking
 */

// Types for Easyship API
export interface EasyshipPackage {
  description?: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  weight_unit: 'kg' | 'lb';
  dimension_unit: 'cm' | 'in';
  value_amount: number;
  value_currency: string;
}

export interface EasyshipAddress {
  line_1: string;
  line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country_alpha2: string;
  contact_name: string;
  company_name?: string;
  phone_number: string;
  email?: string;
}

export interface EasyshipRateRequest {
  origin_address: EasyshipAddress;
  destination_address: EasyshipAddress;
  packages: EasyshipPackage[];
  output_currency?: string;
  is_insured?: boolean;
  insurance_amount?: number;
  selected_courier_id?: string;
}

export interface EasyshipRate {
  courier_id: string;
  courier_name: string;
  courier_logo: string;
  total_charge: number;
  min_delivery_time: number;
  max_delivery_time: number;
  delivery_time_unit: string;
  currency: string;
  service_name: string;
  service_type: string;
}

export interface EasyshipRateResponse {
  rates: EasyshipRate[];
  output_currency: string;
}

export interface EasyshipShipmentRequest {
  origin_address: EasyshipAddress;
  destination_address: EasyshipAddress;
  packages: EasyshipPackage[];
  selected_courier_id: string;
  output_currency: string;
  insurance_amount?: number;
  is_insured?: boolean;
  reference_id?: string;
  metadata?: Record<string, any>;
}

export interface EasyshipShipmentResponse {
  shipment_id: string;
  tracking_number: string;
  label_url: string;
  commercial_invoice_url?: string;
  status: string;
  delivery_date?: string;
  courier: {
    id: string;
    name: string;
    logo: string;
  };
}

export interface EasyshipTrackingResponse {
  tracking_number: string;
  status: string;
  origin_country: string;
  destination_country: string;
  estimated_delivery_date?: string;
  tracking_events: {
    date: string;
    location: string;
    message: string;
    status: string;
  }[];
}

/**
 * Easyship API Service
 * Handles all interactions with the Easyship API
 */
class EasyshipService {
  private apiKey: string;
  private baseUrl: string;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  private ratesCache: Map<string, { rates: EasyshipRate[], timestamp: number }> = new Map();

  constructor() {
    this.apiKey = process.env.EASYSHIP_API_KEY || '';
    this.baseUrl = 'https://api.easyship.com/v2';
    
    if (!this.apiKey) {
      console.warn('Easyship API key is not set. Easyship integration will not work.');
    }
  }

  /**
   * Get shipping rates from Easyship
   * @param request Rate request parameters
   * @returns Array of shipping rates
   */
  async getRates(request: EasyshipRateRequest): Promise<EasyshipRate[]> {
    try {
      // Generate cache key based on request
      const cacheKey = this.generateCacheKey(request);
      
      // Check cache first
      const cachedRates = this.getCachedRates(cacheKey);
      if (cachedRates) {
        return cachedRates;
      }
      
      // Make API request if not in cache
      const response = await fetch(`${this.baseUrl}/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Easyship API error: ${errorData.message || response.statusText}`);
      }
      
      const data: EasyshipRateResponse = await response.json();
      
      // Cache the results
      this.cacheRates(cacheKey, data.rates);
      
      return data.rates;
    } catch (error) {
      console.error('Error fetching shipping rates from Easyship:', error);
      return this.getFallbackRates(request);
    }
  }

  /**
   * Create a shipment in Easyship
   * @param request Shipment request parameters
   * @returns Shipment details
   */
  async createShipment(request: EasyshipShipmentRequest): Promise<EasyshipShipmentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Easyship API error: ${errorData.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating shipment in Easyship:', error);
      throw error;
    }
  }

  /**
   * Track a shipment by tracking number
   * @param trackingNumber Tracking number to look up
   * @returns Tracking information
   */
  async trackShipment(trackingNumber: string): Promise<EasyshipTrackingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Easyship API error: ${errorData.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error tracking shipment in Easyship:', error);
      throw error;
    }
  }

  /**
   * Validate an address using Easyship
   * @param address Address to validate
   * @returns Validated address or error
   */
  async validateAddress(address: EasyshipAddress): Promise<EasyshipAddress> {
    try {
      const response = await fetch(`${this.baseUrl}/addresses/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ address })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Easyship API error: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error('Error validating address with Easyship:', error);
      throw error;
    }
  }

  /**
   * Generate a cache key for a rate request
   * @param request Rate request
   * @returns Cache key string
   */
  private generateCacheKey(request: EasyshipRateRequest): string {
    // Create a simplified version of the request for caching
    const cacheObj = {
      origin: `${request.origin_address.postal_code}-${request.origin_address.country_alpha2}`,
      destination: `${request.destination_address.postal_code}-${request.destination_address.country_alpha2}`,
      packages: request.packages.map(pkg => `${pkg.weight}${pkg.weight_unit}-${pkg.length}x${pkg.width}x${pkg.height}${pkg.dimension_unit}`)
    };
    return JSON.stringify(cacheObj);
  }

  /**
   * Get cached rates if available and not expired
   * @param cacheKey Cache key
   * @returns Cached rates or null if not found/expired
   */
  private getCachedRates(cacheKey: string): EasyshipRate[] | null {
    const cachedData = this.ratesCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < this.cacheTimeout)) {
      return cachedData.rates;
    }
    
    return null;
  }

  /**
   * Cache rates for future use
   * @param cacheKey Cache key
   * @param rates Rates to cache
   */
  private cacheRates(cacheKey: string, rates: EasyshipRate[]): void {
    this.ratesCache.set(cacheKey, {
      rates,
      timestamp: Date.now()
    });
  }

  /**
   * Get fallback rates when API call fails
   * @param request Original rate request
   * @returns Fallback shipping rates
   */
  private getFallbackRates(request: EasyshipRateRequest): EasyshipRate[] {
    // Provide fallback rates based on package weight and destination
    const totalWeight = request.packages.reduce((sum, pkg) => {
      // Convert to kg if in lb
      const weight = pkg.weight_unit === 'lb' ? pkg.weight * 0.453592 : pkg.weight;
      return sum + weight;
    }, 0);
    
    const isInternational = request.origin_address.country_alpha2 !== request.destination_address.country_alpha2;
    
    return [
      {
        courier_id: 'fallback-standard',
        courier_name: 'Standard Shipping',
        courier_logo: '',
        total_charge: isInternational ? 15.99 : 5.99,
        min_delivery_time: isInternational ? 7 : 3,
        max_delivery_time: isInternational ? 14 : 7,
        delivery_time_unit: 'days',
        currency: request.output_currency || 'USD',
        service_name: 'Standard',
        service_type: 'standard'
      },
      {
        courier_id: 'fallback-express',
        courier_name: 'Express Shipping',
        courier_logo: '',
        total_charge: isInternational ? 29.99 : 12.99,
        min_delivery_time: isInternational ? 3 : 2,
        max_delivery_time: isInternational ? 5 : 3,
        delivery_time_unit: 'days',
        currency: request.output_currency || 'USD',
        service_name: 'Express',
        service_type: 'express'
      }
    ];
  }
}

// Export a singleton instance
export const easyshipService = new EasyshipService();
