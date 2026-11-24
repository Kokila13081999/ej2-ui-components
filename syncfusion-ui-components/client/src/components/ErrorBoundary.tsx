import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Keeps the shell (header + navigation) alive if a component page throws. */
export default class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Page error', error, info.componentStack); }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="not-found">
        <h2>Something went wrong on this page.</h2>
        <p className="muted">{this.state.error.message}</p>
        <button className="btn-primary" onClick={() => this.setState({ error: null })}>Try again</button>
      </div>
    );
  }
}
