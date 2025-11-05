import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processHandwrittenInvoiceBatchOpenAI } from '@/lib/openai-service';
import { uploadFileToStorage } from '@/lib/storage-service';

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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        status: 'queued',
        progress: 0,
        documents_processed: 0,
        total_records: 0,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Error creating job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    const documentPromises = files.map(async (file) => {
      const filePath = await uploadFileToStorage(file, job.id);

      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          status: 'uploaded',
        })
        .select()
        .single();

      if (docError) {
        console.error('Error creating document:', docError);
        return null;
      }

      return document;
    });

    const documents = await Promise.all(documentPromises);
    const validDocuments = documents.filter(Boolean);

    await supabase
      .from('jobs')
      .update({ 
        status: 'running',
        message: `Processing ${validDocuments.length} handwritten invoices with OpenAI Vision...`
      })
      .eq('id', job.id)
      .eq('user_id', user.id);

    processDocuments(job.id, user.id, validDocuments.map(d => d!.id), files);

    return NextResponse.json({
      jobId: job.id,
      status: 'queued',
    });

  } catch (error) {
    console.error('Handwritten ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

async function processDocuments(jobId: string, userId: string, documentIds: string[], files: File[]) {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('jobs')
      .update({ 
        progress: 5, 
        message: 'Initializing OpenAI Vision model for handwritten text recognition...' 
      })
      .eq('id', jobId)
      .eq('user_id', userId);

    const { data: synonyms } = await supabase
      .from('synonyms')
      .select('*')
      .eq('user_id', userId);

    const synonymMap = new Map(synonyms?.map(s => [s.term.toLowerCase(), s.canonical]) || []);

    let currentProgress = 10;
    const allResults: any[] = [];

    const extractionResults = await processHandwrittenInvoiceBatchOpenAI(files, async (current, total, filename) => {
      currentProgress = 10 + Math.floor((current / total) * 60);
      await supabase
        .from('jobs')
        .update({ 
          progress: currentProgress,
          message: `Extracting data from handwritten invoice: ${filename} (${current}/${total})...`
        })
        .eq('id', jobId)
        .eq('user_id', userId);
    });

    await supabase
      .from('jobs')
      .update({ 
        progress: 75,
        message: 'Mapping extracted terms to canonical fields...'
      })
      .eq('id', jobId)
      .eq('user_id', userId);

    for (let i = 0; i < extractionResults.length; i++) {
      const extraction = extractionResults[i];
      const docId = documentIds[i];

      const { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .eq('user_id', userId)
        .single();

      if (!doc) {
        continue;
      }

      if (extraction.results.length === 0) {
        continue;
      }

      for (const extracted of extraction.results) {
        const normalizedTerm = extracted.term.toLowerCase().trim();
        let canonical = synonymMap.get(normalizedTerm) || extracted.term;
        if (canonical === extracted.term) {
          const termLower = normalizedTerm;
          if (termLower.includes('subtotal') || termLower === 'sub total' || termLower === 'sub-total') {
            canonical = synonymMap.get('subtotal') || extracted.term;
          } else if (termLower.includes('discount')) {
            canonical = synonymMap.get('discount') || extracted.term;
          } else if (termLower.includes('tax') && !termLower.includes('gst')) {
            canonical = synonymMap.get('tax') || extracted.term;
          }
        }

        allResults.push({
          job_id: jobId,
          user_id: userId,
          doc_id: docId,
          doc_name: doc.name,
          page: extracted.page,
          original_term: extracted.term,
          canonical: canonical,
          value: extracted.value,
          confidence: extracted.confidence,
          evidence: extracted.evidence,
        });
      }
    }

    await supabase
      .from('jobs')
      .update({ 
        progress: 85,
        message: 'Saving extracted data...'
      })
      .eq('id', jobId)
      .eq('user_id', userId);

    if (allResults.length > 0) {
      const { error: resultsError, data: insertedData } = await supabase
        .from('results')
        .insert(allResults)
        .select();

      if (resultsError) {
        console.error(`[Job ${jobId}] Error inserting results:`, resultsError);
        throw resultsError;
      }
    } else {
      console.warn(`[Job ${jobId}] WARNING: No results to insert! This means no data was extracted.`);
    }

    await supabase
      .from('jobs')
      .update({ 
        progress: 95,
        message: 'Finalizing...'
      })
      .eq('id', jobId)
      .eq('user_id', userId);

    await new Promise(resolve => setTimeout(resolve, 500));

    await supabase
      .from('jobs')
      .update({
        status: 'done',
        progress: 100,
        documents_processed: files.length,
        total_records: allResults.length,
        message: `Successfully extracted ${allResults.length} financial terms from ${files.length} handwritten invoices`,
      })
      .eq('id', jobId)
      .eq('user_id', userId);

  } catch (error) {
    console.error(`[Job ${jobId}] Processing error:`, error);
    const supabase = await createClient();
    
    await supabase
      .from('jobs')
      .update({
        status: 'error',
        message: 'Processing failed: ' + (error as Error).message,
      })
      .eq('id', jobId);
  }
}
