import { useState } from 'react';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TabTopBar } from '../../components/TopBar';
import { ar } from '../../copy/ar';
import { FoundView } from './FoundView';
import { MyDuasView } from './MyDuasView';

type View = 'found' | 'myDuas';

export default function Notebook() {
  const [view, setView] = useState<View>('found');
  return (
    <div className="flex flex-col gap-5">
      <TabTopBar title={ar.notebook.title} />
      <div className="flex flex-col gap-4 px-(--gutter)">
        <SegmentedControl
          role="tabs"
          idPrefix="notebook"
          label={ar.notebook.viewsLabel}
          value={view}
          onChange={setView}
          options={[
            { value: 'found', label: ar.notebook.views.found },
            { value: 'myDuas', label: ar.notebook.views.myDuas },
          ]}
        />
        <div id="notebook-panel" role="tabpanel" aria-labelledby={`notebook-tab-${view}`}>
          {view === 'found' ? <FoundView /> : <MyDuasView />}
        </div>
      </div>
    </div>
  );
}
