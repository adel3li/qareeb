import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { Icon } from '../../components/Icon';
import { Field, TextInput } from '../../components/TextField';
import { toast } from '../../components/Toast';
import { APP_URL } from '../../config';
import { ar } from '../../copy/ar';
import { buildDailyReminderIcs, downloadIcs } from '../../lib/calendarReminder';

/** «أضف تذكيرًا إلى تقويمك»: a daily event in an .ics file; the user's calendar does the reminding. */
export function ReminderSheet({ onClose }: { onClose: () => void }) {
  const [time, setTime] = useState('21:00');
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const download = () => {
    if (!valid) return;
    const ics = buildDailyReminderIcs({
      title: ar.calendar.eventTitle,
      description: ar.calendar.eventBody,
      url: `${APP_URL}/#/today`,
      time,
      uid: 'daily-dua@qareeb',
      productId: '-//Qareeb//Daily dua//AR',
    });
    downloadIcs(ics, `qareeb-${time.replace(':', '')}.ics`);
    toast(ar.calendar.reminderDone);
    onClose();
  };
  return (
    <Dialog
      title={ar.calendar.reminderTitle}
      onClose={onClose}
      actions={
        <Button block waitingFor={!valid} icon={<Icon as={Download} />} onClick={download}>
          {ar.calendar.reminderDownload}
        </Button>
      }
    >
      <p className="m-0 text-t-body text-body">{ar.calendar.reminderBody}</p>
      <Field label={ar.calendar.reminderTime}>{(id) => <TextInput id={id} type="time" value={time} onChange={(e) => setTime(e.target.value)} dir="ltr" className="text-start" />}</Field>
    </Dialog>
  );
}
