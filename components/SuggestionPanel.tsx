import React, { useState } from 'react';
import { SparklesIcon, CopyIcon, CheckIcon, SettingsIcon, AlertTriangleIcon } from './icons';
import { Suggestion } from '../types';
import { CodeDiffViewer } from './CodeDiffViewer';

interface SuggestionPanelProps {
  code: string;
  suggestions: Suggestion[];
  correctedCode: string;
  isLoading: boolean;
  isDowngrading: boolean;
  isExplaining: boolean;
  explanation: string;
  error: string;
  onUseCorrectedCode: () => void;
  isAiConfigured: boolean;
  onConfigureAi: () => void;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ 
  code, suggestions, correctedCode, isLoading, error, onUseCorrectedCode, isAiConfigured, onConfigureAi,
  isDowngrading, isExplaining, explanation 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderContent = () => {
    if (isLoading || isDowngrading || isExplaining) {
      let message = 'AI is analyzing your code...';
      if (isExplaining) {
        message = 'AI is explaining your file...';
      } else if (isDowngrading) {
        message = 'AI is downgrading your file...';
      }

      return (
        <div className="flex flex-col items-center justify-center h-full text-foreground-muted">
          <SparklesIcon className="w-12 h-12 animate-pulse text-accent" />
          <p className="mt-4 text-lg">{message}</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-destructive bg-destructive-foreground/50 rounded-md flex items-start gap-3">
          <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-1">An Error Occurred</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (!isAiConfigured) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-foreground-muted text-center">
          <SettingsIcon className="w-12 h-12" />
          <p className="mt-4 text-lg">AI Features Disabled</p>
          <p className="text-sm">Please configure your AI Provider to get feedback.</p>
          <button
            onClick={onConfigureAi}
            className="mt-4 bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover transition-colors"
          >
            Open Settings
          </button>
        </div>
      );
    }
    
    if (suggestions.length === 0 && !correctedCode && !explanation) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-foreground-muted">
          <SparklesIcon className="w-12 h-12" />
          <p className="mt-4 text-lg">Suggestions will appear here</p>
          <p className="text-sm">Click "Analyze & Fix" to get started.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {explanation && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">File Explanation</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 rounded-md text-foreground">
              {explanation.split('\n').map((line, i) => line.trim() && <p key={i}>{line}</p>)}
            </div>
          </div>
        )}
        {correctedCode && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-foreground">Corrected Code</h3>
              <div className="flex gap-2">
                 <button 
                    onClick={handleCopy}
                    className="p-2 rounded-md hover:bg-background transition-colors"
                    title={copied ? "Copied!" : "Copy code"}
                  >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={onUseCorrectedCode}
                    className="bg-foreground-muted text-background px-3 py-1 rounded-md text-sm hover:opacity-80 transition-colors"
                  >
                    Use this code
                  </button>
              </div>
            </div>
            <CodeDiffViewer oldCode={code} newCode={correctedCode} />
          </div>
        )}
        {suggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Suggestions & Explanations</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 rounded-md">
              <ul className="list-disc pl-5 space-y-4">
                {suggestions.map((item, index) => (
                  <li key={index} className="text-foreground">
                    {item.suggestion}
                    {item.example && (
                      <pre className="bg-background-offset p-2 rounded-md mt-2 text-xs text-foreground-muted overflow-x-auto">
                        <code>{item.example}</code>
                      </pre>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-background-offset rounded-lg border border-border h-[calc(100vh-150px)] lg:h-auto shadow-sm">
      <div className="p-3 border-b border-border bg-background-offset/80">
        <h2 className="text-lg font-semibold text-foreground">AI Feedback</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};