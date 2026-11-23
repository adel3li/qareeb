import { useState } from 'react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { Field, PrivacyLine, TextArea, TextInput } from '../../components/TextField';
import { ar } from '../../copy/ar';
import { addMyDua, setAnswered, updateMyDua } from '../../state/actions';
import type { MyDua } from '../../state/shapes';

export function NeedSheet({ need, onClose }: { need: MyDua | null; onClose: () => void }) {
  const [text, setText] = useState(need?.text ?? '');
  const [note, setNote] = useState(need?.note ?? '');
  const [answerNote, setAnswerNote] = useState(need?.answerNote ?? '');
  const save = () => {
    if (text.trim()) {
      if (need) updateMyDua(need.id, { text: text.trim(), note, ...(need.answeredAt ? { answerNote } : {}) });
      else addMyDua(text, note);
    }
    onClose();
  };
  return (
    <Dialog title={need ? ar.myDuas.editTitle : ar.myDuas.newTitle} onClose={onClose} actions={<Button block onClick={save}>{ar.notebook.save}</Button>}>
      <Field label={ar.myDuas.need}>{(id) => <TextInput id={id} value={text} maxLength={500} onChange={(e) => setText(e.target.value)} />}</Field>
      <Field label={ar.myDuas.note}>{(id) => <TextInput id={id} value={note} placeholder={ar.myDuas.notePlaceholder} onChange={(e) => setNote(e.target.value)} />}</Field>
      {need?.answeredAt && (
        <Field label={ar.myDuas.howLabel}>{(id) => <TextArea id={id} value={answerNote} onChange={(e) => setAnswerNote(e.target.value)} className="min-h-[110px]" />}</Field>
      )}
      <PrivacyLine />
    </Dialog>
  );
}

/** Opens when «استُجيبت؟» is switched on; the need is marked answered when saved. */
export function AnswerSheet({ need, onClose }: { need: MyDua; onClose: () => void }) {
  const [text, setText] = useState(need.answerNote ?? '');
  return (
    <Dialog
      title={ar.myDuas.howTitle}
      onClose={onClose}
      actions={
        <Button block onClick={() => { setAnswered(need.id, true, text); onClose(); }}>
          {ar.notebook.save}
        </Button>
      }
    >
      <Field label={ar.myDuas.howLabel}>{(id) => <TextArea id={id} value={text} placeholder={ar.myDuas.howPlaceholder} onChange={(e) => setText(e.target.value)} />}</Field>
      <PrivacyLine />
    </Dialog>
  );
}
