import { AIProvider } from './aiProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAICompatibleProvider } from './OpenAICompatibleProvider';
import { AIProviderConfig } from '../types';

/**
 * Creates an instance of an AI Provider based on the provided configuration.
 * @param config The user's selected AI provider configuration.
 * @returns An instance of an AIProvider, or null if no configuration is provided.
 */
export function createAIProvider(config: AIProviderConfig | null): AIProvider | null {
    if (!config) {
        return null;
    }

    switch (config.provider) {
        case 'gemini':
            return new GeminiProvider(config);
        case 'openai-compatible':
            return new OpenAICompatibleProvider(config);
        default:
            console.error("Invalid AI provider specified in config:", config);
            return null;
    }
}