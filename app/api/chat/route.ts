import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const { jobId, question, conversationHistory } = await request.json();

    if (!jobId || !question) {
      console.error('[Chat API] Missing required fields');
      return NextResponse.json(
        { error: 'Missing jobId or question' },
        { status: 400 }
      );
    }

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

    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .eq('job_id', jobId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (resultsError) {
      console.error('[Chat API] Error fetching results:', resultsError);
      return NextResponse.json(
        { error: 'Failed to fetch results', details: resultsError.message },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      return NextResponse.json({
        answer: "I don't have any financial data to query yet. Please wait for the document processing to complete.",
      });
    }

    const dataContext = results.map(r => ({
      document: r.doc_name,
      page: r.page,
      term: r.original_term,
      canonical: r.canonical,
      value: r.value,
      evidence: r.evidence,
    }));

    const conversationContext = conversationHistory
      ?.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n') || '';

    const prompt = `You are a helpful financial data assistant. You have access to extracted financial data from invoices and can answer questions about them.

Available Financial Data:
${JSON.stringify(dataContext, null, 2)}

Previous conversation:
${conversationContext}

User Question: ${question}

Instructions:
- Answer the user's question based ONLY on the available data
- Be specific and include exact values
- If asking for totals, sum up the relevant values
- If the data doesn't contain the answer, say so clearly
- Format numbers with proper currency notation
- Reference the source document and page when relevant
- Be concise but helpful

Answer:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a financial data assistant that helps users query and understand their invoice data.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer = completion.choices[0].message.content || 'I could not generate an answer.';

    try {
      await supabase.from('chat_history').insert({
        job_id: jobId,
        user_id: user.id,
        question,
        answer,
      });
    } catch (err) {
      // Chat history table may not exist yet
    }

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('[Chat API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

