import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import type { SessionMessage } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatModelLabel, formatTokenCount } from "@/lib/utils";

import { UsageDetails } from "./UsageDetails";

interface MessageTimelineProps {
  messages: SessionMessage[];
}

export function MessageTimeline({ messages }: MessageTimelineProps) {
  const [expandedToolResults, setExpandedToolResults] = useState<Record<string, boolean>>({});
  const [expandedUsage, setExpandedUsage] = useState<Record<string, boolean>>({});
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

  function toggleUsage(id: string) {
    setExpandedUsage((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  useEffect(() => {
    if (!isPending) {
      setPendingToolResultID(null);
    }
  }, [isPending]);

  if (messages.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">No readable messages found.</p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isToolResult = message.role === "toolResult";
        const isExpanded = !isToolResult || expandedToolResults[message.id] === true;
        const preview = getToolResultPreview(message.text);
        const hasUsage = message.usage !== undefined && message.usage.totalTokens > 0;
        const isUsageExpanded = expandedUsage[message.id] === true;

        return (
          <article
            key={message.id}
            className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Badge>{message.role || "unknown"}</Badge>
              {message.timestamp && <span>{formatDate(message.timestamp)}</span>}
              {message.model && (
                <Badge
                  className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-300"
                  title={message.model}
                >
                  {message.role === "toolResult" ? "requested: " : ""}
                  {formatModelLabel(message.model)}
                </Badge>
              )}
              {hasUsage && (
                <>
                  <Badge
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300"
                    title={`${message.usage?.totalTokens.toLocaleString()} total tokens`}
                  >
                    {formatTokenCount(message.usage?.totalTokens ?? 0)} tokens
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUsage(message.id)}
                  >
                    {isUsageExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    {isUsageExpanded ? "Hide usage" : "Usage details"}
                  </Button>
                </>
              )}
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
            {hasUsage && isUsageExpanded && message.usage && (
              <div className="mb-3">
                <UsageDetails usage={message.usage} />
              </div>
            )}
            {isToolResult && !isExpanded && (
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{preview}</p>
            )}
            {isExpanded && (
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-50 p-3 font-sans text-sm leading-6 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
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
