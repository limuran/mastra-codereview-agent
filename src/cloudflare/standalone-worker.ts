import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';

// Code review schema
const CodeReviewSchema = z.object({
  overall_rating: z.number().min(1).max(10),
  issues: z.array(z.object({
    type: z.enum(['bug', 'security', 'performance', 'style', 'maintainability']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    line: z.number().optional(),
    description: z.string(),
    suggestion: z.string()
  })),
  positive_aspects: z.array(z.string()),
  summary: z.string()
});

// Standalone code review function
async function reviewCodeStandalone(input: {
  code: string;
  language?: string;
  filename?: string;
  context?: string;
}, anthropicApiKey: string) {
  const model = anthropic('claude-3-5-sonnet-20241022', {
    apiKey: anthropicApiKey
  });

  let prompt = `You are an expert code reviewer with years of experience across multiple programming languages.

Your task is to:
1. Analyze the provided code for potential issues
2. Look for bugs, security vulnerabilities, performance problems, and maintainability concerns
3. Identify positive aspects of the code
4. Provide constructive feedback and suggestions

Focus on:
- Code quality and best practices
- Security vulnerabilities
- Performance optimizations
- Readability and maintainability
- Proper error handling
- Documentation and comments

Be constructive and specific in your feedback.

Please review the following code:`;

  if (input.filename) {
    prompt += `\n\nFilename: ${input.filename}`;
  }

  if (input.language) {
    prompt += `\nLanguage: ${input.language}`;
  }

  if (input.context) {
    prompt += `\n\nContext: ${input.context}`;
  }

  prompt += `\n\n\`\`\`${input.language || ''}\n${input.code}\n\`\`\``;

  try {
    const result = await generateObject({
      model,
      schema: CodeReviewSchema,
      prompt
    });

    return {
      success: true,
      data: result.object
    };
  } catch (error) {
    console.error('Code review failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Cloudflare Workers entry point - STANDALONE VERSION
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // Route API requests
    if (url.pathname === '/api/review') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      try {
        const body = await request.json();
        
        // Check for required API key
        if (!env.ANTHROPIC_API_KEY) {
          return new Response(
            JSON.stringify({ success: false, error: 'ANTHROPIC_API_KEY not configured' }),
            { 
              headers: { 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        // Perform standalone code review
        const result = await reviewCodeStandalone(body, env.ANTHROPIC_API_KEY);
        
        const response = new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        });

        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid request body' }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            status: 400 
          }
        );
      }
    }
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        mode: 'standalone'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // API documentation endpoint
    if (url.pathname === '/') {
      const docs = `
# Mastra Code Review Agent (Standalone)

## API Endpoints

### POST /api/review
Review code and get detailed analysis.

Request body:
{
  "code": "your code here",
  "language": "javascript",
  "filename": "example.js",
  "context": "Optional context"
}

### GET /health
Health check endpoint.

### Example usage:
curl -X POST https://your-worker.workers.dev/api/review \\
  -H "Content-Type: application/json" \\
  -d '{"code": "function add(a, b) { return a + b; }", "language": "javascript"}'
      `.trim();

      return new Response(docs, {
        headers: { 
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Default response
    return new Response('Mastra Code Review Agent (Standalone Mode)', {
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};