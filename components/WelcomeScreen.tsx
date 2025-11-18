import React, { useState } from 'react';
import { AIProviderConfig } from '../types';
import { LogoIcon, ExternalLinkIcon, SparklesIcon, ChevronDownIcon } from './icons';

interface WelcomeScreenProps {
  onConfigured: (config: AIProviderConfig) => void;
}

type Step = 'welcome' | 'provider' | 'configure';

const geminiModels = ['gemini-2.5-pro', 'gemini-2.5-flash'];
const localModels = ['llama3', 'codellama', 'mistral', 'phi3'];

// FIX: Removed `apiKey` from default Gemini config as it's not a valid property and is handled by environment variables.
const defaultConfig: AIProviderConfig = {
    provider: 'gemini',
    model: 'gemini-2.5-pro'
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onConfigured }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [config, setConfig] = useState<AIProviderConfig>(defaultConfig);

  const handleProviderSelect = (provider: 'gemini' | 'openai-compatible') => {
    if (provider === 'gemini') {
        // FIX: Removed `apiKey` from Gemini config as it's not a valid property and is handled by environment variables.
        setConfig({
            provider: 'gemini',
            model: 'gemini-2.5-pro',
        });
    } else {
        setConfig({
            provider: 'openai-compatible',
            apiKey: '',
            baseUrl: 'http://localhost:11434/v1',
            model: 'llama3',
        });
    }
    setStep('configure');
  }

  const renderWelcomeStep = () => (
    <div className="text-center">
      <LogoIcon className="w-16 h-16 text-accent mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to the Docker Compose Assistant</h1>
      <p className="text-lg text-foreground-muted mb-6">Your smart assistant for writing better, safer Docker Compose files.</p>
      <div className="bg-background-offset/50 border border-border rounded-lg p-4 max-w-2xl mx-auto text-left">
          <h2 className="font-semibold text-foreground mb-2">Privacy First</h2>
          <p className="text-sm text-foreground-muted">
            This application runs entirely in your browser. Your Docker Compose code and API keys are **never** sent to our servers. When you use an AI feature, your code is sent directly from your browser to the AI provider you choose. Your configuration is stored locally on your device.
          </p>
      </div>
      <button onClick={() => setStep('provider')} className="mt-8 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent-hover transition-colors">
        Get Started
      </button>
       <button onClick={() => onConfigured(defaultConfig)} className="block mx-auto mt-4 text-sm text-foreground-muted hover:text-foreground transition-colors">
          Skip and configure later
      </button>
    </div>
  );
  
  const renderProviderStep = () => (
     <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Choose Your AI Engine</h1>
        <p className="text-md text-foreground-muted mb-8 max-w-xl mx-auto">Select how you want to power the AI features. You can use a powerful cloud model or run a private model on your own machine.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <button onClick={() => handleProviderSelect('gemini')} className="bg-background-offset p-6 rounded-lg border border-border hover:border-blue-500 hover:bg-background transition-all text-left">
                <h2 className="text-lg font-bold text-foreground mb-2">Cloud AI (Google Gemini)</h2>
                <p className="text-sm text-foreground-muted mb-4">Easy to set up and very powerful. Recommended for most users. Requires an internet connection and a free Google Gemini API key.</p>
                <span className="text-blue-500 font-semibold">Select →</span>
            </button>
            <button onClick={() => handleProviderSelect('openai-compatible')} className="bg-background-offset p-6 rounded-lg border border-border hover:border-green-500 hover:bg-background transition-all text-left">
                <h2 className="text-lg font-bold text-foreground mb-2">Local AI (Ollama, etc.)</h2>
                <p className="text-sm text-foreground-muted mb-4">Maximum privacy. Your code never leaves your computer. Requires a local AI server running an OpenAI-compatible API.</p>
                <span className="text-green-500 font-semibold">Select →</span>
            </button>
        </div>
     </div>
  );

  const renderConfigureStep = () => (
    <div className="w-full max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-4 text-center">Configure Your AI Provider</h1>
        
        {config.provider === 'gemini' ? (
             <div className="space-y-4 p-6 bg-background-offset/50 border border-border rounded-lg">
                <h3 className="text-lg font-semibold text-blue-500 flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> Gemini Settings</h3>
                {/* FIX: Removed API key input for Gemini. The key is now handled automatically via environment variables as per guidelines. Added an informational message instead. */}
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
                        value={config.provider === 'gemini' ? config.model : ''}
                        onChange={e => config.provider === 'gemini' && setConfig({ ...config, model: e.target.value })}
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
        ) : (
            <div className="space-y-4 p-6 bg-background-offset/50 border border-border rounded-lg">
                <h3 className="text-lg font-semibold text-green-500">Local Model Settings</h3>
                 <div>
                    <label htmlFor="local-base-url" className="block mb-2 text-sm font-medium text-foreground-muted">API Base URL</label>
                    <input
                      type="text"
                      id="local-base-url"
                      value={config.provider === 'openai-compatible' ? config.baseUrl : ''}
                      onChange={e => config.provider === 'openai-compatible' && setConfig({ ...config, baseUrl: e.target.value })}
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
                          value={config.provider === 'openai-compatible' ? config.model : ''}
                          onChange={e => config.provider === 'openai-compatible' && setConfig({ ...config, model: e.target.value })}
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
                      value={config.provider === 'openai-compatible' ? config.apiKey : ''}
                      onChange={e => config.provider === 'openai-compatible' && setConfig({ ...config, apiKey: e.target.value })}
                      className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5"
                      placeholder="Leave blank if not needed"
                    />
                </div>
            </div>
        )}
        <div className="flex justify-between items-center mt-8">
            <button onClick={() => setStep('provider')} className="text-sm text-foreground-muted hover:text-foreground">← Back</button>
            {/* FIX: Removed disabled check for Gemini API key, as it's no longer required from the user. */}
            <button onClick={() => onConfigured(config)} className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-semibold hover:bg-accent-hover transition-colors">
                Save & Start Editing
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 transition-colors duration-200">
      {step === 'welcome' && renderWelcomeStep()}
      {step === 'provider' && renderProviderStep()}
      {step === 'configure' && renderConfigureStep()}
    </div>
  );
};
