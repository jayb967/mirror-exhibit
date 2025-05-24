import { CartItem } from './cartService';

// Tax rates by state (US)
const US_TAX_RATES: Record<string, number> = {
  'AL': 0.04,
  'AK': 0.00,
  'AZ': 0.056,
  'AR': 0.065,
  'CA': 0.0725,
  'CO': 0.029,
  'CT': 0.0635,
  'DE': 0.00,
  'FL': 0.06,
  'GA': 0.04,
  'HI': 0.04,
  'ID': 0.06,
  'IL': 0.0625,
  'IN': 0.07,
  'IA': 0.06,
  'KS': 0.065,
  'KY': 0.06,
  'LA': 0.0445,
  'ME': 0.055,
  'MD': 0.06,
  'MA': 0.0625,
  'MI': 0.06,
  'MN': 0.06875,
  'MS': 0.07,
  'MO': 0.04225,
  'MT': 0.00,
  'NE': 0.055,
  'NV': 0.0685,
  'NH': 0.00,
  'NJ': 0.06625,
  'NM': 0.05125,
  'NY': 0.04,
  'NC': 0.0475,
  'ND': 0.05,
  'OH': 0.0575,
  'OK': 0.045,
  'OR': 0.00,
  'PA': 0.06,
  'RI': 0.07,
  'SC': 0.06,
  'SD': 0.045,
  'TN': 0.07,
  'TX': 0.0625,
  'UT': 0.0595,
  'VT': 0.06,
  'VA': 0.053,
  'WA': 0.065,
  'WV': 0.06,
  'WI': 0.05,
  'WY': 0.04,
  'DC': 0.06
};

// Tax rates by country
const COUNTRY_TAX_RATES: Record<string, number> = {
  'US': 0.00, // Handled by state
  'CA': 0.05, // GST
  'GB': 0.20, // VAT
  'AU': 0.10, // GST
  'DE': 0.19, // VAT
  'FR': 0.20, // VAT
  'JP': 0.10, // Consumption tax
};

// Default tax rate
const DEFAULT_TAX_RATE = 0.10;

// Tax address type
export interface TaxAddress {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
}

/**
 * Tax Service
 * Calculates taxes based on location and order amount
 */
class TaxService {
  /**
   * Calculate tax amount based on cart items and address
   * @param cartItems Cart items
   * @param address Tax address
   * @returns Tax amount
   */
  calculateTax(cartItems: CartItem[], address?: TaxAddress): number {
    // Calculate taxable amount (subtotal)
    const taxableAmount = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Get tax rate based on address
    const taxRate = this.getTaxRate(address);

    // Calculate tax amount
    return taxableAmount * taxRate;
  }

  /**
   * Get tax rate based on address
   * @param address Tax address
   * @returns Tax rate (decimal)
   */
  getTaxRate(address?: TaxAddress): number {
    // If no address provided, use default tax rate
    if (!address || !address.country) {
      return DEFAULT_TAX_RATE;
    }

    // Get country tax rate
    const countryRate = COUNTRY_TAX_RATES[address.country] || DEFAULT_TAX_RATE;

    // For US, use state tax rate if available
    if (address.country === 'US' && address.state) {
      const stateCode = address.state.toUpperCase();
      return US_TAX_RATES[stateCode] !== undefined ? US_TAX_RATES[stateCode] : DEFAULT_TAX_RATE;
    }

    return countryRate;
  }

  /**
   * Get tax breakdown (for display purposes)
   * @param cartItems Cart items
   * @param address Tax address
   * @returns Tax breakdown object
   */
  getTaxBreakdown(cartItems: CartItem[], address?: TaxAddress): {
    taxRate: number;
    taxAmount: number;
    taxDescription: string;
  } {
    const taxRate = this.getTaxRate(address);
    const taxAmount = this.calculateTax(cartItems, address);
    
    let taxDescription = 'Tax';
    
    if (address) {
      if (address.country === 'US' && address.state) {
        taxDescription = `${address.state} Sales Tax (${(taxRate * 100).toFixed(2)}%)`;
      } else if (address.country === 'CA') {
        taxDescription = 'GST/HST (5%)';
      } else if (address.country === 'GB' || address.country === 'DE' || address.country === 'FR') {
        taxDescription = `VAT (${(taxRate * 100).toFixed(0)}%)`;
      } else if (address.country === 'AU') {
        taxDescription = 'GST (10%)';
      } else if (address.country === 'JP') {
        taxDescription = 'Consumption Tax (10%)';
      } else {
        taxDescription = `Tax (${(taxRate * 100).toFixed(0)}%)`;
      }
    }
    
    return {
      taxRate,
      taxAmount,
      taxDescription
    };
  }

  /**
   * Check if address is tax exempt
   * @param address Tax address
   * @returns Boolean indicating if address is tax exempt
   */
  isTaxExempt(address?: TaxAddress): boolean {
    if (!address || !address.country) {
      return false;
    }

    // Check for tax-exempt states in the US
    if (address.country === 'US' && address.state) {
      const stateCode = address.state.toUpperCase();
      return US_TAX_RATES[stateCode] === 0;
    }

    // Check for tax-exempt countries
    return COUNTRY_TAX_RATES[address.country] === 0;
  }
}

// Export a singleton instance
export const taxService = new TaxService();
