import { describe, expect, it } from "vitest";

import { pathForCommand, viewForPath } from "../app/lib/portal-navigation";

describe("school portal navigation", () => {
  it("identifies each portal instead of reporting every screen as home", () => {
    expect(viewForPath("/parent")).toBe("parent");
    expect(viewForPath("/teacher")).toBe("teacher");
    expect(viewForPath("/")).toBe("student");
    expect(viewForPath("/student")).toBe("student");
  });

  it("opens the correct portal for a view command", () => {
    expect(pathForCommand({ view: "parent" })).toBe("/parent");
    expect(pathForCommand({ view: "teacher" })).toBe("/teacher");
    expect(pathForCommand({ view: "student" })).toBe("/student");
    expect(pathForCommand({ view: "home" })).toBe("/");
  });

  it("preserves a requested section and safely defaults an unknown view", () => {
    expect(pathForCommand({ view: "parent", path: "/parent#homework" })).toBe(
      "/parent#homework",
    );
    expect(pathForCommand({ view: "missing" })).toBe("/");
    expect(pathForCommand({})).toBe("/");
  });
});
