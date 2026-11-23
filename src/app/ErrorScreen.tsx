import { Button } from '../components/Button';
import { ar } from '../copy/ar';
import { downloadBackup } from '../features/backup/download';

export function ErrorScreen() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-4 px-gutter py-10 text-center">
      <h1 className="m-0 font-heading text-t-title text-ink">{ar.error.title}</h1>
      <p className="m-0 text-t-body text-body">{ar.error.body}</p>
      <div className="mt-2 flex flex-col gap-3">
        <Button block onClick={() => location.reload()}>
          {ar.error.reload}
        </Button>
        <Button block variant="secondary" onClick={() => downloadBackup()}>
          {ar.error.save}
        </Button>
      </div>
    </main>
  );
}
