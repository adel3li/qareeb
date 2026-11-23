import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS, type StoreName } from './keys';
import { DEFAULTS, type StoredData } from './shapes';
import { migrate, sanitize, VERSIONS } from './migrations';

/**
 * One persisted Zustand store per key in src/state/keys.ts. Each is stored by
 * `persist` as `{"state":{"value":…},"version":1}`; the value's shape is in
 * src/state/shapes.ts. Nothing is written until the user does something: a
 * store writes only when its value is set.
 */
type Slice<K extends StoreName> = { value: StoredData[K] };
type Stores = { [K in StoreName]: UseBoundStore<StoreApi<Slice<K>>> };

function persisted<K extends StoreName>(name: K): UseBoundStore<StoreApi<Slice<K>>> {
  return create<Slice<K>>()(
    persist(() => ({ value: structuredClone(DEFAULTS[name]) }), {
      name: KEYS[name],
      version: VERSIONS[name],
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ value: s.value }),
      migrate: (persistedState, version) => ({ value: migrate(name, (persistedState as Slice<K> | undefined)?.value, version) }) as Slice<K>,
      merge: (persistedState, current) => {
        const v = (persistedState as Partial<Slice<K>> | undefined)?.value;
        return v === undefined ? current : { value: sanitize(name, v) };
      },
    }),
  );
}

export const stores: Stores = {
  settings: persisted('settings'),
  onboarding: persisted('onboarding'),
  welcome: persisted('welcome'),
  completions: persisted('completions'),
  notebook: persisted('notebook'),
  myDuas: persisted('myDuas'),
  favorites: persisted('favorites'),
  drafts: persisted('drafts'),
};

/** Subscribes a component to one stored value. */
export function useStored<K extends StoreName>(name: K): StoredData[K] {
  return (stores[name] as unknown as UseBoundStore<StoreApi<Slice<K>>>)((s) => s.value);
}

export function getStored<K extends StoreName>(name: K): StoredData[K] {
  return (stores[name] as unknown as StoreApi<Slice<K>>).getState().value;
}

export function setStored<K extends StoreName>(name: K, update: (current: StoredData[K]) => StoredData[K]): void {
  const store = stores[name] as unknown as StoreApi<Slice<K>>;
  store.setState({ value: update(store.getState().value) });
}

/** Every stored value, as the backup exports it. */
export function snapshot(): StoredData {
  return Object.fromEntries((Object.keys(KEYS) as StoreName[]).map((k) => [k, getStored(k)])) as unknown as StoredData;
}

/** Replaces every stored value (backup import). */
export function replaceAll(data: StoredData): void {
  for (const k of Object.keys(KEYS) as StoreName[]) setStored(k, () => data[k] as never);
}

/** «امسح كل بياناتي»: every qareeb: key is removed, and the stores return to their empty defaults. */
export function eraseAll(): void {
  for (const k of Object.keys(KEYS) as StoreName[]) {
    (stores[k] as unknown as StoreApi<Slice<typeof k>>).setState({ value: structuredClone(DEFAULTS[k]) as never });
  }
  const prefix = KEYS.settings.split(':')[0] + ':';
  for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key);
}
