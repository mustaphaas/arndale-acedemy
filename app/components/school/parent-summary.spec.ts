import { describe, expect, it } from "vitest";

import type { Assignment } from "@/lib/school";

import { summarizeParentHomework } from "./parent-summary";

function task(id: string, subject: string, completed = false): Assignment {
  return {
    id,
    title: id,
    subject,
    description: "",
    dueDate: "Friday",
    completed,
  };
}

describe("parent homework summary", () => {
  it("keeps an empty classroom distinct from recorded subject progress", () => {
    expect(summarizeParentHomework([])).toEqual({
      total: 0,
      completed: 0,
      remaining: 0,
      subjects: [],
    });
  });

  it("counts shared homework once and combines subject spelling variations", () => {
    const assignments = [
      task("reading", "English", true),
      task("spelling", " english "),
      task("story", "ENGLISH"),
      task("plants", "Science", true),
      task("fractions", "Maths"),
    ];

    expect(summarizeParentHomework(assignments)).toEqual({
      total: 5,
      completed: 2,
      remaining: 3,
      subjects: [
        { subject: "English", total: 3, completed: 1, percent: 33 },
        { subject: "Maths", total: 1, completed: 0, percent: 0 },
        { subject: "Science", total: 1, completed: 1, percent: 100 },
      ],
    });
    expect(assignments[1].subject).toBe(" english ");
  });

  it("keeps homework without a subject visible in both totals and progress", () => {
    const summary = summarizeParentHomework([
      task("first", "", true),
      task("second", "   ", true),
    ]);

    expect(summary.remaining).toBe(0);
    expect(summary.subjects).toEqual([
      { subject: "General", total: 2, completed: 2, percent: 100 },
    ]);
  });
});
