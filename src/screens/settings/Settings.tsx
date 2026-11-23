import { FileText, Info, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { goBack } from '../../app/router';
import { ListGroup, RowButton, RowItem } from '../../components/ListRow';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Switch } from '../../components/Switch';
import { TextSizeStepper } from '../../components/TextSizeStepper';
import { PushedTopBar } from '../../components/TopBar';
import { CONTACT_EMAIL } from '../../config';
import { ar } from '../../copy/ar';
import { toArabicNumerals } from '../../lib/arabic';
import { useSettings } from '../../state/stores';
import type { ThemeChoice } from '../../state/types';
import { AboutContentSheet, PrivacySheet } from './AboutSheets';
import { DataSection } from './DataSection';

export default function Settings() {
  const theme = useSettings((s) => s.theme);
  const fontScale = useSettings((s) => s.fontScale);
  const showMyDuas = useSettings((s) => s.showMyDuasInFlow);
  const update = useSettings((s) => s.update);
  const [sheet, setSheet] = useState<'privacy' | 'content' | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <PushedTopBar title={ar.settings.title} onBack={() => goBack({ name: 'today' })} />
      <div className="flex flex-col gap-6 px-(--gutter)">
        <ListGroup label={ar.settings.appearance}>
          <RowItem>
            <div className="flex flex-col gap-2">
              <span className="text-t-body text-text">{ar.settings.theme}</span>
              <SegmentedControl<ThemeChoice>
                role="radio"
                label={ar.settings.theme}
                value={theme}
                onChange={(v) => update({ theme: v })}
                options={[
                  { value: 'system', label: ar.settings.themes.system },
                  { value: 'light', label: ar.settings.themes.light },
                  { value: 'dark', label: ar.settings.themes.dark },
                ]}
              />
            </div>
          </RowItem>
          <RowItem>
            <TextSizeStepper value={fontScale} onChange={(v) => update({ fontScale: v })} />
          </RowItem>
          <RowItem>
            <div className="flex flex-col [&>button]:w-full">
              <Switch label={ar.settings.showMyDuas} checked={showMyDuas} onChange={(v) => update({ showMyDuasInFlow: v })} />
            </div>
          </RowItem>
        </ListGroup>

        <DataSection />

        <ListGroup label={ar.settings.privacy}>
          <RowButton icon={Lock} onClick={() => setSheet('privacy')}>
            {ar.settings.privacyPolicy}
          </RowButton>
        </ListGroup>

        <ListGroup label={ar.settings.aboutContent}>
          <RowButton icon={FileText} onClick={() => setSheet('content')}>
            {ar.settings.aboutContent}
          </RowButton>
        </ListGroup>

        <ListGroup label={ar.settings.aboutApp}>
          <RowItem>
            <p className="m-0 text-t-body text-text-body">{ar.aboutApp.body}</p>
          </RowItem>
          {CONTACT_EMAIL && (
            <RowButton icon={Mail} href={`mailto:${CONTACT_EMAIL}`}>
              {ar.settings.contact}
            </RowButton>
          )}
          <RowItem>
            <p className="m-0 flex items-center gap-3 text-t-body-sm text-text-muted">
              <Info size={20} strokeWidth={1.75} aria-hidden="true" />
              <span dir="rtl">{ar.settings.version(toArabicNumerals(__APP_VERSION__))}</span>
            </p>
          </RowItem>
        </ListGroup>
      </div>
      {sheet === 'privacy' && <PrivacySheet onClose={() => setSheet(null)} />}
      {sheet === 'content' && <AboutContentSheet onClose={() => setSheet(null)} />}
    </div>
  );
}
