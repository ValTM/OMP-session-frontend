import { useEffect, useState, useTransition } from "react";

import { MIN_SEARCH_CHARACTERS, SEARCH_DEBOUNCE_MS, shouldSearch } from "@/lib/fuzzySearch";

export function useDebouncedSearchQuery(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(() => (shouldSearch(query) ? query : ""));
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!shouldSearch(query)) {
      setIsDebouncing(false);
      startTransition(() => setDebouncedQuery(""));
      return;
    }

    setIsDebouncing(true);
    const timeout = window.setTimeout(() => {
      startTransition(() => setDebouncedQuery(query));
      setIsDebouncing(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [query]);

  return {
    debouncedQuery,
    isDebouncing,
    isPending,
    minSearchCharacters: MIN_SEARCH_CHARACTERS,
  };
}
