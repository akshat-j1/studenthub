'use client';

import { useCallback, useEffect, useState } from 'react';

import { SAVED_IDS_CHANGED_EVENT, getSavedIds, toggleSaved as toggleSavedLib } from '@/lib/saved';

export function useSavedIds() {
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedIds());

  useEffect(() => {
    const handleSavedIdsChanged = () => {
      setSavedIds(getSavedIds());
    };

    window.addEventListener(SAVED_IDS_CHANGED_EVENT, handleSavedIdsChanged);
    return () => window.removeEventListener(SAVED_IDS_CHANGED_EVENT, handleSavedIdsChanged);
  }, []);

  const toggleSaved = useCallback((id: string) => {
    toggleSavedLib(id);
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return { savedIds, toggleSaved, isSaved };
}
