import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("App filters", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/");
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.theme;
  });

  it("sends empty-session and message-count filters to the sessions API", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/api/cwds")) {
        return Promise.resolve(jsonResponse({ items: [] }));
      }
      if (url.startsWith("/api/sessions")) {
        return Promise.resolve(jsonResponse({ items: [], total: 0, limit: 1000, offset: 0 }));
      }
      return Promise.resolve(jsonResponse({ error: "unexpected request" }, 404));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) => String(input) === "/api/sessions?limit=1000"),
      ).toBe(true);
    });

    expect(screen.queryByLabelText(/filter by working directory/i)).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/filter by message count/i), "150+");
    await userEvent.click(screen.getByRole("button", { name: /filters/i }));
    expect(screen.getByRole("option", { name: /all working directories/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: /show 0-message sessions/i }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([input]) =>
            String(input) ===
            "/api/sessions?limit=1000&includeEmptyMessages=true&messageCountBucket=150%2B",
        ),
      ).toBe(true);
    });
  });

  it("lets the user switch between light, dark, and system theme modes", async () => {
    stubMatchMedia(false);
    stubFetch();

    render(<App />);

    const themeSelect = screen.getByLabelText(/theme/i);
    expect(themeSelect).toHaveValue("system");
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("system"));
    expect(document.documentElement).not.toHaveClass("dark");

    await userEvent.selectOptions(themeSelect, "dark");
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
    expect(document.documentElement).toHaveClass("dark");

    await userEvent.selectOptions(themeSelect, "light");
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("light"));
    expect(document.documentElement).not.toHaveClass("dark");
  });
});

function stubFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/api/cwds")) {
        return Promise.resolve(jsonResponse({ items: [] }));
      }
      if (url.startsWith("/api/sessions")) {
        return Promise.resolve(jsonResponse({ items: [], total: 0, limit: 1000, offset: 0 }));
      }
      return Promise.resolve(jsonResponse({ error: "unexpected request" }, 404));
    }),
  );
}

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
