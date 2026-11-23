import { Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { TextField } from '../../components/TextField';
import { ar } from '../../copy/ar';
import { buildDailyReminderIcs, downloadIcs } from '../../lib/calendarReminder';

/** «أضف تذكيرًا إلى تقويمك»: an .ics file with a daily event; the user's calendar does the reminding. */
export function ReminderSheet({ onClose }: { onClose: () => void }) {
  const [time, setTime] = useState('21:00');
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const download = () => {
    if (!valid) return;
    const url = `${location.origin}${location.pathname}#/today`;
    const ics = buildDailyReminderIcs({
      title: ar.calendar.reminderEventTitle,
      description: ar.calendar.reminderEventBody,
      url,
      time,
      uid: `qareeb-daily-${time.replace(':', '')}@qareeb`,
      productId: '-//Qareeb//Daily reminder//AR',
    });
    downloadIcs(ics, `qareeb-${time.replace(':', '')}.ics`);
    onClose();
  };
  return (
    <Dialog
      open
      onClose={onClose}
      title={ar.calendar.reminderTitle}
      footer={
        <Button variant="primary" block icon={Download} waiting={!valid} onClick={download}>
          {ar.calendar.reminderDownload}
        </Button>
      }
    >
      <p className="m-0 text-t-body text-text-body">{ar.calendar.reminderBody}</p>
      <TextField label={ar.calendar.reminderTime} type="time" value={time} onChange={(e) => setTime(e.target.value)} dir="ltr" className="[&_input]:text-end" />
    </Dialog>
  );
}
