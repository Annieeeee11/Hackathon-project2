import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { processHandwrittenInvoiceBatchOpenAI } from '@/lib/openai-service';
import { uploadFileToStorage } from '@/lib/storage-service';

export async function POST(request: NextRequest) {
  try {
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
      .eq('id', job.id);

    processDocuments(job.id, validDocuments.map(d => d!.id), files);

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

async function processDocuments(jobId: string, documentIds: string[], files: File[]) {
  try {
    console.log(`[Job ${jobId}] Starting OpenAI Vision processing for ${files.length} handwritten invoices`);

    await supabase
      .from('jobs')
      .update({ 
        progress: 5, 
        message: 'Initializing OpenAI Vision model for handwritten text recognition...' 
      })
      .eq('id', jobId);

    const { data: synonyms } = await supabase
      .from('synonyms')
      .select('*');

    const synonymMap = new Map(synonyms?.map(s => [s.term.toLowerCase(), s.canonical]) || []);
    console.log(`[Job ${jobId}] Loaded ${synonyms?.length || 0} synonym mappings`);
    if (synonyms && synonyms.length > 0) {
      console.log(`[Job ${jobId}] Synonym mappings:`, synonyms.map(s => `${s.term} -> ${s.canonical}`).join(', '));
    }

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
        .eq('id', jobId);
      
      console.log(`[Job ${jobId}] Processing ${filename}: ${current}/${total}`);
    });

    console.log(`[Job ${jobId}] OpenAI Vision extraction complete. Processing results...`);

    await supabase
      .from('jobs')
      .update({ 
        progress: 75,
        message: 'Mapping extracted terms to canonical fields...'
      })
      .eq('id', jobId);

    for (let i = 0; i < extractionResults.length; i++) {
      const extraction = extractionResults[i];
      const docId = documentIds[i];

      const { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .single();

      if (!doc) {
        console.log(`[Job ${jobId}] Document not found for ${extraction.filename}`);
        continue;
      }

      if (extraction.results.length === 0) {
        console.log(`[Job ${jobId}] No extraction results for ${extraction.filename}`);
        console.log(`[Job ${jobId}] This might indicate Gemini didn't extract any data. Check Gemini response.`);
        continue;
      }

      console.log(`[Job ${jobId}] Processing ${extraction.results.length} extracted terms from ${extraction.filename}:`);
      extraction.results.forEach((r, idx) => {
        console.log(`[Job ${jobId}]   [${idx + 1}] Term: "${r.term}", Value: "${r.value}", Confidence: ${r.confidence}`);
      });

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

        console.log(`[Job ${jobId}] Mapping: "${extracted.term}" (normalized: "${normalizedTerm}") -> canonical: "${canonical}"`);

        allResults.push({
          job_id: jobId,
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

    console.log(`[Job ${jobId}] Mapped ${allResults.length} financial terms`);

    await supabase
      .from('jobs')
      .update({ 
        progress: 85,
        message: 'Saving extracted data...'
      })
      .eq('id', jobId);

    if (allResults.length > 0) {
      console.log(`[Job ${jobId}] Inserting ${allResults.length} results into database...`);
      console.log(`[Job ${jobId}] Sample results being inserted:`, allResults.slice(0, 3).map(r => ({
        term: r.original_term,
        canonical: r.canonical,
        value: r.value
      })));
      
      const { error: resultsError, data: insertedData } = await supabase
        .from('results')
        .insert(allResults)
        .select();

      if (resultsError) {
        console.error(`[Job ${jobId}] Error inserting results:`, resultsError);
        throw resultsError;
      }

      console.log(`[Job ${jobId}] Successfully inserted ${insertedData?.length || allResults.length} results`);
      
      const subtotalResults = allResults.filter(r => 
        r.original_term.toLowerCase().includes('subtotal') || 
        r.canonical.toLowerCase().includes('subtotal')
      );
      const discountResults = allResults.filter(r => 
        r.original_term.toLowerCase().includes('discount') || 
        r.canonical.toLowerCase().includes('discount')
      );
      
      console.log(`[Job ${jobId}] Subtotal-related results: ${subtotalResults.length}`);
      console.log(`[Job ${jobId}] Discount-related results: ${discountResults.length}`);
      
      if (subtotalResults.length > 0) {
        subtotalResults.forEach(r => {
          console.log(`[Job ${jobId}]   Subtotal: "${r.original_term}" -> "${r.canonical}" = "${r.value}"`);
        });
      }
      if (discountResults.length > 0) {
        discountResults.forEach(r => {
          console.log(`[Job ${jobId}]   Discount: "${r.original_term}" -> "${r.canonical}" = "${r.value}"`);
        });
      }
    } else {
      console.warn(`[Job ${jobId}] ⚠️ WARNING: No results to insert! This means no data was extracted.`);
    }

    await supabase
      .from('jobs')
      .update({ 
        progress: 95,
        message: 'Finalizing...'
      })
      .eq('id', jobId);

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
      .eq('id', jobId);

    console.log(`[Job ${jobId}] Processing complete! Total records: ${allResults.length}`);

  } catch (error) {
    console.error(`[Job ${jobId}] Processing error:`, error);
    
    await supabase
      .from('jobs')
      .update({
        status: 'error',
        message: 'Processing failed: ' + (error as Error).message,
      })
      .eq('id', jobId);
  }
}

