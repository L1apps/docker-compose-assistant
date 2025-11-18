import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon } from './icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <div className="text-center p-8 border border-destructive bg-destructive-foreground/50 rounded-lg max-w-lg">
                <AlertTriangleIcon className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong.</h1>
                <p className="text-foreground-muted mb-6">
                    We're sorry, but the web application encountered an unexpected error. Please try refreshing the page.
                </p>
                <p className="text-xs text-foreground-muted">
                   If the problem persists, please consider reporting it. You can find a link to report issues in the header of the main application page.
                </p>
                {this.state.error && (
                    <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-sm text-foreground-muted">Error Details</summary>
                        <pre className="mt-2 p-2 bg-background-offset rounded-md text-xs overflow-auto">
                            <code>
                                {this.state.error.name}: {this.state.error.message}
                                {this.state.error.stack && `\n${this.state.error.stack}`}
                            </code>
                        </pre>
                    </details>
                )}
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}