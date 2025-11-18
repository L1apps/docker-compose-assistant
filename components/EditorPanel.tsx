import React, { useRef, useState } from 'react';
import { UploadIcon, SaveIcon, SparklesIcon, HelpIcon, BookOpenIcon } from './icons';

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  onAnalyze: () => void;
  onFileLoad: () => void;
  onFileSave: () => void;
  onGetHelp: (keyword: string) => void;
  isLoading: boolean;
  onDowngrade: (targetVersion: string) => void;
  detectedVersion: string;
  isDowngrading: boolean;
  isAiConfigured: boolean;
  onExplain: () => void;
  isExplaining: boolean;
}

const availableVersions = ['3.7', '3.3', '2.4'];

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  code, setCode, onAnalyze, onFileLoad, onFileSave, onGetHelp, isLoading, 
  onDowngrade, detectedVersion, isDowngrading, isAiConfigured,
  onExplain, isExplaining
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [targetVersion, setTargetVersion] = useState<string>('');

  const handleHelpClick = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const { selectionStart, selectionEnd, value } = textarea;
      const selectedText = value.substring(selectionStart, selectionEnd).trim();
      if (selectedText) {
        onGetHelp(selectedText);
      } else {
        alert("Please select a keyword in the editor to get help.");
      }
    }
  };
  
  const handleDowngradeClick = () => {
    if (targetVersion && detectedVersion !== 'N/A' && targetVersion < detectedVersion) {
      if (confirm(`Are you sure you want to downgrade from version ${detectedVersion} to ${targetVersion}? This may remove incompatible features.`)) {
        onDowngrade(targetVersion);
      }
    } else if (targetVersion >= detectedVersion) {
        alert("Please select a version older than the detected version to downgrade.");
    }
  };
  
  const anyLoading = isLoading || isDowngrading || isExplaining;
  const aiDisabledTitle = "Please configure your AI Provider in Settings.";

  return (
    <div className="flex flex-col bg-background-offset rounded-lg border border-border overflow-hidden h-[calc(100vh-150px)] lg:h-auto shadow-sm">
      <div className="flex items-center justify-between p-3 border-b border-border bg-background-offset/80 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-foreground">Editor</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-background p-1 rounded-md">
            <span className="text-xs px-2 text-foreground-muted">Version: <span className="font-bold text-foreground">{detectedVersion}</span></span>
            <select
                value={targetVersion}
                onChange={(e) => setTargetVersion(e.target.value)}
                className="bg-background-offset border border-border text-foreground text-xs rounded-md focus:ring-accent focus:border-accent"
                disabled={!isAiConfigured}
                title={!isAiConfigured ? aiDisabledTitle : undefined}
            >
                <option value="">Downgrade to...</option>
                {availableVersions.filter(v => detectedVersion === 'N/A' || v < detectedVersion).map(v => (
                    <option key={v} value={v}>{v}</option>
                ))}
            </select>
            <button onClick={handleDowngradeClick} disabled={!targetVersion || isDowngrading || !isAiConfigured} title={!isAiConfigured ? aiDisabledTitle : undefined} className="bg-foreground-muted text-background px-2 py-1 rounded-md text-xs hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
              {isDowngrading ? 'Working...' : 'Apply'}
            </button>
          </div>
          <div className="w-px h-6 bg-border"></div>
          <button onClick={handleHelpClick} disabled={!isAiConfigured} className="p-2 rounded-md hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={!isAiConfigured ? aiDisabledTitle : "Get help for selected text"}>
            <HelpIcon className="w-5 h-5" />
          </button>
          <button onClick={onFileLoad} className="p-2 rounded-md hover:bg-background transition-colors" title="Load docker-compose.yml">
            <UploadIcon className="w-5 h-5" />
          </button>
          <button onClick={onFileSave} className="p-2 rounded-md hover:bg-background transition-colors" title="Save docker-compose.yml">
            <SaveIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onExplain}
            disabled={anyLoading || !isAiConfigured}
            title={!isAiConfigured ? aiDisabledTitle : "Get an AI-powered explanation of this file"}
            className="flex items-center gap-2 bg-background text-foreground px-4 py-2 rounded-md border border-border hover:bg-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExplaining ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <BookOpenIcon className="w-5 h-5" />
            )}
            <span>{isExplaining ? 'Explaining...' : 'Explain File'}</span>
          </button>
          <button
            onClick={onAnalyze}
            disabled={anyLoading || !isAiConfigured}
            title={!isAiConfigured ? aiDisabledTitle : undefined}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Analyzing...' : 'Analyze & Fix'}</span>
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-full flex-grow p-4 bg-editor-background text-foreground font-mono text-sm resize-none focus:outline-none"
        placeholder="Paste your docker-compose.yml content here..."
        spellCheck="false"
      />
    </div>
  );
};