'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, Button, Icon } from '@hool/design-system';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            padding: '2rem',
          }}
        >
          <Card padding="lg" variant="elevated">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              <Icon
                name="alert-circle"
                size={40}
                style={{ color: '#ef4444' }}
              />
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                Something went wrong
              </h2>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={this.handleRetry}
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
