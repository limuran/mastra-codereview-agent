import { MastraClient } from '@mastra/client-js';
import { codeReviewWorkflow } from '../workflows/reviewWorkflow.js';
import type { ReviewInput } from '../workflows/reviewWorkflow.js';

const client = new MastraClient({
  baseUrl: process.env.MASTRA_BASE_URL || 'http://localhost:4111'
});

export async function reviewCode(input: ReviewInput) {
  try {
    const result = await client.runWorkflow({
      name: 'code-review-workflow',
      data: input
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Code review failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// HTTP handler for API endpoints
export async function handleReviewRequest(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const body = await request.json();
    const result = await reviewCode(body);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: result.success ? 200 : 400
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request body' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
}