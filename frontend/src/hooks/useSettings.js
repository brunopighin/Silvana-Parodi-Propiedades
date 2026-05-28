import { useState, useEffect } from 'react';
import { settingsApi } from '../api/client';

let cachedSettings = null;

export function useSettings() {
  const [settings, setSettings] = useState(cachedSettings || {});
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) return;
    settingsApi.getAll()
      .then(({ data }) => {
        cachedSettings = data;
        setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
