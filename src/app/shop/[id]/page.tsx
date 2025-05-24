import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import ProductDetail from '@/components/shop/ProductDetail';

// Dynamic metadata generation
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const productId = params.id;
  
  // Create Supabase server client
  const supabase = createServerClient();
  
  // Fetch product data
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  // Return 404 if product not found
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    };
  }
  
  // Use SEO metadata if available, otherwise use product name and description
  const title = product.meta_title || `${product.name} | Mirror Exhibit`;
  const description = product.meta_description || product.description?.substring(0, 160) || 'View this exclusive art piece from Mirror Exhibit.';
  const keywords = product.meta_keywords || 'art, gallery, exhibit';
  
  // Construct Open Graph and Twitter card data
  const ogImage = product.image_url || '/assets/default-product.jpg';
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

// Product Page Component (server component)
export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  
  // Create Supabase server client
  const supabase = createServerClient();
  
  // Fetch product data
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, name, price, image_url, category')
    .neq('id', productId)
    .eq('category', product?.category || '')
    .limit(4);
  
  // Return 404 if product not found
  if (!product || error) {
    notFound();
  }
  
  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-12">
      <ProductDetail product={product} relatedProducts={relatedProducts || []} />
    </div>
  );
} 