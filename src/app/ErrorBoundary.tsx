import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ar } from '../copy/ar';
import { Button } from '../components/Button';
import { exportBackup } from '../features/backup/exportBackup';

interface State {
  failed: boolean;
}

/** The root error boundary: «حدث خطأ», reload, or save a copy of the data first. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <ErrorScreen />;
  }
}

export function ErrorScreen() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-4 px-6 text-center">
      <h1 className="m-0 font-kufi text-t-title text-text">{ar.error.title}</h1>
      <p className="m-0 text-t-body text-text-body">{ar.error.body}</p>
      <Button variant="primary" block onClick={() => window.location.reload()}>
        {ar.error.reload}
      </Button>
      <Button variant="secondary" block onClick={() => exportBackup()}>
        {ar.error.exportData}
      </Button>
    </main>
  );
}
