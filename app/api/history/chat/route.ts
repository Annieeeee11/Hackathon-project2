import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[Chat History GET] Auth error:', authError);
      // Return empty array for better UX
      return NextResponse.json([]);
    }

    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    let query = supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: history, error } = await query;

    if (error) {
      console.error('[Chat History GET] Database error:', error);
      // Return empty array instead of error
      return NextResponse.json([]);
    }

    return NextResponse.json(history || []);
  } catch (error) {
    console.error('[Chat History GET] Unexpected error:', error);
    // Return empty array for any unexpected errors
    return NextResponse.json([]);
  }
}

