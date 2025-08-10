import { Workflow, Step } from '@mastra/core';
import { codeReviewAgent } from '../agents/codeReviewer.js';
import { z } from 'zod';

const ReviewInputSchema = z.object({
  code: z.string(),
  language: z.string().optional(),
  context: z.string().optional(),
  filename: z.string().optional()
});

export const codeReviewWorkflow = new Workflow({
  name: 'code-review-workflow',
  triggerSchema: ReviewInputSchema
});

codeReviewWorkflow.step({
  id: 'analyze-code',
  execute: async ({ context }) => {
    const { code, language, context: codeContext, filename } = context.machineContext;
    
    let prompt = `Please review the following code:`;
    
    if (filename) {
      prompt += `\n\nFilename: ${filename}`;
    }
    
    if (language) {
      prompt += `\nLanguage: ${language}`;
    }
    
    if (codeContext) {
      prompt += `\n\nContext: ${codeContext}`;
    }
    
    prompt += `\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    
    const result = await codeReviewAgent.generate({
      messages: [{ role: 'user', content: prompt }]
    });
    
    return {
      review: result.object,
      rawResponse: result.text
    };
  }
});

export type ReviewInput = z.infer<typeof ReviewInputSchema>;