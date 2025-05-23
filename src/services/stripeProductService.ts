import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface ProductSyncData {
  productId: string;
  productVariationId?: string;
  name: string;
  description?: string;
  priceCents: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface StripeProductData {
  id: string;
  stripe_product_id: string;
  stripe_price_id: string;
  product_id: string;
  product_variation_id?: string;
  name: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  sync_status: 'synced' | 'pending' | 'failed' | 'archived';
  last_synced_at: string;
}

class StripeProductService {
  private supabase = createServerSupabaseClient();

  /**
   * Sync a product with Stripe
   */
  async syncProduct(productData: ProductSyncData): Promise<{
    success: boolean;
    stripeProductId?: string;
    stripePriceId?: string;
    error?: string;
  }> {
    try {
      const supabase = await this.supabase;

      // Check if product is already synced
      const existingSync = await this.getExistingSync(productData.productId, productData.productVariationId);

      let stripeProduct: Stripe.Product;
      let stripePrice: Stripe.Price;

      if (existingSync && existingSync.sync_status === 'synced') {
        // Update existing product
        stripeProduct = await stripe.products.update(existingSync.stripe_product_id, {
          name: productData.name,
          description: productData.description,
          metadata: {
            product_id: productData.productId,
            product_variation_id: productData.productVariationId || '',
            ...productData.metadata
          }
        });

        // Check if price needs updating
        if (existingSync.price_cents !== productData.priceCents) {
          // Create new price (Stripe prices are immutable)
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: productData.priceCents,
            currency: productData.currency || 'usd',
            metadata: {
              product_id: productData.productId,
              product_variation_id: productData.productVariationId || ''
            }
          });

          // Archive old price
          await stripe.prices.update(existingSync.stripe_price_id, {
            active: false
          });

          // Record price change
          await this.recordPriceChange(
            existingSync.id,
            productData.productId,
            existingSync.price_cents,
            productData.priceCents,
            existingSync.stripe_price_id,
            stripePrice.id
          );
        } else {
          // Use existing price
          stripePrice = await stripe.prices.retrieve(existingSync.stripe_price_id);
        }
      } else {
        // Create new product
        stripeProduct = await stripe.products.create({
          name: productData.name,
          description: productData.description,
          metadata: {
            product_id: productData.productId,
            product_variation_id: productData.productVariationId || '',
            ...productData.metadata
          }
        });

        // Create price
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: productData.priceCents,
          currency: productData.currency || 'usd',
          metadata: {
            product_id: productData.productId,
            product_variation_id: productData.productVariationId || ''
          }
        });
      }

      // Update or create sync record
      const syncData = {
        product_id: productData.productId,
        product_variation_id: productData.productVariationId,
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        name: productData.name,
        description: productData.description,
        price_cents: productData.priceCents,
        currency: productData.currency || 'usd',
        stripe_metadata: productData.metadata,
        is_active: true,
        sync_status: 'synced' as const,
        last_synced_at: new Date().toISOString(),
        sync_error: null,
        updated_at: new Date().toISOString()
      };

      if (existingSync) {
        await supabase
          .from('stripe_products')
          .update(syncData)
          .eq('id', existingSync.id);
      } else {
        await supabase
          .from('stripe_products')
          .insert(syncData);
      }

      return {
        success: true,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id
      };
    } catch (error: any) {
      console.error('Stripe product sync error:', error);

      // Record sync error
      await this.recordSyncError(productData.productId, productData.productVariationId, error.message);

      return {
        success: false,
        error: error.message || 'Failed to sync product with Stripe'
      };
    }
  }

  /**
   * Sync multiple products in batch
   */
  async syncProducts(products: ProductSyncData[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const product of products) {
      try {
        const result = await this.syncProduct(product);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${product.name}: ${result.error}`);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${product.name}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Get Stripe product data for order items
   */
  async getStripeProductsForOrder(orderItems: Array<{
    product_id: string;
    product_variation_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>): Promise<Array<{
    stripe_product_id?: string;
    stripe_price_id?: string;
    name: string;
    quantity: number;
    unit_amount: number;
  }>> {
    try {
      const supabase = await this.supabase;
      const lineItems = [];

      for (const item of orderItems) {
        // Try to get existing Stripe product
        let stripeProduct = await this.getExistingSync(item.product_id, item.product_variation_id);

        if (!stripeProduct || stripeProduct.sync_status !== 'synced') {
          // Auto-sync product if not synced
          const syncResult = await this.syncProduct({
            productId: item.product_id,
            productVariationId: item.product_variation_id,
            name: item.product_name,
            priceCents: Math.round(item.unit_price * 100),
            currency: 'usd'
          });

          if (syncResult.success) {
            stripeProduct = await this.getExistingSync(item.product_id, item.product_variation_id);
          }
        }

        lineItems.push({
          stripe_product_id: stripeProduct?.stripe_product_id,
          stripe_price_id: stripeProduct?.stripe_price_id,
          name: item.product_name,
          quantity: item.quantity,
          unit_amount: Math.round(item.unit_price * 100)
        });
      }

      return lineItems;
    } catch (error) {
      console.error('Get Stripe products for order error:', error);
      return orderItems.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        unit_amount: Math.round(item.unit_price * 100)
      }));
    }
  }

  /**
   * Archive product in Stripe
   */
  async archiveProduct(productId: string, productVariationId?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const supabase = await this.supabase;
      const existingSync = await this.getExistingSync(productId, productVariationId);

      if (!existingSync) {
        return { success: true }; // Already not synced
      }

      // Archive in Stripe
      await stripe.products.update(existingSync.stripe_product_id, {
        active: false
      });

      // Update sync record
      await supabase
        .from('stripe_products')
        .update({
          is_active: false,
          sync_status: 'archived',
          last_synced_at: new Date().toISOString()
        })
        .eq('id', existingSync.id);

      return { success: true };
    } catch (error: any) {
      console.error('Archive Stripe product error:', error);
      return {
        success: false,
        error: error.message || 'Failed to archive product'
      };
    }
  }

  /**
   * Get sync status for products
   */
  async getSyncStatus(filters: {
    productId?: string;
    syncStatus?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    products: StripeProductData[];
    total: number;
  }> {
    try {
      const supabase = await this.supabase;
      const { productId, syncStatus, limit = 50, offset = 0 } = filters;

      let query = supabase
        .from('stripe_products')
        .select('*', { count: 'exact' })
        .order('last_synced_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      if (syncStatus) {
        query = query.eq('sync_status', syncStatus);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        products: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Get sync status error:', error);
      return {
        products: [],
        total: 0
      };
    }
  }

  /**
   * Get existing sync record
   */
  private async getExistingSync(productId: string, productVariationId?: string): Promise<StripeProductData | null> {
    try {
      const supabase = await this.supabase;

      let query = supabase
        .from('stripe_products')
        .select('*')
        .eq('product_id', productId);

      if (productVariationId) {
        query = query.eq('product_variation_id', productVariationId);
      } else {
        query = query.is('product_variation_id', null);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get existing sync error:', error);
      return null;
    }
  }

  /**
   * Record price change
   */
  private async recordPriceChange(
    stripeProductId: string,
    productId: string,
    oldPriceCents: number,
    newPriceCents: number,
    oldStripePriceId: string,
    newStripePriceId: string,
    changedBy?: string
  ): Promise<void> {
    try {
      const supabase = await this.supabase;

      await supabase
        .from('stripe_price_history')
        .insert({
          stripe_product_id: stripeProductId,
          product_id: productId,
          old_price_cents: oldPriceCents,
          new_price_cents: newPriceCents,
          old_stripe_price_id: oldStripePriceId,
          new_stripe_price_id: newStripePriceId,
          changed_by: changedBy,
          change_reason: 'Product sync update'
        });
    } catch (error) {
      console.error('Record price change error:', error);
    }
  }

  /**
   * Record sync error
   */
  private async recordSyncError(productId: string, productVariationId: string | undefined, errorMessage: string): Promise<void> {
    try {
      const supabase = await this.supabase;

      await supabase
        .from('stripe_products')
        .upsert({
          product_id: productId,
          product_variation_id: productVariationId,
          sync_status: 'failed',
          sync_error: errorMessage,
          last_synced_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Record sync error failed:', error);
    }
  }
}

export const stripeProductService = new StripeProductService();
