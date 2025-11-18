export interface Suggestion {
    suggestion: string;
    example?: string;
}

export interface ContextualHelpResult {
    explanation: string;
    example: string;
}

export interface DowngradeResult {
    downgradedCode: string;
    changes: Suggestion[];
}

export type AIProviderConfig = 
  | {
      provider: 'gemini';
      model?: string; // e.g., 'gemini-2.5-pro'
    }
  | {
      provider: 'openai-compatible';
      apiKey?: string; // Optional for local models
      baseUrl: string; // e.g., 'http://localhost:11434/v1'
      model: string; // e.g., 'llama3'
    };