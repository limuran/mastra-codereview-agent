import { config } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';

export default config({
  name: 'codereview-agent',
  agents: [
    {
      name: 'code-reviewer',
      instructions: 'You are an expert code reviewer. Analyze code for best practices, security issues, performance optimizations, and maintainability.',
      model: anthropic('claude-3-5-sonnet-20241022'),
      tools: []
    }
  ],
  workflows: [
    {
      name: 'code-review-workflow',
      triggerSchema: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          language: { type: 'string' },
          context: { type: 'string' },
          filename: { type: 'string' }
        },
        required: ['code']
      }
    }
  ],
  tools: [],
  memory: {
    provider: 'upstash',
    directives: ['Remember previous code review patterns and user preferences']
  },
  logger: {
    provider: 'console',
    level: 'info'
  }
});