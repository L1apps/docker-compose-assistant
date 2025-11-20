import { Suggestion, ContextualHelpResult } from '../types';

export interface AIProvider {
  getSuggestionsAndCorrections(code: string): Promise<{ correctedCode: string; suggestions: Suggestion[] }>;
  getContextualHelp(keyword: string): Promise<ContextualHelpResult>;
  getExplanation(code: string): Promise<{ explanation: string }>;
  formatCode(code: string): Promise<{ formattedCode: string }>;
}