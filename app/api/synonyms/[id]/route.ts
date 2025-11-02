import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
        { error: 'Synonym not found' },
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
    const { id } = await params;

    const { error } = await supabase
      .from('synonyms')
      .delete()
      .eq('id', id);

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

