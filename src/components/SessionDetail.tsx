import { Check, Copy, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { fetchMessages, type SessionMessage, type SessionSummary } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compactPath, formatDate } from "@/lib/utils";

import { MessageTimeline } from "./MessageTimeline";
import { ResumeCommand } from "./ResumeCommand";

interface SessionDetailProps {
  session: SessionSummary | null;
  onClose: () => void;
}

export function SessionDetail({ session, onClose }: SessionDetailProps) {
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<SessionMessage[]>([]);
  const [includeRaw, setIncludeRaw] = useState(false);
  const [showToolResults, setShowToolResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathCopied, setPathCopied] = useState(false);
  const [isToolResultsPending, startToolResultsTransition] = useTransition();

  useEffect(() => {
    if (!session) {
      return;
    }
    setLoading(true);
    setError(null);
    fetchMessages(session.id, includeRaw)
      .then((result) => setMessages(result.items))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setLoading(false));
  }, [session, includeRaw]);

  const toolResultCount = useMemo(
    () => messages.filter((message) => isToolResult(message)).length,
    [messages],
  );

  useEffect(() => {
    startToolResultsTransition(() => {
      setVisibleMessages(
        showToolResults ? messages : messages.filter((message) => !isToolResult(message)),
      );
    });
  }, [messages, showToolResults]);

  async function copyRolloutPath() {
    if (!session) {
      return;
    }
    await navigator.clipboard.writeText(session.rolloutPath);
    setPathCopied(true);
    window.setTimeout(() => setPathCopied(false), 1200);
  }

  if (!session) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden bg-slate-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-4">
          <div className="min-w-0 space-y-1">
            <p className="font-mono text-xs text-slate-500">{session.id}</p>
            <h2 className="text-lg font-semibold text-slate-950">
              {session.summary ?? session.slug ?? "Untitled session"}
            </h2>
            <p className="text-sm text-slate-500">Updated {formatDate(session.updatedAt)}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close detail" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 space-y-4 overflow-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ResumeCommand command={session.resumeCommand} />
              <div>
                <div className="font-medium text-slate-700">CWD</div>
                <div className="break-words font-mono text-xs text-slate-500">
                  {compactPath(session.cwd)}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="font-medium text-slate-700">Rollout path</div>
                  <Button variant="outline" size="sm" onClick={copyRolloutPath}>
                    {pathCopied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {pathCopied ? "Copied" : "Copy path"}
                  </Button>
                </div>
                <div className="break-words font-mono text-xs text-slate-500">
                  {compactPath(session.rolloutPath)}
                </div>
              </div>
              {session.parseError && (
                <div className="rounded-md bg-amber-50 p-2 text-amber-700">
                  Partial parse: {session.parseError}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">Messages</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant={showToolResults ? "secondary" : "outline"}
                size="sm"
                disabled={toolResultCount === 0}
                onClick={() => setShowToolResults((current) => !current)}
              >
                {showToolResults ? "Hide" : "Show"} tool results ({toolResultCount})
              </Button>
              {isToolResultsPending && (
                <span className="text-xs text-slate-500">Updating messages…</span>
              )}
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={includeRaw}
                  onChange={(event) => setIncludeRaw(event.target.checked)}
                />
                Include raw JSON
              </label>
            </div>
          </div>
          {loading && <p className="text-sm text-slate-500">Loading messages…</p>}
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!loading && !error && visibleMessages.length === 0 && (
            <p className="text-sm text-slate-500">
              {toolResultCount > 0 && !showToolResults
                ? "Only tool results are hidden. Use the toggle to inspect tool output."
                : "No readable messages found."}
            </p>
          )}
          {!loading && !error && visibleMessages.length > 0 && (
            <MessageTimeline messages={visibleMessages} />
          )}
        </div>
      </aside>
    </div>
  );
}

function isToolResult(message: SessionMessage) {
  return message.role === "toolResult";
}
