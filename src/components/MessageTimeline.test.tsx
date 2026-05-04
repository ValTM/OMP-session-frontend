import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MessageTimeline } from "./MessageTimeline";

describe("MessageTimeline", () => {
  it("renders only provided readable text", () => {
    render(
      <MessageTimeline
        messages={[
          {
            id: "m1",
            timestamp: "2026-01-01T00:00:00Z",
            role: "assistant",
            text: "visible answer",
            type: "message",
          },
        ]}
      />,
    );

    expect(screen.getByText("visible answer")).toBeInTheDocument();
    expect(screen.queryByText(/encrypted_content|thinking/i)).not.toBeInTheDocument();
  });
  it("collapses tool result output by default", async () => {
    render(
      <MessageTimeline
        messages={[
          {
            id: "tool-1",
            timestamp: "2026-01-01T00:00:00Z",
            role: "toolResult",
            text: "Tool result: read\nfirst line\nvery long hidden output",
            type: "message",
          },
        ]}
      />,
    );

    expect(screen.getByText("Tool result: read")).toBeInTheDocument();
    expect(screen.queryByText(/very long hidden output/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /expand output/i }));

    expect(screen.getByText(/very long hidden output/)).toBeInTheDocument();
  });
});
