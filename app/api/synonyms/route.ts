import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[Synonyms GET] Auth error:', authError);
      // Return empty array for better UX - no scary error messages
      return NextResponse.json([]);
    }

    const { data: synonyms, error } = await supabase
      .from('synonyms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Synonyms GET] Database error:', error);
      // Return empty array instead of error - let the UI show "No synonyms" state
      return NextResponse.json([]);
    }

    return NextResponse.json(synonyms || []);

  } catch (error: any) {
    console.error('[Synonyms GET] Unexpected error:', error);
    // Return empty array for any unexpected errors
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { term, canonical } = body;

    if (!term || !canonical) {
      return NextResponse.json(
        { error: 'Term and canonical are required' },
        { status: 400 }
      );
    }

    const { data: synonym, error } = await supabase
      .from('synonyms')
      .insert({ 
        user_id: user.id,
        term, 
        canonical 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating synonym:', error);
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return NextResponse.json(
          { error: 'A synonym with this term already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message || 'Failed to create synonym', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(synonym, { status: 201 });

  } catch (error: any) {
    console.error('Synonym creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create synonym', details: error },
      { status: 500 }
    );
  }
}

