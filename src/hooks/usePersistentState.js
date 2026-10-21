import { useEffect, useState } from 'react';

export function readPreference(key, fallback, valid = () => true) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    let value;
    try { value = JSON.parse(raw); } catch { value = raw; }
    return valid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function usePersistentState(key, fallback, valid) {
  const [value, setValue] = useState(() => readPreference(key, fallback, valid));
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private browsing may disable storage. */ }
  }, [key, value]);
  return [value, setValue];
}
