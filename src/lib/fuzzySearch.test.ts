import { describe, expect, it } from "vitest";

import type { SessionSummary } from "@/api/client";

import { fuzzySearchSessions } from "./fuzzySearch";

const baseSession: SessionSummary = {
  id: "base",
  updatedAt: "2026-01-01T00:00:00Z",
  cwd: "/tmp",
  sourceKind: "cli",
  rolloutPath: "/tmp/session.jsonl",
  messageCount: 1,
  resumeCommand: "omp --resume base",
  searchText: "",
};

describe("fuzzySearchSessions", () => {
  it("does not filter before the minimum search length", () => {
    const sessions = [
      { ...baseSession, id: "a", summary: "alpha", searchText: "alpha" },
      { ...baseSession, id: "b", summary: "beta", searchText: "beta" },
    ];

    expect(fuzzySearchSessions(sessions, "al")).toEqual(sessions);
  });

  it("ranks exact id matches above summary-only matches", () => {
    const results = fuzzySearchSessions(
      [
        { ...baseSession, id: "other", summary: "14c5 datastream", searchText: "14c5 datastream" },
        { ...baseSession, id: "14c5b255eac6d66d", summary: "different", searchText: "different" },
      ],
      "14c5",
    );

    expect(results[0].id).toBe("14c5b255eac6d66d");
  });

  it("finds prompt and cwd fragments", () => {
    const results = fuzzySearchSessions(
      [
        {
          ...baseSession,
          id: "a",
          firstUserPrompt: "find cdc datastream work",
          searchText: "find cdc datastream work",
        },
        {
          ...baseSession,
          id: "b",
          cwd: "/Users/example/Payhawk/portal",
          searchText: "/Users/example/Payhawk/portal",
        },
      ],
      "cdc data",
    );

    expect(results.map((session) => session.id)).toEqual(["a"]);
  });
});
