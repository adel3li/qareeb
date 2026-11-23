import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { PrivacyLine, TextArea } from '../../components/TextField';
import { useContent } from '../../content/load';
import { ar } from '../../copy/ar';
import { hijriOfDay } from '../../lib/format';
import { groupByDay } from '../../lib/progress';
import { addNote, deleteNote, updateNote } from '../../state/actions';
import type { Note } from '../../state/shapes';
import { useStored } from '../../state/store';

/** What the user wrote, grouped under its stored Hijri day, with the dua's short title from the stored id. */
export function FoundView() {
  const notes = useStored('notebook');
  const completions = useStored('completions');
  const bundle = useContent();
  const [editing, setEditing] = useState<Note | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);

  const intentionOf = (n: Note) => {
    const c = completions.find((x) => x.date === n.date && x.duaId === n.duaId);
    return c?.intention ? ar.intentions[c.intention] : null;
  };

  return (
    <>
      <div className="flex justify-end">
        <Button variant="secondary" icon={<Icon as={Plus} />} onClick={() => setEditing('new')}>
          {ar.notebook.writeNow}
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState title={ar.notebook.emptyTitle} body={ar.notebook.emptyBody} />
      ) : (
        groupByDay(notes).map((group) => (
          <section key={group.date} className="flex flex-col gap-2.5">
            <h2 className="m-0 mx-1 mt-1 text-t-caption font-semibold text-muted">{hijriOfDay(group.date)}</h2>
            {group.items.map((n) => {
              const dua = bundle.duas.find((d) => d.id === n.duaId);
              const intention = intentionOf(n);
              return (
                <article key={n.id} className="flex flex-col gap-1.5 rounded-card border border-solid border-hairline bg-surface px-card pt-3 pb-1.5 shadow-card">
                  {dua && <p className="m-0 text-t-caption font-semibold text-accent">{dua.shortTitle}</p>}
                  <p className="m-0 whitespace-pre-wrap break-words text-t-body leading-[1.85] text-ink">{n.text}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-t-caption font-normal text-muted">{intention}</span>
                    <div className="-me-2.5 flex">
                      <IconButton label={ar.notebook.editAria} onClick={() => setEditing(n)}>
                        <Icon as={Pencil} />
                      </IconButton>
                      <IconButton label={ar.notebook.deleteAria} onClick={() => setDeleting(n)}>
                        <Icon as={Trash2} />
                      </IconButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ))
      )}

      {editing && <WriteSheet note={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <Dialog
          tone="alert"
          title={ar.notebook.deleteTitle}
          onClose={() => setDeleting(null)}
          actions={
            <>
              <Button variant="danger" block onClick={() => { deleteNote(deleting.id); setDeleting(null); }}>
                {ar.notebook.delete}
              </Button>
              <Button variant="secondary" block onClick={() => setDeleting(null)}>
                {ar.notebook.cancel}
              </Button>
            </>
          }
        >
          <p className="m-0 text-t-body text-body">{ar.notebook.deleteBody}</p>
        </Dialog>
      )}
    </>
  );
}

function WriteSheet({ note, onClose }: { note: Note | null; onClose: () => void }) {
  const [text, setText] = useState(note?.text ?? '');
  const save = () => {
    if (text.trim()) {
      if (note) updateNote(note.id, text);
      else addNote(text);
    }
    onClose();
  };
  return (
    <Dialog
      title={note ? ar.notebook.edit : ar.notebook.writeNow}
      onClose={onClose}
      actions={
        <Button block onClick={save}>
          {ar.notebook.save}
        </Button>
      }
    >
      <TextArea aria-label={ar.notebook.textLabel} value={text} onChange={(e) => setText(e.target.value)} maxLength={10_000} />
      <PrivacyLine />
    </Dialog>
  );
}
