import { NextRequest, NextResponse } from 'next/server';
import { getPathwayService } from '@/lib/pathway-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    const pathwayService = getPathwayService();

    switch (action) {
      case 'query': {
        const result = await pathwayService.query(data);
        return NextResponse.json(result);
      }

      case 'process': {
        const { input, pipeline } = data;
        const result = await pathwayService.processData(input, pipeline);
        return NextResponse.json({ result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Supported actions: query, process` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Pathway API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'health') {
      const pathwayService = getPathwayService();
      const isHealthy = await pathwayService.healthCheck();
      
      return NextResponse.json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: 'pathway',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=health' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Pathway API] Error:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}

