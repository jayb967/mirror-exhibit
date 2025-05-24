import { CartItem } from './cartService';
import { easyshipService, EasyshipAddress, EasyshipPackage, EasyshipRate } from './easyshipService';
import { createClient } from '@supabase/supabase-js';
import { ENABLE_EASYSHIP_INTEGRATION, ENABLE_FREE_SHIPPING_RULES } from '@/config/featureFlags';

// Shipping option types
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  courier_id?: string;
  courier_name?: string;
  courier_logo?: string;
  service_type?: string;
  // Free shipping display fields
  isFreeShipping?: boolean;
  originalPrice?: number;
}

// Shipping address type
export interface ShippingAddress {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  address2?: string;
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
}

// Package dimensions and weight
export interface PackageDetails {
  weight: number;
  weight_unit: 'kg' | 'lb';
  length: number;
  width: number;
  height: number;
  dimension_unit: 'cm' | 'in';
}

/**
 * Shipping Service
 * Calculates shipping costs and provides shipping options
 * Integrates with Easyship for dynamic shipping rates
 */
class ShippingService {
  // Standard shipping options (fallback when Easyship is unavailable)
  private standardOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivery in 5-7 business days',
      price: 5.99,
      estimatedDays: '5-7',
      service_type: 'standard'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivery in 2-3 business days',
      price: 12.99,
      estimatedDays: '2-3',
      service_type: 'express'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Delivery next business day',
      price: 24.99,
      estimatedDays: '1',
      service_type: 'overnight'
    }
  ];

  // Default package details (used when product doesn't have dimensions/weight)
  private defaultPackage: PackageDetails = {
    weight: 2,
    weight_unit: 'lb',
    length: 12,
    width: 12,
    height: 4,
    dimension_unit: 'in'
  };

  // Store address (origin for shipping)
  private storeAddress: EasyshipAddress = {
    line_1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country_alpha2: 'US',
    contact_name: 'Mirror Exhibit',
    phone_number: '555-123-4567'
  };

  // Free shipping threshold
  private freeShippingThreshold = 100;

  // Flag to use Easyship API (controlled by feature flag)
  private useEasyship = ENABLE_EASYSHIP_INTEGRATION;

  /**
   * Calculate shipping cost based on cart items and shipping option
   * @param cartItems Cart items
   * @param shippingOptionId Selected shipping option ID
   * @param address Shipping address
   * @returns Shipping cost
   */
  async calculateShippingCost(
    cartItems: CartItem[],
    shippingOptionId: string = 'standard',
    address?: ShippingAddress
  ): Promise<number> {
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Check if eligible for free shipping based on rules
    const isEligible = await this.checkFreeShippingEligibility(subtotal, cartItems, address);
    if (isEligible && this.isStandardShipping(shippingOptionId)) {
      return 0;
    }

    // If no address provided, use fallback options
    if (!address || !this.isValidAddress(address)) {
      const fallbackOption = this.standardOptions.find(option => option.id === shippingOptionId);
      return fallbackOption?.price || this.standardOptions[0].price;
    }

    try {
      // Get shipping options from Easyship or fallback
      const options = await this.getShippingOptions(address, cartItems);

      // Find selected option
      const selectedOption = options.find(option =>
        option.id === shippingOptionId || option.courier_id === shippingOptionId
      );

      // Return price or default to standard
      return selectedOption?.price || options[0]?.price || this.standardOptions[0].price;
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      // Fallback to standard options
      const fallbackOption = this.standardOptions.find(option => option.id === shippingOptionId);
      return fallbackOption?.price || this.standardOptions[0].price;
    }
  }

  /**
   * Get available shipping options based on shipping address and cart items
   * @param address Shipping address
   * @param cartItems Cart items (optional)
   * @returns Array of shipping options
   */
  async getShippingOptions(
    address?: ShippingAddress,
    cartItems?: CartItem[]
  ): Promise<ShippingOption[]> {
    // If no address or invalid address, return empty array
    if (!address || !this.isValidAddress(address)) {
      console.log('Invalid address provided for shipping options');
      return [];
    }

    // If Easyship integration is disabled, return empty array
    if (!this.useEasyship || !process.env.EASYSHIP_API_KEY) {
      console.log('Easyship integration disabled or API key missing');
      return [];
    }

    try {
      // Convert address to Easyship format
      const destinationAddress = this.convertToEasyshipAddress(address);
      console.log('Converted address for Easyship:', destinationAddress);

      // Get package details from cart items
      const packages = this.getPackagesFromCart(cartItems);
      console.log('Package details for Easyship:', packages);

      // Get origin address from admin settings
      const originAddress = await this.getOriginAddressFromSettings();
      console.log('Origin address for Easyship:', originAddress);

      // Get rates from Easyship
      const rates = await easyshipService.getRates({
        origin_address: originAddress,
        destination_address: destinationAddress,
        packages: packages,
        output_currency: 'USD'
      });

      console.log('Received rates from Easyship:', rates);

      // Convert Easyship rates to shipping options
      const options = this.convertRatesToOptions(rates);

      // Apply free shipping if eligible
      const subtotal = cartItems?.reduce((sum, item) => {
        return sum + (item.price || item.product?.price || 0) * item.quantity;
      }, 0) || 0;

      const isEligible = await this.isEligibleForFreeShipping(subtotal, cartItems, address);

      if (isEligible) {
        // Mark standard shipping as free but still show all options
        options.forEach(option => {
          if (this.isStandardShipping(option.id) || option.service_type === 'standard') {
            option.originalPrice = option.price;
            option.price = 0;
            option.isFreeShipping = true;
          }
        });
      }

      return options;
    } catch (error) {
      console.error('Error getting shipping options from Easyship:', error);
      // Return empty array instead of fallback options
      return [];
    }
  }

  /**
   * Synchronous wrapper for getShippingOptions for backward compatibility
   * @param address Shipping address
   * @returns Array of shipping options
   * @deprecated Use async getShippingOptions instead
   */
  getShippingOptionsSync(address?: ShippingAddress): ShippingOption[] {
    if (!address || !this.isValidAddress(address)) {
      return this.standardOptions;
    }
    return this.getFallbackShippingOptions(address);
  }

  /**
   * Synchronous wrapper for calculateShippingCost for backward compatibility
   * @param cartItems Cart items
   * @param shippingOptionId Selected shipping option ID
   * @param address Shipping address
   * @returns Shipping cost
   * @deprecated Use async calculateShippingCost instead
   */
  calculateShippingCostSync(
    cartItems: CartItem[],
    shippingOptionId: string = 'standard',
    address?: ShippingAddress
  ): number {
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Check if eligible for free shipping based on threshold only
    if (subtotal >= this.freeShippingThreshold && this.isStandardShipping(shippingOptionId)) {
      return 0;
    }

    // If no address provided, use fallback options
    if (!address || !this.isValidAddress(address)) {
      const fallbackOption = this.standardOptions.find(option => option.id === shippingOptionId);
      return fallbackOption?.price || this.standardOptions[0].price;
    }

    // Use fallback options
    const options = this.getFallbackShippingOptions(address);
    const selectedOption = options.find(option => option.id === shippingOptionId);
    return selectedOption?.price || options[0].price;
  }

  /**
   * Convert Easyship rates to shipping options
   * @param rates Easyship rates
   * @returns Shipping options
   */
  private convertRatesToOptions(rates: EasyshipRate[]): ShippingOption[] {
    return rates.map(rate => ({
      id: rate.courier_id,
      name: rate.courier_name,
      description: `${rate.service_name} - Delivery in ${rate.min_delivery_time}-${rate.max_delivery_time} ${rate.delivery_time_unit}`,
      price: rate.total_charge,
      estimatedDays: `${rate.min_delivery_time}-${rate.max_delivery_time}`,
      courier_id: rate.courier_id,
      courier_name: rate.courier_name,
      courier_logo: rate.courier_logo,
      service_type: rate.service_type
    }));
  }

  /**
   * Get fallback shipping options when Easyship is unavailable
   * @param address Shipping address
   * @returns Array of shipping options
   */
  private getFallbackShippingOptions(address: ShippingAddress): ShippingOption[] {
    // Clone standard options
    const options = [...this.standardOptions];

    // Adjust options based on country
    switch (address.country) {
      case 'US':
        // No changes for US
        break;
      case 'CA':
        // Higher prices for Canada
        options.forEach(option => {
          option.price = option.price * 1.2;
          option.estimatedDays = `${parseInt(option.estimatedDays.split('-')[0]) + 2}-${
            parseInt(option.estimatedDays.split('-')[1] || option.estimatedDays) + 2
          }`;
        });
        break;
      default:
        // International shipping
        options.forEach(option => {
          option.price = option.price * 1.5;
          option.estimatedDays = `${parseInt(option.estimatedDays.split('-')[0]) + 5}-${
            parseInt(option.estimatedDays.split('-')[1] || option.estimatedDays) + 5
          }`;
        });

        // Remove overnight option for international
        return options.filter(option => option.id !== 'overnight');
    }

    return options;
  }

  /**
   * Convert shipping address to Easyship format
   * @param address Shipping address
   * @returns Easyship address
   */
  private convertToEasyshipAddress(address: ShippingAddress): EasyshipAddress {
    return {
      line_1: address.address || '',
      line_2: address.address2 || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postalCode || '',
      country_alpha2: this.getCountryCode(address.country),
      contact_name: address.name || 'Customer',
      company_name: address.company || '',
      phone_number: address.phone || '555-555-5555',
      email: address.email || ''
    };
  }

  /**
   * Get country code (ISO 3166-1 alpha-2)
   * @param country Country name or code
   * @returns Two-letter country code
   */
  private getCountryCode(country: string): string {
    // If already a 2-letter code, return as is
    if (country.length === 2) {
      return country.toUpperCase();
    }

    // Map common country names to codes
    const countryMap: Record<string, string> = {
      'united states': 'US',
      'usa': 'US',
      'canada': 'CA',
      'united kingdom': 'GB',
      'uk': 'GB',
      'australia': 'AU'
    };

    return countryMap[country.toLowerCase()] || 'US';
  }

  /**
   * Get package details from cart items
   * @param cartItems Cart items
   * @returns Array of package details for Easyship
   */
  private getPackagesFromCart(cartItems?: CartItem[]): EasyshipPackage[] {
    if (!cartItems || cartItems.length === 0) {
      // Return default package if no items
      return [{
        width: this.defaultPackage.width,
        height: this.defaultPackage.height,
        length: this.defaultPackage.length,
        weight: this.defaultPackage.weight,
        weight_unit: this.defaultPackage.weight_unit,
        dimension_unit: this.defaultPackage.dimension_unit,
        value_amount: 0,
        value_currency: 'USD'
      }];
    }

    // Calculate total value
    const totalValue = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    // For now, we'll use a single package for all items
    // In a real implementation, you might want to split items into multiple packages
    return [{
      width: this.defaultPackage.width,
      height: this.defaultPackage.height,
      length: this.defaultPackage.length,
      weight: this.calculateTotalWeight(cartItems),
      weight_unit: this.defaultPackage.weight_unit,
      dimension_unit: this.defaultPackage.dimension_unit,
      value_amount: totalValue,
      value_currency: 'USD'
    }];
  }

  /**
   * Calculate total weight of cart items
   * @param cartItems Cart items
   * @returns Total weight
   */
  private calculateTotalWeight(cartItems: CartItem[]): number {
    // In a real implementation, you would get weight from product data
    // For now, we'll estimate based on quantity
    const estimatedWeight = cartItems.reduce((sum, item) => {
      // Assume each item weighs 1 lb by default
      return sum + (item.quantity || 1);
    }, 0);

    // Ensure minimum weight
    return Math.max(estimatedWeight, 0.1);
  }

  /**
   * Check if an address is valid for shipping calculations
   * @param address Shipping address
   * @returns Boolean indicating if address is valid
   */
  private isValidAddress(address: ShippingAddress): boolean {
    return !!(
      address &&
      address.country &&
      address.postalCode
    );
  }

  /**
   * Check if a shipping option is standard shipping
   * @param shippingOptionId Shipping option ID
   * @returns Boolean indicating if it's standard shipping
   */
  private isStandardShipping(shippingOptionId: string): boolean {
    // Check if it's our standard shipping ID or contains 'standard' in the ID
    return shippingOptionId === 'standard' ||
           shippingOptionId.toLowerCase().includes('standard');
  }

  /**
   * Check if order is eligible for free shipping based on rules
   * @param subtotal Order subtotal
   * @param cartItems Cart items
   * @param address Shipping address
   * @returns Boolean indicating if eligible for free shipping
   */
  private async checkFreeShippingEligibility(
    subtotal: number,
    cartItems?: CartItem[],
    address?: ShippingAddress
  ): Promise<boolean> {
    try {
      // If no cart items or address, just check against the default threshold
      if (!cartItems || cartItems.length === 0 || !address) {
        return subtotal >= this.freeShippingThreshold;
      }

      // Get free shipping threshold from admin settings
      const threshold = await this.getFreeShippingThresholdFromSettings();
      return subtotal >= threshold;
    } catch (error) {
      console.error('Error checking free shipping eligibility:', error);
      // Fallback to default threshold
      return subtotal >= this.freeShippingThreshold;
    }
  }

  /**
   * Process shipping rules to determine free shipping eligibility
   * @param rules Shipping rules from database
   * @param subtotal Order subtotal
   * @param cartItems Cart items
   * @param address Shipping address
   * @returns Boolean indicating if eligible for free shipping
   */
  private processShippingRules(
    rules: any[],
    subtotal: number,
    cartItems?: CartItem[],
    address?: ShippingAddress
  ): boolean {
    // Check country-specific rules first
    const countryCode = address ? this.getCountryCode(address.country) : 'US';

    // Check each rule in order of priority
    for (const rule of rules) {
      // Skip rules that don't apply to this country
      if (rule.country_codes && rule.country_codes.length > 0) {
        if (!rule.country_codes.includes(countryCode)) {
          continue;
        }
      }

      // Check rule type
      switch (rule.rule_type) {
        case 'threshold':
          // Check if subtotal meets the threshold
          if (subtotal >= rule.threshold_amount) {
            return true;
          }
          break;

        case 'category_specific':
          // Check if any items in the cart belong to the specified category
          if (rule.category_id && cartItems && cartItems.some(item =>
            item.product?.category_id === rule.category_id &&
            (item.product?.price || 0) * item.quantity >= rule.threshold_amount
          )) {
            return true;
          }
          break;

        case 'product_specific':
          // Check if the specified product is in the cart
          if (rule.product_id && cartItems && cartItems.some(item =>
            item.product_id === rule.product_id
          )) {
            return true;
          }
          break;

        default:
          break;
      }
    }

    // If no rules matched, check against the default threshold
    return subtotal >= this.freeShippingThreshold;
  }

  /**
   * Get free shipping threshold from admin settings
   * @returns Free shipping threshold amount
   */
  private async getFreeShippingThresholdFromSettings(): Promise<number> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('free_shipping_threshold')
        .single();

      if (error || !settings) {
        console.log('No admin settings found, using default threshold');
        return this.freeShippingThreshold;
      }

      return settings.free_shipping_threshold || this.freeShippingThreshold;
    } catch (error) {
      console.log('Error fetching admin settings, using default threshold:', error);
      return this.freeShippingThreshold;
    }
  }

  /**
   * Get origin address from admin settings
   * @returns Origin address for shipping
   */
  private async getOriginAddressFromSettings(): Promise<EasyshipAddress> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('origin_address')
        .single();

      if (error || !settings || !settings.origin_address) {
        console.log('No origin address found in admin settings, using default');
        return this.storeAddress;
      }

      const originAddress = settings.origin_address;
      return {
        line_1: originAddress.address || this.storeAddress.line_1,
        line_2: originAddress.address2 || '',
        city: originAddress.city || this.storeAddress.city,
        state: originAddress.state || this.storeAddress.state,
        postal_code: originAddress.postalCode || this.storeAddress.postal_code,
        country_alpha2: this.getCountryCode(originAddress.country || 'US'),
        contact_name: originAddress.name || this.storeAddress.contact_name,
        company_name: originAddress.company || 'Mirror Exhibit',
        phone_number: originAddress.phone || this.storeAddress.phone_number,
        email: originAddress.email || ''
      };
    } catch (error) {
      console.log('Error fetching origin address from admin settings, using default:', error);
      return this.storeAddress;
    }
  }

  /**
   * Check if order is eligible for free shipping
   * @param subtotal Order subtotal
   * @param cartItems Optional cart items for product-specific rules
   * @param address Optional shipping address for location-specific rules
   * @returns Boolean indicating if eligible for free shipping
   */
  async isEligibleForFreeShipping(
    subtotal: number,
    cartItems?: CartItem[],
    address?: ShippingAddress
  ): Promise<boolean> {
    return this.checkFreeShippingEligibility(subtotal, cartItems, address);
  }

  /**
   * Get free shipping threshold
   * @param countryCode Optional country code for location-specific thresholds
   * @returns Free shipping threshold amount
   */
  async getFreeShippingThreshold(countryCode?: string): Promise<number> {
    try {
      // Use admin settings for free shipping threshold
      return await this.getFreeShippingThresholdFromSettings();
    } catch (error) {
      console.error('Error getting free shipping threshold:', error);
      // Fallback to default threshold
      return this.freeShippingThreshold;
    }
  }

  /**
   * Process threshold rules to find the appropriate threshold
   * @param rules Threshold rules from database
   * @param countryCode Country code
   * @returns Threshold amount
   */
  private processThresholdRules(rules: any[], countryCode: string): number {
    // Find country-specific rule
    const countryRule = rules.find(rule =>
      rule.country_codes &&
      rule.country_codes.includes(countryCode)
    );

    // Find global rule (no country restriction)
    const globalRule = rules.find(rule =>
      !rule.country_codes ||
      rule.country_codes.length === 0
    );

    // Return threshold from country-specific rule, global rule, or default
    if (countryRule && countryRule.threshold_amount) {
      return countryRule.threshold_amount;
    } else if (globalRule && globalRule.threshold_amount) {
      return globalRule.threshold_amount;
    } else {
      return this.freeShippingThreshold;
    }
  }

  /**
   * Get remaining amount needed for free shipping
   * @param subtotal Order subtotal
   * @param countryCode Optional country code for location-specific thresholds
   * @param cartItems Optional cart items for product-specific rules
   * @returns Amount needed for free shipping or 0 if already eligible
   */
  async getRemainingForFreeShipping(
    subtotal: number,
    countryCode?: string,
    cartItems?: CartItem[]
  ): Promise<number> {
    // Check if already eligible for free shipping
    if (cartItems && cartItems.length > 0) {
      const isEligible = await this.isEligibleForFreeShipping(
        subtotal,
        cartItems,
        countryCode ? { country: countryCode } : undefined
      );

      if (isEligible) {
        return 0;
      }
    }

    // Get threshold and calculate remaining amount
    const threshold = await this.getFreeShippingThreshold(countryCode);
    const remaining = threshold - subtotal;
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Create a shipment in Easyship
   * @param orderId Order ID
   * @param destinationAddress Destination address
   * @param packages Package details
   * @param selectedCourierId Selected courier ID
   * @returns Shipment details
   */
  async createShipment(
    orderId: string,
    destinationAddress: ShippingAddress,
    packages: PackageDetails[],
    selectedCourierId: string
  ): Promise<{
    shipmentId: string;
    trackingNumber: string;
    labelUrl: string;
    status: string;
  }> {
    try {
      // Convert address to Easyship format
      const easyshipAddress = this.convertToEasyshipAddress(destinationAddress);

      // Convert packages to Easyship format
      const easyshipPackages = packages.map(pkg => ({
        width: pkg.width,
        height: pkg.height,
        length: pkg.length,
        weight: pkg.weight,
        weight_unit: pkg.weight_unit,
        dimension_unit: pkg.dimension_unit,
        value_amount: 100, // Default value
        value_currency: 'USD'
      }));

      // Get origin address from settings
      const originAddress = await this.getOriginAddressFromSettings();

      // Create shipment in Easyship
      const shipment = await easyshipService.createShipment({
        origin_address: originAddress,
        destination_address: easyshipAddress,
        packages: easyshipPackages,
        selected_courier_id: selectedCourierId,
        output_currency: 'USD',
        reference_id: orderId
      });

      return {
        shipmentId: shipment.shipment_id,
        trackingNumber: shipment.tracking_number,
        labelUrl: shipment.label_url,
        status: shipment.status
      };
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw new Error('Failed to create shipment');
    }
  }

  /**
   * Track a shipment
   * @param trackingNumber Tracking number
   * @returns Tracking information
   */
  async trackShipment(trackingNumber: string): Promise<{
    status: string;
    estimatedDeliveryDate?: string;
    events: { date: string; location: string; message: string; status: string }[];
  }> {
    try {
      const tracking = await easyshipService.trackShipment(trackingNumber);

      return {
        status: tracking.status,
        estimatedDeliveryDate: tracking.estimated_delivery_date,
        events: tracking.tracking_events
      };
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }

  /**
   * Validate a shipping address
   * @param address Address to validate
   * @returns Validated address or error
   */
  async validateAddress(address: ShippingAddress): Promise<ShippingAddress> {
    try {
      // Convert to Easyship format
      const easyshipAddress = this.convertToEasyshipAddress(address);

      // Validate with Easyship
      const validatedAddress = await easyshipService.validateAddress(easyshipAddress);

      // Convert back to our format
      return {
        address: validatedAddress.line_1,
        address2: validatedAddress.line_2,
        city: validatedAddress.city,
        state: validatedAddress.state,
        postalCode: validatedAddress.postal_code,
        country: validatedAddress.country_alpha2,
        name: validatedAddress.contact_name,
        company: validatedAddress.company_name,
        phone: validatedAddress.phone_number,
        email: validatedAddress.email
      };
    } catch (error) {
      console.error('Error validating address:', error);
      // Return original address if validation fails
      return address;
    }
  }
}

// Export a singleton instance
export const shippingService = new ShippingService();
