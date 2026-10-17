import { describe, expect, it } from "vitest";

import type { Assignment } from "@/lib/school";

import {
  filterHomework,
  getHomeworkMilestone,
  getHomeworkSummary,
} from "./student-homework";

function tasks(...completed: boolean[]): Assignment[] {
  return completed.map((done, index) => ({
    id: `task-${index}`,
    title: `Task ${index + 1}`,
    subject: "Maths",
    description: "Use your exercise book.",
    dueDate: "Friday",
    completed: done,
  }));
}

describe("student homework progress", () => {
  it("keeps an empty classroom distinct from finished work", () => {
    const summary = getHomeworkSummary([]);
    expect(summary).toEqual({ total: 0, completed: 0, pending: 0, percent: 0 });
    expect(getHomeworkMilestone(summary).title).toBe("Room to grow");
  });

  it("uses every stored assignment and rounds the displayed percentage", () => {
    const assignments = tasks(true, false, true);
    expect(getHomeworkSummary(assignments)).toEqual({
      total: 3,
      completed: 2,
      pending: 1,
      percent: 67,
    });
    expect(filterHomework(assignments, "todo").map((task) => task.id)).toEqual([
      "task-1",
    ]);
    expect(
      filterHomework(assignments, "completed").map((task) => task.id),
    ).toEqual(["task-0", "task-2"]);
    expect(filterHomework(assignments, "all")).toHaveLength(3);
  });

  it("keeps the halfway milestone honest when the task count is odd", () => {
    expect(
      getHomeworkMilestone(
        getHomeworkSummary(tasks(true, true, false, false, false)),
      ).title,
    ).toBe("A brilliant beginning");
    expect(
      getHomeworkMilestone(
        getHomeworkSummary(tasks(true, true, true, false, false)),
      ).title,
    ).toBe("Halfway and growing");
  });

  it("marks a one-task classroom fully finished only after completion", () => {
    expect(getHomeworkMilestone(getHomeworkSummary(tasks(false))).title).toBe(
      "Your first small win",
    );
    expect(getHomeworkSummary(tasks(true)).percent).toBe(100);
    expect(getHomeworkMilestone(getHomeworkSummary(tasks(true))).title).toBe(
      "Every task finished!",
    );
  });
});
