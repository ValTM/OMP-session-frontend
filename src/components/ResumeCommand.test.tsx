import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResumeCommand } from "./ResumeCommand";

describe("ResumeCommand", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders and copies resume command", async () => {
    render(<ResumeCommand command="omp --resume 14c5b255eac6d66d" />);

    expect(screen.getByText("omp --resume 14c5b255eac6d66d")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /copy resume command/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("omp --resume 14c5b255eac6d66d");
  });
});
