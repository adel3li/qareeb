import { useId, useMemo, useState } from 'react';
import { ChevronLeft, Heart } from 'lucide-react';
import { TabTitle } from '../../app/TopBar';
import { hrefOf, navigate } from '../../app/router';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { SegmentedControl } from '../../components/SegmentedControl';
import { SearchField } from '../../components/TextField';
import { useContent } from '../../content/load';
import type { Dua } from '../../content/types';
import { ar } from '../../copy/ar';
import { kindLabel } from '../../features/dua/reference';
import { matchesQuery } from '../../lib/arabicSearch';
import { hijriOfDay } from '../../lib/format';
import { livedDuas } from '../../lib/progress';
import { useStored } from '../../state/store';

type View = 'lived' | 'favorites';

/** Text a dua is found by: its titles, the dua and, for verses, a modern-spelling copy. */
export function searchable(d: Dua): string {
  return [d.title, d.shortTitle, d.text, d.searchExtra, d.speaker].join(' ');
}

/** المكتبة: the duas the user has lived (newest first, with the Hijri day) and the favourites. No totals. */
export default function LibraryScreen() {
  const bundle = useContent();
  const completions = useStored('completions');
  const favorites = useStored('favorites');
  const [view, setView] = useState<View>('lived');
  const [query, setQuery] = useState('');
  const panel = useId();

  const rows = useMemo(() => {
    const byId = new Map(bundle.duas.map((d) => [d.id, d]));
    const list =
      view === 'lived'
        ? livedDuas(completions).flatMap(({ duaId, date }) => (byId.has(duaId) ? [{ dua: byId.get(duaId)!, date }] : []))
        : favorites.flatMap((id) => {
            const dua = byId.get(id);
            if (!dua) return [];
            const lived = livedDuas(completions).find((l) => l.duaId === id);
            return [{ dua, date: lived?.date }];
          });
    return list.filter((r) => matchesQuery(searchable(r.dua), query));
  }, [bundle, completions, favorites, view, query]);

  const nothingYet = view === 'lived' ? completions.length === 0 : favorites.length === 0;

  return (
    <div className="flex flex-col gap-stack">
      <TabTitle>{ar.library.title}</TabTitle>
      <SegmentedControl
        role="tabs"
        label={ar.library.title}
        controls={panel}
        value={view}
        onChange={setView}
        options={[
          { value: 'lived', label: ar.library.lived },
          { value: 'favorites', label: ar.library.favorites },
        ]}
      />
      <div id={panel} role="tabpanel" className="flex flex-col gap-stack">
        {nothingYet ? (
          <EmptyState
            title={view === 'lived' ? ar.library.emptyTitle : ar.library.favEmptyTitle}
            body={view === 'lived' ? ar.library.emptyBody : ar.library.favEmptyBody}
            action={<Button onClick={() => navigate({ name: 'today' })}>{ar.library.goToday}</Button>}
          />
        ) : (
          <>
            <SearchField value={query} onChange={setQuery} />
            {rows.length === 0 ? (
              <EmptyState title={ar.library.noResultsTitle} body={ar.library.noResultsBody} />
            ) : (
              <ul className="m-0 list-none overflow-hidden rounded-card border border-solid border-hairline bg-surface p-0 shadow-card [&>li+li]:border-t [&>li+li]:border-solid [&>li+li]:border-hairline">
                {rows.map(({ dua, date }) => (
                  <li key={dua.id}>
                    <a href={hrefOf({ name: 'dua', id: dua.id })} onClick={(e) => { e.preventDefault(); navigate({ name: 'dua', id: dua.id }); }} className="flex min-h-[72px] items-center gap-3 px-card py-2.5 text-ink no-underline">
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-t-body-lg font-semibold">{dua.shortTitle}</span>
                        <span className="text-t-caption font-normal text-muted">
                          {kindLabel(dua)}
                          {date && ` · ${hijriOfDay(date)}`}
                        </span>
                      </span>
                      {favorites.includes(dua.id) && <Icon as={Heart} filled className="text-accent" aria-label={ar.library.favoriteMark} aria-hidden={false} role="img" />}
                      <Icon as={ChevronLeft} className="text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
