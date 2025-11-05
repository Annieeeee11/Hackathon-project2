import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
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
      .update({ term, canonical })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating synonym:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update synonym' },
        { status: 500 }
      );
    }

    if (!synonym) {
      return NextResponse.json(
        { error: 'Synonym not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(synonym);

  } catch (error) {
    console.error('Synonym update error:', error);
    return NextResponse.json(
      { error: 'Failed to update synonym' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from('synonyms')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting synonym:', error);
      return NextResponse.json(
        { error: 'Failed to delete synonym' },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Synonym deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete synonym' },
      { status: 500 }
    );
  }
}

