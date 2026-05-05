import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { fetchCwds, fetchSessions, type CwdOption, type SessionSummary } from "@/api/client";
import { CommandPalette } from "@/components/CommandPalette";
import { Filters } from "@/components/Filters";
import { SearchBar } from "@/components/SearchBar";
import { SessionDetail } from "@/components/SessionDetail";
import { SessionTable } from "@/components/SessionTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebouncedSearchQuery } from "@/hooks/useDebouncedSearchQuery";
import { useTheme } from "@/hooks/useTheme";
import { fuzzySearchSessions } from "@/lib/fuzzySearch";

export default function App() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [cwds, setCwds] = useState<CwdOption[]>([]);
  const [query, setQuery] = useState(
    () => new URLSearchParams(window.location.search).get("q") ?? "",
  );
  const [cwd, setCwd] = useState(
    () => new URLSearchParams(window.location.search).get("cwd") ?? "",
  );
  const [sourceKind, setSourceKind] = useState(
    () => new URLSearchParams(window.location.search).get("sourceKind") ?? "",
  );
  const [showEmptyMessages, setShowEmptyMessages] = useState(
    () => new URLSearchParams(window.location.search).get("includeEmptyMessages") === "true",
  );
  const [messageCountBucket, setMessageCountBucket] = useState(
    () => new URLSearchParams(window.location.search).get("messageCountBucket") ?? "all",
  );
  const [selected, setSelected] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [isDataPending, startDataTransition] = useTransition();
  const {
    debouncedQuery,
    isDebouncing,
    isPending: isSearchPending,
    minSearchCharacters,
  } = useDebouncedSearchQuery(query);
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const params = new URLSearchParams({ limit: "1000" });
      if (cwd) {
        params.set("cwd", cwd);
      }
      if (sourceKind) {
        params.set("sourceKind", sourceKind);
      }
      if (showEmptyMessages) {
        params.set("includeEmptyMessages", "true");
      }
      if (messageCountBucket !== "all") {
        params.set("messageCountBucket", messageCountBucket);
      }

      const sessionResult = await fetchSessions(params);
      startDataTransition(() => {
        setSessions(sessionResult.items);
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, [cwd, sourceKind, showEmptyMessages, messageCountBucket]);

  useEffect(() => {
    void fetchCwds().then((result) => setCwds(result.items));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    }
    if (cwd) {
      params.set("cwd", cwd);
    }
    if (sourceKind) {
      params.set("sourceKind", sourceKind);
    }
    if (showEmptyMessages) {
      params.set("includeEmptyMessages", "true");
    }
    if (messageCountBucket !== "all") {
      params.set("messageCountBucket", messageCountBucket);
    }
    const next = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, "", next);
  }, [debouncedQuery, cwd, sourceKind, showEmptyMessages, messageCountBucket]);

  const filteredSessions = useMemo(
    () => fuzzySearchSessions(sessions, debouncedQuery),
    [sessions, debouncedQuery],
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">OMP Sessions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Global read-only viewer for ~/.omp sessions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle
              themeMode={themeMode}
              resolvedTheme={resolvedTheme}
              onThemeModeChange={setThemeMode}
            />
            <CommandPalette sessions={sessions} onSelect={setSelected} />
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </header>

        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <SearchBar value={query} onChange={setQuery} />
            <Filters
              cwds={cwds}
              cwd={cwd}
              sourceKind={sourceKind}
              onCwdChange={setCwd}
              onSourceKindChange={setSourceKind}
              onShowEmptyMessagesChange={setShowEmptyMessages}
              onMessageCountBucketChange={setMessageCountBucket}
              showEmptyMessages={showEmptyMessages}
              messageCountBucket={messageCountBucket}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            Showing {filteredSessions.length} of {sessions.length} sessions
          </span>
          {query.trim().length > 0 && query.trim().length < minSearchCharacters && (
            <span>Type {minSearchCharacters - query.trim().length} more characters to search</span>
          )}
          {query.trim().length >= minSearchCharacters && (isDebouncing || isSearchPending) && (
            <span>Updating search…</span>
          )}
          {debouncedQuery && <span>Fuzzy query: “{debouncedQuery}”</span>}
        </div>

        <SessionTable
          sessions={filteredSessions}
          loading={loading || isDataPending}
          error={error}
          onSelect={setSelected}
        />
      </div>
      <SessionDetail session={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
