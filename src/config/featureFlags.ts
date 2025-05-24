/**
 * Feature Flags Configuration
 * 
 * This file contains feature flags for enabling/disabling features
 * and managing phased rollouts of new functionality.
 */

// Feature flag for Easyship integration
export const ENABLE_EASYSHIP_INTEGRATION = true;

// Feature flag for enhanced checkout experience
export const ENABLE_ENHANCED_CHECKOUT = true;

// Feature flag for coupon system
export const ENABLE_COUPONS = true;

// Feature flag for free shipping threshold rules
export const ENABLE_FREE_SHIPPING_RULES = true;

// Feature flag for saved addresses
export const ENABLE_SAVED_ADDRESSES = true;

// Feature flag for saved payment methods
export const ENABLE_SAVED_PAYMENT_METHODS = true;

// Feature flag for digital wallet payments
export const ENABLE_DIGITAL_WALLET = true;

// Feature flag for address validation
export const ENABLE_ADDRESS_VALIDATION = true;

/**
 * Get feature flag value
 * @param flagName Feature flag name
 * @param defaultValue Default value if flag is not found
 * @returns Feature flag value
 */
export function getFeatureFlag(flagName: string, defaultValue: boolean = false): boolean {
  // Check if flag exists in this module
  const flag = (exports as Record<string, any>)[flagName];
  
  // Return flag value or default
  return typeof flag === 'boolean' ? flag : defaultValue;
}

/**
 * Check if a feature is enabled
 * @param featureName Feature name
 * @returns Boolean indicating if feature is enabled
 */
export function isFeatureEnabled(featureName: string): boolean {
  return getFeatureFlag(`ENABLE_${featureName.toUpperCase()}`, false);
}

/**
 * Feature flag groups for related features
 */
export const FEATURE_GROUPS = {
  SHIPPING: [
    'EASYSHIP_INTEGRATION',
    'FREE_SHIPPING_RULES',
    'ADDRESS_VALIDATION'
  ],
  CHECKOUT: [
    'ENHANCED_CHECKOUT',
    'SAVED_ADDRESSES',
    'SAVED_PAYMENT_METHODS',
    'DIGITAL_WALLET'
  ],
  DISCOUNTS: [
    'COUPONS',
    'FREE_SHIPPING_RULES'
  ]
};

/**
 * Check if all features in a group are enabled
 * @param groupName Group name
 * @returns Boolean indicating if all features in the group are enabled
 */
export function isFeatureGroupEnabled(groupName: string): boolean {
  const group = FEATURE_GROUPS[groupName as keyof typeof FEATURE_GROUPS];
  
  if (!group) {
    return false;
  }
  
  return group.every(feature => isFeatureEnabled(feature));
}
