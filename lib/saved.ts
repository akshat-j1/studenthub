const STORAGE_KEY = 'studenthub:saved-opportunity-ids';

export const SAVED_IDS_CHANGED_EVENT = 'studenthub:saved-ids-changed';

function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

function readIds(): string[] {
  if (typeof window === 'undefined') return [];
  return parseIds(localStorage.getItem(STORAGE_KEY));
}

function writeIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(SAVED_IDS_CHANGED_EVENT));
}

/** Returns all saved opportunity ids (newest appended last). */
export function getSavedIds(): string[] {
  return readIds();
}

/** Returns true if the id is saved. Safe on server (returns false). */
export function isSaved(id: string): boolean {
  return readIds().includes(id);
}

/**
 * Toggles saved state for an id. Returns true if now saved, false if removed.
 */
export function toggleSaved(id: string): boolean {
  const ids = readIds();
  const i = ids.indexOf(id);
  if (i >= 0) {
    ids.splice(i, 1);
    writeIds(ids);
    return false;
  }
  ids.push(id);
  writeIds(ids);
  return true;
}
