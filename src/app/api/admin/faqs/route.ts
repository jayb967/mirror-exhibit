// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAccess } from '@/utils/admin-auth';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

// GET - Fetch FAQs (both product and general)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
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
      return NextResponse.json({ faqs: data?.product_faqs || [] });
    } else if (type === 'general') {
      return NextResponse.json({ faqs: data?.general_faqs || [] });
    } else {
      return NextResponse.json({
        product_faqs: data?.product_faqs || [],
        general_faqs: data?.general_faqs || []
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

// POST - Add new FAQ
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Verify admin access
    const authResult = await verifyAdminAccess({
      operation: 'manage FAQs'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const body = await request.json();
    const { type, question, answer } = body;

    if (!type || !question || !answer) {
      return NextResponse.json(
        { error: 'Type, question, and answer are required' },
        { status: 400 }
      );
    }

    if (type !== 'product' && type !== 'general') {
      return NextResponse.json(
        { error: 'Type must be either "product" or "general"' },
        { status: 400 }
      );
    }

    // Get current FAQs
    const { data: currentData, error: fetchError } = await supabase
      .from('site_settings')
      .select('product_faqs, general_faqs')
      .single();

    if (fetchError) {
      console.error('Error fetching current FAQs:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current FAQs' },
        { status: 500 }
      );
    }

    const currentFaqs = type === 'product'
      ? (currentData?.product_faqs || [])
      : (currentData?.general_faqs || []);

    // Generate new ID and sort order
    const newId = Date.now().toString();
    const maxSortOrder = currentFaqs.length > 0
      ? Math.max(...currentFaqs.map((faq: FAQ) => faq.sort_order))
      : 0;

    const newFaq: FAQ = {
      id: newId,
      question,
      answer,
      sort_order: maxSortOrder + 1
    };

    const updatedFaqs = [...currentFaqs, newFaq];

    // Update database
    const updateField = type === 'product' ? 'product_faqs' : 'general_faqs';
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({ [updateField]: updatedFaqs })
      .single();

    if (updateError) {
      console.error('Error updating FAQs:', updateError);
      return NextResponse.json(
        { error: 'Failed to add FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      faq: newFaq,
      message: 'FAQ added successfully'
    });
  } catch (error) {
    console.error('Error in FAQ POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Verify admin access
    const authResult = await verifyAdminAccess({
      operation: 'manage FAQs'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const body = await request.json();
    const { type, id, question, answer } = body;

    if (!type || !id || !question || !answer) {
      return NextResponse.json(
        { error: 'Type, ID, question, and answer are required' },
        { status: 400 }
      );
    }

    if (type !== 'product' && type !== 'general') {
      return NextResponse.json(
        { error: 'Type must be either "product" or "general"' },
        { status: 400 }
      );
    }

    // Get current FAQs
    const { data: currentData, error: fetchError } = await supabase
      .from('site_settings')
      .select('product_faqs, general_faqs')
      .single();

    if (fetchError) {
      console.error('Error fetching current FAQs:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current FAQs' },
        { status: 500 }
      );
    }

    const currentFaqs = type === 'product'
      ? (currentData?.product_faqs || [])
      : (currentData?.general_faqs || []);

    // Find and update the FAQ
    const updatedFaqs = currentFaqs.map((faq: FAQ) =>
      faq.id === id
        ? { ...faq, question, answer }
        : faq
    );

    // Check if FAQ was found
    const faqFound = updatedFaqs.some((faq: FAQ) => faq.id === id);
    if (!faqFound) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Update database
    const updateField = type === 'product' ? 'product_faqs' : 'general_faqs';
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({ [updateField]: updatedFaqs })
      .single();

    if (updateError) {
      console.error('Error updating FAQs:', updateError);
      return NextResponse.json(
        { error: 'Failed to update FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ updated successfully'
    });
  } catch (error) {
    console.error('Error in FAQ PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete FAQ
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Verify admin access
    const authResult = await verifyAdminAccess({
      operation: 'manage FAQs'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    if (type !== 'product' && type !== 'general') {
      return NextResponse.json(
        { error: 'Type must be either "product" or "general"' },
        { status: 400 }
      );
    }

    // Get current FAQs
    const { data: currentData, error: fetchError } = await supabase
      .from('site_settings')
      .select('product_faqs, general_faqs')
      .single();

    if (fetchError) {
      console.error('Error fetching current FAQs:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current FAQs' },
        { status: 500 }
      );
    }

    const currentFaqs = type === 'product'
      ? (currentData?.product_faqs || [])
      : (currentData?.general_faqs || []);

    // Filter out the FAQ to delete
    const updatedFaqs = currentFaqs.filter((faq: FAQ) => faq.id !== id);

    // Check if FAQ was found
    if (updatedFaqs.length === currentFaqs.length) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Update database
    const updateField = type === 'product' ? 'product_faqs' : 'general_faqs';
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({ [updateField]: updatedFaqs })
      .single();

    if (updateError) {
      console.error('Error updating FAQs:', updateError);
      return NextResponse.json(
        { error: 'Failed to delete FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error in FAQ DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
