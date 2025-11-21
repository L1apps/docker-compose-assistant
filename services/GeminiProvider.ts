import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion, ContextualHelpResult, AIProviderConfig } from '../types';
import { AIProvider } from './aiProvider';

export class GeminiProvider implements AIProvider {
  private model: string;
  private apiKey?: string;

  constructor(config: AIProviderConfig) {
    if (config.provider !== 'gemini') {
      throw new Error("Invalid configuration for GeminiProvider.");
    }
    this.model = config.model;
    this.apiKey = config.apiKey;
  }
  
  private getAI(): GoogleGenAI {
    // Prioritize the key from config, then fallback to environment (for aistudio).
    const apiKey = this.apiKey || (typeof process !== 'undefined' && process.env?.API_KEY) || '';
    if (!apiKey) {
      // This warning helps developers diagnose issues if the key isn't set.
      // The user will see a more friendly error in the UI when an API call fails.
      console.warn("Gemini API key not found. Please configure it in Settings. AI features will fail until an API key is provided.");
    }
    return new GoogleGenAI({ apiKey });
  }

  private handleApiError(error: unknown, context: string): never {
    console.error(`Error fetching ${context} from Gemini:`, error);
    if (error instanceof Error) {
      if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        throw new Error("The provided Gemini API key is invalid or missing. Please ensure it is configured correctly in the environment.");
      }
      if (error.message.includes('Requested entity was not found')) {
        throw new Error("Your Gemini API Key was not found or is invalid. Please ensure it is configured correctly in your environment.");
      }
      throw new Error(`Failed to get ${context} from the Gemini API: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching ${context} from the Gemini API.`);
  }

  private async executeJsonCommand<T>(prompt: string, schema: any): Promise<T> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
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
    const prompt = `
      You are an expert YAML formatter specializing in Docker Compose files. Your only task is to format the following docker-compose.yml content.
      
      RULES:
      - Use 2 spaces for indentation.
      - Maintain consistent spacing around colons and hyphens.
      - Ensure proper YAML syntax.
      - Move inline comments to the line above the item they describe. Do not keep comments on the same line as code.
      - Do not change any values, keys, or the logic of the file. Only fix formatting issues.
      - IMPORTANT: The output 'formattedCode' must be RAW YAML. Do NOT wrap it in markdown code blocks (no \`\`\`yaml).
      
      Content to format:
      \`\`\`yaml
      ${code}
      \`\`\`
      Return the result in JSON format with a single key "formattedCode".`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            formattedCode: { type: Type.STRING, description: "The perfectly formatted docker-compose.yml content. Raw YAML only." },
        },
        required: ["formattedCode"],
    };
    
    try {
        const result = await this.executeJsonCommand<{ formattedCode: string }>(prompt, schema);
        return { formattedCode: this.stripMarkdown(result.formattedCode) };
    } catch (error) {
        this.handleApiError(error, "code formatting");
    }
  }

  async getExplanation(code: string): Promise<{ explanation: string }> {
    const prompt = `
      You are an expert in Docker and Docker Compose. Analyze the provided docker-compose.yml content and provide a clear, high-level explanation of what it does.
      
      Analyze the following \`docker-compose.yml\` content:
      \`\`\`yaml
      ${code}
      \`\`\`
      Your tasks:
      1. Provide a concise explanation of the file's purpose.
      2. Use Markdown formatting (headings, bullet points, bold text) to make the explanation easy to read.
      3. Do NOT output raw JSON structure in the text, just the markdown string within the JSON response.
      Return the result in JSON format.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            explanation: { type: Type.STRING, description: "A high-level explanation of the docker-compose file, formatted with Markdown." },
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

  async getContextualHelp(keyword: string): Promise<ContextualHelpResult> {
    const prompt = `
      As an expert on Docker Compose, provide a clear, concise explanation and a simple YAML code example for the following Docker Compose keyword: "${keyword}".
      Focus on the primary use case of the keyword.
      IMPORTANT: The 'example' field must be RAW YAML. Do NOT wrap the example code in markdown (no \`\`\`yaml).
      Return the result in JSON format.`;
      
    const schema = {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          example: { type: Type.STRING, description: "Raw YAML example code. No markdown." }
        },
        required: ["explanation", "example"]
    };

    try {
        const result = await this.executeJsonCommand<ContextualHelpResult>(prompt, schema);
        return {
            explanation: result.explanation,
            example: this.stripMarkdown(result.example)
        };
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
      2. Ensure all comments are placed on their own line above the code they refer to, not inline.
      3. Provide helpful hints and best practices (security, performance, maintainability).
      4. IMPORTANT: The 'correctedCode' must be RAW YAML only. Do NOT include markdown backticks (like \`\`\`yaml) at the start or end.
      
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
            correctedCode: this.stripMarkdown(result.correctedCode), 
            suggestions: result.suggestions 
        };
    } catch (error) {
        this.handleApiError(error, "suggestions and corrections");
    }
  }
}