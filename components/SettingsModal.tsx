import React, { useState, useEffect } from 'react';
import { AIProviderConfig } from '../types';
import { ChevronDownIcon, AlertTriangleIcon, CheckIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIProviderConfig) => void;
  initialConfig?: AIProviderConfig | null;
  onReset: () => void;
}

const defaultConfig: AIProviderConfig = {
    provider: 'gemini',
    model: 'gemini-2.5-pro'
};

const geminiModels = ['gemini-2.5-pro', 'gemini-2.5-flash'];
const localModels = ['llama3', 'codellama', 'mistral', 'phi3', 'gemma3'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialConfig, onReset }) => {
  const [config, setConfig] = useState<AIProviderConfig>(initialConfig || defaultConfig);
  const [isGeminiKeySelected, setIsGeminiKeySelected] = useState(true);
  const [isAistudioAvailable, setIsAistudioAvailable] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    setConfig(initialConfig || defaultConfig);
    const aistudioExists = !!(window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function');
    setIsAistudioAvailable(aistudioExists);

    if (isOpen) {
      setConnectionStatus('idle');
      setConnectionError('');
      if ((initialConfig?.provider === 'gemini' || !initialConfig) && aistudioExists) {
          const checkKey = async () => {
              const hasKey = await window.aistudio.hasSelectedApiKey();
              setIsGeminiKeySelected(hasKey);
          };
          checkKey();
      } else if (config.provider === 'gemini' && !aistudioExists) {
        setIsGeminiKeySelected(!!config.apiKey);
      }
    }
  }, [initialConfig, isOpen, config.provider]);

  if (!isOpen) {
    return null;
  }

  const handleProviderChange = (provider: 'gemini' | 'openai-compatible') => {
    setConnectionStatus('idle');
    setConnectionError('');
    if (provider === 'gemini') {
        const newConfig: AIProviderConfig = {
            provider: 'gemini',
            model: 'gemini-2.5-pro',
        };
        setConfig(newConfig);
        if (isAistudioAvailable) {
            const checkKey = async () => {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsGeminiKeySelected(hasKey);
            };
            checkKey();
        } else {
             setIsGeminiKeySelected(!!newConfig.apiKey);
        }
    } else {
        setConfig({
            provider: 'openai-compatible',
            apiKey: '', // Reset API key for local models
            baseUrl: 'http://localhost:11434/v1',
            model: 'llama3',
        });
    }
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
      const newConfig = { ...config, [field]: value };
      setConfig(newConfig);
      if (field === 'apiKey' && !isAistudioAvailable) {
          setIsGeminiKeySelected(!!value);
      }
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
             const res = await fetch(`${url}/models`);
             if (res.ok) {
                 const data = await res.json();
                 return { success: true, data };
             }
             return { success: false, data: null };
        } catch (e) {
            return { success: false, data: null };
        }
    };

    try {
        // Attempt 1: Try URL exactly as entered
        let result = await tryFetch(urlToTest);
        let data = result.data;
        
        if (result.success) {
            successUrl = urlToTest;
        } 
        // Attempt 2: Try appending /v1 if it wasn't there
        else if (!urlToTest.endsWith('/v1')) {
            const v1Url = `${urlToTest}/v1`;
            result = await tryFetch(v1Url);
            if (result.success) {
                successUrl = v1Url;
                data = result.data;
            }
        }

        if (successUrl) {
            setConnectionStatus('success');
            
            // Check if the configured model exists in the list
            let warningMsg = '';
            if (data && data.data && Array.isArray(data.data)) {
                 const modelId = config.model.trim();
                 // Loose match because models often have :latest or different tags
                 const found = data.data.some((m: any) => m.id === modelId || m.id.startsWith(modelId + ':'));
                 
                 if (!found) {
                     const available = data.data.map((m: any) => m.id).slice(0, 5).join(', ');
                     warningMsg = `Connected, but model '${modelId}' not found. Available: ${available}...`;
                 }
            }

            if (successUrl !== config.baseUrl) {
                 handleOpenAICompatibleChange('baseUrl', successUrl);
                 if (!warningMsg) warningMsg = 'URL auto-corrected to include /v1';
                 else warningMsg += ' (URL also auto-corrected)';
            }
            
            // If there's a warning (wrong model or fixed URL), show it
            if (warningMsg) {
                setConnectionError(warningMsg);
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

  const handleSave = () => {
    onSave(config);
    onClose();
  };
  
  const isSaveDisabled = config.provider === 'gemini' && !isGeminiKeySelected;

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
                {isAistudioAvailable ? (
                  <>
                    {isGeminiKeySelected ? (
                        <div className="bg-background p-3 rounded-md text-sm text-green-500 flex items-center gap-2">
                            <CheckIcon className="w-5 h-5" />
                            <span>Gemini API Key is configured. You can change it below.</span>
                        </div>
                    ) : null}
                    <div className="bg-background p-3 rounded-md text-sm text-foreground-muted">
                        To use Gemini, you must select an API key. This will open a dialog from Google AI Studio.
                        <button onClick={handleSelectKey} className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                            {isGeminiKeySelected ? 'Change Gemini API Key' : 'Select Gemini API Key'}
                        </button>
                    </div>
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
                        value={config.model || ''}
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
          )}

          {config.provider === 'openai-compatible' && (
            <div className="space-y-4 p-4 border border-border rounded-lg">
                <h3 className="text-md font-semibold text-green-500">Local Model Settings</h3>
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
            <button 
              onClick={handleSave} 
              disabled={isSaveDisabled}
              className="px-4 py-2 text-sm font-medium text-accent-foreground bg-accent rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-offset focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Settings
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};