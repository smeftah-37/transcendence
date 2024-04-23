import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
  stack: string;
}

class ErrorBoundary extends Component<{}, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null, info: null, stack: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, info: errorInfo, stack: error.stack });
  }

  render() {
    if (this.state.hasError) {
      return <h4>Something went wrong!</h4>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;