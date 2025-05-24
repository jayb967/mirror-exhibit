import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Fetch FAQs for public use (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'product' or 'general'

    const { data, error } = await supabase
      .from('site_settings')
      .select('product_faqs, general_faqs')
      .single();

    if (error) {
      console.error('Error fetching FAQs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500 }
      );
    }

    if (type === 'product') {
      const faqs = data?.product_faqs || [];
      // Sort by sort_order
      const sortedFaqs = faqs.sort((a: any, b: any) => a.sort_order - b.sort_order);
      return NextResponse.json({ faqs: sortedFaqs });
    } else if (type === 'general') {
      const faqs = data?.general_faqs || [];
      // Sort by sort_order
      const sortedFaqs = faqs.sort((a: any, b: any) => a.sort_order - b.sort_order);
      return NextResponse.json({ faqs: sortedFaqs });
    } else {
      // Return both types
      const productFaqs = data?.product_faqs || [];
      const generalFaqs = data?.general_faqs || [];

      return NextResponse.json({
        product_faqs: productFaqs.sort((a: any, b: any) => a.sort_order - b.sort_order),
        general_faqs: generalFaqs.sort((a: any, b: any) => a.sort_order - b.sort_order)
      });
    }
  } catch (error) {
    console.error('Error in FAQ GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
