import { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import type { AppDua } from '../../content/types';
import { TabTitle } from '../../app/ScreenHeader';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { LinkRow, ListGroup } from '../../components/ListRow';
import { SegmentedControl } from '../../components/SegmentedControl';
import { SearchField } from '../../components/TextField';
import { matchesQuery } from '../../lib/arabicSearch';
import { hijriDayLabel } from '../../lib/dayLabel';
import { livedDuas } from '../../lib/notebook';
import { useCompletions, useFavorites } from '../../state/store';

type View = 'lived' | 'favorites';

/** The duas lived (newest first, with their Hijri day) and the favourites, with search that ignores marks and letter forms. */
export default function Library() {
  const [view, setView] = useState<View>('lived');
  const [query, setQuery] = useState('');
  const byId = useContent((s) => s.byId);
  const completions = useCompletions((s) => s.items);
  const favorites = useFavorites((s) => s.ids);

  const rows = useMemo(() => {
    const lived = livedDuas(completions);
    const lastDay = new Map(lived.map((l) => [l.duaId, l.date]));
    const ids = view === 'lived' ? lived.map((l) => l.duaId) : [...favorites].reverse();
    return ids
      .map((id) => byId.get(id))
      .filter((d): d is AppDua => !!d)
      .map((dua) => ({ dua, date: lastDay.get(dua.id) }));
  }, [view, completions, favorites, byId]);

  const shown = query.trim() ? rows.filter((r) => matchesQuery(r.dua.searchText, query)) : rows;
  const kind = (d: AppDua) => (d.kind === 'quran' ? ar.card.fromQuran : ar.card.fromSunnah);

  return (
    <div className="flex flex-col gap-4">
      <TabTitle title={ar.library.title} />
      <SegmentedControl
        role="tabs"
        idPrefix="library"
        label={ar.library.title}
        value={view}
        onChange={setView}
        options={[
          { value: 'lived', label: ar.library.tabs.lived },
          { value: 'favorites', label: ar.library.tabs.favorites },
        ]}
      />
      <div id="library-panel" role="tabpanel" aria-labelledby={`library-tab-${view}`} className="flex flex-col gap-4">
        {rows.length > 0 ? <SearchField value={query} onChange={setQuery} placeholder={ar.library.search} label={ar.library.searchLabel} /> : null}
        {rows.length === 0 ? (
          view === 'lived' ? (
            <EmptyState
              title={ar.library.empty.title}
              body={ar.library.empty.body}
              action={
                <Button variant="primary" onClick={() => (window.location.hash = '#/today')}>
                  {ar.library.empty.action}
                </Button>
              }
            />
          ) : (
            <EmptyState title={ar.library.emptyFavorites.title} body={ar.library.emptyFavorites.body} />
          )
        ) : shown.length === 0 ? (
          <EmptyState title={ar.library.noResults.title} body={ar.library.noResults.body} />
        ) : (
          <ListGroup>
            {shown.map(({ dua, date }) => (
              <LinkRow
                key={dua.id}
                href={`#/dua/${dua.id}`}
                title={dua.shortTitle}
                meta={date ? `${kind(dua)} · ${hijriDayLabel(date)}` : kind(dua)}
                end={
                  favorites.includes(dua.id) ? (
                    <span className="text-accent" role="img" aria-label={ar.library.favorite}>
                      <Icon icon={Heart} filled />
                    </span>
                  ) : null
                }
              />
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
}
