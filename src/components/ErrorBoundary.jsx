import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 500, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, color: 'var(--text)' }}>Something went wrong</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This page hit an unexpected error. Your data is safe — try refreshing or navigating to another page.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => window.location.reload()}
              style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer' }}>
              Refresh page
            </button>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              style={{ padding: '9px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Go to dashboard
            </button>
          </div>
          {this.state.error && (
            <details style={{ marginTop: 24, textAlign: 'left' }}>
              <summary style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Error details</summary>
              <pre style={{ fontSize: 11, color: 'var(--danger)', background: 'var(--danger-dim)', padding: 12, borderRadius: 8, marginTop: 8, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
