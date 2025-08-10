import { Mastra } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';
import { codeReviewAgent } from '../agents/codeReviewer.js';
import { codeReviewWorkflow } from '../workflows/reviewWorkflow.js';

// Initialize Mastra instance
const mastra = new Mastra({
  name: 'codereview-agent',
  agents: [codeReviewAgent],
  workflows: [codeReviewWorkflow],
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

// Export for use in other modules
export { mastra };
export default mastra;