import { Command } from "cmdk";
import { useEffect, useMemo, useState } from "react";

import type { SessionSummary } from "@/api/client";
import { Button } from "@/components/ui/button";
import { useDebouncedSearchQuery } from "@/hooks/useDebouncedSearchQuery";
import { fuzzySearchSessions, shouldSearch } from "@/lib/fuzzySearch";
import { compactPath } from "@/lib/utils";

interface CommandPaletteProps {
  sessions: SessionSummary[];
  onSelect: (session: SessionSummary) => void;
}

export function CommandPalette({ sessions, onSelect }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { debouncedQuery, isDebouncing, isPending, minSearchCharacters } =
    useDebouncedSearchQuery(query);
  const results = useMemo(() => {
    if (!shouldSearch(debouncedQuery)) {
      return sessions.slice(0, 20);
    }
    return fuzzySearchSessions(sessions, debouncedQuery).slice(0, 20);
  }, [sessions, debouncedQuery]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function selectSession(session: SessionSummary) {
    onSelect(session);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        ⌘K
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <Command
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
            shouldFilter={false}
            onClick={(event) => event.stopPropagation()}
          >
            <Command.Input
              value={query}
              onValueChange={setQuery}
              autoFocus
              placeholder="Jump to session…"
              className="w-full border-b border-slate-200 px-4 py-3 outline-none"
            />
            <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
              {query.trim().length > 0 && query.trim().length < minSearchCharacters
                ? `Type ${minSearchCharacters - query.trim().length} more characters to search`
                : isDebouncing || isPending
                  ? "Updating search…"
                  : "Showing recent sessions. Type 3+ characters to search."}
            </div>
            <Command.List className="max-h-[24rem] overflow-auto p-2">
              <Command.Empty className="p-4 text-sm text-slate-500">
                No sessions found.
              </Command.Empty>
              {results.map((session) => (
                <Command.Item
                  key={session.id}
                  value={session.id}
                  onSelect={() => selectSession(session)}
                  className="cursor-pointer rounded-lg px-3 py-2 aria-selected:bg-slate-100"
                >
                  <div className="font-medium text-slate-900">
                    {session.title ?? session.summary ?? session.slug ?? session.id}
                  </div>
                  <div className="font-mono text-xs text-slate-500">
                    {session.id} · {compactPath(session.cwd)}
                  </div>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
