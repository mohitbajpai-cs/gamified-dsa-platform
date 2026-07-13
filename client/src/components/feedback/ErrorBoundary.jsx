import React, { Component } from 'react';
import ErrorPage from '../../pages/ErrorPage';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorPage error={this.state.error} resetError={() => this.setState({ hasError: false, error: null })} />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
