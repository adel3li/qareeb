import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ar } from '../copy/ar';
import { exportBackup } from '../features/backup/backup';

/** The root error boundary: «حدث خطأ», reload, and save a copy of the data first. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto flex min-h-dvh max-w-(--content-max) flex-col items-center justify-center gap-5 px-6 py-8 text-center">
        <h1 className="m-0 font-q-heading text-t-title">{ar.error.title}</h1>
        <p className="m-0 text-t-body text-text-body">{ar.error.body}</p>
        <div className="flex w-full flex-col gap-[10px]">
          <button type="button" onClick={() => location.reload()} className="min-h-(--button-height) rounded-(--radius-control) bg-cta px-[22px] text-t-button text-cta-text">
            {ar.error.reload}
          </button>
          <button
            type="button"
            onClick={() => exportBackup()}
            className="min-h-(--button-height-sm) rounded-(--radius-control) border border-hairline px-[22px] text-t-body font-medium text-text"
          >
            {ar.error.export}
          </button>
        </div>
      </main>
    );
  }
}
