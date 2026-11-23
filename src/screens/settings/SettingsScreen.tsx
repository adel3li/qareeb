import { useRef, useState, type ReactNode } from 'react';
import { Download, FileText, Info, Lock, Trash2, Upload, type LucideIcon } from 'lucide-react';
import { PushedTitle } from '../../app/TopBar';
import { goBack } from '../../app/router';
import { Icon } from '../../components/Icon';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { toast } from '../../components/Toast';
import { APP_VERSION, CONTACT } from '../../config';
import { ar } from '../../copy/ar';
import { downloadBackup } from '../../features/backup/download';
import { updateSettings } from '../../state/actions';
import { useStored } from '../../state/store';
import { AboutContentSheet, EraseDialog, ImportDialog, PrivacySheet } from './SettingsDialogs';
import { TextSizeStepper } from './TextSizeStepper';

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col">
      <h2 className="m-0 mx-1 mb-2 text-t-caption font-semibold text-accent">{label}</h2>
      <div className="overflow-hidden rounded-card border border-solid border-hairline bg-surface shadow-card [&>*+*]:border-t [&>*+*]:border-solid [&>*+*]:border-hairline">{children}</div>
    </section>
  );
}

function RowButton({ icon, children, onClick, danger }: { icon: LucideIcon; children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`box-border flex min-h-14 w-full items-center gap-3 border-0 bg-transparent px-card text-start text-t-body ${danger ? 'text-danger' : 'text-ink'}`}>
      <Icon as={icon} className={danger ? 'text-danger' : 'text-muted'} />
      {children}
    </button>
  );
}

type Open = 'privacy' | 'about' | 'erase' | { import: string } | null;

export default function SettingsScreen() {
  const settings = useStored('settings');
  const [open, setOpen] = useState<Open>(null);
  const file = useRef<HTMLInputElement>(null);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const text = f.size > 6 * 1024 * 1024 ? ' '.repeat(6 * 1024 * 1024) : await f.text();
    setOpen({ import: text });
    if (file.current) file.current.value = '';
  };

  return (
    <div className="flex flex-col gap-6">
      <PushedTitle title={ar.settings.title} onBack={() => goBack({ name: 'today' })} />

      <Group label={ar.settings.appearance}>
        <div className="flex flex-col gap-3 px-card py-4">
          <span className="text-t-body text-ink" id="theme-label">
            {ar.settings.appearance}
          </span>
          <SegmentedControl
            role="radio"
            label={ar.settings.appearance}
            value={settings.theme}
            onChange={(theme) => updateSettings({ theme })}
            options={[
              { value: 'system', label: ar.settings.theme.system },
              { value: 'light', label: ar.settings.theme.light },
              { value: 'dark', label: ar.settings.theme.dark },
            ]}
          />
        </div>
        <div className="px-card py-4">
          <TextSizeStepper value={settings.fontScale} onChange={(fontScale) => updateSettings({ fontScale })} />
        </div>
        <div className="px-card py-1.5">
          <Switch className="w-full" label={ar.settings.showMyDuas} checked={settings.showMyDuasInFlow} onChange={(showMyDuasInFlow) => updateSettings({ showMyDuasInFlow })} />
        </div>
      </Group>

      <Group label={ar.settings.data}>
        <RowButton icon={Download} onClick={() => { downloadBackup(); toast(ar.settings.exported); }}>
          {ar.settings.export}
        </RowButton>
        <RowButton icon={Upload} onClick={() => file.current?.click()}>
          {ar.settings.import}
        </RowButton>
        <RowButton icon={Trash2} danger onClick={() => setOpen('erase')}>
          {ar.settings.erase}
        </RowButton>
      </Group>
      <input ref={file} type="file" accept="application/json,.json" className="hidden" tabIndex={-1} aria-hidden="true" onChange={(e) => onFile(e.target.files?.[0])} />

      <Group label={ar.settings.privacyGroup}>
        <RowButton icon={Lock} onClick={() => setOpen('privacy')}>
          {ar.settings.privacy}
        </RowButton>
      </Group>

      <Group label={ar.settings.contentGroup}>
        <RowButton icon={FileText} onClick={() => setOpen('about')}>
          {ar.settings.aboutContent}
        </RowButton>
      </Group>

      <Group label={ar.settings.aboutGroup}>
        <p className="m-0 px-card py-4 text-t-body text-body">{ar.settings.aboutBody}</p>
        <p className="m-0 flex min-h-14 items-center gap-3 px-card text-t-body-sm text-muted">
          <Icon as={Info} />
          {ar.settings.version(APP_VERSION)}
          {CONTACT && <span>· {ar.settings.contact(CONTACT)}</span>}
        </p>
      </Group>

      {open === 'privacy' && <PrivacySheet onClose={() => setOpen(null)} />}
      {open === 'about' && <AboutContentSheet onClose={() => setOpen(null)} />}
      {open === 'erase' && <EraseDialog onClose={() => setOpen(null)} />}
      {open && typeof open === 'object' && <ImportDialog text={open.import} onClose={() => setOpen(null)} onPickAnother={() => { setOpen(null); file.current?.click(); }} />}
    </div>
  );
}
