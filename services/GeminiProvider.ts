import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion, ContextualHelpResult, DowngradeResult, AIProviderConfig } from '../types';
import { AIProvider } from './aiProvider';

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor(config: AIProviderConfig) {
    if (config.provider !== 'gemini') throw new Error("Invalid config for GeminiProvider");
    
    // API key is now handled by the environment as per guidelines.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.model = config.model || 'gemini-2.5-pro';
  }

  private handleApiError(error: unknown, context: string): never {
    console.error(`Error fetching ${context} from Gemini:`, error);
    if (error instanceof Error) {
      if (error.message.includes('API key not valid')) {
        throw new Error("The provided Gemini API key is invalid. Please check the key in the Settings and try again.");
      }
      throw new Error(`Failed to get ${context} from the Gemini API: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching ${context} from the Gemini API.`);
  }

  private async executeJsonCommand<T>(prompt: string, schema: any): Promise<T> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });
      
      const text = response.text.trim();
      // Handle cases where the API might return markdown with JSON inside
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const parsableText = jsonMatch ? jsonMatch[1] : text;

      return JSON.parse(parsableText);

    } catch (e) {
      // Re-throw with context using the specific handler
      throw e;
    }
  }

  async getExplanation(code: string): Promise<{ explanation: string }> {
    const prompt = `
      You are an expert in Docker and Docker Compose. Analyze the provided docker-compose.yml content and provide a clear, high-level explanation of what it does.
      Focus on the services defined, their purpose, and how they interact.
      Analyze the following \`docker-compose.yml\` content:
      \`\`\`yaml
      ${code}
      \`\`\`
      Your tasks:
      1. Provide a concise explanation of the file's purpose.
      Return the result in JSON format.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            explanation: { type: Type.STRING, description: "A high-level explanation of the docker-compose file." },
        },
        required: ["explanation"],
    };
    
    try {
        const result = await this.executeJsonCommand<{ explanation: string }>(prompt, schema);
        return result;
    } catch (error) {
        this.handleApiError(error, "file explanation");
    }
  }

  async downgradeComposeVersion(code: string, targetVersion: string): Promise<DowngradeResult> {
    const prompt = `
      You are an expert on all versions of the Docker Compose file specification.
      Analyze the following \`docker-compose.yml\` content. Your task is to rewrite it to be compatible with the target version: "${targetVersion}".
      Current \`docker-compose.yml\` content:
      \`\`\`yaml
      ${code}
      \`\`\`
      Your tasks:
      1. Rewrite the Code for Version ${targetVersion}.
      2. Explain the Changes.
      Return the result in JSON format.`;
    
    const schema = {
      type: Type.OBJECT,
      properties: {
        downgradedCode: { type: Type.STRING },
        changes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { suggestion: { type: Type.STRING } },
            required: ["suggestion"]
          }
        }
      },
      required: ["downgradedCode", "changes"]
    };

    try {
        return await this.executeJsonCommand<DowngradeResult>(prompt, schema);
    } catch (error) {
        this.handleApiError(error, `downgrade to version "${targetVersion}"`);
    }
  }

  async getContextualHelp(keyword: string): Promise<ContextualHelpResult> {
    const prompt = `
      As an expert on Docker Compose, provide a clear, concise explanation and a simple YAML code example for the following Docker Compose keyword: "${keyword}".
      Focus on the primary use case of the keyword.
      Return the result in JSON format.`;
      
    const schema = {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          example: { type: Type.STRING }
        },
        required: ["explanation", "example"]
    };

    try {
        return await this.executeJsonCommand<ContextualHelpResult>(prompt, schema);
    } catch (error) {
        this.handleApiError(error, `contextual help for "${keyword}"`);
    }
  }

  async getSuggestionsAndCorrections(code: string): Promise<{ correctedCode: string; suggestions: Suggestion[] }> {
    const prompt = `
      You are an expert in Docker and Docker Compose. Analyze the provided docker-compose.yml content, correct it, and provide helpful suggestions with examples.
      Analyze the following \`docker-compose.yml\` content:
      \`\`\`yaml
      ${code}
      \`\`\`
      Your tasks:
      1. Correct the code (syntax, indentation, deprecated keys, etc.).
      2. Provide helpful hints and best practices (security, performance, maintainability).
      Return the result in JSON format.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            correctedCode: { type: Type.STRING },
            suggestions: {
                type: Type.ARRAY,
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING },
                        example: { type: Type.STRING }
                    },
                    required: ["suggestion"]
                 },
            },
        },
        required: ["correctedCode", "suggestions"],
    };
    
    try {
        const result = await this.executeJsonCommand<{ correctedCode: string; suggestions: Suggestion[] }>(prompt, schema);
        return { 
            correctedCode: result.correctedCode.trim(), 
            suggestions: result.suggestions 
        };
    } catch (error) {
        this.handleApiError(error, "suggestions and corrections");
    }
  }
}