import { describe, expect, it } from "vitest";

import {
  QUIZZES,
  attendanceSummary,
  unlockedAchievements,
  type StudentExperienceState,
} from "./student-experience";

const base: StudentExperienceState = {
  version: 1,
  quizAttempts: [],
  submissions: [],
  announcements: [],
  notifications: [],
  events: [],
  reportCards: [],
  attendance: [
    { date: "2026-10-13", status: "Present" },
    { date: "2026-10-14", status: "Present" },
    { date: "2026-10-15", status: "Late" },
    { date: "2026-10-16", status: "Absent" },
  ],
  messages: [],
  library: [],
  goals: [],
  notes: [],
  accessibility: {
    textSize: "normal",
    highContrast: false,
    reducedMotion: false,
    readingFont: false,
  },
};

describe("student experience", () => {
  it("ships interactive quiz content", () => {
    expect(QUIZZES.length).toBeGreaterThanOrEqual(3);
    expect(QUIZZES[0].questions.length).toBeGreaterThan(1);
  });

  it("summarises attendance", () => {
    expect(attendanceSummary(base.attendance)).toEqual({
      present: 2,
      late: 1,
      absent: 1,
      rate: 75,
    });
  });

  it("unlocks achievements from completed actions", () => {
    const state: StudentExperienceState = {
      ...base,
      quizAttempts: [
        {
          id: "q1",
          quizId: "fractions-1",
          score: 3,
          total: 3,
          completedAt: new Date().toISOString(),
        },
      ],
      submissions: [
        {
          id: "s1",
          assignmentId: "a1",
          assignmentTitle: "Fractions",
          answer: "My answer",
          submittedAt: new Date().toISOString(),
          status: "Submitted",
        },
      ],
      goals: [
        {
          id: "g1",
          title: "Read daily",
          target: "3 days",
          dueDate: "2026-10-30",
          progress: 100,
          completed: true,
        },
      ],
    };
    const unlocked = unlockedAchievements(state).filter((item) => item.unlocked);
    expect(unlocked.map((item) => item.title)).toEqual(
      expect.arrayContaining(["Quiz star", "Work sent", "Goal getter"]),
    );
  });
});
