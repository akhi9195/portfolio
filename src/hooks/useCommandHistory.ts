import { useCallback, useRef, useState } from 'react';
import { storage } from '../lib/storage';

const KEY = 'term.history';
const MAX = 50;

export function useCommandHistory() {
  const [items, setItems] = useState<string[]>(() => storage.getJSON<string[]>(KEY, []));
  const cursor = useRef<number>(-1);

  const push = useCallback((cmd: string) => {
    setItems((prev) => {
      const next = [...prev.filter((c) => c !== cmd), cmd].slice(-MAX);
      storage.setJSON(KEY, next);
      return next;
    });
    cursor.current = -1;
  }, []);

  /** dir -1 = older, +1 = newer. Returns the entry to show, or '' past the newest. */
  const step = useCallback(
    (dir: -1 | 1): string | undefined => {
      if (!items.length) return undefined;
      let c = cursor.current === -1 ? items.length : cursor.current;
      c = Math.min(items.length, Math.max(0, c + dir));
      cursor.current = c === items.length ? -1 : c;
      return c === items.length ? '' : items[c];
    },
    [items],
  );

  return { push, step };
}
