import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import type { SessionMessage } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface MessageTimelineProps {
  messages: SessionMessage[];
}

export function MessageTimeline({ messages }: MessageTimelineProps) {
  const [expandedToolResults, setExpandedToolResults] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [pendingToolResultID, setPendingToolResultID] = useState<string | null>(null);

  function toggleToolResult(id: string) {
    setPendingToolResultID(id);
    startTransition(() => {
      setExpandedToolResults((current) => ({
        ...current,
        [id]: !current[id],
      }));
    });
  }

  useEffect(() => {
    if (!isPending) {
      setPendingToolResultID(null);
    }
  }, [isPending]);

  if (messages.length === 0) {
    return <p className="text-sm text-slate-500">No readable messages found.</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isToolResult = message.role === "toolResult";
        const isExpanded = !isToolResult || expandedToolResults[message.id] === true;
        const preview = getToolResultPreview(message.text);

        return (
          <article key={message.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Badge>{message.role || "unknown"}</Badge>
              {message.timestamp && <span>{formatDate(message.timestamp)}</span>}
              {isToolResult && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleToolResult(message.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  {isExpanded ? "Collapse output" : "Expand output"}
                </Button>
              )}
              {isToolResult && pendingToolResultID === message.id && isPending && (
                <span>Updating…</span>
              )}
            </div>
            {isToolResult && !isExpanded && (
              <p className="truncate text-sm text-slate-500">{preview}</p>
            )}
            {isExpanded && (
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-50 p-3 font-sans text-sm leading-6 text-slate-800">
                {message.text}
              </pre>
            )}
          </article>
        );
      })}
    </div>
  );
}

function getToolResultPreview(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return "Tool result output hidden.";
  }
  return lines[0];
}
