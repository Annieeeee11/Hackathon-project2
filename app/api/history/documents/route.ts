import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[Documents GET] Auth error:', authError);
      // Return empty array for better UX - no scary error messages
      return NextResponse.json([]);
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        id,
        name,
        file_size,
        status,
        created_at,
        upload_date
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Documents GET] Database error:', error);
      // Return empty array instead of error - let the UI show "No documents" state
      return NextResponse.json([]);
    }

    const history = await Promise.all(
      documents?.map(async (doc) => {
        const { data: result } = await supabase
          .from('results')
          .select('job_id')
          .eq('doc_id', doc.id)
          .limit(1)
          .maybeSingle();

        const jobId = result?.job_id || null;
        let recordsCount = 0;
        let jobStatus = 'unknown';

        if (jobId) {
          const { data: job } = await supabase
            .from('jobs')
            .select('status, total_records')
            .eq('id', jobId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          recordsCount = job?.total_records || 0;
          jobStatus = job?.status || 'unknown';
        }

        return {
          id: doc.id,
          name: doc.name,
          fileSize: doc.file_size,
          status: doc.status,
          uploadDate: doc.upload_date || doc.created_at,
          jobId,
          recordsCount,
          jobStatus,
        };
      }) || []
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error('Document history error:', error);
    // Return empty array for any unexpected errors
    return NextResponse.json([]);
  }
}

