import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SessionSummary } from "@/api/client";
import { formatDate, formatDateTimeParts } from "@/lib/utils";

import { SessionTable } from "./SessionTable";

describe("SessionTable", () => {
  it("renders updated date and time on separate rows", () => {
    const session: SessionSummary = {
      id: "session-1",
      updatedAt: "2026-01-02T03:04:00Z",
      cwd: "/tmp/project",
      sourceKind: "cli",
      rolloutPath: "/tmp/session.jsonl",
      summary: "Test session",
      messageCount: 3,
      resumeCommand: "omp --resume session-1",
      searchText: "test session",
    };
    const updated = formatDateTimeParts(session.updatedAt);

    render(<SessionTable sessions={[session]} loading={false} onSelect={vi.fn()} />);

    const updatedTime = screen.getByTitle(formatDate(session.updatedAt));
    expect(updatedTime).toHaveAttribute("dateTime", session.updatedAt);
    expect(updatedTime).toHaveTextContent(updated.date);
    expect(updatedTime).toHaveTextContent(updated.time);
    expect(screen.getByText(updated.date).tagName).toBe("SPAN");
    expect(screen.getByText(updated.time).tagName).toBe("SPAN");
  });

  it("shows the OMP session title before generated summary", () => {
    const session: SessionSummary = {
      id: "session-1",
      updatedAt: "2026-01-02T03:04:00Z",
      cwd: "/tmp/project",
      sourceKind: "cli",
      rolloutPath: "/tmp/session.jsonl",
      title: "EMI reporting in RRS",
      summary: "Generated rollout summary",
      messageCount: 3,
      resumeCommand: "omp --resume session-1",
      searchText: "test session",
    };

    render(<SessionTable sessions={[session]} loading={false} onSelect={vi.fn()} />);

    expect(screen.getByText("EMI reporting in RRS")).toBeInTheDocument();
    expect(screen.getByText("Generated rollout summary")).toBeInTheDocument();
  });

  it("renders main model pills", () => {
    const session: SessionSummary = {
      id: "session-1",
      updatedAt: "2026-01-02T03:04:00Z",
      cwd: "/tmp/project",
      sourceKind: "cli",
      rolloutPath: "/tmp/session.jsonl",
      summary: "Test session",
      messageCount: 3,
      mainModels: ["github-copilot/gpt-5.5", "anthropic/claude-opus-4.5"],
      mainUsage: {
        input: 30,
        output: 12,
        cacheRead: 300,
        cacheWrite: 5,
        totalTokens: 347,
        cost: { input: 0.03, output: 0.05, cacheRead: 0.003, cacheWrite: 0.005, total: 0.088 },
      },
      resumeCommand: "omp --resume session-1",
      searchText: "test session",
    };

    render(<SessionTable sessions={[session]} loading={false} onSelect={vi.fn()} />);

    expect(screen.getByText("gpt-5.5")).toHaveAttribute("title", "github-copilot/gpt-5.5");
    expect(screen.getByText("claude-opus-4.5")).toHaveAttribute(
      "title",
      "anthropic/claude-opus-4.5",
    );
    expect(screen.getByText("347 tokens")).toHaveAttribute("title", "347 total tokens");
  });
});
