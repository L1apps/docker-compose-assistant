import { Suggestion, ContextualHelpResult } from '../types';

export interface AIProvider {
  getSuggestionsAndCorrections(code: string, dockerVersion?: string): Promise<{ correctedCode: string; suggestions: Suggestion[] }>;
  getContextualHelp(keyword: string, dockerVersion?: string): Promise<ContextualHelpResult>;
  getExplanation(code: string): Promise<{ explanation: string }>;
  formatCode(code: string, dockerVersion?: string): Promise<{ formattedCode: string }>;
}