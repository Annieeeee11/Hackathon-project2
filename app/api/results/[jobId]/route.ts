import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
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

    const { jobId } = await params;

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found or access denied' },
        { status: 403 }
      );
    }

    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .eq('job_id', jobId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[Results API] Error fetching results for jobId ${jobId}:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch results', details: error.message },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      console.warn(`[Results API] No results found for jobId ${jobId}`);
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single();
      
      if (!jobData) {
        console.warn(`[Results API] Job ${jobId} not found`);
      }
    }

    const transformedResults = results?.map(result => ({
      id: result.id,
      docId: result.doc_id,
      docName: result.doc_name,
      page: result.page,
      originalTerm: result.original_term,
      canonical: result.canonical,
      value: result.value,
      confidence: result.confidence,
      evidence: result.evidence,
    })) || [];

    return NextResponse.json(transformedResults);

  } catch (error) {
    console.error('[Results API] Results fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results', details: (error as Error).message },
      { status: 500 }
    );
  }
}

