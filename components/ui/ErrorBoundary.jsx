'use client';

import { Component } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-danger)', marginBottom: 16 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-hint)', marginBottom: 24 }}>
            {this.state.error?.message}
          </p>
          <Button
            variant="secondary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
          <div style={{ marginTop: 12 }}>
            <Link href="/" style={{ color: 'var(--color-primary)', fontSize: 13, textDecoration: 'none' }}>
              Go home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
