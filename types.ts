export interface Suggestion {
    suggestion: string;
    example?: string;
}

export interface ContextualHelpResult {
    explanation: string;
    example: string;
}

// Fix: Add AIProviderConfig type definition to resolve import errors in other files.
export type AIProviderConfig =
  | {
      provider: 'gemini';
      model: string;
      apiKey?: string;
    }
  | {
      provider: 'openai-compatible';
      model: string;
      baseUrl: string;
      apiKey?: string;
    };