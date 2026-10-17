import { useSyncExternalStore } from "react";

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type QuizDefinition = {
  id: string;
  subject: "Maths" | "English" | "Science";
  title: string;
  topic: string;
  questions: QuizQuestion[];
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  score: number;
  total: number;
  completedAt: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  answer: string;
  fileName?: string;
  dataUrl?: string;
  submittedAt: string;
  status: "Submitted" | "Reviewed";
  feedback?: string;
  score?: number;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: "School" | "Class" | "Event";
  date: string;
};

export type StudentNotification = {
  id: string;
  title: string;
  body: string;
  kind: "homework" | "feedback" | "achievement" | "announcement" | "calendar";
  createdAt: string;
  read: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "Homework" | "Test" | "Holiday" | "Event";
};

export type ReportCard = {
  term: string;
  overall: number;
  subjects: Array<{ subject: string; score: number; remark: string }>;
  teacherRemark: string;
};

export type AttendanceRecord = {
  date: string;
  status: "Present" | "Absent" | "Late";
};

export type StudentMessage = {
  id: string;
  from: "Student" | "Teacher";
  body: string;
  createdAt: string;
  read: boolean;
};

export type LibraryResource = {
  id: string;
  subject: "Maths" | "English" | "Science" | "General";
  title: string;
  type: "Story" | "Worksheet" | "Video" | "Guide";
  description: string;
  minutes: number;
};

export type Goal = {
  id: string;
  title: string;
  target: string;
  dueDate: string;
  progress: number;
  completed: boolean;
};

export type NotebookEntry = {
  id: string;
  title: string;
  body: string;
  subject: string;
  updatedAt: string;
};

export type AccessibilitySettings = {
  textSize: "normal" | "large" | "extra";
  highContrast: boolean;
  reducedMotion: boolean;
  readingFont: boolean;
};

export type StudentExperienceState = {
  version: 1;
  quizAttempts: QuizAttempt[];
  submissions: Submission[];
  announcements: Announcement[];
  notifications: StudentNotification[];
  events: CalendarEvent[];
  reportCards: ReportCard[];
  attendance: AttendanceRecord[];
  messages: StudentMessage[];
  library: LibraryResource[];
  goals: Goal[];
  notes: NotebookEntry[];
  accessibility: AccessibilitySettings;
};

export const STUDENT_EXPERIENCE_KEY = "arndale-academy.student-experience.v1";

export const QUIZZES: QuizDefinition[] = [
  {
    id: "fractions-1",
    subject: "Maths",
    title: "Fraction Adventure",
    topic: "Halves and quarters",
    questions: [
      {
        id: "f1",
        prompt: "Which fraction means one of two equal parts?",
        options: ["1/4", "1/2", "2/3", "3/4"],
        answer: 1,
        explanation: "A half means one whole split into two equal parts.",
      },
      {
        id: "f2",
        prompt: "Four friends share one orange equally. What fraction does each friend get?",
        options: ["1/2", "1/3", "1/4", "4/1"],
        answer: 2,
        explanation: "Four equal shares means each friend receives one quarter.",
      },
      {
        id: "f3",
        prompt: "Which is larger?",
        options: ["1/4", "1/2", "They are equal", "Not enough information"],
        answer: 1,
        explanation: "When the whole is the same size, one half is larger than one quarter.",
      },
    ],
  },
  {
    id: "reading-1",
    subject: "English",
    title: "Story Detective",
    topic: "Reading comprehension",
    questions: [
      {
        id: "r1",
        prompt: "A character packs an umbrella after seeing dark clouds. What can you infer?",
        options: ["They expect rain", "They are going swimming", "They dislike clouds", "It is nighttime"],
        answer: 0,
        explanation: "The umbrella and dark clouds are clues that rain may be coming.",
      },
      {
        id: "r2",
        prompt: "Which sentence best summarises a paragraph?",
        options: ["The longest sentence", "The main idea in your own words", "Every detail copied", "Only the final word"],
        answer: 1,
        explanation: "A summary keeps the main idea and leaves out small details.",
      },
    ],
  },
  {
    id: "plants-1",
    subject: "Science",
    title: "Plant Power",
    topic: "What plants need",
    questions: [
      {
        id: "p1",
        prompt: "Which one does a healthy plant need?",
        options: ["Water", "Plastic", "Soap", "Sandpaper"],
        answer: 0,
        explanation: "Plants need water, light, air and suitable conditions to grow.",
      },
      {
        id: "p2",
        prompt: "Which part usually takes in water from the soil?",
        options: ["Flower", "Leaf", "Root", "Fruit"],
        answer: 2,
        explanation: "Roots absorb water and minerals from the soil.",
      },
    ],
  },
];

const SEED: StudentExperienceState = {
  version: 1,
  quizAttempts: [],
  submissions: [],
  announcements: [
    {
      id: "ann-1",
      title: "Reading Week starts Monday",
      body: "Bring your favourite storybook and get ready for our class reading challenge.",
      category: "School",
      date: "2026-10-19",
    },
    {
      id: "ann-2",
      title: "Science garden walk",
      body: "Willow class will visit the school garden on Thursday. Wear your outdoor shoes.",
      category: "Class",
      date: "2026-10-22",
    },
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Spelling practice",
      body: "Your English spelling task is due soon.",
      kind: "homework",
      createdAt: "2026-10-17T08:00:00.000Z",
      read: false,
    },
    {
      id: "notif-2",
      title: "New class announcement",
      body: "Reading Week starts Monday.",
      kind: "announcement",
      createdAt: "2026-10-17T07:30:00.000Z",
      read: false,
    },
  ],
  events: [
    { id: "event-1", title: "Spelling check", date: "2026-10-20", time: "10:00", type: "Test" },
    { id: "event-2", title: "Science garden walk", date: "2026-10-22", time: "11:15", type: "Event" },
    { id: "event-3", title: "Half-term holiday", date: "2026-10-30", type: "Holiday" },
  ],
  reportCards: [
    {
      term: "Autumn · Mid-term",
      overall: 74,
      subjects: [
        { subject: "Maths", score: 72, remark: "Growing confidence with number work." },
        { subject: "English", score: 69, remark: "Good comprehension; keep practising spelling." },
        { subject: "Science", score: 82, remark: "Excellent curiosity and observation." },
      ],
      teacherRemark: "Oliver is curious and engaged. Short, regular spelling practice will help balance his strong Science progress.",
    },
  ],
  attendance: [
    { date: "2026-10-13", status: "Present" },
    { date: "2026-10-14", status: "Present" },
    { date: "2026-10-15", status: "Late" },
    { date: "2026-10-16", status: "Present" },
    { date: "2026-10-17", status: "Present" },
  ],
  messages: [
    {
      id: "msg-1",
      from: "Teacher",
      body: "Hi Oliver! Remember to bring your reading book tomorrow. You did a lovely job in Science today.",
      createdAt: "2026-10-16T13:20:00.000Z",
      read: false,
    },
  ],
  library: [
    { id: "lib-1", subject: "English", title: "The Tiny Seed", type: "Story", description: "A short reading story about a seed’s journey.", minutes: 8 },
    { id: "lib-2", subject: "Maths", title: "Fractions with Food", type: "Guide", description: "Learn halves and quarters using pizza, fruit and sandwiches.", minutes: 10 },
    { id: "lib-3", subject: "Science", title: "How Plants Drink", type: "Video", description: "A short visual lesson about roots and water.", minutes: 6 },
    { id: "lib-4", subject: "English", title: "Spelling Builder", type: "Worksheet", description: "Practise this week’s six spelling words.", minutes: 12 },
  ],
  goals: [
    { id: "goal-1", title: "Become a stronger speller", target: "Practise spelling on 3 days this week", dueDate: "2026-10-23", progress: 33, completed: false },
  ],
  notes: [
    { id: "note-1", title: "Plant facts", body: "Roots take in water. Leaves use sunlight to help the plant make food.", subject: "Science", updatedAt: "2026-10-16T11:30:00.000Z" },
  ],
  accessibility: {
    textSize: "normal",
    highContrast: false,
    reducedMotion: false,
    readingFont: false,
  },
};

let snapshot: StudentExperienceState = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

function cloneSeed(): StudentExperienceState {
  return JSON.parse(JSON.stringify(SEED)) as StudentExperienceState;
}

function isState(value: unknown): value is StudentExperienceState {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<StudentExperienceState>;
  return item.version === 1 &&
    Array.isArray(item.quizAttempts) &&
    Array.isArray(item.submissions) &&
    Array.isArray(item.announcements) &&
    Array.isArray(item.notifications) &&
    Array.isArray(item.events) &&
    Array.isArray(item.reportCards) &&
    Array.isArray(item.attendance) &&
    Array.isArray(item.messages) &&
    Array.isArray(item.library) &&
    Array.isArray(item.goals) &&
    Array.isArray(item.notes) &&
    !!item.accessibility;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STUDENT_EXPERIENCE_KEY, JSON.stringify(snapshot));
  } catch {
    // Keep the in-memory experience usable if browser storage is unavailable.
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STUDENT_EXPERIENCE_KEY);
    if (!raw) {
      snapshot = cloneSeed();
      persist();
      return;
    }
    const parsed = JSON.parse(raw);
    snapshot = isState(parsed) ? parsed : cloneSeed();
  } catch {
    snapshot = cloneSeed();
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function update(recipe: (current: StudentExperienceState) => StudentExperienceState) {
  hydrate();
  snapshot = recipe(snapshot);
  persist();
  emit();
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useStudentExperience() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => {
      hydrate();
      return snapshot;
    },
    () => SEED,
  );
}

export function refreshStudentExperience() {
  hydrated = false;
  hydrate();
  emit();
}

function notify(title: string, body: string, kind: StudentNotification["kind"]) {
  const notification: StudentNotification = {
    id: makeId("notif"),
    title,
    body,
    kind,
    createdAt: new Date().toISOString(),
    read: false,
  };
  update((current) => ({
    ...current,
    notifications: [notification, ...current.notifications].slice(0, 40),
  }));
}

export function recordQuizAttempt(quizId: string, score: number, total: number) {
  const attempt: QuizAttempt = {
    id: makeId("quiz"),
    quizId,
    score,
    total,
    completedAt: new Date().toISOString(),
  };
  update((current) => ({
    ...current,
    quizAttempts: [attempt, ...current.quizAttempts].slice(0, 30),
  }));
  if (score === total) {
    notify("Perfect quiz!", "You earned a perfect score. Brilliant work!", "achievement");
  }
  return attempt;
}

export function submitAssignment(input: {
  assignmentId: string;
  assignmentTitle: string;
  answer: string;
  fileName?: string;
  dataUrl?: string;
}) {
  const submission: Submission = {
    id: makeId("submission"),
    assignmentId: input.assignmentId,
    assignmentTitle: input.assignmentTitle,
    answer: input.answer.trim(),
    fileName: input.fileName,
    dataUrl: input.dataUrl,
    submittedAt: new Date().toISOString(),
    status: "Submitted",
  };
  update((current) => ({
    ...current,
    submissions: [
      submission,
      ...current.submissions.filter((item) => item.assignmentId !== input.assignmentId),
    ],
  }));
  notify("Work submitted", `${input.assignmentTitle} was sent to your teacher.`, "homework");
  return submission;
}

export function reviewSubmission(id: string, feedback: string, score: number) {
  update((current) => ({
    ...current,
    submissions: current.submissions.map((item) =>
      item.id === id
        ? { ...item, status: "Reviewed", feedback: feedback.trim(), score }
        : item,
    ),
  }));
  notify("Teacher feedback is ready", "Your teacher reviewed one of your submissions.", "feedback");
}

export function addAnnouncement(input: Omit<Announcement, "id">) {
  const announcement = { ...input, id: makeId("ann") };
  update((current) => ({
    ...current,
    announcements: [announcement, ...current.announcements],
  }));
  notify("New announcement", input.title, "announcement");
  return announcement;
}

export function markNotificationRead(id: string) {
  update((current) => ({
    ...current,
    notifications: current.notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item,
    ),
  }));
}

export function markAllNotificationsRead() {
  update((current) => ({
    ...current,
    notifications: current.notifications.map((item) => ({ ...item, read: true })),
  }));
}

export function sendStudentMessage(from: StudentMessage["from"], body: string) {
  const message: StudentMessage = {
    id: makeId("student-message"),
    from,
    body: body.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  update((current) => ({
    ...current,
    messages: [message, ...current.messages].slice(0, 60),
  }));
  if (from === "Teacher") notify("New message from your teacher", body.trim(), "announcement");
  return message;
}

export function markStudentMessagesRead(reader: StudentMessage["from"]) {
  update((current) => ({
    ...current,
    messages: current.messages.map((message) =>
      message.from !== reader ? { ...message, read: true } : message,
    ),
  }));
}

export function addCalendarEvent(input: Omit<CalendarEvent, "id">) {
  const event = { ...input, id: makeId("event") };
  update((current) => ({ ...current, events: [...current.events, event] }));
  notify("Calendar updated", input.title, "calendar");
  return event;
}

export function addGoal(input: Omit<Goal, "id" | "progress" | "completed">) {
  const goal: Goal = { ...input, id: makeId("goal"), progress: 0, completed: false };
  update((current) => ({ ...current, goals: [goal, ...current.goals] }));
  return goal;
}

export function updateGoal(id: string, progress: number) {
  const safe = Math.max(0, Math.min(100, Math.round(progress)));
  update((current) => ({
    ...current,
    goals: current.goals.map((goal) =>
      goal.id === id ? { ...goal, progress: safe, completed: safe >= 100 } : goal,
    ),
  }));
  if (safe >= 100) notify("Goal achieved!", "You completed one of your learning goals.", "achievement");
}

export function addNote(input: { title: string; body: string; subject: string }) {
  const note: NotebookEntry = {
    id: makeId("note"),
    title: input.title.trim(),
    body: input.body.trim(),
    subject: input.subject,
    updatedAt: new Date().toISOString(),
  };
  update((current) => ({ ...current, notes: [note, ...current.notes] }));
  return note;
}

export function deleteNote(id: string) {
  update((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }));
}

export function setAccessibility(settings: Partial<AccessibilitySettings>) {
  update((current) => ({
    ...current,
    accessibility: { ...current.accessibility, ...settings },
  }));
}

export function attendanceSummary(records: AttendanceRecord[]) {
  const present = records.filter((item) => item.status === "Present").length;
  const late = records.filter((item) => item.status === "Late").length;
  const absent = records.filter((item) => item.status === "Absent").length;
  const total = records.length || 1;
  return {
    present,
    late,
    absent,
    rate: Math.round(((present + late) / total) * 100),
  };
}

export function unlockedAchievements(state: StudentExperienceState) {
  const perfectQuiz = state.quizAttempts.some((attempt) => attempt.score === attempt.total);
  const submitted = state.submissions.length > 0;
  const goalDone = state.goals.some((goal) => goal.completed);
  return [
    { title: "First steps", description: "Started your learning journey.", unlocked: true },
    { title: "Quiz star", description: "Score full marks on a quiz.", unlocked: perfectQuiz },
    { title: "Work sent", description: "Submit your first assignment.", unlocked: submitted },
    { title: "Goal getter", description: "Complete a learning goal.", unlocked: goalDone },
  ];
}
