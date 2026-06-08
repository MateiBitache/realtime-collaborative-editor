import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { App } from "./main.jsx";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the editor shell", async () => {
    render(<App />);

    expect(screen.getByText("Real Time Collaborative Editor")).toBeInTheDocument();
    expect(screen.getByText("Choose a document")).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/documents", expect.any(Object)));
  });
});
