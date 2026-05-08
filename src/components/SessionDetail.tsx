import { ArrowUp, Check, Copy, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition, type UIEvent } from "react";

import { fetchMessages, type SessionMessage, type SessionSummary } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compactPath, formatDate } from "@/lib/utils";

import { MessageTimeline } from "./MessageTimeline";
import { ResumeCommand } from "./ResumeCommand";
import { UsageDetails } from "./UsageDetails";

interface SessionDetailProps {
  session: SessionSummary | null;
  onClose: () => void;
}

export function SessionDetail({ session, onClose }: SessionDetailProps) {
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<SessionMessage[]>([]);
  const [includeRaw, setIncludeRaw] = useState(false);
  const [showToolResults, setShowToolResults] = useState(false);
  const [showToolCalls, setShowToolCalls] = useState(false);
  const [toolCallCount, setToolCallCount] = useState(0);
  const [toolResultCount, setToolResultCount] = useState(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathCopied, setPathCopied] = useState(false);
  const [isMessageFiltersPending, startMessageFiltersTransition] = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    setLoading(true);
    setError(null);
    fetchMessages(session.id, includeRaw, showToolCalls, showToolResults)
      .then((result) => {
        setMessages(result.items);
        setToolCallCount(result.toolCallCount);
        setToolResultCount(result.toolResultCount);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setLoading(false));
  }, [session, includeRaw, showToolCalls, showToolResults]);

  useEffect(() => {
    setIsScrolledDown(false);
    contentRef.current?.scrollTo?.({ top: 0 });
  }, [session?.id]);

  useEffect(() => {
    startMessageFiltersTransition(() => {
      setVisibleMessages(
        messages.filter((message) => {
          if (isToolResult(message)) {
            return showToolResults;
          }
          if (isToolCall(message)) {
            return showToolCalls;
          }
          return true;
        }),
      );
    });
  }, [messages, showToolResults, showToolCalls]);

  async function copyRolloutPath() {
    if (!session) {
      return;
    }
    await navigator.clipboard.writeText(session.rolloutPath);
    setPathCopied(true);
    window.setTimeout(() => setPathCopied(false), 1200);
  }

  function handleContentScroll(event: UIEvent<HTMLDivElement>) {
    setIsScrolledDown(event.currentTarget.scrollTop > 240);
  }

  function scrollContentToTop() {
    contentRef.current?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  if (!session) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/30 dark:bg-slate-950/70" onClick={onClose}>
      <aside
        className="relative ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden bg-slate-50 shadow-2xl dark:bg-slate-950"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0 space-y-1">
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{session.id}</p>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
              {session.title ?? session.summary ?? session.slug ?? "Untitled session"}
            </h2>
            {session.title && session.summary && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{session.summary}</p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Updated {formatDate(session.updatedAt)}
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close detail" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div
          ref={contentRef}
          role="region"
          aria-label="Session detail content"
          className="flex-1 space-y-4 overflow-auto p-4"
          onScroll={handleContentScroll}
        >
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ResumeCommand command={session.resumeCommand} />
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-200">CWD</div>
                <div className="break-words font-mono text-xs text-slate-500 dark:text-slate-400">
                  {compactPath(session.cwd)}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="font-medium text-slate-700 dark:text-slate-200">Rollout path</div>
                  <Button variant="outline" size="sm" onClick={copyRolloutPath}>
                    {pathCopied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {pathCopied ? "Copied" : "Copy path"}
                  </Button>
                </div>
                <div className="break-words font-mono text-xs text-slate-500 dark:text-slate-400">
                  {compactPath(session.rolloutPath)}
                </div>
              </div>
              {session.parseError && (
                <div className="rounded-md bg-amber-50 p-2 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Partial parse: {session.parseError}
                </div>
              )}
            </CardContent>
          </Card>
          {session.mainUsage && session.mainUsage.totalTokens > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Main conversation usage only. Tool output is counted when a later model turn
                  consumes it as input/cache.
                </p>
                <UsageDetails usage={session.mainUsage} />
              </CardContent>
            </Card>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Messages</h3>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showToolCalls}
                  disabled={toolCallCount === 0}
                  onChange={(event) => setShowToolCalls(event.target.checked)}
                />
                Show tool calls ({toolCallCount})
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showToolResults}
                  disabled={toolResultCount === 0}
                  onChange={(event) => setShowToolResults(event.target.checked)}
                />
                Show tool results ({toolResultCount})
              </label>
              {isMessageFiltersPending && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Updating messages…
                </span>
              )}
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeRaw}
                  onChange={(event) => setIncludeRaw(event.target.checked)}
                />
                Include raw JSON
              </label>
            </div>
          </div>
          {loading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading messages…</p>
          )}
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}
          {!loading && !error && visibleMessages.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {hiddenToolMessageCount(
                toolCallCount,
                toolResultCount,
                showToolCalls,
                showToolResults,
              ) > 0
                ? "Only tool calls/results are hidden. Use the toggles to inspect tool activity."
                : "No readable messages found."}
            </p>
          )}
          {!loading && !error && visibleMessages.length > 0 && (
            <MessageTimeline messages={visibleMessages} />
          )}
        </div>
        {isScrolledDown && (
          <Button
            variant="default"
            size="sm"
            className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg"
            aria-label="Go to top"
            onClick={scrollContentToTop}
          >
            <ArrowUp className="h-4 w-4" />
            Top
          </Button>
        )}
      </aside>
    </div>
  );
}

function isToolResult(message: SessionMessage) {
  return message.role === "toolResult";
}

function isToolCall(message: SessionMessage) {
  return message.role === "toolCall";
}

function hiddenToolMessageCount(
  toolCallCount: number,
  toolResultCount: number,
  showToolCalls: boolean,
  showToolResults: boolean,
) {
  return (showToolCalls ? 0 : toolCallCount) + (showToolResults ? 0 : toolResultCount);
}
