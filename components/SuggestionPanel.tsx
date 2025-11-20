import React, { useState } from 'react';
import { SparklesIcon, CopyIcon, CheckIcon, SettingsIcon, AlertTriangleIcon } from './icons';
import { Suggestion } from '../types';
import { CodeDiffViewer } from './CodeDiffViewer';

interface SuggestionPanelProps {
  code: string;
  suggestions: Suggestion[];
  correctedCode: string;
  isLoading: boolean;
  isExplaining: boolean;
  isFormatting: boolean;
  explanation: string;
  error: string;
  onUseCorrectedCode: () => void;
  isAIConfigured: boolean;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ 
  code, suggestions, correctedCode, isLoading, error, onUseCorrectedCode,
  isExplaining, isFormatting, explanation, isAIConfigured 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderContent = () => {
    if (isLoading || isExplaining || isFormatting) {
      let message = 'AI is analyzing your code...';
      if (isExplaining) {
        message = 'AI is explaining your file...';
      } else if (isFormatting) {
        message = 'AI is formatting your file...';
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
    
    if (suggestions.length === 0 && !correctedCode && !explanation) {
      if (!isAIConfigured) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-foreground-muted text-center p-4">
            <SettingsIcon className="w-12 h-12" />
            <p className="mt-4 text-lg font-semibold text-foreground">AI Not Configured</p>
            <p className="text-sm mt-1">Please set up your AI provider in the settings (⚙️) to enable analysis and other features.</p>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center h-full text-foreground-muted">
          <SparklesIcon className="w-12 h-12" />
          <p className="mt-4 text-lg">Suggestions will appear here</p>
          <p className="text-sm">Click "Analyze & Fix" or "Format" to see changes.</p>
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
              <h3 className="text-lg font-semibold text-foreground">Proposed Changes</h3>
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
                    className="bg-accent text-accent-foreground px-3 py-1 rounded-md text-sm hover:bg-accent-hover transition-colors shadow-sm font-medium"
                  >
                    Apply Changes
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
      <div className="p-2 border-b border-border bg-background-offset/80">
        <h2 className="text-sm font-semibold text-foreground px-2">AI Feedback & Preview</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};