"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onRetry?: () => void;
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
    console.error("Dashboard Component Error:", error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-center space-y-3 my-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">
              {this.props.fallbackTitle || "Some dashboard information is temporarily unavailable."}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {this.props.fallbackMessage ||
                "A telemetry or calculation service could not be loaded at this moment. You can retry the request or check network connectivity."}
            </p>
            {this.state.error && (
              <p className="text-[11px] text-rose-600 font-mono bg-rose-50 p-2 rounded max-w-lg mx-auto overflow-auto">
                {this.state.error.message || String(this.state.error)}
              </p>
            )}
          </div>
          <div>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
