import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ar } from '../../copy/ar';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { TextArea, TextField } from '../../components/TextField';
import { hijriDate } from '../../lib/dayLabel';
import { useMyDuas } from '../../state/store';
import type { MyDua } from '../../state/schemas';

/** دعواتي: needs the user prays for, and those answered with how. No counts, no percentages. */
export function MyDuasList() {
  const items = useMyDuas((s) => s.items);
  const [view, setView] = useState<'open' | 'answered'>('open');
  const [editing, setEditing] = useState<MyDua | 'new' | null>(null);
  const [answering, setAnswering] = useState<MyDua | null>(null);
  const [deleting, setDeleting] = useState<MyDua | null>(null);
  const shown = items.filter((d) => (view === 'answered' ? !!d.answeredAt : !d.answeredAt)).reverse();
  const t = ar.notebook.myDuas;

  return (
    <>
      <div className="flex items-stretch gap-3">
        <div className="flex-1">
          <SegmentedControl
            role="tabs"
            label={ar.notebook.tabs.myDuas}
            value={view}
            onChange={setView}
            options={[
              { value: 'open', label: t.tabs.open },
              { value: 'answered', label: t.tabs.answered },
            ]}
          />
        </div>
        <Button variant="secondary" icon={<Icon icon={Plus} />} onClick={() => setEditing('new')} className="px-4">
          {t.add}
        </Button>
      </div>

      {shown.length === 0 ? (
        view === 'open' ? <EmptyState title={t.empty.title} body={t.empty.body} /> : <EmptyState title={t.emptyAnswered.title} body={t.emptyAnswered.body} />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {shown.map((d) => (
            <li key={d.id} className="flex flex-col gap-1 rounded-card border border-solid border-hairline bg-surface px-card pt-3.5 pb-1.5 shadow-card">
              <h3 className="m-0 text-[1.0625rem] leading-[1.6] font-semibold text-text">{d.text}</h3>
              {d.note ? <p className="m-0 text-t-body text-text-body">{d.note}</p> : null}
              <p className="m-0 text-t-caption text-text-muted">{d.answeredAt ? t.answeredOn(hijriDate(d.answeredAt)) : t.addedOn(hijriDate(d.createdAt))}</p>
              {d.answerNote ? <p className="m-0 mt-1 border-s-2 border-solid border-accent ps-3.5 text-t-body text-text-body">{d.answerNote}</p> : null}
              <div className="flex items-center justify-between">
                <Switch
                  label={t.answered}
                  checked={!!d.answeredAt}
                  onChange={(on) => (on ? setAnswering(d) : useMyDuas.getState().setAnswered(d.id, null))}
                  className="gap-4"
                />
                <div className="-me-2.5 flex">
                  <IconButton icon={Pencil} label={t.editLabel} onClick={() => setEditing(d)} />
                  <IconButton icon={Trash2} label={t.deleteLabel} onClick={() => setDeleting(d)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? <NeedSheet item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} /> : null}
      {answering ? (
        <AnsweredSheet
          item={answering}
          onClose={() => setAnswering(null)}
          onSaved={() => {
            setAnswering(null);
            setView('answered');
          }}
        />
      ) : null}

      <Dialog open={!!deleting} title={t.deleteConfirm.title} onClose={() => setDeleting(null)}>
        <p className="m-0 text-t-body text-text-body">{t.deleteConfirm.body}</p>
        <Button
          variant="danger"
          block
          onClick={() => {
            if (deleting) useMyDuas.getState().remove(deleting.id);
            setDeleting(null);
          }}
        >
          {t.deleteConfirm.confirm}
        </Button>
        <Button variant="secondary" block onClick={() => setDeleting(null)}>
          {ar.common.cancel}
        </Button>
      </Dialog>
    </>
  );
}

function NeedSheet({ item, onClose }: { item: MyDua | null; onClose: () => void }) {
  const t = ar.notebook.myDuas.sheet;
  const [text, setText] = useState(item?.text ?? '');
  const [note, setNote] = useState(item?.note ?? '');
  const save = () => {
    const value = text.trim();
    if (!value) return;
    const input = { text: value, ...(note.trim() ? { note: note.trim() } : {}) };
    if (item) useMyDuas.getState().update(item.id, input);
    else useMyDuas.getState().add(input);
    onClose();
  };
  return (
    <Dialog open title={item ? t.editTitle : t.addTitle} onClose={onClose}>
      <TextField label={t.need} value={text} maxLength={500} placeholder={t.needPlaceholder} onChange={(e) => setText(e.target.value)} />
      <TextField label={t.note} value={note} maxLength={500} placeholder={t.notePlaceholder} onChange={(e) => setNote(e.target.value)} />
      <p className="m-0 text-t-caption text-text-muted">{ar.common.privacyLine}</p>
      <Button variant="primary" block waiting={!text.trim()} onClick={save}>
        {ar.common.save}
      </Button>
    </Dialog>
  );
}

function AnsweredSheet({ item, onClose, onSaved }: { item: MyDua; onClose: () => void; onSaved: () => void }) {
  const t = ar.notebook.myDuas.how;
  const [note, setNote] = useState(item.answerNote ?? '');
  return (
    <Dialog open title={t.title} onClose={onClose}>
      <TextArea label={t.label} value={note} placeholder={t.placeholder} privacyLine onChange={(e) => setNote(e.target.value)} />
      <Button
        variant="primary"
        block
        onClick={() => {
          useMyDuas.getState().setAnswered(item.id, { answeredAt: new Date().toISOString(), ...(note.trim() ? { answerNote: note.trim() } : {}) });
          onSaved();
        }}
      >
        {ar.common.save}
      </Button>
    </Dialog>
  );
}
