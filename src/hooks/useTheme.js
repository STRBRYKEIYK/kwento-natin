import { useEffect, useState } from 'react';
import { usePersistentState } from './usePersistentState';

export function useTheme() {
  const [theme, setTheme] = usePersistentState('kwento-theme', 'system', value => ['system', 'light', 'dark'].includes(value));
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = event => setSystemDark(event.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const dark = theme === 'dark' || (theme === 'system' && systemDark);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  return { dark, toggleTheme: () => setTheme(dark ? 'light' : 'dark') };
}
