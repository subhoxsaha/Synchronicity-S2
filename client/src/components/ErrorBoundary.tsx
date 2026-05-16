import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-lg w-full bg-card border-[3px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
                Something broke
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                An unexpected error occurred. You can try refreshing or resetting below.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border-[2px] border-red-400 p-4">
                <p className="font-mono text-xs text-red-700 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[3px] active:shadow-none transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-background text-foreground font-black uppercase tracking-widest text-xs border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[3px] active:shadow-none transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
