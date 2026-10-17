import { describe, expect, it } from "vitest";

import {
  generateTeacherResource,
  getEarlyWarnings,
  getHomeworkHint,
  getLearningPath,
  getParentIntelligence,
  getRewards,
  getTutorReply,
  scoreReading,
  type LearningState,
} from "./learning-intelligence";

const state: LearningState = {
  version: 1,
  xp: 640,
  streak: 4,
  stars: 18,
  mastery: [
    { subject: "Maths", topic: "Fractions", score: 62, attempts: 4, trend: "up" },
    { subject: "English", topic: "Spelling", score: 58, attempts: 4, trend: "down" },
    { subject: "Science", topic: "Plants", score: 82, attempts: 3, trend: "up" },
  ],
  readingAttempts: [],
  portfolio: [],
  messages: [],
  appointments: [],
};

describe("learning intelligence", () => {
  it("prioritises weakest topics in the learning path", () => {
    const path = getLearningPath(state.mastery);
    expect(path[0].topic).toBe("Spelling");
    expect(path[1].topic).toBe("Fractions");
  });

  it("raises an early warning for weak mastery", () => {
    const warnings = getEarlyWarnings(state, 1);
    expect(warnings[0].title).toContain("Spelling");
    expect(warnings[0].severity).toBe("high");
  });

  it("summarises parent strengths and practice areas", () => {
    const insight = getParentIntelligence(state);
    expect(insight.strengths[0].topic).toBe("Plants");
    expect(insight.needsPractice[0].topic).toBe("Spelling");
  });

  it("calculates rewards from XP", () => {
    const rewards = getRewards(state);
    expect(rewards.level).toBe(3);
    expect(rewards.currentLevelXp).toBe(140);
  });

  it("scores matching reading text", () => {
    expect(scoreReading("The cat sat", "The cat sat")).toBe(100);
    expect(scoreReading("The cat sat", "The cat")).toBe(67);
  });

  it("keeps homework help hint-first", () => {
    expect(getHomeworkHint("Fractions", "Maths", "", 1)).toContain("Hint 1");
    expect(getHomeworkHint("Fractions", "Maths", "", 2)).toContain("Hint 2");
  });

  it("generates teacher resources", () => {
    const resource = generateTeacherResource({
      kind: "lesson",
      subject: "Maths",
      topic: "Fractions",
      level: "Core",
    });
    expect(resource).toContain("Fractions");
    expect(resource).toContain("Learning intention");
  });

  it("uses guided tutor replies rather than answer dumping", () => {
    const reply = getTutorReply("Help me with fractions", state.mastery);
    expect(reply).toContain("Try this");
    expect(reply).toContain("fraction");
  });
});
