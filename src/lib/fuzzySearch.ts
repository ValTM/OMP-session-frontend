import { matchSorter, rankings } from "match-sorter";

import type { SessionSummary } from "@/api/client";

export const MIN_SEARCH_CHARACTERS = 3;
export const SEARCH_DEBOUNCE_MS = 600;

export function shouldSearch(query: string) {
  return query.trim().length >= MIN_SEARCH_CHARACTERS;
}

export function fuzzySearchSessions(sessions: SessionSummary[], query: string) {
  const normalized = query.trim();
  if (!shouldSearch(normalized)) {
    return sessions;
  }

  return matchSorter(sessions, normalized, {
    keys: [
      { key: "id", threshold: rankings.CONTAINS },
      { key: "slug", threshold: rankings.WORD_STARTS_WITH },
      { key: "summary", threshold: rankings.CONTAINS },
      { key: "firstUserPrompt", threshold: rankings.CONTAINS },
      { key: "cwd", threshold: rankings.CONTAINS },
      { key: "searchText", threshold: rankings.CONTAINS },
    ],
  });
}
