import { Suggestion, ContextualHelpResult, DowngradeResult, AIProviderConfig } from '../types';
import { AIProvider } from './aiProvider';

export class OpenAICompatibleProvider implements AIProvider {
  private apiKey?: string;
  private baseUrl: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    if (config.provider !== 'openai-compatible') throw new Error("Invalid config for OpenAICompatibleProvider");
    if (!config.baseUrl || !config.model) {
      throw new Error("Base URL and Model Name are required for OpenAI-Compatible Provider.");
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
  }

  private handleApiError(error: unknown, context: string): never {
    console.error(`Error fetching ${context} from OpenAI-compatible API:`, error);
    if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
             throw new Error(`Could not connect to the local AI server at ${this.baseUrl}. Please ensure the server is running and the Base URL is correct.`);
        }
      throw new Error(`Failed to get ${context} from the API: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching ${context} from the API.`);
  }

  private async executeJsonCommand<T>(prompt: string, systemPrompt: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }
      
      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      
      if (!content) {
          throw new Error("API returned an empty response.");
      }

      return JSON.parse(content);
    } catch (e) {
      // Re-throw with context using the specific handler
      throw e;
    }
  }

  async getExplanation(code: string): Promise<{ explanation: string }> {
    const systemPrompt = `You are an expert in Docker and Docker Compose. Analyze the provided docker-compose.yml content and provide a clear, high-level explanation of what it does. Respond with a single JSON object containing an 'explanation' key.`;
    const prompt = `Explain what this docker-compose.yml does:\n\n\`\`\`yaml\n${code}\n\`\`\``;
     try {
      const result = await this.executeJsonCommand<{ explanation: string }>(prompt, systemPrompt);
       return result;
    } catch (error) {
      this.handleApiError(error, "file explanation");
    }
  }

  async downgradeComposeVersion(code: string, targetVersion: string): Promise<DowngradeResult> {
    const systemPrompt = `You are an expert on all versions of the Docker Compose file specification. Your task is to rewrite the provided 'docker-compose.yml' content to be compatible with a specific target version, explaining all changes. Respond with a single JSON object containing 'downgradedCode' and a 'changes' array. The 'changes' array should contain objects with a 'suggestion' key.`;
    const prompt = `Rewrite the following docker-compose.yml to be compatible with version "${targetVersion}". \n\n\`\`\`yaml\n${code}\n\`\`\``;
    try {
      return await this.executeJsonCommand<DowngradeResult>(prompt, systemPrompt);
    } catch (error) {
      this.handleApiError(error, `downgrade to version "${targetVersion}"`);
    }
  }

  async getContextualHelp(keyword: string): Promise<ContextualHelpResult> {
    const systemPrompt = `You are an expert on Docker Compose. Provide a clear explanation and a simple YAML code example for a given Docker Compose keyword. Respond with a single JSON object containing 'explanation' and 'example' keys.`;
    const prompt = `Provide help for the keyword: "${keyword}"`;
    try {
      return await this.executeJsonCommand<ContextualHelpResult>(prompt, systemPrompt);
    } catch (error) {
      this.handleApiError(error, `contextual help for "${keyword}"`);
    }
  }

  async getSuggestionsAndCorrections(code: string): Promise<{ correctedCode: string; suggestions: Suggestion[] }> {
    const systemPrompt = `You are an expert in Docker and Docker Compose. Analyze the provided docker-compose.yml content, correct any errors, and suggest best practices. Respond with a single JSON object containing the 'correctedCode' and a 'suggestions' array. The 'suggestions' array should contain objects with 'suggestion' and optional 'example' keys.`;
    const prompt = `Analyze and correct this docker-compose.yml:\n\n\`\`\`yaml\n${code}\n\`\`\``;
     try {
      const result = await this.executeJsonCommand<{ correctedCode: string; suggestions: Suggestion[] }>(prompt, systemPrompt);
       return { 
            correctedCode: result.correctedCode.trim(), 
            suggestions: result.suggestions 
        };
    } catch (error) {
      this.handleApiError(error, "suggestions and corrections");
    }
  }
}