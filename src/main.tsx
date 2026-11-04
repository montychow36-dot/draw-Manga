import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Manga Screentone Studio Error Boundary Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e1015] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-text">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 text-2xl font-bold mb-4 shadow-xl">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">
            Manga Screentone Studio 載入遇到狀況
          </h1>
          <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
            系統攔截到載入錯誤，這通常是因為上傳至 GitHub 或遠端伺服器時的網址路徑或瀏覽器快取引起。
          </p>
          {this.state.error && (
            <div className="bg-[#181c25] border border-red-900/50 rounded-lg p-3 text-left font-mono text-[11px] text-red-300 max-w-lg overflow-x-auto mb-4 w-full">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/40"
          >
            重新整理載入工作台 (Reload)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
