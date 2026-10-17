import type { Assignment } from "@/lib/school";

export type SubjectProgress = {
  subject: string;
  total: number;
  completed: number;
  percent: number;
};

export function summarizeParentHomework(assignments: readonly Assignment[]) {
  const subjects = new Map<string, SubjectProgress>();
  let completed = 0;

  for (const assignment of assignments) {
    const subject = assignment.subject.trim() || "General";
    const subjectKey = subject.toLocaleLowerCase("en-GB");
    const progress = subjects.get(subjectKey) ?? {
      subject,
      total: 0,
      completed: 0,
      percent: 0,
    };

    progress.total += 1;
    if (assignment.completed) {
      completed += 1;
      progress.completed += 1;
    }
    progress.percent = Math.round((progress.completed / progress.total) * 100);
    subjects.set(subjectKey, progress);
  }

  return {
    total: assignments.length,
    completed,
    remaining: assignments.length - completed,
    subjects: [...subjects.values()].sort((left, right) =>
      left.subject.localeCompare(right.subject, "en-GB"),
    ),
  };
}
