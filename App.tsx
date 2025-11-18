import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { SuggestionPanel } from './components/SuggestionPanel';
import { AIProvider } from './services/aiProvider';
import { getAIProvider } from './services/aiServiceFactory';
import { ContextualHelpResult, Suggestion, AIProviderConfig } from './types';
import { LogoIcon, ExternalLinkIcon, SettingsIcon, InfoIcon, FeedbackIcon } from './components/icons';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { ThemeSwitcher, Theme } from './components/ThemeSwitcher';

const APP_VERSION = "1.7.0";
const GITHUB_REPO_URL = "https://github.com/<your-username>/<your-repo-name>"; // TODO: Replace with your repo URL
const defaultAiConfig: AIProviderConfig = { provider: 'gemini', model: 'gemini-2.5-pro' };

const App: React.FC = () => {
  const [code, setCode] = useState<string>(`# Paste your docker-compose.yml here or load a file.
# Then click "Analyze & Fix" to get suggestions.

version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
    - "8080:80"
  db:
    image: postgres:latest
    environment:
      POSTGRES_PASSWORD: mysecretpassword
`);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [correctedCode, setCorrectedCode] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [helpContent, setHelpContent] = useState<ContextualHelpResult | null>(null);
  const [helpKeyword, setHelpKeyword] = useState<string>('');
  const [isHelpLoading, setIsHelpLoading] = useState<boolean>(false);
  const [helpError, setHelpError] = useState<string>('');

  const [detectedVersion, setDetectedVersion] = useState<string>('');
  const [isDowngrading, setIsDowngrading] = useState<boolean>(false);
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(() => {
    const savedConfig = localStorage.getItem('aiConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultAiConfig;
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (document.documentElement.dataset.theme as Theme) || 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const aiProvider: AIProvider | null = useMemo(() => {
    try {
      return getAIProvider(aiConfig);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to initialize AI provider.');
      return null;
    }
  }, [aiConfig]);
  
  const isAiConfigured = !!aiProvider;

  useEffect(() => {
    const match = code.match(/version:\s*['"]?(\d+\.\d+)['"]?/);
    setDetectedVersion(match ? match[1] : 'N/A');
  }, [code]);

  const handleConfigSave = (config: AIProviderConfig) => {
    setAiConfig(config);
    localStorage.setItem('aiConfig', JSON.stringify(config));
    setError(''); // Clear any previous errors on new config
  };
  
  const handleResetApp = () => {
    if (window.confirm("Are you sure you want to reset the web application? All settings will be cleared.")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  const ensureAiIsConfigured = (): boolean => {
    if (!isAiConfigured) {
      setError("Please configure your AI Provider. You can do this from the Settings menu.");
      setIsSettingsModalOpen(true);
      return false;
    }
    setError('');
    return true;
  }

  const handleAnalyze = useCallback(async () => {
    if (!ensureAiIsConfigured() || !aiProvider) return;
    setIsLoading(true);
    setError('');
    setSuggestions([]);
    setCorrectedCode('');
    setExplanation('');
    try {
      const result = await aiProvider.getSuggestionsAndCorrections(code);
      setSuggestions(result.suggestions);
      setCorrectedCode(result.correctedCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [code, aiProvider]);

  const handleExplain = useCallback(async () => {
    if (!ensureAiIsConfigured() || !aiProvider) return;
    setIsExplaining(true);
    setError('');
    setSuggestions([]);
    setCorrectedCode('');
    setExplanation('');
    try {
      const result = await aiProvider.getExplanation(code);
      setExplanation(result.explanation);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while generating the explanation.');
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  }, [code, aiProvider]);

  const handleGetHelp = useCallback(async (keyword: string) => {
    if (!ensureAiIsConfigured() || !aiProvider) return;
    setHelpKeyword(keyword);
    setIsHelpModalOpen(true);
    setIsHelpLoading(true);
    setHelpError('');
    setHelpContent(null);
    try {
      const result = await aiProvider.getContextualHelp(keyword);
      setHelpContent(result);
    } catch (e) {
      setHelpError(e instanceof Error ? e.message : `Failed to get help for "${keyword}".`);
      console.error(e);
    } finally {
      setIsHelpLoading(false);
    }
  }, [aiProvider]);
  
  const handleDowngrade = useCallback(async (targetVersion: string) => {
    if (!ensureAiIsConfigured() || !aiProvider) return;
    setIsDowngrading(true);
    setError('');
    setSuggestions([]);
    setCorrectedCode('');
    setExplanation('');
    try {
      const result = await aiProvider.downgradeComposeVersion(code, targetVersion);
      setSuggestions(result.changes);
      setCorrectedCode(result.downgradedCode);
      setCode(result.downgradedCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to downgrade to version ${targetVersion}.`);
      console.error(e);
    } finally {
      setIsDowngrading(false);
    }
  }, [code, aiProvider]);

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCode(text);
        setSuggestions([]);
        setCorrectedCode('');
        setExplanation('');
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const triggerFileLoad = () => fileInputRef.current?.click();

  const handleFileSave = () => {
    const contentToSave = correctedCode || code;
    const blob = new Blob([contentToSave], { type: 'text/yaml;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "docker-compose.yml");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUseCorrectedCode = () => {
    if (correctedCode) setCode(correctedCode);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <header className="bg-background-offset/80 backdrop-blur-sm border-b border-border p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-accent" />
            <h1 className="text-xl font-bold text-foreground">Docker Compose Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://docs.docker.com/reference/compose-file/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground-muted hover:text-accent transition-colors">
              Compose Docs
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
            <div className="w-px h-6 bg-border mx-2"></div>
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
             <a href={`${GITHUB_REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-background-offset transition-colors" title="Report an Issue">
                <FeedbackIcon className="w-5 h-5" />
            </a>
             <button onClick={() => setIsAboutModalOpen(true)} className="p-2 rounded-md hover:bg-background-offset transition-colors" title="About this Web Application">
              <InfoIcon className="w-5 h-5" />
            </button>
             <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-md hover:bg-background-offset transition-colors" title="AI Provider Settings">
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <EditorPanel
          code={code}
          setCode={setCode}
          onAnalyze={handleAnalyze}
          onFileLoad={triggerFileLoad}
          onFileSave={handleFileSave}
          onGetHelp={handleGetHelp}
          isLoading={isLoading}
          onDowngrade={handleDowngrade}
          detectedVersion={detectedVersion}
          isDowngrading={isDowngrading}
          isAiConfigured={isAiConfigured}
          onExplain={handleExplain}
          isExplaining={isExplaining}
        />
        <SuggestionPanel
          code={code}
          suggestions={suggestions}
          correctedCode={correctedCode}
          isLoading={isLoading}
          isDowngrading={isDowngrading}
          isExplaining={isExplaining}
          explanation={explanation}
          error={error}
          onUseCorrectedCode={handleUseCorrectedCode}
          isAiConfigured={isAiConfigured}
          onConfigureAi={() => setIsSettingsModalOpen(true)}
        />
      </main>
      
      <input type="file" ref={fileInputRef} onChange={handleFileLoad} className="hidden" accept=".yml,.yaml" />

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} keyword={helpKeyword} content={helpContent} isLoading={isHelpLoading} error={helpError} />
      
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onSave={handleConfigSave} initialConfig={aiConfig} onReset={handleResetApp} />

      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} version={APP_VERSION} repoUrl={GITHUB_REPO_URL} />

      <footer className="text-center p-4 text-xs text-foreground-muted border-t border-border mt-auto">
        <p>
          Copyright © {new Date().getFullYear()} Your Name Here. Apache 2.0 Licensed.
          <br />
          Encounter a bug or have a suggestion? Please <a href={`${GITHUB_REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">open an issue on GitHub</a>.
        </p>
      </footer>
    </div>
  );
};

export default App;