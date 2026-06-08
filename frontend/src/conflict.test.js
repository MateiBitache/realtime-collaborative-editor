import { describe, expect, it } from "vitest";
import { shouldApplyIncomingUpdate, statusFromUpdate } from "./conflict";

describe("conflict helpers", () => {
  it("keeps local text for own saved updates", () => {
    expect(shouldApplyIncomingUpdate({ editorId: "a", conflict: false }, "a")).toBe(false);
  });

  it("applies remote updates", () => {
    expect(shouldApplyIncomingUpdate({ editorId: "b", conflict: false }, "a")).toBe(true);
  });

  it("applies own conflict updates so the editor returns to server state", () => {
    expect(shouldApplyIncomingUpdate({ editorId: "a", conflict: true }, "a")).toBe(true);
  });

  it("explains stale version conflicts", () => {
    const status = statusFromUpdate({ editorId: "a", conflict: true }, "a");

    expect(status).toContain("older version");
  });
});
