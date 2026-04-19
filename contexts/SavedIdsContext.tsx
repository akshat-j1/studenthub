'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type SavedIdsContextValue = {
  savedIds: string[];
  loading: boolean;
  error: string | null;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => Promise<void>;
};

const SavedIdsContext = createContext<SavedIdsContextValue | undefined>(undefined);

export function SavedIdsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const syncSavedIds = async () => {
      if (authLoading) return;

      if (!user) {
        if (!cancelled) {
          setSavedIds([]);
          setLoading(false);
          setError(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('user_id', user.id);

      if (cancelled) return;

      if (queryError) {
        setSavedIds([]);
        setError(queryError.message);
      } else {
        const ids = (data ?? [])
          .map((row) => row.opportunity_id)
          .filter((value): value is string => typeof value === 'string');
        setSavedIds(ids);
      }

      setLoading(false);
    };

    void syncSavedIds();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggleSaved = useCallback(
    async (opportunityId: string) => {
      if (!user) {
        setError('You must be logged in to save opportunities.');
        return;
      }

      setError(null);
      const currentlySaved = savedIds.includes(opportunityId);

      if (currentlySaved) {
        const { error: deleteError } = await supabase
          .from('saved_opportunities')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunityId);

        if (deleteError) {
          setError(deleteError.message);
          return;
        }

        setSavedIds((prev) => prev.filter((id) => id !== opportunityId));
        return;
      }

      const { error: insertError } = await supabase.from('saved_opportunities').insert({
        user_id: user.id,
        opportunity_id: opportunityId,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSavedIds((prev) => (prev.includes(opportunityId) ? prev : [...prev, opportunityId]));
    },
    [savedIds, user]
  );

  const value = useMemo<SavedIdsContextValue>(
    () => ({ savedIds, loading, error, isSaved, toggleSaved }),
    [savedIds, loading, error, isSaved, toggleSaved]
  );

  return <SavedIdsContext.Provider value={value}>{children}</SavedIdsContext.Provider>;
}

export function useSavedIdsContext() {
  const context = useContext(SavedIdsContext);
  if (!context) {
    throw new Error('useSavedIdsContext must be used within SavedIdsProvider');
  }
  return context;
}
