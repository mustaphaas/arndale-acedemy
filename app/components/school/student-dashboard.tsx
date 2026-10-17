import {
  useActionMutation,
  useActionQuery,
} from "@/lib/assignment-hooks";
import {
  IconArrowRight,
  IconBook,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconClipboardList,
  IconClock,
  IconHeart,
  IconInfoCircle,
  IconLeaf,
  IconLoader2,
  IconMathSymbols,
  IconPencil,
  IconRefresh,
  IconSparkles,
  IconTrophy,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SAMPLE_LEARNER, type Assignment } from "@/lib/school";

import {
  filterHomework,
  getHomeworkMilestone,
  getHomeworkSummary,
  type HomeworkFilter,
} from "./student-homework";

import "./student-dashboard.css";

const SAMPLE_LESSONS = [
  {
    subject: "Maths",
    topic: "Fun with fractions",
    time: "9:00–9:45",
    icon: IconMathSymbols,
    tone: "yellow",
    description:
      "Explore halves and quarters. See how equal parts can make one whole.",
    materials: "A pencil and your maths book",
  },
  {
    subject: "English",
    topic: "Story explorers",
    time: "10:00–10:45",
    icon: IconBook,
    tone: "blue",
    description:
      "Meet the characters in a story, then imagine what might happen next.",
    materials: "Your reading book and a curious mind",
  },
  {
    subject: "Science",
    topic: "How plants grow",
    time: "11:15–12:00",
    icon: IconLeaf,
    tone: "pink",
    description:
      "Look closely at a seedling. Discover what plants need to grow strong.",
    materials: "Your science book and a pencil",
  },
] as const;

function subjectIcon(subject: string) {
  const name = subject.toLowerCase();
  if (name.includes("math")) return IconMathSymbols;
  if (name.includes("science")) return IconLeaf;
  if (name.includes("english") || name.includes("read")) return IconBook;
  return IconPencil;
}

function dueLabel(dueDate: string) {
  return dueDate.trim() ? `Due ${dueDate}` : "No due date set";
}

type SpeechSource = "summary" | "task";

export function StudentDashboard() {
  const homework = useActionQuery<Assignment[]>("list-assignments", {});
  const updateAssignment = useActionMutation<
    Assignment | undefined,
    { id: string; completed: boolean }
  >("update-assignment");
  const assignments = homework.data ?? [];
  const ready = homework.isSuccess;
  const summary = getHomeworkSummary(assignments);
  const milestone = getHomeworkMilestone(summary);
  const nextTask = assignments.find((assignment) => !assignment.completed);
  const [filter, setFilter] = useState<HomeworkFilter>("all");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
  const [taskFeedback, setTaskFeedback] = useState<{
    id: string;
    message: string;
    error: boolean;
  } | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState<boolean | null>(null);
  const [speaking, setSpeaking] = useState<SpeechSource | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const taskTriggerRef = useRef<HTMLButtonElement | null>(null);
  const homeworkHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const selectedLesson = SAMPLE_LESSONS[lessonIndex];
  const SelectedLessonIcon = selectedLesson.icon;
  const visibleAssignments = filterHomework(assignments, filter);

  useEffect(() => {
    setSpeechAvailable(
      "speechSynthesis" in window &&
        typeof window.SpeechSynthesisUtterance === "function",
    );
    return () => {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stopReading() {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current = null;
      window.speechSynthesis.cancel();
    }
    setSpeaking(null);
  }

  function readAloud(text: string, source: SpeechSource) {
    const wasReading = speaking === source;
    stopReading();
    setSpeechError(null);
    if (wasReading) return;
    if (
      !("speechSynthesis" in window) ||
      typeof window.SpeechSynthesisUtterance !== "function"
    ) {
      setSpeechAvailable(false);
      setSpeechError(
        "Read aloud is unavailable in this browser. A grown-up can read with you.",
      );
      return;
    }
    try {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 0.9;
      utterance.onend = () => {
        utteranceRef.current = null;
        setSpeaking(null);
      };
      utterance.onerror = (event) => {
        utteranceRef.current = null;
        setSpeaking(null);
        if (event.error !== "canceled" && event.error !== "interrupted") {
          setSpeechError(
            "Read aloud could not start. Try again, or ask a grown-up to read with you.",
          );
        }
      };
      utteranceRef.current = utterance;
      setSpeaking(source);
      window.speechSynthesis.speak(utterance);
    } catch {
      stopReading();
      setSpeechError(
        "Read aloud could not start. Try again, or ask a grown-up to read with you.",
      );
    }
  }

  function openTask(assignment: Assignment, trigger: HTMLButtonElement) {
    stopReading();
    setSpeechError(null);
    setTaskFeedback(null);
    taskTriggerRef.current = trigger;
    setSelectedTask(assignment);
  }

  function closeTask() {
    stopReading();
    setSpeechError(null);
    setSelectedTask(null);
  }

  async function saveCompletion() {
    if (!selectedTask || savingTaskId !== null) return;
    const task = selectedTask;
    const completed = !task.completed;
    setSavingTaskId(task.id);
    setTaskFeedback(null);
    try {
      const saved = await updateAssignment.mutateAsync({
        id: task.id,
        completed,
      });
      if (!saved || saved.id !== task.id || saved.completed !== completed) {
        setTaskFeedback({
          id: task.id,
          message:
            "We couldn’t confirm that change. Reload your homework and try again.",
          error: true,
        });
        void homework.refetch();
        return;
      }
      setSelectedTask((current) =>
        current?.id === saved.id ? saved : current,
      );
      setTaskFeedback({
        id: task.id,
        message: completed
          ? "Task saved as complete. Lovely effort!"
          : "Task moved back to your to-do list.",
        error: false,
      });
    } catch {
      setTaskFeedback({
        id: task.id,
        message:
          "We couldn’t confirm that change. Check your connection and try again.",
        error: true,
      });
    } finally {
      setSavingTaskId(null);
    }
  }

  const spokenSummary = `Ready to grow, ${SAMPLE_LEARNER.firstName}? This is an example pupil and timetable. ${
    ready
      ? summary.total === 0
        ? "There are no classroom tasks yet."
        : `You have ${summary.pending} ${summary.pending === 1 ? "task" : "tasks"} to do, and ${summary.completed} completed. ${nextTask ? `Your next task is ${nextTask.title}. Open it to read the instructions.` : "Every task is finished. Well done!"}`
      : homework.isError
        ? "Your homework could not load. Use Try again to reload it."
        : "Your homework is loading."
  } Take one small step at a time.`;

  return (
    <div className="student-dashboard sd-root">
      <section
        className="sd-day"
        id="overview"
        aria-labelledby="sd-welcome-title"
      >
        <div className="sd-day-heading">
          <div>
            <h1>My day</h1>
            <p>{SAMPLE_LEARNER.className}</p>
          </div>
          {speechAvailable !== false && (
            <Button
              type="button"
              variant="outline"
              className="sd-read-button"
              disabled={speechAvailable === null}
              onClick={() => readAloud(spokenSummary, "summary")}
              aria-pressed={speaking === "summary"}
            >
              {speaking === "summary" ? (
                <IconVolumeOff aria-hidden="true" />
              ) : (
                <IconVolume aria-hidden="true" />
              )}
              {speaking === "summary" ? "Stop reading" : "Read to me"}
            </Button>
          )}
        </div>

        <div className="sd-welcome">
          <div className="sd-welcome-copy">
            <h2 id="sd-welcome-title">
              Good morning, {SAMPLE_LEARNER.firstName}!
            </h2>
            <p>A new day, a new little adventure. Let’s grow!</p>
            <div className="sd-welcome-pills" aria-label="Today at a glance">
              <span>
                <IconBook size={15} aria-hidden="true" />
                {SAMPLE_LESSONS.length} lessons today
              </span>
              <span>
                <IconPencil size={15} aria-hidden="true" />
                {ready ? summary.pending : "—"} tasks to try
              </span>
            </div>
          </div>
          <div className="sd-banner-art" aria-hidden="true">
            <span className="sd-banner-sun" />
            <IconLeaf className="sd-banner-leaf" />
            <IconPencil className="sd-banner-pencil" />
          </div>
        </div>
        {(speechError && !selectedTask) || speechAvailable === false ? (
          <p className="sd-speech-note" role="status">
            {speechError ??
              "Read aloud is unavailable in this browser. A grown-up can read with you."}
          </p>
        ) : null}
      </section>

      <div className="sd-quick-stats" aria-label="Homework at a glance">
        <article className="sd-stat">
          <span className="sd-stat-icon sd-tone-blue">
            <IconClipboardList aria-hidden="true" />
          </span>
          <div>
            <span>Classroom tasks</span>
            <strong>{ready ? summary.total : "—"}</strong>
          </div>
        </article>
        <article className="sd-stat">
          <span className="sd-stat-icon sd-tone-yellow">
            <IconPencil aria-hidden="true" />
          </span>
          <div>
            <span>To try next</span>
            <strong>{ready ? summary.pending : "—"}</strong>
          </div>
        </article>
        <article className="sd-stat">
          <span className="sd-stat-icon sd-tone-mint">
            <IconCircleCheck aria-hidden="true" />
          </span>
          <div>
            <span>Tasks completed</span>
            <strong>{ready ? summary.completed : "—"}</strong>
          </div>
        </article>
      </div>

      <div className="sd-content-grid">
        <div className="sd-main-column">
          <section
            className="sd-lessons"
            id="lessons"
            aria-labelledby="sd-lessons-title"
          >
            <div className="sd-section-heading">
              <h2 id="sd-lessons-title">Let’s explore today</h2>
              <a href="#timetable" className="sd-text-link">
                Sample Wednesday <IconArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div
              className="sd-lesson-grid"
              role="group"
              aria-label="Choose a sample lesson"
            >
              {SAMPLE_LESSONS.map((lesson, index) => {
                const LessonIcon = lesson.icon;
                return (
                  <Button
                    key={lesson.subject}
                    type="button"
                    variant="ghost"
                    className={`sd-lesson-card sd-tone-${lesson.tone} ${index === lessonIndex ? "sd-is-selected" : ""}`}
                    aria-pressed={index === lessonIndex}
                    aria-controls="sd-lesson-detail"
                    onClick={() => setLessonIndex(index)}
                  >
                    <span className="sd-lesson-top">
                      <span className="sd-lesson-icon">
                        <LessonIcon size={23} aria-hidden="true" />
                      </span>
                      <IconArrowRight
                        className="sd-lesson-arrow"
                        size={18}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="sd-lesson-subject">{lesson.subject}</span>
                    <span className="sd-lesson-topic">{lesson.topic}</span>
                    <span className="sd-lesson-time">
                      <IconClock size={14} aria-hidden="true" />
                      {lesson.time}
                    </span>
                  </Button>
                );
              })}
            </div>
            <div
              className="sd-lesson-detail"
              id="sd-lesson-detail"
              aria-live="polite"
              aria-atomic="true"
            >
              <SelectedLessonIcon size={22} aria-hidden="true" />
              <div>
                <h3>{selectedLesson.topic}</h3>
                <p>{selectedLesson.description}</p>
                <span>
                  <strong>Bring along:</strong> {selectedLesson.materials}.
                </span>
              </div>
            </div>
          </section>

          <section
            className="sd-panel sd-homework"
            id="homework"
            aria-labelledby="sd-homework-title"
            aria-busy={homework.isPending}
          >
            <div className="sd-section-heading">
              <h2 id="sd-homework-title" ref={homeworkHeadingRef} tabIndex={-1}>
                A little practice
              </h2>
              {ready && (
                <span className="sd-count-pill">{summary.pending} to do</span>
              )}
            </div>
            {homework.isPending ? (
              <div className="sd-data-state" role="status">
                <IconLoader2
                  className="sd-loading-icon"
                  size={25}
                  aria-hidden="true"
                />
                <h3>Finding your homework…</h3>
                <p>Your classroom tasks will appear here.</p>
              </div>
            ) : homework.isError ? (
              <div className="sd-data-state sd-error-state" role="alert">
                <IconInfoCircle size={26} aria-hidden="true" />
                <h3>Homework couldn’t load</h3>
                <p>Try again to load the classroom task list.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void homework.refetch()}
                  disabled={homework.isFetching}
                >
                  <IconRefresh
                    className={
                      homework.isFetching ? "sd-loading-icon" : undefined
                    }
                    aria-hidden="true"
                  />
                  {homework.isFetching ? "Trying again…" : "Try again"}
                </Button>
              </div>
            ) : assignments.length === 0 ? (
              <div className="sd-data-state">
                <IconBook size={30} aria-hidden="true" />
                <h3>Your homework space is ready</h3>
                <p>
                  There are no classroom tasks yet. When your teacher adds one,
                  you’ll find it here.
                </p>
              </div>
            ) : (
              <>
                {nextTask ? (
                  <article className="sd-next-task">
                    <div className="sd-next-top">
                      <span>
                        <IconSparkles size={16} aria-hidden="true" />
                        Your next small step
                      </span>
                      <span>{dueLabel(nextTask.dueDate)}</span>
                    </div>
                    <div className="sd-next-body">
                      <span className="sd-task-stamp">
                        <IconClipboardList size={26} aria-hidden="true" />
                      </span>
                      <div className="sd-next-copy">
                        <span>{nextTask.subject}</span>
                        <h3>{nextTask.title}</h3>
                        {nextTask.description && <p>{nextTask.description}</p>}
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="sd-open-next"
                      onClick={(event) =>
                        openTask(nextTask, event.currentTarget)
                      }
                    >
                      <span>Open my task</span>
                      <IconArrowRight aria-hidden="true" />
                    </Button>
                  </article>
                ) : (
                  <div className="sd-all-done">
                    <span>
                      <IconCheck size={24} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>All finished for now!</h3>
                      <p>
                        You’ve completed all {summary.total}{" "}
                        {summary.total === 1 ? "task" : "tasks"}. That’s
                        something to feel proud of.
                      </p>
                    </div>
                  </div>
                )}
                <div className="sd-homework-toolbar">
                  <h3>My homework</h3>
                  <div
                    className="sd-filters"
                    role="group"
                    aria-label="Filter homework"
                  >
                    {(
                      [
                        ["all", "All", summary.total],
                        ["todo", "To do", summary.pending],
                        ["completed", "Completed", summary.completed],
                      ] as const
                    ).map(([value, label, count]) => (
                      <Button
                        key={value}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`sd-filter ${filter === value ? "sd-is-active" : ""}`}
                        aria-pressed={filter === value}
                        onClick={() => setFilter(value)}
                      >
                        {label}
                        <span>{count}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div aria-live="polite" aria-atomic="false">
                  {visibleAssignments.length > 0 ? (
                    <ul className="sd-assignment-list">
                      {visibleAssignments.map((assignment) => {
                        const SubjectIcon = subjectIcon(assignment.subject);
                        return (
                          <li
                            className={`sd-assignment ${assignment.completed ? "sd-is-complete" : ""}`}
                            key={assignment.id}
                          >
                            <span className="sd-assignment-icon">
                              <SubjectIcon size={20} aria-hidden="true" />
                            </span>
                            <div className="sd-assignment-copy">
                              <h4>{assignment.title}</h4>
                              <p>
                                {assignment.subject}
                                <span aria-hidden="true"> · </span>
                                {dueLabel(assignment.dueDate)}
                              </p>
                            </div>
                            {assignment.completed && (
                              <span className="sd-complete-label">
                                <IconCircleCheck size={16} aria-hidden="true" />
                                <span>Done</span>
                              </span>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="sd-task-link"
                              aria-label={`Open ${assignment.title}`}
                              onClick={(event) =>
                                openTask(assignment, event.currentTarget)
                              }
                            >
                              Open
                              <IconArrowRight aria-hidden="true" />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="sd-filter-empty">
                      {filter === "completed"
                        ? "Your first finished task will appear here. You can do it!"
                        : "Nothing left to do. Find your finished tasks in Completed."}
                    </p>
                  )}
                </div>
                {homework.isFetching && (
                  <p className="sd-refresh-note" role="status">
                    Refreshing your homework…
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        <aside
          className="sd-side-column"
          aria-label="Your learning and support"
        >
          <section
            className="sd-panel sd-progress"
            id="progress"
            aria-labelledby="sd-progress-title"
          >
            <div className="sd-section-heading">
              <h2 id="sd-progress-title">Look at you grow!</h2>
              <IconLeaf size={21} aria-hidden="true" />
            </div>
            {!ready ? (
              <p className="sd-muted-state">
                {homework.isError
                  ? "Reload your homework to see your progress."
                  : "Your progress will appear when your homework loads."}
              </p>
            ) : summary.total === 0 ? (
              <div className="sd-progress-empty">
                <IconLeaf size={32} aria-hidden="true" />
                <h3>Room to grow</h3>
                <p>Your progress starts with your first classroom task.</p>
              </div>
            ) : (
              <>
                <div className="sd-progress-content">
                  <div
                    className="sd-progress-ring"
                    role="progressbar"
                    aria-label="Homework completed"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={summary.percent}
                    aria-valuetext={`${summary.completed} of ${summary.total} tasks completed`}
                  >
                    <svg viewBox="0 0 112 112" aria-hidden="true">
                      <circle
                        className="sd-ring-track"
                        cx="56"
                        cy="56"
                        r="47"
                      />
                      <circle
                        className="sd-ring-value"
                        cx="56"
                        cy="56"
                        r="47"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={100 - summary.percent}
                        transform="rotate(-90 56 56)"
                      />
                    </svg>
                    <div>
                      <strong>{summary.percent}%</strong>
                      <span>complete</span>
                    </div>
                  </div>
                  <div className="sd-progress-copy">
                    <strong>
                      {summary.completed} of {summary.total} tasks
                    </strong>
                    <p>
                      {summary.pending === 0
                        ? "All your practice is finished."
                        : `${summary.pending} ${summary.pending === 1 ? "task" : "tasks"} still to try.`}
                    </p>
                  </div>
                </div>
                <div className="sd-milestone">
                  <IconTrophy size={24} aria-hidden="true" />
                  <div>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </div>
              </>
            )}
          </section>

          <section
            className="sd-panel sd-help"
            id="help"
            aria-labelledby="sd-help-title"
          >
            <div className="sd-section-heading">
              <h2 id="sd-help-title">A helping hand</h2>
              <IconHeart size={21} aria-hidden="true" />
            </div>
            <p>
              Great learners ask questions. You don’t have to work it all out on
              your own.
            </p>
            <details className="sd-help-details">
              <summary>
                Feeling a bit stuck?
                <IconChevronDown size={17} aria-hidden="true" />
              </summary>
              <ol>
                <li>Read the instructions one more time.</li>
                <li>Try one small part of the task.</li>
                <li>
                  Ask your teacher in class, or a grown-up at home, to help with
                  the tricky bit.
                </li>
              </ol>
            </details>
          </section>

          <section
            className="sd-panel sd-timetable"
            id="timetable"
            aria-labelledby="sd-timetable-title"
          >
            <div className="sd-section-heading">
              <h2 id="sd-timetable-title">After our lessons</h2>
              <IconCalendar size={20} aria-hidden="true" />
            </div>
            <p className="sd-timetable-label">Sample Wednesday afternoon</p>
            <dl>
              <div>
                <dt>12:00</dt>
                <dd>Lunch & play</dd>
              </div>
              <div>
                <dt>13:00</dt>
                <dd>Art time</dd>
              </div>
              <div>
                <dt>14:15</dt>
                <dd>Story circle</dd>
              </div>
            </dl>
            <a href="#lessons" className="sd-text-link">
              Back to our lessons
              <IconArrowRight size={16} aria-hidden="true" />
            </a>
          </section>
        </aside>
      </div>

      <Dialog
        open={selectedTask !== null}
        onOpenChange={(open) => {
          if (!open) closeTask();
        }}
      >
        {selectedTask && (
          <DialogContent
            className="student-dashboard sd-task-dialog"
            motion="instant"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (taskTriggerRef.current?.isConnected)
                taskTriggerRef.current.focus();
              else homeworkHeadingRef.current?.focus();
            }}
          >
            <DialogHeader>
              <DialogTitle className="sd-dialog-title">
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription className="sd-dialog-meta">
                {selectedTask.subject} · {dueLabel(selectedTask.dueDate)}
              </DialogDescription>
            </DialogHeader>
            <div className="sd-task-instructions">
              <h3>What to do</h3>
              <p>
                {selectedTask.description ||
                  "There are no instructions for this task yet. Ask your teacher what to do before marking it complete."}
              </p>
            </div>
            {speechAvailable && (
              <Button
                type="button"
                variant="outline"
                className="sd-dialog-read"
                onClick={() =>
                  readAloud(
                    `${selectedTask.title}. ${selectedTask.description || "There are no instructions for this task yet. Ask your teacher what to do."}`,
                    "task",
                  )
                }
                aria-pressed={speaking === "task"}
              >
                {speaking === "task" ? (
                  <IconVolumeOff aria-hidden="true" />
                ) : (
                  <IconVolume aria-hidden="true" />
                )}
                {speaking === "task" ? "Stop reading" : "Read the instructions"}
              </Button>
            )}
            {speechError && (
              <p className="sd-speech-note" role="status">
                {speechError}
              </p>
            )}
            {taskFeedback?.id === selectedTask.id ? (
              <p
                className={`sd-task-feedback ${taskFeedback.error ? "sd-feedback-error" : ""}`}
                role={taskFeedback.error ? "alert" : "status"}
              >
                {!taskFeedback.error && (
                  <IconCircleCheck size={19} aria-hidden="true" />
                )}
                {taskFeedback.message}
              </p>
            ) : selectedTask.completed ? (
              <p className="sd-task-feedback">
                <IconCircleCheck size={19} aria-hidden="true" />
                You’ve marked this task as complete.
              </p>
            ) : (
              <p className="sd-completion-hint">
                Take your time. When you’ve done the task, you can mark it as
                finished below.
              </p>
            )}
            <DialogFooter className="sd-dialog-footer">
              <Button type="button" variant="outline" onClick={closeTask}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => void saveCompletion()}
                disabled={savingTaskId !== null}
              >
                {savingTaskId === selectedTask.id ? (
                  <>
                    <IconLoader2
                      className="sd-loading-icon"
                      aria-hidden="true"
                    />
                    Saving…
                  </>
                ) : selectedTask.completed ? (
                  "Move back to to do"
                ) : (
                  <>
                    <IconCheck aria-hidden="true" />
                    I’ve finished
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
