import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send error and info to monitoring service
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-xl font-semibold text-secondary-700">
            Đã xảy ra lỗi
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Vui lòng thử tải lại trang.
          </p>
          <button
            className="mt-4 rounded bg-primary-600 px-3 py-2 text-white"
            onClick={() => location.reload()}
          >
            Tải lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
