import { useState } from "react";
import type { CwdOption } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { compactPath } from "@/lib/utils";

interface FiltersProps {
  cwds: CwdOption[];
  cwd: string;
  sourceKind: string;
  showEmptyMessages: boolean;
  messageCountBucket: string;
  onCwdChange: (cwd: string) => void;
  onSourceKindChange: (sourceKind: string) => void;
  onShowEmptyMessagesChange: (showEmptyMessages: boolean) => void;
  onMessageCountBucketChange: (messageCountBucket: string) => void;
}

export function Filters({
  cwds,
  cwd,
  sourceKind,
  showEmptyMessages,
  messageCountBucket,
  onCwdChange,
  onSourceKindChange,
  onShowEmptyMessagesChange,
  onMessageCountBucketChange,
}: FiltersProps) {
  const [isSecondaryFiltersOpen, setIsSecondaryFiltersOpen] = useState(
    () => cwd !== "" || sourceKind !== "" || showEmptyMessages,
  );

  function toggleSecondaryFilters() {
    setIsSecondaryFiltersOpen((isOpen) => !isOpen);
  }

  return (
    <>
      <Select
        aria-label="Filter by message count"
        value={messageCountBucket}
        className="w-full md:w-52"
        onChange={(event) => onMessageCountBucketChange(event.target.value)}
      >
        <option value="all">All message counts</option>
        <option value="0-25">0–25 messages</option>
        <option value="25-75">26–75 messages</option>
        <option value="75-150">76–150 messages</option>
        <option value="150+">151+ messages</option>
      </Select>

      <Button
        type="button"
        variant="outline"
        aria-expanded={isSecondaryFiltersOpen}
        aria-controls="secondary-session-filters"
        onClick={toggleSecondaryFilters}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
        </svg>
        Filters
      </Button>

      {isSecondaryFiltersOpen && (
        <div
          id="secondary-session-filters"
          className="flex w-full flex-wrap items-center gap-2 border-t border-slate-100 pt-3"
        >
          <Select
            aria-label="Filter by working directory"
            value={cwd}
            className="h-9 w-full text-xs md:max-w-md"
            onChange={(event) => onCwdChange(event.target.value)}
          >
            <option value="">All working directories</option>
            {cwds.map((option) => (
              <option key={option.cwd} value={option.cwd}>
                {compactPath(option.cwd)} ({option.count})
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by source kind"
            value={sourceKind}
            className="h-9 w-full text-xs md:w-36"
            onChange={(event) => onSourceKindChange(event.target.value)}
          >
            <option value="">All sources</option>
            <option value="cli">CLI</option>
          </Select>
          <label className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={showEmptyMessages}
              onChange={(event) => onShowEmptyMessagesChange(event.target.checked)}
            />
            Show 0-message sessions
          </label>
        </div>
      )}
    </>
  );
}
