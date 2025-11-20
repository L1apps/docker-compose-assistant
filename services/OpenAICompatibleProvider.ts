import { Suggestion, ContextualHelpResult, AIProviderConfig } from '../types';
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
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Ensure no trailing slash
    this.model = config.model;
  }

  private handleApiError(error: unknown, context: string): never {
    console.error(`Error fetching ${context} from OpenAI-compatible API:`, error);
    if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
             throw new Error(`Network Error: Could not connect to ${this.baseUrl}. Ensure the server is running, reachable, and 'OLLAMA_ORIGINS="*"' is set.`);
        }
        
        // Handle 404 errors intelligently
        if (error.message.includes('404')) {
            // Extract the server response body if it exists in the error message
            // Format is typically: "API request failed with status 404: { ... }"
            const bodyMatch = error.message.match(/API request failed with status 404: (.*)/);
            const body = bodyMatch ? bodyMatch[1] : '';

            // Check for specific "model not found" error from Ollama/OpenAI
            if (body.toLowerCase().includes('model') && body.toLowerCase().includes('not found')) {
                 throw new Error(`Model Error: The model '${this.model}' was not found on the server. Please check the model name in Settings or pull it first.`);
            }

             throw new Error(`Endpoint Error (404): The server returned 404 at ${this.baseUrl}. If the URL is correct, the model '${this.model}' might not exist. Server message: ${body || 'Not Found'}`);
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

  // Helper to remove markdown code fences if the AI includes them in the string value
  private stripMarkdown(code: string): string {
    if (!code) return "";
    let clean = code.trim();
    // Remove ```yaml or ``` at the start
    clean = clean.replace(/^```(?:yaml)?\s*/i, '');
    // Remove ``` at the end
    clean = clean.replace(/\s*```$/, '');
    return clean;
  }

  async formatCode(code: string): Promise<{ formattedCode: string }> {
    const systemPrompt = `You are an expert YAML formatter specializing in Docker Compose files. Your only task is to format the provided docker-compose.yml content. Apply 2-space indentation, ensure consistent spacing, and maintain valid YAML syntax. Do not alter any values, keys, or logic. Respond with a single JSON object containing a 'formattedCode' key. IMPORTANT: The 'formattedCode' must be RAW YAML. Do NOT wrap it in markdown backticks.`;
    const prompt = `Format this docker-compose.yml:\n\n\`\`\`yaml\n${code}\n\`\`\``;
    try {
      const result = await this.executeJsonCommand<{ formattedCode: string }>(prompt, systemPrompt);
      return { formattedCode: this.stripMarkdown(result.formattedCode) };
    } catch (error) {
      this.handleApiError(error, "code formatting");
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

  async getContextualHelp(keyword: string): Promise<ContextualHelpResult> {
    const systemPrompt = `You are an expert on Docker Compose. Provide a clear explanation and a simple YAML code example for a given Docker Compose keyword. Respond with a single JSON object containing 'explanation' and 'example' keys. IMPORTANT: The 'example' field must be RAW YAML only. Do NOT wrap the example code in markdown (no \`\`\`yaml).`;
    const prompt = `Provide help for the keyword: "${keyword}"`;
    try {
      const result = await this.executeJsonCommand<ContextualHelpResult>(prompt, systemPrompt);
      return {
          explanation: result.explanation,
          example: this.stripMarkdown(result.example)
      };
    } catch (error) {
      this.handleApiError(error, `contextual help for "${keyword}"`);
    }
  }

  async getSuggestionsAndCorrections(code: string): Promise<{ correctedCode: string; suggestions: Suggestion[] }> {
    const systemPrompt = `You are an expert in Docker and Docker Compose. Analyze the provided docker-compose.yml content, correct any errors, and suggest best practices. Respond with a single JSON object containing the 'correctedCode' and a 'suggestions' array. The 'suggestions' array should contain objects with 'suggestion' and optional 'example' keys. IMPORTANT: The 'correctedCode' must be RAW YAML only. Do NOT include markdown backticks (like \`\`\`yaml).`;
    const prompt = `Analyze and correct this docker-compose.yml:\n\n\`\`\`yaml\n${code}\n\`\`\``;
     try {
      const result = await this.executeJsonCommand<{ correctedCode: string; suggestions: Suggestion[] }>(prompt, systemPrompt);
       return { 
            correctedCode: this.stripMarkdown(result.correctedCode), 
            suggestions: result.suggestions 
        };
    } catch (error) {
      this.handleApiError(error, "suggestions and corrections");
    }
  }
}