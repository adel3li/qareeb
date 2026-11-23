import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { ar } from '../../copy/ar';
import { hijriOfTimestamp } from '../../lib/format';
import { deleteMyDua, setAnswered } from '../../state/actions';
import type { MyDua } from '../../state/shapes';
import { useStored } from '../../state/store';
import { AnswerSheet, NeedSheet } from './NeedSheets';

/** دعواتي: needs the user prays for, and those answered with how. Memories, not achievements: no counts. */
export function MyDuasView() {
  const all = useStored('myDuas');
  const [view, setView] = useState<'open' | 'answered'>('open');
  const [editing, setEditing] = useState<MyDua | 'new' | null>(null);
  const [answering, setAnswering] = useState<MyDua | null>(null);
  const [deleting, setDeleting] = useState<MyDua | null>(null);
  const list = all.filter((d) => (view === 'open' ? !d.answeredAt : !!d.answeredAt));
  const shown = view === 'answered' ? [...list].sort((a, b) => (b.answeredAt ?? '').localeCompare(a.answeredAt ?? '')) : list;

  return (
    <>
      <div className="flex items-center gap-2.5">
        <div className="flex-1">
          <SegmentedControl
            role="radio"
            label={ar.notebook.myDuas}
            value={view}
            onChange={setView}
            options={[
              { value: 'open', label: ar.myDuas.open },
              { value: 'answered', label: ar.myDuas.answered },
            ]}
          />
        </div>
        <Button variant="secondary" icon={<Icon as={Plus} />} onClick={() => setEditing('new')} className="shrink-0">
          {ar.myDuas.add}
        </Button>
      </div>

      {shown.length === 0 ? (
        view === 'open' ? (
          <EmptyState title={ar.myDuas.emptyTitle} body={ar.myDuas.emptyBody} />
        ) : (
          <EmptyState title={ar.myDuas.answeredEmptyTitle} body={ar.myDuas.answeredEmptyBody} />
        )
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {shown.map((d) => (
            <li key={d.id} className="flex flex-col gap-1 rounded-card border border-solid border-hairline bg-surface px-card pt-3 pb-1.5 shadow-card">
              <h2 className="m-0 break-words text-t-body-lg font-semibold text-ink">{d.text}</h2>
              {d.note && <p className="m-0 whitespace-pre-wrap break-words text-t-body text-body">{d.note}</p>}
              <p className="m-0 text-t-caption font-normal text-muted">
                {d.answeredAt ? ar.myDuas.answeredOn(hijriOfTimestamp(d.answeredAt)) : ar.myDuas.addedOn(hijriOfTimestamp(d.createdAt))}
              </p>
              {d.answeredAt && d.answerNote && (
                <p className="m-0 mt-1 whitespace-pre-wrap break-words border-0 border-s-2 border-solid border-accent ps-3 text-t-body text-body">{d.answerNote}</p>
              )}
              <div className="flex items-center justify-between gap-2">
                <Switch
                  label={ar.myDuas.switchLabel}
                  checked={!!d.answeredAt}
                  onChange={(on) => (on ? setAnswering(d) : setAnswered(d.id, false))}
                />
                <div className="-me-2.5 flex">
                  <IconButton label={ar.myDuas.editAria} onClick={() => setEditing(d)}>
                    <Icon as={Pencil} />
                  </IconButton>
                  <IconButton label={ar.myDuas.deleteAria} onClick={() => setDeleting(d)}>
                    <Icon as={Trash2} />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && <NeedSheet need={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {answering && <AnswerSheet need={answering} onClose={() => setAnswering(null)} />}
      {deleting && (
        <Dialog
          tone="alert"
          title={ar.myDuas.deleteTitle}
          onClose={() => setDeleting(null)}
          actions={
            <>
              <Button variant="danger" block onClick={() => { deleteMyDua(deleting.id); setDeleting(null); }}>
                {ar.notebook.delete}
              </Button>
              <Button variant="secondary" block onClick={() => setDeleting(null)}>
                {ar.notebook.cancel}
              </Button>
            </>
          }
        >
          <p className="m-0 text-t-body text-body">{ar.myDuas.deleteBody}</p>
        </Dialog>
      )}
    </>
  );
}
