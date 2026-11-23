import { useRef, useState } from 'react';
import { Download, FileText, Info, Lock, Trash2, Upload } from 'lucide-react';
import { ar } from '../../copy/ar';
import { PushedHeader } from '../../app/ScreenHeader';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { Icon } from '../../components/Icon';
import { ButtonRow, ListGroup, SectionLabel } from '../../components/ListRow';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { TextSizeStepper } from '../../components/TextSizeStepper';
import { useToast } from '../../components/Toast';
import { exportBackup } from '../../features/backup/exportBackup';
import { ImportSheet } from '../../features/backup/ImportSheet';
import { parseBackup, type ParseResult } from '../../lib/backup';
import { BACKUP_MAX_BYTES } from '../../config';
import { eraseAll } from '../../state/data';
import { useSettings } from '../../state/store';
import { AboutContent, PrivacyPolicy } from './InfoSheets';

/** Appearance, my data, privacy, about the content, about the app. Every setting here works. */
export default function Settings() {
  const s = useSettings();
  const toast = useToast((t) => t.show);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<ParseResult | null>(null);
  const [sheet, setSheet] = useState<'privacy' | 'about' | 'erase' | null>(null);
  const t = ar.settings;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > BACKUP_MAX_BYTES) setImported({ ok: false, error: 'tooLarge' });
    else setImported(parseBackup(await file.text(), file.size));
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-6">
      <PushedHeader title={t.title} />

      <section aria-labelledby="s-appearance">
        <SectionLabel id="s-appearance">{t.appearance}</SectionLabel>
        <div className="rounded-card border border-solid border-hairline bg-surface shadow-card [&>*+*]:border-t [&>*+*]:border-solid [&>*+*]:border-hairline">
          <div className="flex flex-col gap-3 px-card py-4">
            <span id="theme-label" className="text-t-body text-text">
              {t.theme}
            </span>
            <SegmentedControl
              role="radio"
              label={t.theme}
              value={s.theme}
              onChange={s.setTheme}
              options={[
                { value: 'system', label: t.themes.system },
                { value: 'light', label: t.themes.light },
                { value: 'dark', label: t.themes.dark },
              ]}
            />
          </div>
          <div className="px-card py-4">
            <TextSizeStepper value={s.fontScale} onChange={s.setFontScale} />
          </div>
          <div className="px-card py-2">
            <Switch label={t.showMyDuas} checked={s.showMyDuasInFlow} onChange={s.setShowMyDuasInFlow} className="w-full gap-4" />
          </div>
        </div>
      </section>

      <section aria-labelledby="s-data">
        <SectionLabel id="s-data">{t.data}</SectionLabel>
        <ListGroup>
          <ButtonRow
            icon={Download}
            label={t.export}
            onClick={() => {
              exportBackup();
              toast(t.exported);
            }}
          />
          <ButtonRow icon={Upload} label={t.import} onClick={() => fileRef.current?.click()} />
          <ButtonRow icon={Trash2} label={t.erase} danger onClick={() => setSheet('erase')} />
        </ListGroup>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" aria-hidden="true" tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
      </section>

      <section aria-labelledby="s-privacy">
        <SectionLabel id="s-privacy">{t.privacy}</SectionLabel>
        <ListGroup>
          <ButtonRow icon={Lock} label={t.privacyPolicy} onClick={() => setSheet('privacy')} />
        </ListGroup>
      </section>

      <section aria-labelledby="s-about">
        <SectionLabel id="s-about">{t.about}</SectionLabel>
        <ListGroup>
          <ButtonRow icon={FileText} label={t.aboutContent} onClick={() => setSheet('about')} />
        </ListGroup>
      </section>

      <section aria-labelledby="s-app">
        <SectionLabel id="s-app">{t.aboutApp}</SectionLabel>
        <div className="rounded-card border border-solid border-hairline bg-surface shadow-card">
          <p className="m-0 px-card py-4 text-t-body text-text-body">{t.aboutAppBody}</p>
          <p className="m-0 flex min-h-14 items-center gap-3 border-t border-solid border-hairline px-card text-t-body-sm text-text-muted">
            <Icon icon={Info} />
            {t.version(__APP_VERSION__)}
          </p>
        </div>
      </section>

      {imported ? <ImportSheet result={imported} onClose={() => setImported(null)} onPickAnother={() => fileRef.current?.click()} /> : null}
      {sheet === 'privacy' ? <PrivacyPolicy onClose={() => setSheet(null)} /> : null}
      {sheet === 'about' ? <AboutContent onClose={() => setSheet(null)} /> : null}
      <Dialog open={sheet === 'erase'} title={t.eraseConfirm.title} onClose={() => setSheet(null)}>
        <p className="m-0 text-t-body text-text-body">{t.eraseConfirm.body}</p>
        <Button
          variant="danger"
          block
          onClick={() => {
            setSheet(null);
            eraseAll();
            window.location.hash = '#/today';
          }}
        >
          {t.eraseConfirm.confirm}
        </Button>
        <Button variant="secondary" block onClick={() => setSheet(null)}>
          {ar.common.cancel}
        </Button>
      </Dialog>
    </div>
  );
}
