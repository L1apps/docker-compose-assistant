import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { SuggestionPanel } from './components/SuggestionPanel';
import { AIProvider } from './services/aiProvider';
import { createAIProvider } from './services/aiServiceFactory';
import { ContextualHelpResult, Suggestion, AIProviderConfig } from './types';
import { ExternalLinkIcon, InfoIcon, DockerIcon, SettingsIcon, MailIcon } from './components/icons';
import { HelpModal } from './components/HelpModal';
import { AboutModal } from './components/AboutModal';
import { ThemeSwitcher, Theme } from './components/ThemeSwitcher';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';

const APP_VERSION = "1.8.0";
const DOCKER_HUB_URL = "https://hub.docker.com/r/l1apps/docker-compose-assistant";

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
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [helpContent, setHelpContent] = useState<ContextualHelpResult | null>(null);
  const [helpKeyword, setHelpKeyword] = useState<string>('');
  const [isHelpLoading, setIsHelpLoading] = useState<boolean>(false);
  const [helpError, setHelpError] = useState<string>('');

  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const [aiProviderConfig, setAIProviderConfig] = useState<AIProviderConfig | null>(() => {
    try {
      const storedConfig = localStorage.getItem('aiProviderConfig');
      return storedConfig ? JSON.parse(storedConfig) : null;
    } catch {
      localStorage.removeItem('aiProviderConfig');
      return null;
    }
  });

  const [showWelcome, setShowWelcome] = useState<boolean>(!aiProviderConfig);
  const [aiProvider, setAIProvider] = useState<AIProvider | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Effect to sync theme changes to localStorage and DOM
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setAIProvider(createAIProvider(aiProviderConfig));
  }, [aiProviderConfig]);

  const handleConfigSave = (config: AIProviderConfig) => {
    setAIProviderConfig(config);
    localStorage.setItem('aiProviderConfig', JSON.stringify(config));
    setShowWelcome(false);
    setIsSettingsModalOpen(false);
  };
    
  const handleSkipWelcome = () => {
    setShowWelcome(false);
  };
    
  const handleResetConfig = () => {
    if (confirm("Are you sure you want to reset all application settings? This will remove your AI provider configuration and reload the application.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!aiProvider) return;
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
    if (!aiProvider) return;
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
  
  const handleFormatCode = useCallback(async () => {
    if (!aiProvider) return;
    setIsFormatting(true);
    setError('');
    setSuggestions([]);
    setCorrectedCode('');
    setExplanation('');
    try {
      const result = await aiProvider.formatCode(code);
      // Instead of setting code directly, we set correctedCode to trigger the Diff Viewer
      setCorrectedCode(result.formattedCode);
      setSuggestions([{ suggestion: "The code has been formatted to standard YAML spacing and syntax standards." }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while formatting the code.');
      console.error(e);
    } finally {
      setIsFormatting(false);
    }
  }, [code, aiProvider]);

  const handleGetHelp = useCallback(async (keyword: string) => {
    if (!aiProvider) return;
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

  const handleClear = useCallback(() => {
    if (code.trim() !== '' && !window.confirm('Are you sure you want to clear the editor? This cannot be undone.')) {
      return;
    }
    setCode('');
    setSuggestions([]);
    setCorrectedCode('');
    setExplanation('');
    setError('');
  }, [code]);

  const handleUseCorrectedCode = () => {
    if (correctedCode) {
      setCode(correctedCode);
      setCorrectedCode('');
      setSuggestions([]);
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onConfigured={handleConfigSave} onSkip={handleSkipWelcome} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <header className="bg-background-offset/80 backdrop-blur-sm border-b border-border p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Docker Compose Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://docs.docker.com/reference/compose-file/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground-muted hover:text-accent transition-colors hidden sm:flex">
              Compose Docs
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
            <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
             <a href={DOCKER_HUB_URL} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-background-offset transition-colors" title="View on Docker Hub">
                <DockerIcon className="w-5 h-5" />
            </a>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-md hover:bg-background-offset transition-colors" title="AI Provider Settings">
              <SettingsIcon className="w-5 h-5" />
            </button>
             <div className="w-px h-6 bg-border mx-2"></div>
             <button onClick={() => setIsAboutModalOpen(true)} className="p-2 rounded-md hover:bg-background-offset transition-colors" title="About this Web Application">
              <InfoIcon className="w-5 h-5" />
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
          onClear={handleClear}
          onGetHelp={handleGetHelp}
          isLoading={isLoading}
          onExplain={handleExplain}
          isExplaining={isExplaining}
          onFormatCode={handleFormatCode}
          isFormatting={isFormatting}
          isAIConfigured={!!aiProvider}
        />
        <SuggestionPanel
          code={code}
          suggestions={suggestions}
          correctedCode={correctedCode}
          isLoading={isLoading}
          isExplaining={isExplaining}
          isFormatting={isFormatting}
          explanation={explanation}
          error={error}
          onUseCorrectedCode={handleUseCorrectedCode}
          isAIConfigured={!!aiProvider}
        />
      </main>
      
      <input type="file" ref={fileInputRef} onChange={handleFileLoad} className="hidden" accept=".yml,.yaml" />

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} keyword={helpKeyword} content={helpContent} isLoading={isHelpLoading} error={helpError} />
      
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} version={APP_VERSION} dockerHubUrl={DOCKER_HUB_URL} />

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        onSave={handleConfigSave}
        initialConfig={aiProviderConfig}
        onReset={handleResetConfig}
      />

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 lg:px-6 py-3 flex justify-between items-center text-xs text-foreground-muted">
          <span>Version {APP_VERSION} &copy; {new Date().getFullYear()} L1Apps. Apache 2.0 Licensed.</span>
          <div className="flex items-center gap-4">
            <a href="mailto:services@l1apps.com" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <MailIcon className="w-4 h-4" />
              <span>Support</span>
            </a>
            <a href={DOCKER_HUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <DockerIcon className="w-4 h-4" />
              <span>Docker Hub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;