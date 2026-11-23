import { useEffect, useRef, useState } from 'react';
import { ar, type IntentionKey } from '../../copy/ar';
import { Button } from '../../components/Button';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { Door } from '../../components/EmptyState';
import { TextArea, TextField } from '../../components/TextField';
import { DRAFT_DEBOUNCE_MS } from '../../config';
import { INTENTIONS } from '../../state/schemas';

const heading = 'm-0 font-kufi text-t-subtitle text-text';

export function IntentionPanel({ initial, sourced, onDone }: { initial: IntentionKey | null; sourced: boolean; onDone: (value: IntentionKey | null) => void }) {
  const [value, setValue] = useState<IntentionKey | null>(initial);
  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h3 className={heading}>{ar.live.intention.title}</h3>
          <p className="m-0 text-t-body-sm text-text-muted">{ar.live.intention.hint}</p>
        </div>
        <ChoiceGrid label={ar.live.intention.title} options={INTENTIONS.map((k) => ({ value: k, label: ar.live.intention.options[k] }))} value={value} onChange={setValue} />
        {sourced && value === initial ? <p className="m-0 text-t-body-sm text-text-body">{ar.live.intention.sourced}</p> : null}
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <Button variant="quiet" className="self-center" onClick={() => onDone(null)}>
          {ar.common.skip}
        </Button>
        <Button variant="primary" block onClick={() => onDone(value)}>
          {ar.common.continue}
        </Button>
      </div>
    </>
  );
}

/** Saves what is typed as a draft on the device, 500ms after the last key. */
function useDraftSaver(value: string, save: (v: string) => void) {
  const saveRef = useRef(save);
  saveRef.current = save;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => saveRef.current(value), DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value]);
}

interface WritingProps {
  initial: string;
  onChange: (value: string) => void;
  onDraft: (value: string) => void;
}

export function JournalPanel({ prompt, initial, onChange, onDraft, onSave, onFinish }: WritingProps & { prompt: string; onSave: (text: string) => void; onFinish: () => void }) {
  const [text, setText] = useState(initial);
  useDraftSaver(text, onDraft);
  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <TextArea
          label={prompt}
          labelStyle="prompt"
          value={text}
          placeholder={ar.live.journal.placeholder}
          privacyLine
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <Button variant="secondary" block onClick={onFinish}>
          {ar.live.journal.finish}
        </Button>
        <Button variant="primary" block waiting={!text.trim()} onClick={() => onSave(text.trim())}>
          {ar.live.journal.save}
        </Button>
      </div>
    </>
  );
}

export function MyDuaPanel({ initial, onChange, onDraft, onAdd, onSkip }: WritingProps & { onAdd: (text: string) => void; onSkip: () => void }) {
  const [text, setText] = useState(initial);
  useDraftSaver(text, onDraft);
  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <h3 className={heading}>{ar.live.myDua.title}</h3>
        <TextField
          label={ar.live.myDua.label}
          value={text}
          maxLength={500}
          placeholder={ar.live.myDua.placeholder}
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <Button variant="secondary" block onClick={onSkip}>
          {ar.live.myDua.notNow}
        </Button>
        <Button variant="primary" block waiting={!text.trim()} onClick={() => onAdd(text.trim())}>
          {ar.live.myDua.add}
        </Button>
      </div>
    </>
  );
}

export function ClosingPanel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Door size="lg" />
      <p role="status" className="m-0 font-kufi text-t-display text-text">
        {ar.live.closing}
      </p>
    </div>
  );
}
