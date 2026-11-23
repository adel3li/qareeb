import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { Door } from '../../components/Door';
import { Field, PrivacyLine, TextArea, TextInput } from '../../components/TextField';
import type { Dua } from '../../content/types';
import { ar } from '../../copy/ar';
import { INTENTIONS, type Intention } from '../../state/shapes';
import { Authored } from '../dua/Authored';

const heading = 'm-0 font-heading text-t-subtitle text-ink';

export function IntentionView({ value, onChange, onSkip, onContinue }: {
  value: Intention | null;
  onChange: (v: Intention | null) => void;
  onSkip: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div>
        <h2 className={heading}>{ar.live.intentionTitle}</h2>
        <p className="m-0 text-t-body-sm text-muted">{ar.live.intentionHint}</p>
      </div>
      <ChoiceGrid label={ar.live.intentionTitle} value={value} onChange={onChange} options={INTENTIONS.map((i) => ({ value: i, label: ar.intentions[i] }))} />
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Button variant="quiet" onClick={onSkip} className="self-center">
          {ar.live.skip}
        </Button>
        <Button block onClick={onContinue}>
          {ar.live.continue}
        </Button>
      </div>
    </>
  );
}

/** A draft saves 500 ms after the last key and comes back if the experience is closed. */
function useDraftText(initial: string, save: (text: string) => void) {
  const [text, setText] = useState(initial);
  const saveRef = useRef(save);
  saveRef.current = save;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => saveRef.current(text), 500);
    return () => clearTimeout(t);
  }, [text]);
  return [text, setText] as const;
}

export function NotebookView({ dua, initial, onDraft, onType, onSave, onFinish }: {
  dua: Dua;
  initial: string;
  onDraft: (text: string) => void;
  onType: (text: string) => void;
  onSave: (text: string) => void;
  onFinish: (text: string) => void;
}) {
  const [text, setText] = useDraftText(initial, onDraft);
  return (
    <>
      <Field label={<Authored text={dua.journalPrompt} />} labelClass={heading}>
        {(id) => (
          <TextArea
            id={id}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onType(e.target.value);
            }}
            className="min-h-[170px]"
          />
        )}
      </Field>
      <PrivacyLine />
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <Button variant="secondary" block onClick={() => onFinish(text)}>
          {ar.live.finish}
        </Button>
        <Button block onClick={() => onSave(text)}>
          {ar.live.saveNote}
        </Button>
      </div>
    </>
  );
}

export function NeedView({ initial, onDraft, onType, onAdd, onSkip }: {
  initial: string;
  onDraft: (text: string) => void;
  onType: (text: string) => void;
  onAdd: (text: string) => void;
  onSkip: (text: string) => void;
}) {
  const [text, setText] = useDraftText(initial, onDraft);
  return (
    <>
      <h2 className={heading}>{ar.live.needTitle}</h2>
      <Field label={ar.live.needLabel}>{(id) => <TextInput id={id} value={text} maxLength={500} onChange={(e) => { setText(e.target.value); onType(e.target.value); }} />}</Field>
      <PrivacyLine />
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <Button variant="secondary" block onClick={() => onSkip(text)}>
          {ar.live.needSkip}
        </Button>
        <Button block onClick={() => (text.trim() ? onAdd(text) : onSkip(text))}>
          {ar.live.needAdd}
        </Button>
      </div>
    </>
  );
}

export function ClosingView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <Door size="lg" />
      <p role="status" className="m-0 font-heading text-t-title text-ink">
        {ar.live.closing}
      </p>
    </div>
  );
}
