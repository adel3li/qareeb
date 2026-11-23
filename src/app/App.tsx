import { lazy, Suspense, useEffect } from 'react';
import { loadContent, useContent } from '../content/load';
import { useOnboarding } from '../state/store';
import { ToastRegion } from '../components/Toast';
import { ar } from '../copy/ar';
import { useAppearance } from './useAppearance';
import { useRoute } from './useRoute';
import { tabOf } from './routes';
import { TabBar, WideHeader } from './TabBar';
import { useOverlays } from './overlays';
import { ErrorScreen } from './ErrorBoundary';

const Onboarding = lazy(() => import('../screens/onboarding/Onboarding'));
const Today = lazy(() => import('../screens/today/Today'));
const Library = lazy(() => import('../screens/library/Library'));
const DuaPage = lazy(() => import('../screens/library/DuaPage'));
const Notebook = lazy(() => import('../screens/notebook/Notebook'));
const Calendar = lazy(() => import('../screens/calendar/Calendar'));
const Settings = lazy(() => import('../screens/settings/Settings'));
const LiveDua = lazy(() => import('../features/live-dua/LiveDua'));
const ShareSheet = lazy(() => import('../features/share/ShareSheet'));

export function App() {
  useAppearance();
  useEffect(loadContent, []);
  const onboarded = useOnboarding((s) => s.completedAt !== null);
  const status = useContent((s) => s.status);
  const preview = useContent((s) => s.file?.meta.preview ?? false);

  if (status === 'error') return <ErrorScreen />;
  if (!onboarded) {
    return (
      <Suspense fallback={null}>
        <Onboarding />
      </Suspense>
    );
  }
  return (
    <>
      {preview ? <p className="m-0 border-b border-solid border-hairline bg-surface-sunken px-gutter py-2 text-center text-t-caption text-danger">{ar.preview.banner}</p> : null}
      <Shell ready={status === 'ready'} />
      <Overlays />
      <ToastRegion />
    </>
  );
}

function Shell({ ready }: { ready: boolean }) {
  const route = useRoute();
  const tab = tabOf(route);
  useEffect(() => window.scrollTo(0, 0), [route.name, route.name === 'dua' ? route.id : '']);
  return (
    <>
      <WideHeader current={tab} />
      <main className="mx-auto box-border w-full max-w-content px-gutter pb-[calc(112px+env(safe-area-inset-bottom,0px))] wide:pb-12">
        {ready ? (
          <Suspense fallback={null}>
            {route.name === 'today' && <Today />}
            {route.name === 'library' && <Library />}
            {route.name === 'dua' && <DuaPage id={route.id} />}
            {route.name === 'notebook' && <Notebook view={route.view} />}
            {route.name === 'calendar' && <Calendar />}
            {route.name === 'settings' && <Settings />}
          </Suspense>
        ) : null}
      </main>
      <TabBar current={tab} />
    </>
  );
}

function Overlays() {
  const live = useOverlays((s) => s.live);
  const shareDuaId = useOverlays((s) => s.shareDuaId);
  return (
    <Suspense fallback={null}>
      {live ? <LiveDua key={`${live.duaId}-${live.day}`} {...live} /> : null}
      {shareDuaId ? <ShareSheet duaId={shareDuaId} /> : null}
    </Suspense>
  );
}
