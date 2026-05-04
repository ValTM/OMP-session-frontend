import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SessionSummary } from "@/api/client";

import { SessionDetail } from "./SessionDetail";

describe("SessionDetail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hides tool calls and tool results by default and reveals them independently", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({
            items: [
              {
                id: "m1",
                timestamp: "2026-01-01T00:00:00Z",
                role: "user",
                text: "actual prompt",
                type: "message",
              },
              {
                id: "tool-call-1",
                timestamp: "2026-01-01T00:00:01Z",
                role: "toolCall",
                text: "Tool call: read",
                type: "message",
              },
              {
                id: "tool-result-1",
                timestamp: "2026-01-01T00:00:02Z",
                role: "toolResult",
                text: "Tool result: read\nfile contents",
                type: "message",
              },
            ],
          }),
        ),
      ),
    );

    render(<SessionDetail session={session} onClose={vi.fn()} />);

    expect(await screen.findByText("actual prompt")).toBeInTheDocument();
    expect(screen.queryByText("Tool call: read")).not.toBeInTheDocument();
    expect(screen.queryByText("Tool result: read")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox", { name: /show tool calls \(1\)/i }));
    expect(screen.getByText("Tool call: read")).toBeInTheDocument();
    expect(screen.queryByText("Tool result: read")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox", { name: /show tool results \(1\)/i }));
    await waitFor(() => {
      expect(screen.getByText("Tool result: read")).toBeInTheDocument();
    });
  });
});

const session: SessionSummary = {
  id: "session-1",
  updatedAt: "2026-01-01T00:00:00Z",
  cwd: "/tmp/project",
  sourceKind: "cli",
  rolloutPath: "/tmp/session.jsonl",
  summary: "Test session",
  messageCount: 1,
  resumeCommand: "omp --resume session-1",
  searchText: "test session",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
