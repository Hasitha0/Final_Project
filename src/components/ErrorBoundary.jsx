import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({ 
      showDetails: !prevState.showDetails 
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Something went wrong
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The application encountered an unexpected error
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {this.state.error?.message || 'An unknown error occurred'}
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Try Again
              </button>
              
              <button
                onClick={this.toggleDetails}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                {this.state.showDetails ? 'Hide Details' : 'Show Details'}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Reload Page
              </button>
            </div>

            {this.state.showDetails && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Error Details:
                </h4>
                <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                  {this.state.error?.stack || 'No stack trace available'}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-3 mb-2">
                      Component Stack:
                    </h4>
                    <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>If this problem persists, please contact support.</p>
              <p className="mt-1">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 