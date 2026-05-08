import type { TokenUsage } from "@/api/client";
import { formatCost, formatWholeNumber } from "@/lib/utils";

interface UsageDetailsProps {
  usage: TokenUsage;
}

export function UsageDetails({ usage }: UsageDetailsProps) {
  const rows = usageRows(usage);
  return (
    <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950"
        >
          <dt className="text-slate-500 dark:text-slate-400">{row.label}</dt>
          <dd className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function usageRows(usage: TokenUsage) {
  const rows = [
    { label: "Total", value: formatWholeNumber(usage.totalTokens) },
    { label: "Input", value: formatWholeNumber(usage.input) },
    { label: "Output", value: formatWholeNumber(usage.output) },
    { label: "Cache read", value: formatWholeNumber(usage.cacheRead) },
    { label: "Cache write", value: formatWholeNumber(usage.cacheWrite) },
    { label: "Cost", value: formatCost(usage.cost.total) },
  ];

  if (usage.reasoningTokens !== undefined) {
    rows.push({ label: "Reasoning", value: formatWholeNumber(usage.reasoningTokens) });
  }
  if (usage.premiumRequests !== undefined && usage.premiumRequests > 0) {
    rows.push({ label: "Premium reqs", value: formatWholeNumber(usage.premiumRequests) });
  }
  if (usage.cttl?.ephemeral5m) {
    rows.push({ label: "Cache 5m", value: formatWholeNumber(usage.cttl.ephemeral5m) });
  }
  if (usage.cttl?.ephemeral1h) {
    rows.push({ label: "Cache 1h", value: formatWholeNumber(usage.cttl.ephemeral1h) });
  }
  if (usage.server?.webSearch) {
    rows.push({ label: "Web search", value: formatWholeNumber(usage.server.webSearch) });
  }
  if (usage.server?.webFetch) {
    rows.push({ label: "Web fetch", value: formatWholeNumber(usage.server.webFetch) });
  }

  return rows;
}
