import React, { useState, useEffect } from 'react';
import { AIProviderConfig } from '../types';
import { LogoIcon, SparklesIcon, ChevronDownIcon, CheckIcon, AlertTriangleIcon } from './icons';

interface WelcomeScreenProps {
  onConfigured: (config: AIProviderConfig) => void;
  onSkip: () => void;
}

type Step = 'welcome' | 'provider' | 'configure';

const geminiModels = ['gemini-2.5-pro', 'gemini-2.5-flash'];
const localModels = ['llama3', 'codellama', 'mistral', 'phi3', 'gemma3'];

const defaultConfig: AIProviderConfig = {
    provider: 'gemini',
    model: 'gemini-2.5-pro'
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onConfigured, onSkip }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [config, setConfig] = useState<AIProviderConfig>(defaultConfig);
  const [isGeminiKeySelected, setIsGeminiKeySelected] = useState(false);
  const [isAistudioAvailable, setIsAistudioAvailable] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    const aistudioExists = !!(window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function');
    setIsAistudioAvailable(aistudioExists);
    
    // Check API key status when the configuration step for Gemini is shown
    if (step === 'configure' && config.provider === 'gemini' && aistudioExists) {
      const checkKey = async () => {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsGeminiKeySelected(hasKey);
      };
      checkKey();
    }
  }, [step, config.provider]);

  const handleProviderSelect = (provider: 'gemini' | 'openai-compatible') => {
    if (provider === 'gemini') {
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
    setConnectionStatus('idle');
    setConnectionError('');
  }
  
  const handleSelectKey = async () => {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setIsGeminiKeySelected(true);
      } else {
        alert('API key selection is not available in this environment.');
      }
  };

  const handleGeminiChange = (field: 'model' | 'apiKey', value: string) => {
    if (config.provider === 'gemini') {
      setConfig({
        ...config,
        [field]: value,
      });
    }
  };

  const handleOpenAICompatibleChange = (field: 'baseUrl' | 'model' | 'apiKey', value: string) => {
    if (config.provider === 'openai-compatible') {
      setConfig({
        ...config,
        [field]: value,
      });
      setConnectionStatus('idle');
      setConnectionError('');
    }
  };

  const testConnection = async () => {
    if (config.provider !== 'openai-compatible') return;
    
    setConnectionStatus('testing');
    setConnectionError('');

    let urlToTest = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    let successUrl = '';

    const tryFetch = async (url: string) => {
        try {
             // Try fetching models. standard OpenAI is /v1/models.
             // Some users might put .../v1 in the box, some might put just the root.
             // We construct a path to /models relative to the input.
             const res = await fetch(`${url}/models`);
             if (res.ok) return true;
             return false;
        } catch (e) {
            return false;
        }
    };

    try {
        // Attempt 1: Try URL exactly as entered
        if (await tryFetch(urlToTest)) {
            successUrl = urlToTest;
        } 
        // Attempt 2: Try appending /v1 if it wasn't there
        else if (!urlToTest.endsWith('/v1')) {
            const v1Url = `${urlToTest}/v1`;
            if (await tryFetch(v1Url)) {
                successUrl = v1Url;
            }
        }

        if (successUrl) {
            setConnectionStatus('success');
            // Auto-update the config if we found the correct path was different
            if (successUrl !== config.baseUrl) {
                 handleOpenAICompatibleChange('baseUrl', successUrl);
                 setConnectionError('URL auto-corrected to include /v1');
            }
        } else {
             throw new Error('Connection failed');
        }

    } catch (e) {
        setConnectionStatus('error');
        let msg = 'Could not connect.';
        
        if (window.location.protocol === 'https:' && config.baseUrl.startsWith('http:')) {
             msg = 'Blocked: You are running this app on HTTPS but trying to connect to an insecure HTTP server. This is blocked by the browser (Mixed Content).';
        } else {
             msg = 'Could not connect. Ensure the server is running, reachable, and has "OLLAMA_ORIGINS" set to "*" if remote.';
        }
        setConnectionError(msg);
    }
  };

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
       <button onClick={onSkip} className="block mx-auto mt-4 text-sm text-foreground-muted hover:text-foreground transition-colors">
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

  const renderConfigureStep = () => {
    const isSaveDisabled = config.provider === 'gemini' && (isAistudioAvailable ? !isGeminiKeySelected : !config.apiKey);
    
    return (
        <div className="w-full max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-4 text-center">Configure Your AI Provider</h1>
            
            {config.provider === 'gemini' ? (
                 <div className="space-y-4 p-6 bg-background-offset/50 border border-border rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-500 flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> Gemini Settings</h3>
                    {isAistudioAvailable ? (
                        <>
                            {isGeminiKeySelected ? (
                              <div className="bg-background p-3 rounded-md text-sm text-green-500 flex items-center gap-2">
                                <CheckIcon className="w-5 h-5" />
                                <span>Gemini API Key is configured.</span>
                              </div>
                            ) : (
                              <div className="bg-background p-3 rounded-md text-sm text-foreground-muted">
                                To use Gemini, you must select an API key. This will open a dialog from Google AI Studio.
                                <button onClick={handleSelectKey} className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                                  Select Gemini API Key
                                </button>
                              </div>
                            )}
                        </>
                    ) : (
                       <div>
                          <label htmlFor="gemini-api-key" className="block mb-2 text-sm font-medium text-foreground-muted">API Key</label>
                          <input
                            type="password"
                            id="gemini-api-key"
                            value={config.apiKey || ''}
                            onChange={(e) => handleGeminiChange('apiKey', e.target.value)}
                            className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 font-mono"
                            placeholder="Enter your Gemini API Key"
                          />
                           <p className="mt-2 text-xs text-foreground-muted">
                            You can get a free API key from{' '}
                            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
                              Google AI Studio
                            </a>.
                          </p>
                      </div>
                    )}
                     <div className="mt-3 bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-3 rounded-r-lg" role="alert">
                        <div className="flex items-start">
                            <AlertTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-sm">Billing Required</p>
                                <p className="text-xs">
                                    Your Google Cloud project must have billing enabled to use the Gemini API. This is a requirement even for the free tier.
                                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline ml-1 font-semibold">Learn More</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="gemini-model-name" className="block mb-2 text-sm font-medium text-foreground-muted">Model Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            id="gemini-model-name"
                            list="gemini-models"
                            value={config.model}
                            onChange={e => handleGeminiChange('model', e.target.value)}
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
                        <div className="flex gap-2">
                            <input
                              type="text"
                              id="local-base-url"
                              value={config.baseUrl}
                              onChange={e => handleOpenAICompatibleChange('baseUrl', e.target.value)}
                              className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 font-mono flex-grow"
                              placeholder="e.g., http://localhost:11434/v1"
                            />
                             <button
                                onClick={testConnection}
                                disabled={connectionStatus === 'testing'}
                                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                                    connectionStatus === 'success' 
                                    ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                    : connectionStatus === 'error'
                                    ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                    : 'bg-background-offset border-border hover:bg-border'
                                }`}
                                title="Test Connection"
                            >
                               {connectionStatus === 'testing' ? (
                                   <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                   </svg>
                               ) : connectionStatus === 'success' ? 'OK' : 'Test'}
                            </button>
                        </div>
                        {connectionError ? (
                            <p className="mt-2 text-xs text-destructive">{connectionError}</p>
                        ) : connectionStatus === 'success' ? (
                            <p className="mt-2 text-xs text-green-500">Successfully connected to local AI server.</p>
                        ) : null}
                         <p className="mt-2 text-xs text-foreground-muted">The endpoint for your local AI server. Default for Ollama is <code>http://localhost:11434/v1</code>.</p>
                    </div>
                     <div>
                        <label htmlFor="local-model-name" className="block mb-2 text-sm font-medium text-foreground-muted">Model Name</label>
                         <div className="relative">
                            <input
                              type="text"
                              id="local-model-name"
                              list="local-models"
                              value={config.model}
                              onChange={e => handleOpenAICompatibleChange('model', e.target.value)}
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
                          onChange={e => handleOpenAICompatibleChange('apiKey', e.target.value)}
                          className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5"
                          placeholder="Leave blank if not needed"
                        />
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mt-8">
                <button onClick={() => setStep('provider')} className="text-sm text-foreground-muted hover:text-foreground">← Back</button>
                <button 
                    onClick={() => onConfigured(config)} 
                    disabled={isSaveDisabled}
                    className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Save & Start Editing
                </button>
            </div>
        </div>
      );
    };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 transition-colors duration-200">
      {step === 'welcome' && renderWelcomeStep()}
      {step === 'provider' && renderProviderStep()}
      {step === 'configure' && renderConfigureStep()}
    </div>
  );
};