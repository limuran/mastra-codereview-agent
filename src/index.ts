import { mastra } from './mastra/index.js';
import { codeReviewWorkflow } from './workflows/reviewWorkflow.js';
import { reviewCode } from './api/review.js';

// Export main functions for use
export { reviewCode, codeReviewWorkflow, mastra };
export { codeReviewAgent } from './agents/codeReviewer.js';

// Example usage function
export async function main() {
  const sampleCode = `
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}
  `;
  
  console.log('Starting code review...');
  
  const result = await reviewCode({
    code: sampleCode,
    language: 'javascript',
    filename: 'calculator.js',
    context: 'E-commerce shopping cart calculation function'
  });
  
  console.log('Review result:', JSON.stringify(result, null, 2));
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}