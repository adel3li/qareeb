import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { ConfirmDialog, Dialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';
import { JournalEntry } from '../../components/JournalEntry';
import { TextArea } from '../../components/TextField';
import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import { useLocalDay } from '../../lib/dates';
import { hijriDayLabel } from '../../lib/hijriLabel';
import { groupByDay } from '../../lib/notebook';
import { useCompletions, useNotebook } from '../../state/stores';
import type { NotebookEntry } from '../../state/types';

/** «ما وجدته»: what the user wrote, grouped by Hijri day, newest first. */
export function FoundView() {
  const content = useContent();
  const today = useLocalDay();
  const entries = useNotebook((s) => s.items);
  const { add, edit, remove } = useNotebook.getState();
  const completions = useCompletions((s) => s.items);
  const [editing, setEditing] = useState<NotebookEntry | 'new' | null>(null);
  const [deleting, setDeleting] = useState<NotebookEntry | null>(null);

  const groups = useMemo(() => groupByDay(entries), [entries]);
  const titleOf = (id?: string) => (id && content ? content.duas.find((d) => d.id === id)?.shortTitle : undefined);
  const intentionOf = (e: NotebookEntry) => {
    const c = completions.find((x) => x.date === e.date && x.duaId === e.duaId);
    return c?.intention ? ar.live.intention.options[c.intention] : undefined;
  };

  const write = (
    <Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>
      {ar.notebook.writeNow}
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      {entries.length === 0 ? (
        <EmptyState title={ar.notebook.emptyFoundTitle} body={ar.notebook.emptyFoundBody} action={write} />
      ) : (
        <>
          <div className="flex justify-end">
            <Button variant="secondary" icon={Plus} onClick={() => setEditing('new')}>
              {ar.notebook.writeNow}
            </Button>
          </div>
          {groups.map((g) => (
            <section key={g.date} className="flex flex-col gap-2">
              <h2 className="mx-1 mt-1 mb-0 text-t-caption font-semibold text-text-muted">{hijriDayLabel(g.date)}</h2>
              {g.entries.map((e) => (
                <JournalEntry key={e.id} duaTitle={titleOf(e.duaId)} text={e.text} intention={intentionOf(e)} onEdit={() => setEditing(e)} onDelete={() => setDeleting(e)} />
              ))}
            </section>
          ))}
        </>
      )}
      {editing && (
        <EntrySheet
          initial={editing === 'new' ? '' : editing.text}
          title={editing === 'new' ? ar.notebook.writeTitle : ar.notebook.editTitle}
          onClose={() => setEditing(null)}
          onSave={(text) => {
            if (editing === 'new') add({ date: today, text });
            else edit(editing.id, text);
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title={ar.notebook.deleteEntryTitle}
        body={ar.notebook.deleteEntryBody}
        confirmLabel={ar.notebook.deleteConfirm}
        onConfirm={() => {
          if (deleting) remove(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function EntrySheet({ initial, title, onClose, onSave }: { initial: string; title: string; onClose: () => void; onSave: (text: string) => void }) {
  const [text, setText] = useState(initial);
  return (
    <Dialog
      open
      onClose={onClose}
      title={title}
      footer={
        <Button variant="primary" block waiting={!text.trim()} onClick={() => text.trim() && onSave(text.trim())}>
          {ar.common.save}
        </Button>
      }
    >
      <TextArea label={ar.notebook.entryLabel} privacyNote value={text} onChange={(e) => setText(e.target.value)} autoFocus />
    </Dialog>
  );
}
