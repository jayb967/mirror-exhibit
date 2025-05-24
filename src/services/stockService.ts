import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Stock validation service
 * Provides methods for checking product stock availability
 */
class StockService {
  private supabase = createClientComponentClient();

  /**
   * Check if a product has enough stock
   * @param productId Product ID
   * @param requestedQuantity Quantity to check
   * @returns Object with validation result and available stock
   */
  async checkProductStock(productId: string, requestedQuantity: number): Promise<{
    hasStock: boolean;
    availableStock: number;
    errorMessage?: string;
  }> {
    try {
      // Get product stock information
      const { data: product, error } = await this.supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (error || !product) {
        return {
          hasStock: false,
          availableStock: 0,
          errorMessage: 'Product not found'
        };
      }

      // For made-to-order products, stock_quantity might be null or undefined
      // In this case, we assume unlimited stock is available
      const availableStock = product.stock_quantity ?? 999999; // Use nullish coalescing
      const hasStock = availableStock >= requestedQuantity;

      return {
        hasStock,
        availableStock: product.stock_quantity === null || product.stock_quantity === undefined ? 999999 : availableStock,
        errorMessage: hasStock ? undefined : `Only ${availableStock} items available`
      };
    } catch (error) {
      console.error('Error checking product stock:', error);
      return {
        hasStock: false,
        availableStock: 0,
        errorMessage: 'Error checking product stock'
      };
    }
  }

  /**
   * Check if a cart item has enough stock
   * @param productId Product ID
   * @param currentQuantity Current quantity in cart
   * @param additionalQuantity Additional quantity to add (default: 0)
   * @returns Object with validation result and available stock
   */
  async checkCartItemStock(
    productId: string,
    currentQuantity: number,
    additionalQuantity: number = 0
  ): Promise<{
    hasStock: boolean;
    availableStock: number;
    allowedQuantity: number;
    errorMessage?: string;
  }> {
    try {
      const totalRequestedQuantity = currentQuantity + additionalQuantity;
      const { hasStock, availableStock, errorMessage } = await this.checkProductStock(
        productId,
        totalRequestedQuantity
      );

      return {
        hasStock,
        availableStock,
        allowedQuantity: Math.min(totalRequestedQuantity, availableStock),
        errorMessage
      };
    } catch (error) {
      console.error('Error checking cart item stock:', error);
      return {
        hasStock: false,
        availableStock: 0,
        allowedQuantity: 0,
        errorMessage: 'Error checking cart item stock'
      };
    }
  }

  /**
   * Validate cart items against stock levels
   * @param cartItems Array of cart items to validate
   * @returns Object with validation results
   */
  async validateCart(cartItems: Array<{ product_id: string; quantity: number }>): Promise<{
    isValid: boolean;
    invalidItems: Array<{
      product_id: string;
      requestedQuantity: number;
      availableStock: number;
    }>;
    errorMessage?: string;
  }> {
    try {
      if (!cartItems.length) {
        return {
          isValid: true,
          invalidItems: []
        };
      }

      // Get all product IDs from cart
      const productIds = cartItems.map(item => item.product_id);

      // Get stock information for all products in one query
      const { data: products, error } = await this.supabase
        .from('products')
        .select('id, stock_quantity')
        .in('id', productIds);

      if (error) {
        throw error;
      }

      // Check each cart item against stock
      const invalidItems = [];
      for (const item of cartItems) {
        const product = products?.find(p => p.id === item.product_id);
        if (!product) {
          invalidItems.push({
            product_id: item.product_id,
            requestedQuantity: item.quantity,
            availableStock: 0
          });
          continue;
        }

        const availableStock = product.stock_quantity || 0;
        if (availableStock < item.quantity) {
          invalidItems.push({
            product_id: item.product_id,
            requestedQuantity: item.quantity,
            availableStock
          });
        }
      }

      return {
        isValid: invalidItems.length === 0,
        invalidItems,
        errorMessage: invalidItems.length > 0
          ? 'Some items in your cart are no longer available in the requested quantity'
          : undefined
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      return {
        isValid: false,
        invalidItems: [],
        errorMessage: 'Error validating cart'
      };
    }
  }

  /**
   * Update product stock quantity
   * @param productId Product ID
   * @param quantityChange Amount to change stock by (negative for decrease)
   * @returns Success status
   */
  async updateProductStock(productId: string, quantityChange: number): Promise<boolean> {
    try {
      // Get current stock
      const { data: product, error: getError } = await this.supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (getError || !product) {
        console.error('Error getting product stock:', getError);
        return false;
      }

      const currentStock = product.stock_quantity || 0;
      const newStock = currentStock + quantityChange;

      // Prevent negative stock
      if (newStock < 0) {
        console.error('Cannot reduce stock below zero');
        return false;
      }

      // Update stock
      const { error: updateError } = await this.supabase
        .from('products')
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (updateError) {
        console.error('Error updating product stock:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const stockService = new StockService();
