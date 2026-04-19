'use client';

import { useSavedIdsContext } from '@/contexts/SavedIdsContext';

export function useSavedIds() {
  return useSavedIdsContext();
}
