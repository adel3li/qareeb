import { ar } from '../../copy/ar';
import { TabTitle } from '../../app/ScreenHeader';
import { SegmentedControl } from '../../components/SegmentedControl';
import { FoundList } from './FoundList';
import { MyDuasList } from './MyDuasList';

/** الدفتر: ما وجدته and دعواتي. No counts anywhere. */
export default function Notebook({ view }: { view: 'found' | 'my-duas' }) {
  return (
    <div className="flex flex-col gap-4">
      <TabTitle title={ar.notebook.title} />
      <SegmentedControl
        role="tabs"
        idPrefix="notebook"
        label={ar.notebook.title}
        value={view}
        onChange={(v) => window.location.replace(v === 'my-duas' ? '#/notebook/my-duas' : '#/notebook')}
        options={[
          { value: 'found', label: ar.notebook.tabs.found },
          { value: 'my-duas', label: ar.notebook.tabs.myDuas },
        ]}
      />
      <div id="notebook-panel" role="tabpanel" aria-labelledby={`notebook-tab-${view}`} className="flex flex-col gap-4">
        {view === 'found' ? <FoundList /> : <MyDuasList />}
      </div>
    </div>
  );
}
