import { lazy, Suspense, useEffect } from 'react';
import { TabBar } from '../components/TabBar';
import { ar } from '../copy/ar';
import { useContent } from '../content/load';
import { useOnboarding } from '../state/stores';
import { useUi } from '../state/ui';
import { useRoute } from './router';
import { useApplyAppearance } from './theme';
import { Toast } from './Toast';

const Today = lazy(() => import('../screens/today/Today'));
const Library = lazy(() => import('../screens/library/Library'));
const DuaPage = lazy(() => import('../screens/library/DuaPage'));
const Notebook = lazy(() => import('../screens/notebook/Notebook'));
const Calendar = lazy(() => import('../screens/calendar/CalendarScreen'));
const Settings = lazy(() => import('../screens/settings/Settings'));
const Onboarding = lazy(() => import('../screens/onboarding/Onboarding'));
const LiveDua = lazy(() => import('../features/live-dua/LiveDua'));
const ShareSheet = lazy(() => import('../features/share/ShareSheet'));

function Loading() {
  return (
    <p role="status" className="m-0 p-8 text-center text-t-body-sm text-text-muted">
      {ar.common.loading}
    </p>
  );
}

export function App() {
  useApplyAppearance();
  const onboarded = useOnboarding((s) => s.completedAt !== null);
  const route = useRoute();
  const content = useContent();
  const live = useUi((s) => s.live);
  const shareDuaId = useUi((s) => s.shareDuaId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  if (!onboarded) {
    return (
      <Suspense fallback={<Loading />}>
        <Onboarding />
      </Suspense>
    );
  }

  return (
    <>
      {content?.preview && (
        <p className="m-0 border-b border-hairline bg-surface-sunken px-4 py-2 text-center text-t-caption text-danger">{ar.draft.previewBanner}</p>
      )}
      <main className="mx-auto w-full max-w-(--content-max) pb-[calc(120px+env(safe-area-inset-bottom))] wide:max-w-[720px] wide:pb-12">
        <Suspense fallback={<Loading />}>
          {route.name === 'today' && <Today />}
          {route.name === 'library' && <Library />}
          {route.name === 'dua' && <DuaPage id={route.id} />}
          {route.name === 'notebook' && <Notebook />}
          {route.name === 'calendar' && <Calendar />}
          {route.name === 'settings' && <Settings />}
        </Suspense>
      </main>
      <TabBar />
      <Toast />
      <Suspense fallback={null}>
        {live && <LiveDua key={`${live.duaId}-${live.recordDay}`} />}
        {shareDuaId && <ShareSheet />}
      </Suspense>
    </>
  );
}
