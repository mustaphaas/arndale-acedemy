import { describe, expect, it } from "vitest";

import { createAssignmentStore, STORAGE_KEY } from "./assignment-store";

class BrowserStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const newTask = {
  title: "  Count the leaves  ",
  subject: "Science",
  description: "Look for five different leaves.",
  dueDate: "Friday",
};

describe("browser assignment persistence", () => {
  it("keeps created and completed homework when the portal is reopened", () => {
    const storage = new BrowserStorage();
    const teacher = createAssignmentStore(() => storage);
    expect(teacher.create(newTask)).toBe(true);
    const task = teacher
      .getSnapshot()
      .assignments.find((row) => row.title === "Count the leaves")!;
    expect(task).toBeDefined();
    expect(teacher.update({ id: task.id, completed: true })).toBe(true);

    const reopened = createAssignmentStore(() => storage);
    expect(
      reopened.getSnapshot().assignments.find((row) => row.id === task.id),
    ).toMatchObject({
      title: "Count the leaves",
      completed: true,
    });
  });

  it("keeps an intentionally empty list after all sample tasks are deleted", () => {
    const storage = new BrowserStorage();
    const store = createAssignmentStore(() => storage);
    expect(store.getSnapshot().assignments.length).toBeGreaterThan(0);
    for (const row of store.getSnapshot().assignments)
      expect(store.remove(row.id)).toBe(true);
    expect(
      createAssignmentStore(() => storage).getSnapshot().assignments,
    ).toEqual([]);
  });

  it("preserves another tab's changes when a stale view saves a task", () => {
    const storage = new BrowserStorage();
    const firstTab = createAssignmentStore(() => storage);
    const secondTab = createAssignmentStore(() => storage);
    firstTab.create({ ...newTask, title: "First tab" });
    secondTab.create({ ...newTask, title: "Second tab" });
    firstTab.refresh();
    const titles = firstTab.getSnapshot().assignments.map((row) => row.title);
    expect(titles).toContain("First tab");
    expect(titles).toContain("Second tab");
  });

  it("notifies mounted views after a successful save", () => {
    const storage = new BrowserStorage();
    const store = createAssignmentStore(() => storage);
    let notices = 0;
    const unsubscribe = store.subscribe(() => {
      notices += 1;
    });
    store.create(newTask);
    expect(notices).toBe(1);
    unsubscribe();
    store.create(newTask);
    expect(notices).toBe(1);
  });

  it("reports denied browser storage without claiming a successful save", () => {
    const store = createAssignmentStore(() => {
      throw new Error("SecurityError");
    });
    expect(store.getSnapshot().error).toBeTruthy();
    expect(store.create(newTask)).toBe(false);
    expect(
      store
        .getSnapshot()
        .assignments.some((row) => row.title === "Count the leaves"),
    ).toBe(false);
  });

  it("keeps the last saved state when a write exceeds the browser quota", () => {
    const storage = new BrowserStorage();
    const store = createAssignmentStore(() => storage);
    const before = storage.getItem(STORAGE_KEY);
    const originalRows = store.getSnapshot().assignments;
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    expect(store.create(newTask)).toBe(false);
    expect(store.getSnapshot().error).toBeTruthy();
    expect(store.getSnapshot().assignments).toEqual(originalRows);
    expect(storage.getItem(STORAGE_KEY)).toBe(before);
  });

  it.each([
    "broken JSON",
    '{"version":2,"assignments":[]}',
    '{"version":1,"assignments":[{"id":"bad"}]}',
  ])("preserves unreadable saved data and reports it: %s", (saved) => {
    const storage = new BrowserStorage();
    storage.setItem(STORAGE_KEY, saved);
    const store = createAssignmentStore(() => storage);
    expect(store.getSnapshot().error).toBeTruthy();
    expect(store.create(newTask)).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBe(saved);
  });

  it("rejects an empty task title without changing saved homework", () => {
    const storage = new BrowserStorage();
    const store = createAssignmentStore(() => storage);
    const before = storage.getItem(STORAGE_KEY);
    expect(store.create({ ...newTask, title: "   " })).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBe(before);
  });
});
