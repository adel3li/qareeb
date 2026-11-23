import { useId, useState } from 'react';
import { TabTitle } from '../../app/TopBar';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ar } from '../../copy/ar';
import { FoundView } from './FoundView';
import { MyDuasView } from './MyDuasView';

/** الدفتر: «ما وجدته» by Hijri day, and «دعواتي». No counts anywhere. */
export default function NotebookScreen() {
  const [view, setView] = useState<'found' | 'myDuas'>(() => (sessionStorageGet() === 'myDuas' ? 'myDuas' : 'found'));
  const panel = useId();
  const change = (v: 'found' | 'myDuas') => {
    setView(v);
    try {
      sessionStorage.setItem('qareeb-ui:notebook-view', v);
    } catch {
      /* a convenience only */
    }
  };
  return (
    <div className="flex flex-col gap-stack">
      <TabTitle>{ar.notebook.title}</TabTitle>
      <SegmentedControl
        role="tabs"
        label={ar.notebook.title}
        controls={panel}
        value={view}
        onChange={change}
        options={[
          { value: 'found', label: ar.notebook.found },
          { value: 'myDuas', label: ar.notebook.myDuas },
        ]}
      />
      <div id={panel} role="tabpanel" className="flex flex-col gap-stack">
        {view === 'found' ? <FoundView /> : <MyDuasView />}
      </div>
    </div>
  );
}

function sessionStorageGet(): string | null {
  try {
    return sessionStorage.getItem('qareeb-ui:notebook-view');
  } catch {
    return null;
  }
}
