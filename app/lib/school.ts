export const SCHOOL_NAME = "Arndale Academy";
export const SCHOOL_TAGLINE = "A place to learn. A place to grow.";

export type PortalRole = "student" | "parent" | "teacher";

export type Assignment = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  completed: boolean;
};

export const SAMPLE_LEARNER = {
  name: "Oliver James",
  firstName: "Oliver",
  initials: "OJ",
  className: "Primary 3 · Willow class",
  teacher: "Ms. Taylor",
};
