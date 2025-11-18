import { Suggestion, ContextualHelpResult, DowngradeResult } from '../types';

export interface AIProvider {
  getSuggestionsAndCorrections(code: string): Promise<{ correctedCode: string; suggestions: Suggestion[] }>;
  getContextualHelp(keyword: string): Promise<ContextualHelpResult>;
  downgradeComposeVersion(code: string, targetVersion: string): Promise<DowngradeResult>;
  getExplanation(code: string): Promise<{ explanation: string }>;
}