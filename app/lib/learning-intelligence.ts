import { useSyncExternalStore } from "react";

export type LearningSubject = "Maths" | "English" | "Science";

export type MasteryRecord = {
  subject: LearningSubject;
  topic: string;
  score: number;
  attempts: number;
  trend: "up" | "steady" | "down";
};

export type ReadingAttempt = {
  id: string;
  text: string;
  transcript: string;
  accuracy: number;
  createdAt: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  category: "Drawing" | "Project" | "Reading" | "Achievement";
  note: string;
  createdAt: string;
  fileName?: string;
  dataUrl?: string;
};

export type PortalMessage = {
  id: string;
  from: "Parent" | "Teacher";
  body: string;
  createdAt: string;
  read: boolean;
};

export type AppointmentRequest = {
  id: string;
  date: string;
  time: string;
  reason: string;
  status: "Requested" | "Confirmed";
};

export type LearningState = {
  version: 1;
  xp: number;
  streak: number;
  stars: number;
  mastery: MasteryRecord[];
  readingAttempts: ReadingAttempt[];
  portfolio: PortfolioItem[];
  messages: PortalMessage[];
  appointments: AppointmentRequest[];
};

export type LearningPathItem = {
  subject: LearningSubject;
  topic: string;
  score: number;
  reason: string;
  activity: string;
  minutes: number;
};

export type EarlyWarning = {
  severity: "high" | "medium";
  title: string;
  detail: string;
  action: string;
};

export const LEARNING_STORAGE_KEY = "arndale-academy.learning-intelligence.v1";

const SEED_STATE: LearningState = {
  version: 1,
  xp: 640,
  streak: 4,
  stars: 18,
  mastery: [
    { subject: "Maths", topic: "Fractions", score: 62, attempts: 4, trend: "up" },
    { subject: "Maths", topic: "Number sense", score: 78, attempts: 6, trend: "steady" },
    { subject: "English", topic: "Reading fluency", score: 68, attempts: 5, trend: "up" },
    { subject: "English", topic: "Spelling", score: 58, attempts: 4, trend: "down" },
    { subject: "English", topic: "Comprehension", score: 74, attempts: 5, trend: "steady" },
    { subject: "Science", topic: "Plants", score: 82, attempts: 3, trend: "up" },
    { subject: "Science", topic: "Observation", score: 76, attempts: 3, trend: "steady" },
  ],
  readingAttempts: [],
  portfolio: [
    {
      id: "portfolio-seed-1",
      title: "Plant life-cycle poster",
      category: "Project",
      note: "A class science project showing seed, sprout and mature plant stages.",
      createdAt: "2026-10-12T10:15:00.000Z",
    },
    {
      id: "portfolio-seed-2",
      title: "Reading milestone",
      category: "Achievement",
      note: "Read three short stories independently this week.",
      createdAt: "2026-10-14T14:20:00.000Z",
    },
  ],
  messages: [
    {
      id: "message-seed-1",
      from: "Teacher",
      body: "Oliver is showing good curiosity in Science. Please keep practising the weekly spelling words for ten minutes at home.",
      createdAt: "2026-10-15T13:00:00.000Z",
      read: false,
    },
  ],
  appointments: [],
};

let snapshot: LearningState = SEED_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function cloneSeed(): LearningState {
  return JSON.parse(JSON.stringify(SEED_STATE)) as LearningState;
}

function isValidState(value: unknown): value is LearningState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LearningState>;
  return (
    candidate.version === 1 &&
    typeof candidate.xp === "number" &&
    typeof candidate.streak === "number" &&
    typeof candidate.stars === "number" &&
    Array.isArray(candidate.mastery) &&
    Array.isArray(candidate.readingAttempts) &&
    Array.isArray(candidate.portfolio) &&
    Array.isArray(candidate.messages) &&
    Array.isArray(candidate.appointments)
  );
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) {
      snapshot = cloneSeed();
      persist();
      return;
    }
    const parsed = JSON.parse(raw);
    snapshot = isValidState(parsed) ? parsed : cloneSeed();
  } catch {
    snapshot = cloneSeed();
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // The in-memory state remains usable for this session.
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function update(mutator: (current: LearningState) => LearningState) {
  hydrate();
  snapshot = mutator(snapshot);
  persist();
  emit();
}

function id(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function subscribeLearningState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLearningState() {
  hydrate();
  return snapshot;
}

export function getServerLearningState() {
  return SEED_STATE;
}

export function useLearningIntelligence() {
  return useSyncExternalStore(
    subscribeLearningState,
    getLearningState,
    getServerLearningState,
  );
}

export function refreshLearningStateFromStorage() {
  if (typeof window === "undefined") return;
  hydrated = false;
  hydrate();
  emit();
}

export function addXp(amount: number) {
  update((current) => ({
    ...current,
    xp: Math.max(0, current.xp + amount),
    stars: Math.max(0, current.stars + Math.max(1, Math.round(amount / 25))),
  }));
}

export function recordReadingAttempt(input: {
  text: string;
  transcript: string;
  accuracy: number;
}) {
  const attempt: ReadingAttempt = {
    id: id("reading"),
    text: input.text,
    transcript: input.transcript,
    accuracy: Math.max(0, Math.min(100, Math.round(input.accuracy))),
    createdAt: new Date().toISOString(),
  };
  update((current) => ({
    ...current,
    xp: current.xp + 30,
    stars: current.stars + 1,
    readingAttempts: [attempt, ...current.readingAttempts].slice(0, 12),
    mastery: current.mastery.map((item) =>
      item.subject === "English" && item.topic === "Reading fluency"
        ? {
            ...item,
            attempts: item.attempts + 1,
            score: Math.round(item.score * 0.75 + attempt.accuracy * 0.25),
            trend: attempt.accuracy >= item.score ? "up" : "steady",
          }
        : item,
    ),
  }));
  return attempt;
}

export function addPortfolioItem(input: Omit<PortfolioItem, "id" | "createdAt">) {
  const item: PortfolioItem = {
    ...input,
    id: id("portfolio"),
    createdAt: new Date().toISOString(),
  };
  update((current) => ({
    ...current,
    xp: current.xp + 20,
    stars: current.stars + 1,
    portfolio: [item, ...current.portfolio].slice(0, 30),
  }));
  return item;
}

export function deletePortfolioItem(itemId: string) {
  update((current) => ({
    ...current,
    portfolio: current.portfolio.filter((item) => item.id !== itemId),
  }));
}

export function sendPortalMessage(from: PortalMessage["from"], body: string) {
  const message: PortalMessage = {
    id: id("message"),
    from,
    body: body.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  update((current) => ({
    ...current,
    messages: [message, ...current.messages].slice(0, 50),
  }));
  return message;
}

export function markMessagesRead(reader: PortalMessage["from"]) {
  update((current) => ({
    ...current,
    messages: current.messages.map((message) =>
      message.from !== reader ? { ...message, read: true } : message,
    ),
  }));
}

export function requestAppointment(input: Omit<AppointmentRequest, "id" | "status">) {
  const request: AppointmentRequest = {
    ...input,
    id: id("appointment"),
    status: "Requested",
  };
  update((current) => ({
    ...current,
    appointments: [request, ...current.appointments],
  }));
  return request;
}

export function confirmAppointment(appointmentId: string) {
  update((current) => ({
    ...current,
    appointments: current.appointments.map((appointment) =>
      appointment.id === appointmentId
        ? { ...appointment, status: "Confirmed" }
        : appointment,
    ),
  }));
}

export function getLearningPath(mastery: MasteryRecord[]): LearningPathItem[] {
  return [...mastery]
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((item) => ({
      subject: item.subject,
      topic: item.topic,
      score: item.score,
      minutes: item.score < 60 ? 15 : 10,
      reason:
        item.score < 60
          ? "This is the biggest learning gap right now."
          : item.score < 70
            ? "A little more practice should build confidence."
            : "Keep this skill warm while stronger topics move ahead.",
      activity:
        item.topic === "Spelling"
          ? "Hear 6 words, spell them, then use two in sentences."
          : item.topic === "Fractions"
            ? "Use shapes and everyday objects to practise halves and quarters."
            : item.topic === "Reading fluency"
              ? "Read a short paragraph aloud twice and beat your first score."
              : `Try a short guided practice on ${item.topic.toLowerCase()}.`,
    }));
}

export function getEarlyWarnings(
  state: LearningState,
  pendingHomework: number,
): EarlyWarning[] {
  const warnings: EarlyWarning[] = [];
  const weak = [...state.mastery].sort((a, b) => a.score - b.score)[0];

  if (weak && weak.score < 60) {
    warnings.push({
      severity: "high",
      title: `${weak.topic} needs attention`,
      detail: `${weak.subject} mastery is currently ${weak.score}% and the recent trend is ${weak.trend}.`,
      action: `Give ${weak.topic.toLowerCase()} 10–15 focused minutes on three days this week.`,
    });
  } else if (weak && weak.score < 70) {
    warnings.push({
      severity: "medium",
      title: `Watch ${weak.topic}`,
      detail: `${weak.subject} mastery is ${weak.score}%, below the strongest areas.`,
      action: "Use the personalised path before adding harder work.",
    });
  }

  if (pendingHomework >= 3) {
    warnings.push({
      severity: "medium",
      title: "Homework backlog is building",
      detail: `${pendingHomework} tasks are still open.`,
      action: "Prioritise the oldest or easiest task first to rebuild momentum.",
    });
  }

  if (state.streak <= 1) {
    warnings.push({
      severity: "medium",
      title: "Learning routine has slowed",
      detail: "The current learning streak is only one day.",
      action: "Use one short activity today to restart the routine.",
    });
  }

  return warnings;
}

export function getParentIntelligence(state: LearningState) {
  const sorted = [...state.mastery].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 2);
  const needsPractice = [...sorted].reverse().slice(0, 2);
  const lastReading = state.readingAttempts[0];
  return {
    strengths,
    needsPractice,
    lastReading,
    recommendation:
      needsPractice[0]?.topic === "Spelling"
        ? "Practise six spelling words for ten minutes, then ask Oliver to use two in a sentence."
        : `Spend ten minutes on ${needsPractice[0]?.topic.toLowerCase() ?? "the next learning activity"} and finish with one confidence-building question.`,
  };
}

export function getRewards(state: LearningState) {
  const level = Math.floor(state.xp / 250) + 1;
  const nextLevelXp = level * 250;
  const badges = [
    state.streak >= 3 ? "Learning streak" : null,
    state.readingAttempts.length >= 1 ? "Brave reader" : null,
    state.portfolio.length >= 3 ? "Creative collector" : null,
    state.mastery.some((item) => item.score >= 80) ? "Mastery star" : null,
  ].filter(Boolean) as string[];

  return {
    level,
    nextLevelXp,
    currentLevelXp: state.xp - (level - 1) * 250,
    levelSpan: 250,
    badges,
  };
}

export function getTutorReply(question: string, mastery: MasteryRecord[]) {
  const text = question.trim().toLowerCase();
  const weakest = [...mastery].sort((a, b) => a.score - b.score)[0];

  if (!text) {
    return "Ask me about today’s Maths, English or Science work and I’ll explain it one small step at a time.";
  }
  if (text.includes("fraction") || text.includes("half") || text.includes("quarter")) {
    return "Think of a pizza cut into equal pieces. A half means 1 of 2 equal pieces. A quarter means 1 of 4 equal pieces. Try this: if four friends share one orange equally, what fraction does each friend get?";
  }
  if (text.includes("spell") || text.includes("spelling")) {
    return "Try the word in three steps: say it slowly, clap its sounds, then write it once from memory. I won’t give the whole answer first. Which word are you practising?";
  }
  if (text.includes("plant") || text.includes("science")) {
    return "Plants need light, water, air and the right temperature. Start by naming one thing a seed needs before it can grow into a seedling.";
  }
  if (text.includes("answer") || text.includes("homework")) {
    return "I can help without doing the work for you. Tell me the part that feels confusing, and I’ll give you a hint first, then an example if you still need it.";
  }
  if (text.includes("read") || text.includes("story")) {
    return "Read one sentence at a time. If a word feels difficult, look at the first sound, break the word into smaller parts, then read the whole sentence again smoothly.";
  }

  return `Let’s work it out together. Your current focus area is ${weakest?.topic ?? "today’s lesson"}. Tell me what you already know about “${question.trim()}”, and I’ll give you the next hint instead of jumping straight to the answer.`;
}

export function getHomeworkHint(title: string, subject: string, description: string, step: number) {
  const combined = `${title} ${description}`.toLowerCase();
  if (subject.toLowerCase().includes("math") || combined.includes("fraction")) {
    return step <= 1
      ? "Hint 1: draw the whole first, then split it into equal parts."
      : "Hint 2: count how many equal parts there are in total, then count the parts you are talking about.";
  }
  if (subject.toLowerCase().includes("english") || combined.includes("read")) {
    return step <= 1
      ? "Hint 1: read the question first, then look for the sentence in the text that gives you a clue."
      : "Hint 2: answer in your own words and use one detail from the text to explain why.";
  }
  if (subject.toLowerCase().includes("science")) {
    return step <= 1
      ? "Hint 1: name what you can observe before you try to explain why it happens."
      : "Hint 2: use a because sentence to connect your observation to the science idea.";
  }
  return step <= 1
    ? "Hint 1: underline the action word in the instruction and do only that first step."
    : "Hint 2: explain your thinking in one short sentence before you continue.";
}

export function generateTeacherResource(input: {
  kind: "lesson" | "quiz" | "worksheet" | "comment" | "differentiate";
  subject: LearningSubject;
  topic: string;
  level: "Support" | "Core" | "Stretch";
}) {
  const topic = input.topic.trim() || "today’s topic";
  if (input.kind === "lesson") {
    return [
      `Lesson: ${input.subject} — ${topic}`,
      `Level: ${input.level}`,
      "",
      "Learning intention",
      `Pupils will explain one key idea about ${topic.toLowerCase()} and show it in a short task.`,
      "",
      "Starter · 5 min",
      "Use one visual or everyday object and ask: What do you notice? What do you already know?",
      "",
      "Teach · 10 min",
      "Model one example aloud, naming each thinking step.",
      "",
      "Guided practice · 10 min",
      "Complete two examples together. Ask pupils to explain the next step before you reveal it.",
      "",
      "Independent task · 15 min",
      input.level === "Support"
        ? "Use fewer questions, visual prompts and sentence starters."
        : input.level === "Stretch"
          ? "Add one explain-your-reasoning challenge and one transfer question."
          : "Use four short questions followed by one explain-your-thinking question.",
      "",
      "Exit check · 5 min",
      "One question pupils answer independently so you can decide who needs tomorrow’s recap.",
    ].join("\n");
  }
  if (input.kind === "quiz") {
    return [
      `${input.subject}: ${topic} — 5-question check`,
      "1. Recall one key fact.",
      "2. Choose the correct example from three options.",
      "3. Explain why one example is correct.",
      "4. Apply the idea to a new situation.",
      "5. Confidence check: green, amber or red — and why?",
    ].join("\n");
  }
  if (input.kind === "worksheet") {
    return [
      `Worksheet: ${topic}`,
      "A. Warm-up: 3 quick recall questions",
      "B. Guided example: complete the missing step",
      "C. Independent practice: 4 questions",
      "D. Explain it: write one sentence about your method",
      input.level === "Stretch"
        ? "E. Challenge: create your own example and solve it."
        : "E. Check: circle the question you found hardest.",
    ].join("\n");
  }
  if (input.kind === "comment") {
    return `Oliver is developing confidence in ${topic.toLowerCase()}. He engages well with guided examples and is beginning to explain his thinking more clearly. A useful next step is short, regular practice that asks him to explain how he reached an answer, not only whether it is correct.`;
  }
  return [
    `Differentiate: ${input.subject} — ${topic}`,
    "Support group: visual model, one worked example, fewer questions, adult check after question 2.",
    "Core group: standard task plus one explain-your-thinking prompt.",
    "Stretch group: reduce repetition; add a new-context problem and ask for two possible methods.",
  ].join("\n");
}

export function scoreReading(target: string, transcript: string) {
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, "")
      .split(/\s+/)
      .filter(Boolean);
  const targetWords = normalise(target);
  const spokenWords = normalise(transcript);
  if (targetWords.length === 0) return 0;
  let matches = 0;
  targetWords.forEach((word, index) => {
    if (spokenWords[index] === word) matches += 1;
  });
  return Math.round((matches / targetWords.length) * 100);
}
