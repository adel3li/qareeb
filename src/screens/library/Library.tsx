import { Heart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ButtonLink } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { ListGroup, ListRow } from '../../components/ListRow';
import { SegmentedControl } from '../../components/SegmentedControl';
import { SearchField } from '../../components/TextField';
import { TabTopBar } from '../../components/TopBar';
import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import { hijriDayLabel } from '../../lib/hijriLabel';
import { livedDuas, searchDuas } from '../../lib/library';
import { kindLabel } from '../../lib/reference';
import { useCompletions, useFavorites } from '../../state/stores';

type View = 'lived' | 'favorites';

export default function Library() {
  const content = useContent();
  const completions = useCompletions((s) => s.items);
  const favoriteIds = useFavorites((s) => s.ids);
  const [view, setView] = useState<View>('lived');
  const [query, setQuery] = useState('');

  const lived = useMemo(() => (content ? livedDuas(completions, content.duas) : []), [content, completions]);
  const favorites = useMemo(() => {
    if (!content) return [];
    const byId = new Map(content.duas.map((d) => [d.id, d]));
    return [...favoriteIds].reverse().flatMap((id) => {
      const dua = byId.get(id);
      return dua ? [{ dua, date: lived.find((l) => l.dua.id === id)?.date }] : [];
    });
  }, [content, favoriteIds, lived]);

  const list = view === 'lived' ? lived : favorites;
  const results = searchDuas(list, query);

  return (
    <div className="flex flex-col gap-5">
      <TabTopBar title={ar.library.title} />
      <div className="flex flex-col gap-4 px-(--gutter)">
        <SegmentedControl
          role="tabs"
          idPrefix="library"
          label={ar.library.viewsLabel}
          value={view}
          onChange={setView}
          options={[
            { value: 'lived', label: ar.library.views.lived },
            { value: 'favorites', label: ar.library.views.favorites },
          ]}
        />
        <div id="library-panel" role="tabpanel" aria-labelledby={`library-tab-${view}`} className="flex flex-col gap-4">
          {list.length > 0 && <SearchField label={ar.library.search} placeholder={ar.library.searchPlaceholder} value={query} onChange={setQuery} />}
          {!content ? null : list.length === 0 ? (
            view === 'lived' ? (
              <EmptyState
                title={ar.library.emptyLivedTitle}
                body={ar.library.emptyLivedBody}
                action={
                  <ButtonLink variant="primary" href="#/today">
                    {ar.library.emptyLivedAction}
                  </ButtonLink>
                }
              />
            ) : (
              <EmptyState title={ar.library.emptyFavTitle} body={ar.library.emptyFavBody} />
            )
          ) : results.length === 0 ? (
            <EmptyState title={ar.library.noResultsTitle} body={ar.library.noResultsBody} />
          ) : (
            <ListGroup>
              {results.map(({ dua, date }) => (
                <ListRow
                  key={dua.id}
                  href={`#/dua/${dua.id}`}
                  title={dua.shortTitle}
                  meta={date ? `${kindLabel(dua.kind)} · ${hijriDayLabel(date)}` : kindLabel(dua.kind)}
                  end={
                    favoriteIds.includes(dua.id) && view === 'lived' ? (
                      <span className="text-accent" role="img" aria-label={ar.library.favoriteMark}>
                        <Icon icon={Heart} fill="currentColor" />
                      </span>
                    ) : null
                  }
                />
              ))}
            </ListGroup>
          )}
        </div>
      </div>
    </div>
  );
}
