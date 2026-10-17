import { useActionQuery } from "@agent-native/core/client/hooks";
import {
  IconAlertCircle,
  IconBook2,
  IconBooks,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconCircleCheck,
  IconClipboardList,
  IconClock,
  IconDownload,
  IconInfoCircle,
  IconLeaf,
  IconMessageCircle,
  IconPencil,
  IconRefresh,
  IconSchool,
} from "@tabler/icons-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { type Assignment, SAMPLE_LEARNER, SCHOOL_NAME } from "@/lib/school";

import { summarizeParentHomework } from "./parent-summary";

import "./parent-dashboard.css";

type HomeworkFilter = "all" | "todo" | "completed";
type ParentDialog =
  | { kind: "task"; assignmentId: string }
  | { kind: "contacts" }
  | null;

const filters: { value: HomeworkFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "completed", label: "Completed" },
];

function HomeworkLoading() {
  return (
    <div className="pd-loading" role="status">
      <span className="pd-visually-hidden">Loading homework…</span>
      {[0, 1, 2].map((row) => (
        <div className="pd-loading-row" key={row} aria-hidden="true">
          <Skeleton className="pd-loading-icon" />
          <div>
            <Skeleton className="pd-loading-title" />
            <Skeleton className="pd-loading-detail" />
          </div>
          <Skeleton className="pd-loading-status" />
        </div>
      ))}
    </div>
  );
}

export function ParentDashboard() {
  const assignmentsQuery = useActionQuery<Assignment[]>("list-assignments", {});
  const [filter, setFilter] = useState<HomeworkFilter>("all");
  const [dialog, setDialog] = useState<ParentDialog>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const homeworkSectionRef = useRef<HTMLElement | null>(null);
  const assignments = assignmentsQuery.data ?? [];
  const hasData = assignmentsQuery.data !== undefined;
  const summary = summarizeParentHomework(assignments);
  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "todo") return !assignment.completed;
    if (filter === "completed") return assignment.completed;
    return true;
  });
  const selectedAssignment =
    dialog?.kind === "task"
      ? assignments.find((assignment) => assignment.id === dialog.assignmentId)
      : undefined;
  const filterCounts = {
    all: summary.total,
    todo: summary.remaining,
    completed: summary.completed,
  };

  function downloadSummary() {
    setDownloadFeedback(null);
    try {
      const generatedAt = new Date();
      const lines = [
        `${SCHOOL_NAME} — Homework summary`,
        `Created: ${generatedAt.toLocaleString("en-GB")}`,
        "",
        `Sample learner profile: ${SAMPLE_LEARNER.name}`,
        SAMPLE_LEARNER.className,
        "Source: shared classroom assignments in this preview.",
        "This summary is not an individual pupil assessment.",
        "",
        `To do: ${summary.remaining}`,
        `Completed: ${summary.completed}`,
        `Total homework tasks: ${summary.total}`,
        "",
        "HOMEWORK COMPLETION BY SUBJECT",
        ...summary.subjects.map(
          (subject) =>
            `${subject.subject}: ${subject.completed} of ${subject.total} complete (${subject.percent}%)`,
        ),
        "",
        "HOMEWORK",
        ...assignments.flatMap((assignment) => [
          "",
          `${assignment.completed ? "[Completed]" : "[To do]"} ${assignment.title}`,
          `${assignment.subject.trim() || "General"} · Due: ${assignment.dueDate || "Not set"}`,
          ...(assignment.description ? [assignment.description] : []),
        ]),
      ];
      const blob = new Blob([lines.join("\n")], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `arndale-homework-${generatedAt.toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      setDownloadFeedback("Your text summary download has started.");
    } catch {
      setDownloadFeedback("The download couldn’t start. Please try again.");
    }
  }

  return (
    <div className="parent-dashboard">
      <section className="pd-overview" id="overview" aria-labelledby="pd-title">
        <div className="pd-heading-row">
          <div>
            <h1 id="pd-title">
              Welcome back, {SAMPLE_LEARNER.firstName}’s family.
            </h1>
            <p>A little encouragement makes a big difference.</p>
          </div>
          <Button
            variant="outline"
            className="pd-download"
            disabled={
              !hasData || assignmentsQuery.isError || summary.total === 0
            }
            onClick={downloadSummary}
          >
            <IconDownload aria-hidden="true" />
            Download summary
          </Button>
        </div>

        <div className="pd-overview-card">
          <div className="pd-learner">
            <span className="pd-learner-avatar" aria-hidden="true">
              {SAMPLE_LEARNER.initials}
            </span>
            <div>
              <span className="pd-sample-label">Sample learner profile</span>
              <h2>{SAMPLE_LEARNER.name}</h2>
              <p>{SAMPLE_LEARNER.className}</p>
            </div>
          </div>
          <dl className="pd-metrics" aria-label="Classroom homework overview">
            <div className="pd-metric">
              <dt>
                <IconPencil aria-hidden="true" /> To do
              </dt>
              <dd>{hasData ? summary.remaining : "—"}</dd>
            </div>
            <div className="pd-metric">
              <dt>
                <IconCircleCheck aria-hidden="true" /> Completed
              </dt>
              <dd>{hasData ? summary.completed : "—"}</dd>
            </div>
            <div className="pd-metric">
              <dt>
                <IconBooks aria-hidden="true" /> Total tasks
              </dt>
              <dd>{hasData ? summary.total : "—"}</dd>
            </div>
          </dl>
        </div>
        <div className="pd-overview-footnote">
          <p className="pd-data-note">
            <IconInfoCircle aria-hidden="true" />
            Homework comes from the shared classroom list in this preview.
          </p>
          {assignmentsQuery.isFetching && hasData && (
            <span className="pd-refreshing" role="status">
              Updating…
            </span>
          )}
        </div>
        {downloadFeedback && (
          <p className="pd-download-feedback" role="status">
            {downloadFeedback}
          </p>
        )}
      </section>

      {assignmentsQuery.isError && (
        <div className="pd-query-error" role="alert">
          <IconAlertCircle aria-hidden="true" />
          <div>
            <strong>
              We couldn’t {hasData ? "refresh" : "load"} the homework.
            </strong>
            <p>
              {hasData
                ? "You’re seeing the last loaded classroom list. Try again for the latest updates."
                : "Please try again to see the classroom homework and progress."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={assignmentsQuery.isFetching}
            onClick={() => void assignmentsQuery.refetch()}
          >
            <IconRefresh aria-hidden="true" />
            {assignmentsQuery.isFetching ? "Trying…" : "Try again"}
          </Button>
        </div>
      )}

      <div className="pd-layout">
        <div className="pd-main-column">
          <section
            className="pd-panel pd-homework"
            id="homework"
            ref={homeworkSectionRef}
            tabIndex={-1}
            aria-labelledby="pd-homework-title"
          >
            <div className="pd-panel-heading">
              <h2 id="pd-homework-title">Homework at a glance</h2>
              <IconClipboardList
                className="pd-heading-icon"
                aria-hidden="true"
              />
            </div>
            <fieldset className="pd-filters" disabled={!hasData}>
              <legend className="pd-visually-hidden">
                Filter homework by status
              </legend>
              {filters.map((option) => (
                <label className="pd-filter" key={option.value}>
                  <input
                    type="radio"
                    name="parent-homework-filter"
                    value={option.value}
                    checked={filter === option.value}
                    onChange={() => setFilter(option.value)}
                  />
                  <span>{option.label}</span>
                  {hasData && (
                    <span className="pd-filter-count">
                      {filterCounts[option.value]}
                    </span>
                  )}
                </label>
              ))}
            </fieldset>

            {assignmentsQuery.isPending ? (
              <HomeworkLoading />
            ) : !hasData ? (
              <div className="pd-empty">
                <IconClipboardList aria-hidden="true" />
                <h3>Homework is unavailable</h3>
                <p>Use “Try again” above to reload the list.</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="pd-empty" role="status">
                <IconCircleCheck aria-hidden="true" />
                <h3>
                  {summary.total === 0
                    ? "No homework has been added yet"
                    : filter === "todo"
                      ? "All homework is complete"
                      : "No completed homework yet"}
                </h3>
                <p>
                  {summary.total === 0
                    ? "New classroom tasks will appear here."
                    : filter === "todo"
                      ? "A lovely moment to celebrate the effort."
                      : "Completed tasks will appear here as they’re marked done."}
                </p>
                {summary.total > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    View all homework <IconChevronRight aria-hidden="true" />
                  </Button>
                )}
              </div>
            ) : (
              <ul
                className="pd-homework-list"
                aria-label={`${filters.find((option) => option.value === filter)?.label} homework`}
              >
                {filteredAssignments.map((assignment) => (
                  <li key={assignment.id}>
                    <button
                      className="pd-homework-row"
                      type="button"
                      onClick={(event) => {
                        dialogTriggerRef.current = event.currentTarget;
                        setDialog({
                          kind: "task",
                          assignmentId: assignment.id,
                        });
                      }}
                    >
                      <span
                        className={`pd-task-icon${assignment.completed ? " pd-task-icon-complete" : ""}`}
                        aria-hidden="true"
                      >
                        {assignment.completed ? <IconCheck /> : <IconBook2 />}
                      </span>
                      <span className="pd-task-copy">
                        <strong>{assignment.title}</strong>
                        <span className="pd-task-detail">
                          <span>{assignment.subject.trim() || "General"}</span>
                          <span className="pd-task-due">
                            <IconClock aria-hidden="true" /> Due{" "}
                            {assignment.dueDate || "not set"}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`pd-task-status${assignment.completed ? " pd-task-status-complete" : ""}`}
                      >
                        {assignment.completed ? "Completed" : "To do"}
                      </span>
                      <IconChevronRight
                        className="pd-row-chevron"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className="pd-panel"
            id="progress"
            aria-labelledby="pd-progress-title"
          >
            <div className="pd-panel-heading">
              <h2 id="pd-progress-title">Progress by subject</h2>
              <span className="pd-panel-meta">Homework completion</span>
            </div>
            {assignmentsQuery.isPending ? (
              <div className="pd-progress-loading" role="status">
                <span className="pd-visually-hidden">
                  Loading subject progress…
                </span>
                {[0, 1, 2].map((row) => (
                  <Skeleton
                    key={row}
                    className="pd-progress-skeleton"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : summary.subjects.length === 0 ? (
              <p className="pd-empty-progress">
                {hasData
                  ? "Subject progress will appear when homework is added."
                  : "Subject progress will be available when homework loads."}
              </p>
            ) : (
              <ul className="pd-progress-list">
                {summary.subjects.map((subject, index) => (
                  <li
                    className={`pd-subject pd-subject-${index % 3}`}
                    key={subject.subject}
                  >
                    <div className="pd-subject-heading">
                      <strong>{subject.subject}</strong>
                      <span>
                        {subject.completed} of {subject.total} complete{" "}
                        <b>{subject.percent}%</b>
                      </span>
                    </div>
                    <progress
                      className="pd-progress-bar"
                      value={subject.completed}
                      max={subject.total}
                      aria-label={`${subject.subject} homework completion`}
                    />
                  </li>
                ))}
              </ul>
            )}
            <p className="pd-progress-note">
              Homework completion is separate from assessment results.
            </p>
          </section>

          <section
            className="pd-records"
            id="attendance"
            aria-label="School records"
          >
            <article className="pd-panel pd-record">
              <IconCalendar className="pd-record-icon" aria-hidden="true" />
              <h2>Attendance</h2>
              <p>Not recorded yet</p>
              <span>No attendance records are available here.</span>
            </article>
            <article className="pd-panel pd-record">
              <IconSchool className="pd-record-icon" aria-hidden="true" />
              <h2>Assessment results</h2>
              <p>Not recorded yet</p>
              <span>No assessment results have been added.</span>
            </article>
          </section>
        </div>

        <aside
          className="pd-side-column"
          aria-label="Resources for your family"
        >
          <section className="pd-reading" aria-labelledby="pd-reading-title">
            <span className="pd-reading-icon" aria-hidden="true">
              <IconBook2 />
            </span>
            <h2 id="pd-reading-title">A little reading, together.</h2>
            <p>
              Make a quiet moment for a story. Let {SAMPLE_LEARNER.firstName}{" "}
              pick a book and take turns reading aloud.
            </p>
            <div className="pd-reading-prompt">
              <span>Try a question tonight</span>
              <p>“What do you think will happen next?”</p>
            </div>
            <span className="pd-reading-footer">
              <IconLeaf aria-hidden="true" /> Small habits, happy learners.
            </span>
          </section>

          <section
            className="pd-panel pd-notices"
            id="people"
            aria-labelledby="pd-notices-title"
          >
            <div className="pd-panel-heading">
              <h2 id="pd-notices-title">Around the school</h2>
            </div>
            <span className="pd-sample-label pd-notices-label">
              Sample term notices
            </span>
            <article className="pd-notice">
              <span className="pd-notice-icon" aria-hidden="true">
                <IconBooks />
              </span>
              <div>
                <h3>Our reading adventure</h3>
                <p>
                  Willow class is exploring stories about friendship. Ask your
                  child about a favourite character.
                </p>
                <span>Classroom update · Example</span>
              </div>
            </article>
            <article className="pd-notice">
              <span
                className="pd-notice-icon pd-notice-outdoors"
                aria-hidden="true"
              >
                <IconLeaf />
              </span>
              <div>
                <h3>Ready for outdoor learning</h3>
                <p>
                  A warm layer and waterproof shoes help children enjoy learning
                  outside.
                </p>
                <span>School reminder · Example</span>
              </div>
            </article>
          </section>

          <section
            className="pd-panel pd-help"
            id="help"
            aria-labelledby="pd-help-title"
          >
            <div className="pd-help-heading">
              <span className="pd-teacher-avatar" aria-hidden="true">
                MT
              </span>
              <div>
                <h2 id="pd-help-title">Here to help</h2>
                <p>{SAMPLE_LEARNER.teacher} · Sample class teacher</p>
              </div>
            </div>
            <p>Have a question about learning or the school day?</p>
            <Button
              variant="outline"
              onClick={(event) => {
                dialogTriggerRef.current = event.currentTarget;
                setDialog({ kind: "contacts" });
              }}
            >
              <IconMessageCircle aria-hidden="true" /> School contacts
              <IconChevronRight aria-hidden="true" />
            </Button>
          </section>
        </aside>
      </div>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent
          className="pd-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (dialogTriggerRef.current?.isConnected) {
              dialogTriggerRef.current.focus();
            } else {
              homeworkSectionRef.current?.focus();
            }
          }}
        >
          {dialog?.kind === "contacts" ? (
            <>
              <DialogHeader>
                <DialogTitle>School contacts</DialogTitle>
                <DialogDescription className="pd-dialog-description">
                  Use your school’s usual contact channels for a personal reply.
                </DialogDescription>
              </DialogHeader>
              <dl className="pd-contact-details">
                <div>
                  <dt>Class teacher</dt>
                  <dd>
                    {SAMPLE_LEARNER.teacher}
                    <span>Sample profile · {SAMPLE_LEARNER.className}</span>
                  </dd>
                </div>
                <div>
                  <dt>School office</dt>
                  <dd>
                    Contact details not added
                    <span>
                      Phone and email details are not available in this preview.
                    </span>
                  </dd>
                </div>
              </dl>
              <p className="pd-contact-guidance">
                For homework questions, use the teacher contact details in your
                school’s welcome pack. To report an absence or change a
                collection arrangement, follow your school’s usual office
                procedure.
              </p>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedAssignment?.title ?? "Homework updated"}
                </DialogTitle>
                <DialogDescription className="pd-dialog-description">
                  {selectedAssignment
                    ? "Details from the shared classroom homework list."
                    : "This task is no longer in the current homework list."}
                </DialogDescription>
              </DialogHeader>
              {selectedAssignment && (
                <>
                  <dl className="pd-task-metadata">
                    <div>
                      <dt>Subject</dt>
                      <dd>{selectedAssignment.subject.trim() || "General"}</dd>
                    </div>
                    <div>
                      <dt>Due</dt>
                      <dd>{selectedAssignment.dueDate || "Not set"}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>
                        {selectedAssignment.completed ? "Completed" : "To do"}
                      </dd>
                    </div>
                  </dl>
                  <p className="pd-task-instructions">
                    {selectedAssignment.description ||
                      "No additional instructions have been added."}
                  </p>
                </>
              )}
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
