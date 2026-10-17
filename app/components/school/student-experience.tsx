import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { IOSIcon } from "@/components/school/ios-icons";
import {
  QUIZZES,
  addGoal,
  addNote,
  attendanceSummary,
  deleteNote,
  markAllNotificationsRead,
  markNotificationRead,
  recordQuizAttempt,
  sendStudentMessage,
  setAccessibility,
  submitAssignment,
  reviewSubmission,
  addAnnouncement,
  addCalendarEvent,
  unlockedAchievements,
  updateGoal,
  useStudentExperience,
  type QuizDefinition,
} from "@/lib/student-experience";
import type { Assignment } from "@/lib/school";

import "./student-experience.css";

function PanelHeading({
  kicker,
  title,
  copy,
  icon,
}: {
  kicker: string;
  title: string;
  copy: string;
  icon: Parameters<typeof IOSIcon>[0]["name"];
}) {
  return (
    <div className="sx-heading">
      <div>
        <span>{kicker}</span>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      <span className="sx-icon"><IOSIcon name={icon} size={22} /></span>
    </div>
  );
}

export function StudentDayExtras() {
  const state = useStudentExperience();
  return (
    <div className="sx-day-grid">
      <section className="sx-card sx-announcements">
        <PanelHeading
          kicker="SCHOOL UPDATES"
          title="What’s happening"
          copy="Important things for your class and school."
          icon="info"
        />
        <div className="sx-list">
          {state.announcements.slice(0, 2).map((item) => (
            <article key={item.id}>
              <small>{item.category} · {item.date}</small>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sx-card sx-calendar">
        <PanelHeading
          kicker="COMING UP"
          title="My calendar"
          copy="Tests, homework, school events and holidays."
          icon="calendar"
        />
        <div className="sx-calendar-list">
          {state.events.slice(0, 4).map((event) => (
            <article key={event.id}>
              <time>{event.date.slice(5).replace("-", "/")}</time>
              <div>
                <strong>{event.title}</strong>
                <span>{event.type}{event.time ? ` · ${event.time}` : ""}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuizRunner({ quiz }: { quiz: QuizDefinition }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const question = quiz.questions[index];
  const isCorrect = choice === question.answer;

  function next() {
    if (choice === null) return;
    const nextAnswers = [...answers, choice];
    if (index >= quiz.questions.length - 1) {
      const score = nextAnswers.reduce(
        (total, answer, answerIndex) =>
          total + (answer === quiz.questions[answerIndex].answer ? 1 : 0),
        0,
      );
      recordQuizAttempt(quiz.id, score, quiz.questions.length);
      setAnswers(nextAnswers);
      setFinished(true);
      return;
    }
    setAnswers(nextAnswers);
    setIndex((current) => current + 1);
    setChoice(null);
  }

  if (finished) {
    const score = answers.reduce(
      (total, answer, answerIndex) =>
        total + (answer === quiz.questions[answerIndex].answer ? 1 : 0),
      0,
    );
    return (
      <div className="sx-quiz-finish">
        <span><IOSIcon name="trophy" size={30} /></span>
        <h3>{score === quiz.questions.length ? "Perfect score!" : "Nice work!"}</h3>
        <strong>{score}/{quiz.questions.length}</strong>
        <p>{score === quiz.questions.length ? "You answered every question correctly." : "Review the explanations and try again when you’re ready."}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIndex(0);
            setChoice(null);
            setAnswers([]);
            setFinished(false);
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="sx-quiz-runner">
      <div className="sx-quiz-progress">
        <span>Question {index + 1} of {quiz.questions.length}</span>
        <span>{quiz.subject}</span>
      </div>
      <h3>{question.prompt}</h3>
      <div className="sx-quiz-options">
        {question.options.map((option, optionIndex) => (
          <button
            type="button"
            key={option}
            className={choice === optionIndex ? "is-selected" : ""}
            onClick={() => setChoice(optionIndex)}
          >
            <span>{String.fromCharCode(65 + optionIndex)}</span>
            {option}
          </button>
        ))}
      </div>
      {choice !== null && (
        <div className={`sx-quiz-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
          <strong>{isCorrect ? "Correct!" : "Almost."}</strong>
          <p>{question.explanation}</p>
        </div>
      )}
      <Button type="button" onClick={next} disabled={choice === null}>
        {index === quiz.questions.length - 1 ? "Finish quiz" : "Next question"}
      </Button>
    </div>
  );
}

export function StudentQuizCentre() {
  const [quizId, setQuizId] = useState(QUIZZES[0].id);
  const quiz = QUIZZES.find((item) => item.id === quizId) ?? QUIZZES[0];
  return (
    <section className="sx-card" id="quizzes">
      <PanelHeading
        kicker="INTERACTIVE PRACTICE"
        title="Quiz centre"
        copy="Answer questions, get instant explanations and build mastery."
        icon="checklist"
      />
      <div className="sx-pill-tabs">
        {QUIZZES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={quizId === item.id ? "is-active" : ""}
            onClick={() => setQuizId(item.id)}
          >
            {item.subject}
          </button>
        ))}
      </div>
      <QuizRunner key={quiz.id} quiz={quiz} />
    </section>
  );
}

export function StudentLibraryAndClassroom({ view }: { view: "library" | "classroom" }) {
  const state = useStudentExperience();
  const [subject, setSubject] = useState("All");
  const resources = state.library.filter((item) => subject === "All" || item.subject === subject);

  return (
    <div className="sx-stack">
      {view === "library" && <section className="sx-card" id="library">
        <PanelHeading
          kicker="DIGITAL LIBRARY"
          title="Explore and read"
          copy="Stories, worksheets, videos and short learning guides."
          icon="book"
        />
        <div className="sx-pill-tabs">
          {["All", "Maths", "English", "Science"].map((item) => (
            <button
              key={item}
              type="button"
              className={subject === item ? "is-active" : ""}
              onClick={() => setSubject(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="sx-resource-grid">
          {resources.map((item) => (
            <article key={item.id}>
              <span><IOSIcon name={item.subject === "Maths" ? "math" : item.subject === "Science" ? "sprout" : "book"} size={22} /></span>
              <small>{item.subject} · {item.type}</small>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <b>{item.minutes} min</b>
              <Button type="button" variant="outline">Open resource</Button>
            </article>
          ))}
        </div>
      </section>}

      {view === "classroom" && <section className="sx-card" id="classroom">
        <PanelHeading
          kicker="MY CLASSROOM"
          title="Willow class"
          copy="Your teacher, classmates and class challenge in one friendly space."
          icon="support"
        />
        <div className="sx-classroom-grid">
          <article className="sx-teacher-card">
            <span className="sx-avatar">MT</span>
            <div>
              <small>Class teacher</small>
              <strong>Ms. Taylor</strong>
              <p>“Small steps every day make big learning adventures.”</p>
            </div>
          </article>
          <article>
            <small>This week’s class challenge</small>
            <strong>Read 100 pages together</strong>
            <div className="sx-meter"><span style={{ width: "68%" }} /></div>
            <p>Willow class is 68% of the way there.</p>
          </article>
          <article>
            <small>Classmates</small>
            <div className="sx-classmates">
              {["Ava", "Noah", "Mia", "Oliver"].map((name) => <span key={name}>{name.slice(0, 1)}</span>)}
            </div>
            <p>Safe class space — no public profiles or open chat.</p>
          </article>
        </div>
      </section>}
    </div>
  );
}

export function StudentProgressExtras({ view }: { view: "results" | "goals" | "achievements" }) {
  const state = useStudentExperience();
  const attendance = useMemo(() => attendanceSummary(state.attendance), [state.attendance]);
  const achievements = useMemo(() => unlockedAchievements(state), [state]);
  const report = state.reportCards[0];
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDate, setGoalDate] = useState("");

  return (
    <div className="sx-stack">
      {view === "results" && <section className="sx-card" id="results">
        <PanelHeading
          kicker="RESULTS"
          title="My report card"
          copy="See subject progress and teacher feedback in one place."
          icon="clipboard"
        />
        {report && (
          <>
            <div className="sx-report-top">
              <div><span>{report.term}</span><strong>{report.overall}%</strong><small>overall</small></div>
              <p>{report.teacherRemark}</p>
            </div>
            <div className="sx-report-subjects">
              {report.subjects.map((item) => (
                <article key={item.subject}>
                  <strong>{item.subject}</strong>
                  <b>{item.score}%</b>
                  <p>{item.remark}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>}

      {view === "results" && <section className="sx-card" id="attendance">
        <PanelHeading
          kicker="ATTENDANCE"
          title="My school days"
          copy="A simple, child-friendly view of attendance."
          icon="calendar"
        />
        <div className="sx-attendance-summary">
          <article><strong>{attendance.rate}%</strong><span>attendance</span></article>
          <article><strong>{attendance.present}</strong><span>present</span></article>
          <article><strong>{attendance.late}</strong><span>late</span></article>
          <article><strong>{attendance.absent}</strong><span>absent</span></article>
        </div>
        <div className="sx-attendance-days">
          {state.attendance.map((item) => (
            <span className={`is-${item.status.toLowerCase()}`} key={item.date}>
              {item.date.slice(8)} <small>{item.status}</small>
            </span>
          ))}
        </div>
      </section>}

      {view === "goals" && <section className="sx-card" id="goals">
        <PanelHeading
          kicker="MY GOALS"
          title="What I’m working towards"
          copy="Set small goals and watch your progress grow."
          icon="sprout"
        />
        <div className="sx-goal-list">
          {state.goals.map((goal) => (
            <article key={goal.id}>
              <div>
                <strong>{goal.title}</strong>
                <p>{goal.target}</p>
                <small>Due {goal.dueDate}</small>
              </div>
              <div className="sx-goal-control">
                <div className="sx-meter"><span style={{ width: `${goal.progress}%` }} /></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  aria-label={`Progress for ${goal.title}`}
                  onChange={(event) => updateGoal(goal.id, Number(event.target.value))}
                />
                <b>{goal.progress}%</b>
              </div>
            </article>
          ))}
        </div>
        <form
          className="sx-inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!goalTitle.trim() || !goalTarget.trim() || !goalDate) return;
            addGoal({ title: goalTitle.trim(), target: goalTarget.trim(), dueDate: goalDate });
            setGoalTitle("");
            setGoalTarget("");
            setGoalDate("");
          }}
        >
          <input value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} placeholder="Goal title" />
          <input value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} placeholder="What will you do?" />
          <input type="date" value={goalDate} onChange={(event) => setGoalDate(event.target.value)} />
          <Button type="submit">Add goal</Button>
        </form>
      </section>}

      {view === "achievements" && <section className="sx-card" id="achievements">
        <PanelHeading
          kicker="ACHIEVEMENTS"
          title="My achievement centre"
          copy="Badges unlock as you practise, submit work and reach goals."
          icon="trophy"
        />
        <div className="sx-achievement-grid">
          {achievements.map((item) => (
            <article className={item.unlocked ? "is-unlocked" : ""} key={item.title}>
              <span><IOSIcon name="trophy" size={24} /></span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <small>{item.unlocked ? "Unlocked" : "Keep going"}</small>
            </article>
          ))}
        </div>
      </section>}
    </div>
  );
}

export function StudentWorkExtras({ assignments, view }: { assignments: Assignment[]; view: "submissions" | "notebook" }) {
  const state = useStudentExperience();
  const [submissionTaskId, setSubmissionTaskId] = useState(assignments[0]?.id ?? "");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (!submissionTaskId && assignments[0]) setSubmissionTaskId(assignments[0].id);
  }, [assignments, submissionTaskId]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteSubject, setNoteSubject] = useState("General");
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function sendWork() {
    const task = assignments.find((item) => item.id === submissionTaskId);
    if (!task || (!answer.trim() && !fileRef.current?.files?.[0])) return;
    const file = fileRef.current?.files?.[0];
    let dataUrl: string | undefined;
    if (file && file.size <= 1_500_000) {
      dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });
    }
    submitAssignment({
      assignmentId: task.id,
      assignmentTitle: task.title,
      answer,
      fileName: file?.name,
      dataUrl,
    });
    setAnswer("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="sx-stack">
      {view === "submissions" && <section className="sx-card" id="submissions">
        <PanelHeading
          kicker="ASSIGNMENT SUBMISSION"
          title="Send my work"
          copy="Type an answer or attach a photo/file for your teacher to review."
          icon="clipboard"
        />
        <div className="sx-submission-layout">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendWork();
            }}
          >
            <label>Choose homework
              <select value={submissionTaskId} onChange={(event) => setSubmissionTaskId(event.target.value)}>
                {assignments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </label>
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer or tell your teacher about your work…" />
            <input ref={fileRef} type="file" accept="image/*,.pdf,audio/*" />
            <Button type="submit">Submit to teacher</Button>
          </form>
          <div className="sx-submission-list">
            {state.submissions.length === 0 ? <p>No work submitted yet.</p> : state.submissions.map((item) => (
              <article key={item.id}>
                <small>{item.status}</small>
                <strong>{item.assignmentTitle}</strong>
                {item.fileName && <span>{item.fileName}</span>}
                {item.feedback ? (
                  <div className="sx-feedback-box">
                    <b>Teacher feedback {item.score ? `· ${item.score}%` : ""}</b>
                    <p>{item.feedback}</p>
                  </div>
                ) : <p>Waiting for teacher feedback.</p>}
              </article>
            ))}
          </div>
        </div>
      </section>}

      {view === "notebook" && <section className="sx-card" id="notebook">
        <PanelHeading
          kicker="MY NOTEBOOK"
          title="Notes & reflections"
          copy="Save ideas, learning notes and things you want to remember."
          icon="pencil"
        />
        <div className="sx-notebook-layout">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!noteTitle.trim() || !noteBody.trim()) return;
              addNote({ title: noteTitle, body: noteBody, subject: noteSubject });
              setNoteTitle("");
              setNoteBody("");
            }}
          >
            <input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="Note title" />
            <select value={noteSubject} onChange={(event) => setNoteSubject(event.target.value)}>
              <option>General</option><option>Maths</option><option>English</option><option>Science</option>
            </select>
            <textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder="Write or reflect here…" />
            <Button type="submit" variant="outline">Save note</Button>
          </form>
          <div className="sx-note-grid">
            {state.notes.map((note) => (
              <article key={note.id}>
                <small>{note.subject}</small>
                <strong>{note.title}</strong>
                <p>{note.body}</p>
                <button type="button" onClick={() => deleteNote(note.id)}>Delete</button>
              </article>
            ))}
          </div>
        </div>
      </section>}
    </div>
  );
}

export function StudentUtilityCentre() {
  const state = useStudentExperience();
  const [open, setOpen] = useState<"notifications" | "messages" | "accessibility" | null>(null);
  const [message, setMessage] = useState("");
  const unreadNotifications = state.notifications.filter((item) => !item.read).length;
  const unreadMessages = state.messages.filter((item) => item.from === "Teacher" && !item.read).length;

  return (
    <div className="sx-utilities">
      <button type="button" onClick={() => setOpen(open === "notifications" ? null : "notifications")} aria-label="Notifications">
        <IOSIcon name="info" size={18} />
        {unreadNotifications > 0 && <span>{unreadNotifications}</span>}
      </button>
      <button type="button" onClick={() => setOpen(open === "messages" ? null : "messages")} aria-label="Messages">
        <IOSIcon name="support" size={18} />
        {unreadMessages > 0 && <span>{unreadMessages}</span>}
      </button>
      <button type="button" onClick={() => setOpen(open === "accessibility" ? null : "accessibility")} aria-label="Accessibility">
        <IOSIcon name="palette" size={18} />
      </button>

      {open && (
        <div className="sx-popover">
          {open === "notifications" && (
            <>
              <div className="sx-popover-head">
                <strong>Notifications</strong>
                <button type="button" onClick={markAllNotificationsRead}>Mark all read</button>
              </div>
              <div className="sx-popover-list">
                {state.notifications.slice(0, 8).map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={item.read ? "" : "is-unread"}
                    onClick={() => markNotificationRead(item.id)}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {open === "messages" && (
            <>
              <div className="sx-popover-head"><strong>Messages</strong><span>Safe teacher chat</span></div>
              <div className="sx-message-thread">
                {state.messages.slice(0, 8).reverse().map((item) => (
                  <article className={item.from === "Student" ? "is-student" : "is-teacher"} key={item.id}>
                    <strong>{item.from}</strong>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
              <form
                className="sx-message-compose"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!message.trim()) return;
                  sendStudentMessage("Student", message);
                  setMessage("");
                }}
              >
                <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message Ms. Taylor…" />
                <Button type="submit" size="sm">Send</Button>
              </form>
            </>
          )}

          {open === "accessibility" && (
            <>
              <div className="sx-popover-head"><strong>Accessibility</strong><span>Make the portal comfortable for you</span></div>
              <div className="sx-accessibility">
                <label>Text size
                  <select value={state.accessibility.textSize} onChange={(event) => setAccessibility({ textSize: event.target.value as typeof state.accessibility.textSize })}>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                    <option value="extra">Extra large</option>
                  </select>
                </label>
                <label><input type="checkbox" checked={state.accessibility.highContrast} onChange={(event) => setAccessibility({ highContrast: event.target.checked })} /> Higher contrast</label>
                <label><input type="checkbox" checked={state.accessibility.reducedMotion} onChange={(event) => setAccessibility({ reducedMotion: event.target.checked })} /> Reduce motion</label>
                <label><input type="checkbox" checked={state.accessibility.readingFont} onChange={(event) => setAccessibility({ readingFont: event.target.checked })} /> Easier reading font</label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function StudentAccessibilityBridge() {
  const state = useStudentExperience();
  const classes = [
    `sx-text-${state.accessibility.textSize}`,
    state.accessibility.highContrast ? "sx-high-contrast" : "",
    state.accessibility.reducedMotion ? "sx-reduced-motion" : "",
    state.accessibility.readingFont ? "sx-reading-font" : "",
  ].filter(Boolean).join(" ");

  return <span className="sx-accessibility-bridge" data-classes={classes} hidden />;
}


export function TeacherStudentWorkflows() {
  const state = useStudentExperience();
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [announcement, setAnnouncement] = useState({ title: "", body: "", category: "Class" as "School" | "Class" | "Event", date: "" });
  const [event, setEvent] = useState({ title: "", date: "", time: "", type: "Event" as "Homework" | "Test" | "Holiday" | "Event" });

  return (
    <div className="sx-stack">
      <section className="sx-card" id="student-work-review">
        <PanelHeading
          kicker="STUDENT SUBMISSIONS"
          title="Review Oliver’s work"
          copy="Open submitted work, add a score and send feedback back to the student portal."
          icon="clipboard"
        />
        <div className="sx-review-list">
          {state.submissions.length === 0 ? (
            <p>No student submissions yet.</p>
          ) : state.submissions.map((item) => (
            <article key={item.id}>
              <div>
                <small>{item.status} · {new Date(item.submittedAt).toLocaleDateString("en-GB")}</small>
                <strong>{item.assignmentTitle}</strong>
                {item.answer && <p>{item.answer}</p>}
                {item.fileName && <span>Attachment: {item.fileName}</span>}
              </div>
              {item.status === "Reviewed" ? (
                <div className="sx-feedback-box">
                  <b>{item.score}%</b>
                  <p>{item.feedback}</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const body = feedback[item.id]?.trim();
                    const score = scores[item.id] ?? 80;
                    if (!body) return;
                    reviewSubmission(item.id, body, score);
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores[item.id] ?? 80}
                    onChange={(e) => setScores((current) => ({ ...current, [item.id]: Number(e.target.value) }))}
                    aria-label="Score"
                  />
                  <textarea
                    value={feedback[item.id] ?? ""}
                    onChange={(e) => setFeedback((current) => ({ ...current, [item.id]: e.target.value }))}
                    placeholder="Write helpful feedback…"
                    required
                  />
                  <Button type="submit">Send feedback</Button>
                </form>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="sx-card" id="teacher-updates">
        <PanelHeading
          kicker="CLASS UPDATES"
          title="Announcements & calendar"
          copy="Publish a class notice or add an event that appears in the student portal."
          icon="calendar"
        />
        <div className="sx-teacher-update-grid">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!announcement.title.trim() || !announcement.body.trim() || !announcement.date) return;
              addAnnouncement(announcement);
              setAnnouncement({ title: "", body: "", category: "Class", date: "" });
            }}
          >
            <h3>New announcement</h3>
            <input value={announcement.title} onChange={(e) => setAnnouncement((current) => ({ ...current, title: e.target.value }))} placeholder="Title" />
            <textarea value={announcement.body} onChange={(e) => setAnnouncement((current) => ({ ...current, body: e.target.value }))} placeholder="Message" />
            <select value={announcement.category} onChange={(e) => setAnnouncement((current) => ({ ...current, category: e.target.value as typeof announcement.category }))}>
              <option>Class</option><option>School</option><option>Event</option>
            </select>
            <input type="date" value={announcement.date} onChange={(e) => setAnnouncement((current) => ({ ...current, date: e.target.value }))} />
            <Button type="submit" variant="outline">Publish announcement</Button>
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!event.title.trim() || !event.date) return;
              addCalendarEvent(event);
              setEvent({ title: "", date: "", time: "", type: "Event" });
            }}
          >
            <h3>Add calendar event</h3>
            <input value={event.title} onChange={(e) => setEvent((current) => ({ ...current, title: e.target.value }))} placeholder="Event title" />
            <select value={event.type} onChange={(e) => setEvent((current) => ({ ...current, type: e.target.value as typeof event.type }))}>
              <option>Homework</option><option>Test</option><option>Holiday</option><option>Event</option>
            </select>
            <input type="date" value={event.date} onChange={(e) => setEvent((current) => ({ ...current, date: e.target.value }))} />
            <input type="time" value={event.time} onChange={(e) => setEvent((current) => ({ ...current, time: e.target.value }))} />
            <Button type="submit" variant="outline">Add to calendar</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
