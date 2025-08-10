import { Mastra } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';

// Simple Mastra instance for debugging
const mastra = new Mastra({
  name: 'codereview-agent',
  agents: [],
  workflows: [],
  tools: []
});

export { mastra };
export default mastra;