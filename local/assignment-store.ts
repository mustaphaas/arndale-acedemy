export const STORAGE_KEY = "arndale-academy.assignments.v1";
export type Assignment = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  completed: boolean;
};
export type NewAssignment = Omit<Assignment, "id" | "completed">;
export type AssignmentUpdate = Pick<Assignment, "id" | "completed">;
export type Snapshot = {
  assignments: Assignment[];
  error: string | null;
  loaded: boolean;
};
type BrowserStorage = Pick<Storage, "getItem" | "setItem">;

const sampleAssignments: Assignment[] = [
  {
    id: "assignment-fractions",
    title: "Fraction detectives",
    subject: "Maths",
    description: "5 fun questions to solve",
    dueDate: "Tomorrow",
    completed: false,
  },
  {
    id: "assignment-reading",
    title: "Read a little, dream a lot",
    subject: "English",
    description: "Read for 15 minutes and share your favorite part",
    dueDate: "Friday",
    completed: false,
  },
  {
    id: "assignment-spelling",
    title: "Spelling superstars",
    subject: "English",
    description: "Practice this week’s word list",
    dueDate: "Today",
    completed: true,
  },
  {
    id: "assignment-plants",
    title: "How plants grow",
    subject: "Science",
    description: "Draw the stages of a plant’s life",
    dueDate: "Thursday",
    completed: false,
  },
];

class HomeworkError extends Error {}

function decodeSavedAssignments(raw: string): Assignment[] {
  const saved: unknown = JSON.parse(raw);
  if (
    !saved ||
    typeof saved !== "object" ||
    !("version" in saved) ||
    saved.version !== 1 ||
    !("assignments" in saved) ||
    !Array.isArray(saved.assignments)
  ) {
    throw new HomeworkError(
      "Saved demo data could not be read. Your saved records have not been replaced.",
    );
  }
  const ids = new Set<string>();
  return saved.assignments.map((row: unknown) => {
    if (!row || typeof row !== "object")
      throw new HomeworkError(
        "Saved homework contains an invalid record. Your saved records have not been replaced.",
      );
    const value = row as Record<string, unknown>;
    if (
      typeof value.id !== "string" ||
      !value.id ||
      ids.has(value.id) ||
      typeof value.title !== "string" ||
      !value.title.trim() ||
      typeof value.subject !== "string" ||
      !value.subject.trim() ||
      typeof value.description !== "string" ||
      typeof value.dueDate !== "string" ||
      !value.dueDate.trim() ||
      typeof value.completed !== "boolean"
    ) {
      throw new HomeworkError(
        "Saved homework contains an invalid record. Your saved records have not been replaced.",
      );
    }
    ids.add(value.id);
    return {
      id: value.id,
      title: value.title,
      subject: value.subject,
      description: value.description,
      dueDate: value.dueDate,
      completed: value.completed,
    };
  });
}

// Match the existing list action's ordering by its text due-date label.
function orderAssignments(rows: Assignment[]): Assignment[] {
  return rows.sort((left, right) => left.dueDate.localeCompare(right.dueDate));
}

export function createAssignmentStore(storage: () => BrowserStorage) {
  let snapshot: Snapshot = { assignments: [], error: null, loaded: false };
  const listeners = new Set<() => void>();

  function publish(next: Snapshot) {
    if (JSON.stringify(snapshot) === JSON.stringify(next)) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function readSaved(): Assignment[] {
    const currentStorage = storage();
    const raw = currentStorage.getItem(STORAGE_KEY);
    if (raw !== null) return orderAssignments(decodeSavedAssignments(raw));
    const initial = orderAssignments(
      sampleAssignments.map((row) => ({ ...row })),
    );
    currentStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, assignments: initial }),
    );
    return initial;
  }

  function report(error: unknown, operation: "read" | "write") {
    const message =
      error instanceof HomeworkError
        ? error.message
        : error instanceof SyntaxError
          ? "Saved demo data could not be read. Your saved records have not been replaced."
          : operation === "read"
            ? "Browser storage is unavailable. Allow this site to save data, then reload the page."
            : "Your change could not be saved in this browser. Check that site storage is allowed and has space, then try again.";
    publish({ ...snapshot, error: message });
  }

  function refresh() {
    try {
      publish({ assignments: readSaved(), error: null, loaded: true });
    } catch (error) {
      report(error, "read");
    }
  }

  function save(change: (rows: Assignment[]) => Assignment[]): boolean {
    try {
      // Read immediately before writing so another tab's completed edits survive.
      const assignments = orderAssignments(change(readSaved()));
      storage().setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, assignments }),
      );
      publish({ assignments, error: null, loaded: true });
      return true;
    } catch (error) {
      report(error, "write");
      return false;
    }
  }

  refresh();

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    refresh,
    create: (input: NewAssignment) => {
      return save((rows) => {
        const title = input.title.trim();
        const subject = input.subject.trim();
        const dueDate = input.dueDate.trim();
        if (!title || !subject || !dueDate)
          throw new HomeworkError(
            "Add a task name, subject and due date before saving.",
          );
        return [
          ...rows,
          {
            id: crypto.randomUUID(),
            title,
            subject,
            description: input.description.trim(),
            dueDate,
            completed: false,
          },
        ];
      });
    },
    update: (input: AssignmentUpdate) =>
      save((rows) => {
        if (
          typeof input.completed !== "boolean" ||
          !rows.some((row) => row.id === input.id)
        )
          throw new HomeworkError(
            "This homework is no longer available. Refresh the page and try again.",
          );
        return rows.map((row) =>
          row.id === input.id ? { ...row, completed: input.completed } : row,
        );
      }),
    remove: (id: string) =>
      save((rows) => {
        if (!rows.some((row) => row.id === id))
          throw new HomeworkError(
            "This homework is no longer available. Refresh the page and try again.",
          );
        return rows.filter((row) => row.id !== id);
      }),
  };
}
