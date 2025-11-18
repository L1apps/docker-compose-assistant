import React from 'react';
import { ContextualHelpResult } from '../types';
import { SparklesIcon } from './icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  content: ContextualHelpResult | null;
  isLoading: boolean;
  error: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, keyword, content, isLoading, error }) => {
  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-foreground-muted">
          <SparklesIcon className="w-10 h-10 animate-pulse text-accent" />
          <p className="mt-4">Getting help for <span className="font-bold text-foreground">{keyword}</span>...</p>
        </div>
      );
    }
    if (error) {
      return <div className="p-4 text-destructive-foreground bg-destructive rounded-md">{error}</div>;
    }
    if (content) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-semibold text-foreground mb-2">Explanation</h3>
            <p className="text-foreground-muted text-sm">{content.explanation}</p>
          </div>
          <div>
            <h3 className="text-md font-semibold text-foreground mb-2">Example</h3>
            <pre className="bg-editor-background p-3 rounded-md overflow-x-auto text-sm text-foreground">
              <code>{content.example}</code>
            </pre>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-background-offset border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Contextual Help: <span className="text-accent font-mono">{keyword}</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Close help modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};