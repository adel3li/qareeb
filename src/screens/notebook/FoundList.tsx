import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { TextArea } from '../../components/TextField';
import { hijriDayLabel } from '../../lib/dayLabel';
import { toLocalDateString } from '../../lib/dates';
import { groupByDay, intentionFor } from '../../lib/notebook';
import { useCompletions, useNotebook } from '../../state/store';
import type { NotebookEntry } from '../../state/schemas';

/** ما وجدته: entries grouped by their stored Hijri day; edit and delete always visible. */
export function FoundList() {
  const entries = useNotebook((s) => s.entries);
  const completions = useCompletions((s) => s.items);
  const byId = useContent((s) => s.byId);
  const [editing, setEditing] = useState<NotebookEntry | 'new' | null>(null);
  const [deleting, setDeleting] = useState<NotebookEntry | null>(null);

  return (
    <>
      <Button variant="secondary" className="self-start" icon={<Icon icon={Plus} />} onClick={() => setEditing('new')}>
        {ar.notebook.writeNow}
      </Button>

      {entries.length === 0 ? (
        <EmptyState title={ar.notebook.empty.title} body={ar.notebook.empty.body} />
      ) : (
        groupByDay(entries).map((group) => (
          <section key={group.date} aria-label={hijriDayLabel(group.date)} className="flex flex-col gap-2.5">
            <h2 className="mx-1 mt-1 mb-0 text-t-caption font-semibold text-text-muted">{hijriDayLabel(group.date)}</h2>
            {group.items.map((entry) => {
              const intention = intentionFor(entry, completions);
              const dua = entry.duaId ? byId.get(entry.duaId) : undefined;
              return (
                <article key={entry.id} className="flex flex-col gap-1.5 rounded-card border border-solid border-hairline bg-surface px-card pt-3 pb-1.5 shadow-card">
                  {dua ? <p className="m-0 text-t-caption font-semibold text-accent">{dua.shortTitle}</p> : null}
                  <p className="m-0 whitespace-pre-wrap text-t-body leading-[1.85] text-text">{entry.text}</p>
                  <div className="flex items-center justify-between text-t-caption text-text-muted">
                    <span>{intention ? ar.live.intention.options[intention] : ''}</span>
                    <div className="-me-2.5 flex">
                      <IconButton icon={Pencil} label={ar.notebook.editEntry} onClick={() => setEditing(entry)} />
                      <IconButton icon={Trash2} label={ar.notebook.deleteEntryLabel} onClick={() => setDeleting(entry)} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ))
      )}

      {editing ? <WriteSheet entry={editing === 'new' ? null : editing} onClose={() => setEditing(null)} /> : null}

      <Dialog open={!!deleting} title={ar.notebook.deleteEntry.title} onClose={() => setDeleting(null)}>
        <p className="m-0 text-t-body text-text-body">{ar.notebook.deleteEntry.body}</p>
        <Button
          variant="danger"
          block
          onClick={() => {
            if (deleting) useNotebook.getState().remove(deleting.id);
            setDeleting(null);
          }}
        >
          {ar.notebook.deleteEntry.confirm}
        </Button>
        <Button variant="secondary" block onClick={() => setDeleting(null)}>
          {ar.common.cancel}
        </Button>
      </Dialog>
    </>
  );
}

function WriteSheet({ entry, onClose }: { entry: NotebookEntry | null; onClose: () => void }) {
  const [text, setText] = useState(entry?.text ?? '');
  const save = () => {
    const value = text.trim();
    if (!value) return;
    if (entry) useNotebook.getState().update(entry.id, value);
    else useNotebook.getState().add({ date: toLocalDateString(), text: value });
    onClose();
  };
  return (
    <Dialog open title={entry ? ar.notebook.write.editTitle : ar.notebook.write.title} onClose={onClose}>
      <TextArea label={ar.notebook.write.label} labelStyle="hidden" value={text} placeholder={ar.notebook.write.placeholder} privacyLine onChange={(e) => setText(e.target.value)} />
      <Button variant="primary" block waiting={!text.trim()} onClick={save}>
        {ar.common.save}
      </Button>
    </Dialog>
  );
}
