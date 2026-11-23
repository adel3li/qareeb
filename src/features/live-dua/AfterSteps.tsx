import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { Door } from '../../components/Door';
import { TextArea, TextField } from '../../components/TextField';
import { ar } from '../../copy/ar';
import { INTENTIONS, type Dua, type Intention } from '../../content/types';
import { hasPlaceholder } from '../../lib/placeholders';

export function IntentionScreen({ dua, value, onChange, onDone }: { dua: Dua; value: Intention | null; onChange: (v: Intention | null) => void; onDone: () => void }) {
  const sourced = dua.whenToSay?.intention && !hasPlaceholder(dua.whenToSay.text) ? dua.whenToSay : null;
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h3 className="m-0 font-q-heading text-t-subtitle">{ar.live.intention.question}</h3>
        <p className="m-0 text-t-body-sm text-text-muted">{ar.live.intention.hint}</p>
      </div>
      <ChoiceGrid
        label={ar.live.intention.question}
        value={value}
        onChange={onChange}
        options={INTENTIONS.map((v) => ({ value: v, label: ar.live.intention.options[v] }))}
      />
      {sourced && value === sourced.intention && <p className="m-0 text-t-body-sm text-text-body">{ar.live.intention.sourceReason(sourced.text)}</p>}
      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Button variant="quiet" className="self-center" onClick={() => { onChange(null); onDone(); }}>
          {ar.live.intention.skip}
        </Button>
        <Button variant="primary" block onClick={onDone}>
          {ar.live.intention.continue}
        </Button>
      </div>
    </div>
  );
}

export function NotebookScreen({
  dua,
  text,
  restored,
  onChange,
  onSave,
  onFinish,
}: {
  dua: Dua;
  text: string;
  restored: boolean;
  onChange: (t: string) => void;
  onSave: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <TextArea label={hasPlaceholder(dua.journalPrompt) ? ar.live.notebook.label : dua.journalPrompt} prominent privacyNote value={text} placeholder={ar.live.notebook.placeholder} onChange={(e) => onChange(e.target.value)} />
      {restored && <p className="m-0 text-t-caption text-text-muted">{ar.live.notebook.draftRestored}</p>}
      <div className="mt-auto flex flex-col gap-[10px] pt-2">
        <Button variant="secondary" block onClick={onFinish}>
          {ar.live.notebook.finish}
        </Button>
        <Button variant="primary" block onClick={onSave} waiting={!text.trim()}>
          {ar.live.notebook.save}
        </Button>
      </div>
    </div>
  );
}

export function MyDuaScreen({ onAdd, onSkip }: { onAdd: (text: string) => void; onSkip: () => void }) {
  const [text, setText] = useState('');
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h3 className="m-0 font-q-heading text-t-subtitle">{ar.live.myDua.question}</h3>
      <TextField label={ar.live.myDua.label} placeholder={ar.live.myDua.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-auto flex flex-col gap-[10px] pt-2">
        <Button variant="secondary" block onClick={onSkip}>
          {ar.live.myDua.skip}
        </Button>
        <Button variant="primary" block waiting={!text.trim()} onClick={() => text.trim() && onAdd(text)}>
          {ar.live.myDua.add}
        </Button>
      </div>
    </div>
  );
}

/** «جعله الله دعاءً مستجابًا», held for --closing-hold (2s), then back to Today. */
export function ClosingScreen({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current(), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12 text-center">
      <Door className="scale-125" />
      <p role="status" className="fade-in m-0 font-q-heading text-t-display text-text">
        {ar.live.closing}
      </p>
    </div>
  );
}
