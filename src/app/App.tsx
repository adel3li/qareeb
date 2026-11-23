import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from '../components/Toast';
import { ar } from '../copy/ar';
import { useStored } from '../state/store';
import { useUi } from '../state/ui';
import { TabBar, WideHeader } from './Navigation';
import { tabOf, useRoute, type Route } from './router';
import { useAppearance } from './useAppearance';
import { loadContent } from '../content/load';

// Start loading the content chunk at once, in parallel with the first screen.
void loadContent().catch(() => {});

const Onboarding = lazy(() => import('../screens/onboarding/OnboardingScreen'));
const Today = lazy(() => import('../screens/today/TodayScreen'));
const Library = lazy(() => import('../screens/library/LibraryScreen'));
const DuaPage = lazy(() => import('../screens/dua/DuaScreen'));
const Notebook = lazy(() => import('../screens/notebook/NotebookScreen'));
const Calendar = lazy(() => import('../screens/calendar/CalendarScreen'));
const Settings = lazy(() => import('../screens/settings/SettingsScreen'));
const LiveDua = lazy(() => import('../features/live-dua/LiveDua'));
const ShareDialog = lazy(() => import('../features/share/ShareDialog'));

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'today':
      return <Today />;
    case 'library':
      return <Library />;
    case 'dua':
      return <DuaPage id={route.id} />;
    case 'notebook':
      return <Notebook />;
    case 'calendar':
      return <Calendar />;
    case 'settings':
      return <Settings />;
  }
}

export function Loading() {
  return (
    <p role="status" className="m-0 py-16 text-center text-t-body-sm text-muted">
      {ar.loading}
    </p>
  );
}

export function App() {
  useAppearance();
  const onboarded = useStored('onboarding').completedAt !== null;
  const route = useRoute();
  const live = useUi((s) => s.live);
  const share = useUi((s) => s.share);
  const routeKey = route.name === 'dua' ? `dua/${route.id}` : route.name;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  if (!onboarded) {
    return (
      <Suspense fallback={<Loading />}>
        <Onboarding />
      </Suspense>
    );
  }

  const tab = tabOf(route);
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:rounded-control focus:bg-raised focus:p-3">
        {ar.nav.skipToContent}
      </a>
      <WideHeader current={tab} settingsOpen={route.name === 'settings'} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-content flex-1 px-gutter pb-8 outline-none md:pb-12">
        <Suspense fallback={<Loading />}>
          <Screen key={routeKey} route={route} />
        </Suspense>
      </main>
      <TabBar current={tab} />
      <Suspense fallback={null}>
        {live && <LiveDua key={live.duaId} />}
        {share && <ShareDialog />}
      </Suspense>
      <Toaster />
    </div>
  );
}
