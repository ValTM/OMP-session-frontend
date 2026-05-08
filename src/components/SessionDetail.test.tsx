import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SessionSummary } from "@/api/client";

import { SessionDetail } from "./SessionDetail";

describe("SessionDetail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("hides tool calls and tool results by default and reveals them independently", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = new URL(String(input), "http://localhost");
        const includeToolCalls = url.searchParams.get("includeToolCalls") === "true";
        const includeToolResults = url.searchParams.get("includeToolResults") === "true";
        return Promise.resolve(
          jsonResponse({
            items: [
              {
                id: "m1",
                timestamp: "2026-01-01T00:00:00Z",
                role: "user",
                text: "actual prompt",
                type: "message",
              },
              ...(includeToolCalls
                ? [
                    {
                      id: "tool-call-1",
                      timestamp: "2026-01-01T00:00:01Z",
                      role: "toolCall",
                      text: "Tool call: read",
                      type: "message",
                      model: "github-copilot/gpt-5.5",
                      usage: {
                        input: 10,
                        output: 5,
                        cacheRead: 100,
                        cacheWrite: 2,
                        totalTokens: 117,
                        reasoningTokens: 1,
                        cost: {
                          input: 0.01,
                          output: 0.02,
                          cacheRead: 0.001,
                          cacheWrite: 0.002,
                          total: 0.033,
                        },
                      },
                    },
                  ]
                : []),
              ...(includeToolResults
                ? [
                    {
                      id: "tool-result-1",
                      timestamp: "2026-01-01T00:00:02Z",
                      role: "toolResult",
                      text: "Tool result: read\nfile contents",
                      type: "message",
                      model: "github-copilot/gpt-5.5",
                    },
                  ]
                : []),
            ],
            total: 1 + Number(includeToolCalls) + Number(includeToolResults),
            limit: 5000,
            offset: 0,
            toolCallCount: 1,
            toolResultCount: 1,
          }),
        );
      }),
    );

    render(<SessionDetail session={session} onClose={vi.fn()} />);

    expect(await screen.findByText("actual prompt")).toBeInTheDocument();
    expect(screen.queryByText("Tool call: read")).not.toBeInTheDocument();
    expect(screen.queryByText("Tool result: read")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox", { name: /show tool calls \(1\)/i }));
    expect(await screen.findByText("Tool call: read")).toBeInTheDocument();
    expect(screen.getByText("gpt-5.5")).toHaveAttribute("title", "github-copilot/gpt-5.5");
    expect(screen.getByText("117 tokens")).toHaveAttribute("title", "117 total tokens");
    await userEvent.click(screen.getByRole("button", { name: /usage details/i }));
    expect(screen.getByText("Reasoning")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("Tool result: read")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox", { name: /show tool results \(1\)/i }));
    await waitFor(() => {
      expect(screen.getByText("Tool result: read")).toBeInTheDocument();
    });
    expect(screen.getByText("requested: gpt-5.5")).toHaveAttribute(
      "title",
      "github-copilot/gpt-5.5",
    );
  });

  it("scrolls the detail panel back to the top", async () => {
    const scrollTo = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });
    stubMessagesFetch();

    render(<SessionDetail session={session} onClose={vi.fn()} />);

    await screen.findByText("actual prompt");
    expect(screen.queryByRole("button", { name: /go to top/i })).not.toBeInTheDocument();

    fireEvent.scroll(screen.getByRole("region", { name: /session detail content/i }), {
      target: { scrollTop: 300 },
    });
    await userEvent.click(screen.getByRole("button", { name: /go to top/i }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
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
  mainUsage: {
    input: 30,
    output: 12,
    cacheRead: 300,
    cacheWrite: 5,
    totalTokens: 347,
    cost: { input: 0.03, output: 0.05, cacheRead: 0.003, cacheWrite: 0.005, total: 0.088 },
  },
};

function stubMessagesFetch() {
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
          ],
          total: 1,
          limit: 5000,
          offset: 0,
          toolCallCount: 0,
          toolResultCount: 0,
        }),
      ),
    ),
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
