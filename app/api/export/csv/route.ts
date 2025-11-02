import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check job status first
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('status, total_records')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'done') {
      return NextResponse.json(
        { error: `Cannot export: Job is still ${job.status}. Please wait for processing to complete.` },
        { status: 400 }
      );
    }

    // Fetch results for the job
    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching results for export:', error);
      return NextResponse.json(
        { error: 'Failed to fetch results' },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'No results found for this job. The job may have completed but no data was extracted.' },
        { status: 404 }
      );
    }

    // Generate CSV
    const headers = [
      'Document Name',
      'Page',
      'Original Term',
      'Canonical Field',
      'Value',
      'Confidence (%)',
      'Evidence'
    ];

    const csvRows = [
      headers.join(','),
      ...results.map(row => [
        `"${row.doc_name}"`,
        row.page,
        `"${row.original_term}"`,
        `"${row.canonical}"`,
        `"${row.value}"`,
        row.confidence,
        `"${(row.evidence || '').replace(/"/g, '""')}"` // Escape quotes in evidence
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="finance_results_${jobId}.csv"`,
      },
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}

