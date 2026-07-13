import React from 'react';
import Error500Page from '../pages/errors/500error';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Error500Page />;
    }

    return this.props.children;
  }
}
