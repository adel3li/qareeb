import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';
import { IconButton } from '../../components/IconButton';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { ar } from '../../copy/ar';
import { toLocalDateString, useLocalDay } from '../../lib/dates';
import { hijriDayLabel } from '../../lib/hijriLabel';
import { useMyDuas } from '../../state/stores';
import type { MyDua } from '../../state/types';
import { AnsweredSheet, NeedSheet } from './NeedSheets';

type View = 'open' | 'answered';
const t = ar.notebook.myDuas;

/** «دعواتي»: the user's needs; answered ones are memories, never counted. */
export function MyDuasView() {
  const today = useLocalDay();
  const items = useMyDuas((s) => s.items);
  const { add, edit, markAnswered, markOpen, remove } = useMyDuas.getState();
  const [view, setView] = useState<View>('open');
  const [sheet, setSheet] = useState<{ kind: 'new' } | { kind: 'edit'; need: MyDua } | { kind: 'answer'; need: MyDua } | null>(null);
  const [deleting, setDeleting] = useState<MyDua | null>(null);

  const shown = items.filter((d) => (view === 'answered' ? Boolean(d.answeredAt) : !d.answeredAt)).slice().reverse();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SegmentedControl
            role="radio"
            label={t.viewsLabel}
            value={view}
            onChange={setView}
            options={[
              { value: 'open', label: t.views.open },
              { value: 'answered', label: t.views.answered },
            ]}
          />
        </div>
        <Button variant="secondary" icon={Plus} onClick={() => setSheet({ kind: 'new' })}>
          {t.add}
        </Button>
      </div>
      {shown.length === 0 ? (
        view === 'open' ? (
          <EmptyState
            title={t.emptyOpenTitle}
            body={t.emptyOpenBody}
            action={
              <Button variant="primary" icon={Plus} onClick={() => setSheet({ kind: 'new' })}>
                {t.add}
              </Button>
            }
          />
        ) : (
          <EmptyState title={t.emptyAnsweredTitle} body={t.emptyAnsweredBody} />
        )
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {shown.map((d) => (
            <li key={d.id} className="flex flex-col gap-1 rounded-(--radius-card) border border-hairline bg-surface px-(--card-padding) pt-3 pb-1">
              <p className="m-0 text-[1.0625rem] leading-[1.6] font-semibold whitespace-pre-wrap text-text">{d.text}</p>
              {d.note && <p className="m-0 text-t-body-sm whitespace-pre-wrap text-text-body">{d.note}</p>}
              <p className="m-0 text-t-caption font-normal text-text-muted">
                {d.answeredAt ? t.answeredOn(hijriDayLabel(d.answeredAt, false)) : t.addedOn(hijriDayLabel(toLocalDateString(new Date(d.createdAt)), false))}
              </p>
              {d.answerNote && <p className="m-0 border-s-2 border-accent ps-3 text-t-body-sm whitespace-pre-wrap text-text-body">{d.answerNote}</p>}
              <div className="flex items-center justify-between gap-2">
                <Switch label={t.answered} checked={Boolean(d.answeredAt)} onChange={(on) => (on ? setSheet({ kind: 'answer', need: d }) : markOpen(d.id))} />
                <span className="-me-[10px] flex">
                  <IconButton icon={Pencil} label={t.editNeed} onClick={() => setSheet({ kind: 'edit', need: d })} />
                  <IconButton icon={Trash2} label={t.deleteNeed} onClick={() => setDeleting(d)} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {sheet?.kind === 'new' && (
        <NeedSheet
          title={t.addTitle}
          onClose={() => setSheet(null)}
          onSave={(v) => {
            add(v);
            setSheet(null);
            setView('open');
          }}
        />
      )}
      {sheet?.kind === 'edit' && (
        <NeedSheet
          title={t.editTitle}
          initial={sheet.need}
          onClose={() => setSheet(null)}
          onSave={(v) => {
            edit(sheet.need.id, { text: v.text, note: v.note ?? '', ...(sheet.need.answeredAt ? { answerNote: v.answerNote ?? '' } : {}) });
            setSheet(null);
          }}
        />
      )}
      {sheet?.kind === 'answer' && (
        <AnsweredSheet
          onClose={() => setSheet(null)}
          onSave={(note) => {
            markAnswered(sheet.need.id, today, note);
            setSheet(null);
          }}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title={t.deleteTitle}
        body={t.deleteBody}
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
