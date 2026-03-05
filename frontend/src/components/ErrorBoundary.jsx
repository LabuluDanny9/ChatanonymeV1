/**
 * Error Boundary — Affiche une erreur au lieu d'une page blanche
 */

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full rounded-2xl bg-white border border-red-100 p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-slate-600 mb-6">{this.state.error?.message || 'Erreur inconnue'}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-chat-primary text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
