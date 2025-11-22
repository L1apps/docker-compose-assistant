import React, { useState } from 'react';
import { SparklesIcon, CopyIcon, CheckIcon, SettingsIcon, AlertTriangleIcon, InfoIcon } from './icons';
import { Suggestion, ContextualHelpResult, AIProviderConfig } from '../types';
import { CodeDiffViewer } from './CodeDiffViewer';

interface SuggestionPanelProps {
  code: string;
  suggestions: Suggestion[];
  correctedCode: string;
  explanation: string;
  helpContent: ContextualHelpResult | null;
  helpKeyword?: string;
  isLoading: boolean;
  isExplaining: boolean;
  isFormatting: boolean;
  error: string;
  onUseCorrectedCode: () => void;
  isAIConfigured: boolean;
  aiProviderConfig: AIProviderConfig | null;
}

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const renderedLines = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const key = i;
    
    if (line.startsWith('### ')) {
      if (inList) { renderedLines.push(<ul key={`ul-end-${key}`} className="list-disc pl-5 mb-4 space-y-1" />); inList = false; }
      renderedLines.push(<h3 key={key} className="text-lg font-bold mt-4 mb-2 text-foreground">{processInline(line.substring(4))}</h3>);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { renderedLines.push(<ul key={`ul-end-${key}`} className="list-disc pl-5 mb-4 space-y-1" />); inList = false; }
      renderedLines.push(<h2 key={key} className="text-xl font-bold mt-4 mb-2 text-foreground">{processInline(line.substring(3))}</h2>);
      continue;
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
       if (!inList) {
           const listItems = [];
           let j = i;
           while(j < lines.length && (lines[j].trim().startsWith('- ') || lines[j].trim().startsWith('* '))) {
               listItems.push(
                   <li key={j} className="text-foreground">
                       {processInline(lines[j].trim().substring(2))}
                   </li>
               );
               j++;
           }
           renderedLines.push(<ul key={`ul-${key}`} className="list-disc pl-5 mb-4 space-y-1">{listItems}</ul>);
           i = j - 1; 
           inList = false; 
           continue;
       }
    }
    
    if (!line.trim()) {
        continue;
    }

    if (inList) { inList = false; }
    renderedLines.push(<p key={key} className="mb-2 text-foreground leading-relaxed">{processInline(line)}</p>);
  }

  return <div>{renderedLines}</div>;
};

const processInline = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
        }
        const codeParts = part.split(/(`.*?`)/g);
         return codeParts.map((subPart, subIndex) => {
             if (subPart.startsWith('`') && subPart.endsWith('`')) {
                 return <code key={`${index}-${subIndex}`} className="bg-background-offset px-1 py-0.5 rounded text-sm font-mono">{subPart.substring(1, subPart.length - 1)}</code>;
             }
             return subPart;
         });
    });
};

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ 
  code, suggestions, correctedCode, isLoading, error, onUseCorrectedCode,
  isExplaining, isFormatting, explanation, helpContent, helpKeyword, isAIConfigured, aiProviderConfig
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

    if (helpContent) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
             <InfoIcon className="w-5 h-5 text-accent" />
             <h3 className="text-lg font-semibold text-foreground">Contextual Help: <span className="font-mono text-accent">{helpKeyword}</span></h3>
          </div>
          
          <div>
            <h4 className="text-md font-bold text-foreground mb-2">Explanation</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 rounded-md text-foreground">
              <SimpleMarkdown text={helpContent.explanation} />
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-bold text-foreground mb-2">Example Usage</h4>
            <pre className="bg-background p-3 rounded-md overflow-x-auto text-sm text-foreground font-mono border border-border">
              <code>{helpContent.example}</code>
            </pre>
          </div>
        </div>
      );
    }
    
    const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
    
    if (safeSuggestions.length === 0 && !correctedCode && !explanation) {
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
          <p className="text-sm">Select a Version or click "Analyze & Fix".</p>
          
          {isAIConfigured && aiProviderConfig && (
             <div className="mt-8 p-4 bg-background rounded-md border border-border text-xs text-foreground-muted flex flex-col items-center max-w-xs text-center shadow-sm">
                <span className="font-semibold mb-1 uppercase tracking-wider opacity-70">Currently using the following AI Model:</span>
                <div className="flex flex-col items-center gap-1 mt-1">
                    <span className="font-bold text-foreground text-sm">
                        {aiProviderConfig.provider === 'gemini' ? 'Google Gemini' : 'Local AI'}
                    </span>
                    <span className="font-mono text-accent text-sm bg-accent/10 px-2 py-0.5 rounded">{aiProviderConfig.model}</span>
                </div>
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {explanation && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">File Explanation</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 rounded-md text-foreground">
              <SimpleMarkdown text={explanation} />
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
        {safeSuggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Suggestions & Explanations</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 rounded-md">
              <ul className="list-disc pl-5 space-y-4">
                {safeSuggestions.map((item, index) => (
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
    <div className="flex flex-col h-[calc(100vh-150px)] lg:h-auto">
      {/* Folder Tab Header */}
      <div className="flex px-4">
         <div className="px-4 py-2 bg-background-offset border-t border-x border-border rounded-t-lg font-semibold text-sm transform translate-y-[1px] z-10 select-none shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
           AI Feedback & Preview
         </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-grow bg-background-offset border border-border rounded-lg rounded-tl-none overflow-hidden shadow-sm relative z-0">
          <div className="flex-grow p-4 overflow-y-auto">
            {renderContent()}
          </div>
          <div className="p-4 border-t border-border bg-background/50 text-center flex items-center justify-center gap-3 text-destructive">
            <AlertTriangleIcon className="w-6 h-6 flex-shrink-0" />
            <span className="text-base font-extrabold">
              Accuracy depends on AI and source of data. Please review all code.
            </span>
          </div>
      </div>
    </div>
  );
};