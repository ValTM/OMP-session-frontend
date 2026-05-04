import type { SessionSummary } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { compactPath, formatDate, formatDateTimeParts } from "@/lib/utils";

import { ResumeCommand } from "./ResumeCommand";

interface SessionTableProps {
  sessions: SessionSummary[];
  loading: boolean;
  error?: string;
  onSelect: (session: SessionSummary) => void;
}

export function SessionTable({ sessions, loading, error, onSelect }: SessionTableProps) {
  if (loading) {
    return (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No sessions found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[calc(100vh-15rem)] overflow-auto">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-[55%] px-4 py-3">Session</th>
              <th className="w-[25%] px-4 py-3">CWD</th>
              <th className="w-[12%] px-4 py-3">Updated</th>
              <th className="w-[8%] px-4 py-3">Resume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((session) => {
              const updated = formatDateTimeParts(session.updatedAt);
              return (
                <tr key={session.id} className="align-top hover:bg-slate-50">
                  <td className="w-[55%] overflow-hidden px-4 py-3">
                    <Button
                      variant="ghost"
                      className="h-auto w-full max-w-full justify-start p-0 text-left"
                      onClick={() => onSelect(session)}
                    >
                      <span className="min-w-0 max-w-full w-full space-y-1">
                        <span className="block truncate font-mono text-xs text-slate-500">
                          {session.id}
                        </span>
                        <span
                          className="block truncate font-medium text-slate-900"
                          title={
                            session.summary ??
                            session.slug ??
                            session.firstUserPrompt ??
                            "Untitled session"
                          }
                        >
                          {session.summary ??
                            session.slug ??
                            session.firstUserPrompt ??
                            "Untitled session"}
                        </span>
                        {session.firstUserPrompt && (
                          <span
                            className="block truncate text-slate-500"
                            title={session.firstUserPrompt}
                          >
                            {session.firstUserPrompt}
                          </span>
                        )}
                        <span className="flex flex-wrap gap-2">
                          <Badge>{session.sourceKind}</Badge>
                          <Badge>{session.messageCount} messages</Badge>
                          {session.parseError && (
                            <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                              partial
                            </Badge>
                          )}
                        </span>
                      </span>
                    </Button>
                  </td>
                  <td className="w-[25%] overflow-hidden px-4 py-3 font-mono text-xs text-slate-500">
                    <div className="truncate" title={compactPath(session.cwd)}>
                      {compactPath(session.cwd)}
                    </div>
                  </td>
                  <td className="w-[12%] overflow-hidden px-4 py-3 text-slate-600">
                    <time
                      className="block leading-tight"
                      dateTime={session.updatedAt}
                      title={formatDate(session.updatedAt)}
                    >
                      <span className="block whitespace-nowrap">{updated.date}</span>
                      <span className="block whitespace-nowrap text-xs text-slate-500">
                        {updated.time}
                      </span>
                    </time>
                  </td>
                  <td className="w-[8%] overflow-hidden px-4 py-3">
                    <ResumeCommand command={session.resumeCommand} compact />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
