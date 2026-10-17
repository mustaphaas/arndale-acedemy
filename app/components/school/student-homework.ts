import type { Assignment } from "@/lib/school";

export type HomeworkFilter = "all" | "todo" | "completed";

export function getHomeworkSummary(assignments: readonly Assignment[]) {
  const total = assignments.length;
  const completed = assignments.filter(
    (assignment) => assignment.completed,
  ).length;

  return {
    total,
    completed,
    pending: total - completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function filterHomework(
  assignments: readonly Assignment[],
  filter: HomeworkFilter,
) {
  if (filter === "all") return assignments;
  return assignments.filter((assignment) =>
    filter === "completed" ? assignment.completed : !assignment.completed,
  );
}

export function getHomeworkMilestone(
  summary: ReturnType<typeof getHomeworkSummary>,
) {
  if (summary.total === 0) {
    return {
      title: "Room to grow",
      description:
        "Your first classroom task will start your learning journey here.",
    };
  }
  if (summary.completed === 0) {
    return {
      title: "Your first small win",
      description:
        "Try one task. Take your time, and ask for help whenever you need it.",
    };
  }
  if (summary.completed === summary.total) {
    return {
      title: "Every task finished!",
      description:
        "Look at all that effort. Take a moment to feel proud of yourself.",
    };
  }
  if (summary.completed * 2 >= summary.total) {
    return {
      title: "Halfway and growing",
      description:
        "You’ve finished at least half of your tasks. Keep taking those small steps.",
    };
  }
  return {
    title: "A brilliant beginning",
    description:
      "You’ve finished your first task. Every little bit of practice helps you grow.",
  };
}
