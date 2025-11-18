import { AIProvider } from './aiProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAICompatibleProvider } from './OpenAICompatibleProvider';
import { AIProviderConfig } from '../types';

export function getAIProvider(config: AIProviderConfig): AIProvider | null {
    if (!config || !config.provider) {
        return null;
    }

    try {
        switch (config.provider) {
            case 'gemini':
                return new GeminiProvider(config);
            case 'openai-compatible':
                return new OpenAICompatibleProvider(config);
            default:
                console.error(`Unknown AI provider: ${(config as { provider: string }).provider}`);
                return null;
        }
    } catch (error) {
        console.error(`Failed to initialize AI provider '${config.provider}':`, error);
        // Re-throw the error with a more user-friendly message
        if (error instanceof Error) {
            throw new Error(`Configuration error for ${config.provider}: ${error.message}`);
        }
        throw new Error(`An unknown configuration error occurred for ${config.provider}.`);
    }
}