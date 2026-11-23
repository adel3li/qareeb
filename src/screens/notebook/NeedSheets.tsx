import { useState } from 'react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { PrivacyHint, TextArea, TextField } from '../../components/TextField';
import { ar } from '../../copy/ar';
import type { MyDua } from '../../state/types';

const t = ar.notebook.myDuas;

export function NeedSheet({ title, initial, onClose, onSave }: { title: string; initial?: MyDua; onClose: () => void; onSave: (v: { text: string; note?: string; answerNote?: string }) => void }) {
  const [text, setText] = useState(initial?.text ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [answerNote, setAnswerNote] = useState(initial?.answerNote ?? '');
  const valid = text.trim().length > 0;
  return (
    <Dialog
      open
      onClose={onClose}
      title={title}
      footer={
        <Button variant="primary" block waiting={!valid} onClick={() => valid && onSave({ text, note, answerNote })}>
          {ar.common.save}
        </Button>
      }
    >
      <TextField label={t.need} placeholder={t.needPlaceholder} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
      <TextArea label={t.note} value={note} onChange={(e) => setNote(e.target.value)} className="[&_textarea]:min-h-24" />
      {initial?.answeredAt && <TextArea label={t.howLabel} value={answerNote} onChange={(e) => setAnswerNote(e.target.value)} className="[&_textarea]:min-h-24" />}
      <PrivacyHint />
    </Dialog>
  );
}

export function AnsweredSheet({ onClose, onSave }: { onClose: () => void; onSave: (note: string) => void }) {
  const [note, setNote] = useState('');
  return (
    <Dialog
      open
      onClose={onClose}
      title={t.howTitle}
      footer={
        <Button variant="primary" block onClick={() => onSave(note)}>
          {t.howSave}
        </Button>
      }
    >
      <TextArea label={t.howLabel} privacyNote value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
    </Dialog>
  );
}
