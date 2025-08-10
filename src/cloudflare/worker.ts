import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { handleReviewRequest } from '../api/review.js';

// Cloudflare Workers entry point
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
      const response = await handleReviewRequest(request);
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Default response
    return new Response('Mastra Code Review Agent', {
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

// Deployment configuration using correct version
export const deployer = new CloudflareDeployer({
  name: 'mastra-codereview-agent',
  compatibilityDate: '2024-01-01',
  vars: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    MASTRA_BASE_URL: process.env.MASTRA_BASE_URL || 'http://localhost:4111'
  }
});