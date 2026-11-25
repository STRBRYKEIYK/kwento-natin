import { useEffect } from 'react';
import '../library/styles.css';

export function LibraryLayout({ theme = 'light', children }) {
  useEffect(() => {
    document.body.style.background = theme === 'dark' ? 'var(--ink)' : 'var(--paper)';
    document.body.style.color = theme === 'dark' ? 'var(--paper)' : 'var(--ink)';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, [theme]);

  return <div className="lib-noise">{children}</div>;
}
