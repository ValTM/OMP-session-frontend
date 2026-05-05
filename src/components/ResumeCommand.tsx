import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface ResumeCommandProps {
  command: string;
  compact?: boolean;
}

export function ResumeCommand({ command, compact = false }: ResumeCommandProps) {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <code className="min-w-0 flex-1 truncate rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {command}
        </code>
      )}
      <Button aria-label="Copy resume command" size="sm" variant="outline" onClick={copyCommand}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {compact ? "Copy" : copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
