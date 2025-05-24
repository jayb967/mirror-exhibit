# Enhanced Checkout Implementation

This document describes the enhanced checkout implementation for the Mirror Exhibit e-commerce application.

## Overview

The enhanced checkout implementation provides a comprehensive checkout experience with the following features:

1. Guest checkout support
2. Cart validation against stock levels
3. Dynamic shipping options and cost calculation
4. Location-based tax calculation
5. Order summary with detailed breakdown
6. Free shipping threshold promotion

## Components

### 1. Stock Validation

The checkout process validates cart items against current stock levels:

- Uses the `CartValidation` component to check stock before proceeding
- Provides options to update quantities or remove items if stock is insufficient
- Prevents checkout if any items are out of stock

### 2. Shipping Calculation

Dynamic shipping options and costs based on:

- Customer location (country, state)
- Order subtotal (free shipping threshold)
- Selected shipping method (standard, express, overnight)

The `shippingService` provides:

- `calculateShippingCost()`: Calculates shipping cost based on cart items and shipping option
- `getShippingOptions()`: Gets available shipping options based on shipping address
- `isEligibleForFreeShipping()`: Checks if order is eligible for free shipping
- `getRemainingForFreeShipping()`: Gets remaining amount needed for free shipping

### 3. Tax Calculation

Location-based tax calculation:

- US state-specific sales tax rates
- International VAT/GST rates
- Tax exemptions for certain locations

The `taxService` provides:

- `calculateTax()`: Calculates tax amount based on cart items and address
- `getTaxRate()`: Gets tax rate based on address
- `getTaxBreakdown()`: Gets tax breakdown with description for display
- `isTaxExempt()`: Checks if address is tax exempt

### 4. Order Summary

Enhanced order summary with:

- Detailed item list with images and quantities
- Subtotal, shipping, tax, and discount breakdown
- Dynamic total calculation
- Collapsible details for better mobile experience

## Implementation Details

### Checkout Flow

1. User adds items to cart
2. User proceeds to checkout
3. System validates cart items against stock levels
4. User chooses to sign in or continue as guest
5. User enters shipping and payment information
6. System calculates shipping options and costs based on location
7. System calculates tax based on location
8. User selects shipping method
9. User reviews order summary
10. User completes checkout
11. Order is created in database
12. User is redirected to Stripe for payment

### Database Schema

The implementation uses the following database tables:

- `orders`: Stores order information including shipping, tax, and discount
- `order_items`: Stores items in each order
- `products`: Stores product information including stock quantity
- `guest_users`: Stores guest user information

### API Integration

The checkout process integrates with:

- Stripe API for payment processing
- Supabase for database operations
- Internal services for shipping and tax calculation

## Usage

### Shipping Options

The checkout page displays shipping options based on the customer's location:

```tsx
<div className="tw-space-y-4">
  {shippingOptions.map((option) => (
    <div key={option.id} className="tw-flex tw-items-center">
      <input
        type="radio"
        id={`shipping-${option.id}`}
        name="shippingOption"
        value={option.id}
        checked={selectedShippingOption === option.id}
        onChange={() => handleShippingOptionChange(option.id)}
        className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300"
      />
      <label htmlFor={`shipping-${option.id}`} className="tw-ml-3 tw-flex tw-flex-col">
        <span className="tw-text-sm tw-font-medium tw-text-gray-900">
          {option.name}
          {option.id === 'standard' && shippingService.isEligibleForFreeShipping(subtotal) && (
            <span className="tw-ml-2 tw-text-green-600">(Free)</span>
          )}
        </span>
        <span className="tw-text-sm tw-text-gray-500">{option.description}</span>
      </label>
      <span className="tw-ml-auto tw-font-medium">
        {option.id === 'standard' && shippingService.isEligibleForFreeShipping(subtotal)
          ? 'Free'
          : `$${option.price.toFixed(2)}`}
      </span>
    </div>
  ))}
</div>
```

### Tax Calculation

The checkout page calculates tax based on the customer's location:

```tsx
// Calculate tax when address or cart changes
useEffect(() => {
  // Create tax address from form data
  const taxAddress: TaxAddress = {
    country: formData.country,
    state: formData.state,
    city: formData.city,
    postalCode: formData.postalCode
  };
  
  // Calculate tax
  const breakdown = taxService.getTaxBreakdown(cartItems, taxAddress);
  setTaxBreakdown(breakdown);
}, [formData.country, formData.state, formData.city, formData.postalCode, cartItems]);
```

### Order Creation

The checkout process creates an order with detailed information:

```tsx
// Create order in the database
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: user?.id || null,
    guest_token: !user ? guestToken : null,
    status: 'pending',
    subtotal,
    tax: taxBreakdown.taxAmount,
    shipping: shippingCost,
    discount,
    total: subtotal + taxBreakdown.taxAmount + shippingCost - discount,
    shipping_address: {
      first_name: formData.firstName,
      last_name: formData.lastName,
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      email: formData.email
    },
    shipping_method: selectedShippingOption,
    tax_rate: taxBreakdown.taxRate,
    tax_description: taxBreakdown.taxDescription,
    payment_method: paymentMethod
  })
  .select('id')
  .single();
```

## Future Improvements

- Add coupon code support
- Implement address validation
- Add saved addresses for registered users
- Implement real-time shipping rate calculation with carrier APIs
- Add order tracking integration
- Implement abandoned cart recovery
- Add gift options and gift messages
