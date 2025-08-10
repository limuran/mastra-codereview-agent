import { Agent } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

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

export const codeReviewAgent = new Agent({
  name: 'code-reviewer',
  instructions: `You are an expert code reviewer with years of experience across multiple programming languages.
  
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
  
  Be constructive and specific in your feedback.`,
  model: anthropic('claude-3-5-sonnet-20241022'),
  outputSchema: CodeReviewSchema
});

export type CodeReviewResult = z.infer<typeof CodeReviewSchema>;