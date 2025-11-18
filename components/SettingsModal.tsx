import React, { useState, useEffect } from 'react';
import { AIProviderConfig } from '../types';
import { ExternalLinkIcon, ChevronDownIcon, AlertTriangleIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIProviderConfig) => void;
  initialConfig: AIProviderConfig;
  onReset: () => void;
}

const defaultConfig: AIProviderConfig = {
    provider: 'gemini',
    model: 'gemini-2.5-pro'
};

const geminiModels = ['gemini-2.5-pro', 'gemini-2.5-flash'];
const localModels = ['llama3', 'codellama', 'mistral', 'phi3'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialConfig, onReset }) => {
  const [config, setConfig] = useState<AIProviderConfig>(initialConfig || defaultConfig);

  useEffect(() => {
    setConfig(initialConfig || defaultConfig);
  }, [initialConfig, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleProviderChange = (provider: 'gemini' | 'openai-compatible') => {
    if (provider === 'gemini') {
        setConfig({
            provider: 'gemini',
            model: 'gemini-2.5-pro',
        });
    } else {
        setConfig({
            provider: 'openai-compatible',
            apiKey: '', // Reset API key for local models
            baseUrl: 'http://localhost:11434/v1',
            model: 'llama3',
        });
    }
  }

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-background-offset border border-border rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">AI Provider Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Close settings modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label htmlFor="ai-provider" className="block mb-2 text-sm font-medium text-foreground-muted">AI Provider</label>
            <select
              id="ai-provider"
              value={config.provider}
              onChange={e => handleProviderChange(e.target.value as 'gemini' | 'openai-compatible')}
              className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5"
            >
              <option value="gemini">Google Gemini (Cloud)</option>
              <option value="openai-compatible">Local Model (OpenAI-Compatible API)</option>
            </select>
          </div>

          {config.provider === 'gemini' && (
            <div className="space-y-4 p-4 border border-border rounded-lg">
                <h3 className="text-md font-semibold text-blue-500">Gemini Settings</h3>
                <div className="bg-background p-3 rounded-md text-sm text-foreground-muted">
                    The Google Gemini API key is securely managed by the environment and configured automatically. You do not need to enter it here.
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-2 text-xs text-accent hover:underline">
                      Create a Gemini API Key here <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                </div>
                 <div>
                    <label htmlFor="gemini-model-name" className="block mb-2 text-sm font-medium text-foreground-muted">Model Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="gemini-model-name"
                        list="gemini-models"
                        value={config.model || ''}
                        onChange={e => setConfig({ ...config, model: e.target.value })}
                        className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 font-mono"
                        placeholder="e.g., gemini-2.5-pro"
                      />
                      <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <datalist id="gemini-models">
                        {geminiModels.map(m => <option key={m} value={m} />)}
                    </datalist>
                </div>
            </div>
          )}

          {config.provider === 'openai-compatible' && (
            <div className="space-y-4 p-4 border border-border rounded-lg">
                <h3 className="text-md font-semibold text-green-500">Local Model Settings</h3>
                 <div>
                    <label htmlFor="local-base-url" className="block mb-2 text-sm font-medium text-foreground-muted">API Base URL</label>
                    <input
                      type="text"
                      id="local-base-url"
                      value={config.baseUrl}
                      onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
                      className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 font-mono"
                      placeholder="e.g., http://localhost:11434/v1"
                    />
                     <p className="mt-2 text-xs text-foreground-muted">The endpoint for your local AI server. The default is for Ollama.</p>
                </div>
                 <div>
                    <label htmlFor="local-model-name" className="block mb-2 text-sm font-medium text-foreground-muted">Model Name</label>
                    <div className="relative">
                        <input
                          type="text"
                          id="local-model-name"
                          list="local-models"
                          value={config.model}
                          onChange={e => setConfig({ ...config, model: e.target.value })}
                          className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 font-mono"
                          placeholder="e.g., llama3, codellama"
                        />
                        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                     <datalist id="local-models">
                        {localModels.map(m => <option key={m} value={m} />)}
                    </datalist>
                     <p className="mt-2 text-xs text-foreground-muted">The name of the model you have pulled on your local server.</p>
                </div>
                <div>
                    <label htmlFor="local-api-key" className="block mb-2 text-sm font-medium text-foreground-muted">API Key (Optional)</label>
                    <input
                      type="password"
                      id="local-api-key"
                      value={config.apiKey || ''}
                      onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                      className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5"
                      placeholder="Leave blank if not needed"
                    />
                     <p className="mt-2 text-xs text-foreground-muted">Most local servers like Ollama don't require an API key.</p>
                </div>
            </div>
          )}
           <p className="text-xs text-foreground-muted">Your settings are stored securely in your browser's local storage and are never sent anywhere except to the chosen AI provider.</p>

        </div>
        <footer className="p-4 bg-background border-t border-border flex justify-between items-center gap-3">
           <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-transparent rounded-lg hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-offset focus:ring-destructive">
             <AlertTriangleIcon className="w-4 h-4" />
            Reset Application
          </button>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground bg-background-offset border border-border rounded-lg hover:bg-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-offset focus:ring-accent">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-accent-foreground bg-accent rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-offset focus:ring-accent">
              Save Settings
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};