import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { STORAGE_KEY } from "./assignment-store";

class BrowserStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

async function openPortal(storage: BrowserStorage) {
  vi.resetModules();
  vi.stubGlobal("window", { localStorage: storage });
  return import("./assignment-hooks");
}

afterEach(() => vi.unstubAllGlobals());

describe("local dashboard adapter", () => {
  it("returns the persisted record so the student can confirm completion", async () => {
    const storage = new BrowserStorage();
    const portal = await openPortal(storage);
    const task = portal.browserAssignments
      .getSnapshot()
      .assignments.find((row) => !row.completed)!;
    const mutation = portal.useActionMutation("update-assignment");
    const saved = await mutation.mutateAsync({ id: task.id, completed: true });
    expect(saved).toMatchObject({ id: task.id, completed: true });
    const reopened = await openPortal(storage);
    expect(
      reopened.browserAssignments
        .getSnapshot()
        .assignments.find((row) => row.id === task.id)?.completed,
    ).toBe(true);
  });

  it("rejects a failed completion and does not call form success after a failed write", async () => {
    const storage = new BrowserStorage();
    const portal = await openPortal(storage);
    const task = portal.browserAssignments.getSnapshot().assignments[0];
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    const mutation = portal.useActionMutation("update-assignment");
    await expect(
      mutation.mutateAsync({ id: task.id, completed: true }),
    ).rejects.toThrow();
    const onSuccess = vi.fn();
    mutation.mutate({ id: task.id, completed: true }, { onSuccess });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("distinguishes an unreadable list from a successfully loaded empty list", async () => {
    const storage = new BrowserStorage();
    storage.setItem(STORAGE_KEY, "unreadable saved data");
    const portal = await openPortal(storage);
    let query: ReturnType<typeof portal.useActionQuery>;
    function Probe() {
      query = portal.useActionQuery("list-assignments", {});
      return null;
    }
    renderToStaticMarkup(createElement(Probe));
    expect(query!.data).toBeUndefined();
    expect(query!.isError).toBe(true);
    expect(query!.isPending).toBe(false);

    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, assignments: [] }),
    );
    await query!.refetch();
    renderToStaticMarkup(createElement(Probe));
    expect(query!.data).toEqual([]);
    expect(query!.isSuccess).toBe(true);
  });
});
