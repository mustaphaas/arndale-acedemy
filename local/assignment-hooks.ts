import { useSyncExternalStore } from "react";

import {
  createAssignmentStore,
  type Assignment,
  type AssignmentUpdate,
  type NewAssignment,
} from "./assignment-store";

export const browserAssignments = createAssignmentStore(
  () => window.localStorage,
);

export function useAssignmentSnapshot() {
  return useSyncExternalStore(
    browserAssignments.subscribe,
    browserAssignments.getSnapshot,
    browserAssignments.getSnapshot,
  );
}

// This adapter supports the assignment operations consumed by the dashboards.
export function useActionQuery<Result extends Assignment[] = Assignment[]>(
  _action: "list-assignments",
  _input: Record<string, never>,
) {
  const snapshot = useAssignmentSnapshot();
  return {
    data: snapshot.loaded ? (snapshot.assignments as Result) : undefined,
    error: snapshot.error,
    isSuccess: snapshot.loaded && snapshot.error === null,
    isError: snapshot.error !== null,
    isPending: false,
    isFetching: false,
    refetch: browserAssignments.refresh,
  };
}

type AssignmentAction =
  | "create-assignment"
  | "update-assignment"
  | "delete-assignment";

export function useActionMutation<Result = unknown, Input = unknown>(
  action: AssignmentAction,
) {
  function execute(input: Input): Result {
    let saved = false;
    let result: Assignment | undefined;
    switch (action) {
      case "create-assignment":
        saved = browserAssignments.create(input as NewAssignment);
        break;
      case "update-assignment": {
        const update = input as AssignmentUpdate;
        saved = browserAssignments.update(update);
        if (saved)
          result = browserAssignments
            .getSnapshot()
            .assignments.find((row) => row.id === update.id);
        break;
      }
      case "delete-assignment":
        saved = browserAssignments.remove((input as { id: string }).id);
        break;
    }
    if (!saved)
      throw new Error(
        browserAssignments.getSnapshot().error ??
          "Homework could not be saved.",
      );
    return result as Result;
  }

  return {
    isPending: false,
    mutate(
      input: Input,
      callbacks?: {
        onSuccess?: (result: Result) => void;
        onError?: (error: Error) => void;
      },
    ) {
      try {
        const result = execute(input);
        callbacks?.onSuccess?.(result);
      } catch (error) {
        callbacks?.onError?.(
          error instanceof Error
            ? error
            : new Error("Homework could not be saved."),
        );
      }
    },
    mutateAsync: async (input: Input): Promise<Result> => execute(input),
  };
}
