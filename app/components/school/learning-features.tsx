import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { IOSIcon } from "@/components/school/ios-icons";
import {
  addPortfolioItem,
  addXp,
  confirmAppointment,
  generateTeacherResource,
  getEarlyWarnings,
  getHomeworkHint,
  getLearningPath,
  getParentIntelligence,
  getRewards,
  getTutorReply,
  markMessagesRead,
  recordReadingAttempt,
  requestAppointment,
  scoreReading,
  sendPortalMessage,
  useLearningIntelligence,
  type LearningSubject,
} from "@/lib/learning-intelligence";
import type { Assignment } from "@/lib/school";

import "./learning-features.css";

const READING_SAMPLE =
  "The small seed rested in the warm soil. With water and sunlight, it began to grow into a green plant.";

function MasteryBars() {
  const state = useLearningIntelligence();
  return (
    <div className="lf-mastery-list">
      {state.mastery.map((item) => (
        <article className="lf-mastery-row" key={`${item.subject}-${item.topic}`}>
          <div>
            <span>{item.subject}</span>
            <strong>{item.topic}</strong>
          </div>
          <div className="lf-mastery-meter">
            <span style={{ width: `${item.score}%` }} />
          </div>
          <b>{item.score}%</b>
        </article>
      ))}
    </div>
  );
}

export function StudentLearningHub({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const state = useLearningIntelligence();
  const path = useMemo(() => getLearningPath(state.mastery), [state.mastery]);
  const rewards = useMemo(() => getRewards(state), [state]);
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Array<{ role: "child" | "tutor"; text: string }>>([
    {
      role: "tutor",
      text: "Hi Oliver. Ask me about Maths, English, Science or homework. I’ll give hints and explain one small step at a time.",
    },
  ]);
  const [readingTranscript, setReadingTranscript] = useState("");
  const [readingFeedback, setReadingFeedback] = useState("");
  const [listening, setListening] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioNote, setPortfolioNote] = useState("");
  const [portfolioCategory, setPortfolioCategory] = useState<
    "Drawing" | "Project" | "Reading" | "Achievement"
  >("Project");
  const [hintStep, setHintStep] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function askTutor() {
    const trimmed = question.trim();
    if (!trimmed) return;
    const reply = getTutorReply(trimmed, state.mastery);
    setConversation((current) => [
      ...current,
      { role: "child", text: trimmed },
      { role: "tutor", text: reply },
    ]);
    setQuestion("");
    addXp(5);
  }

  function startReadingCoach() {
    setReadingFeedback("");
    const SpeechRecognitionCtor = (
      window as Window & {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      }
    ).SpeechRecognition ??
      (
        window as Window & {
          webkitSpeechRecognition?: new () => any;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setReadingFeedback(
        "Live speech recognition is not available in this browser. You can type what you read below and score it instead.",
      );
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setReadingFeedback("I couldn’t hear that clearly. Try again in a quieter place.");
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      setReadingTranscript(transcript);
      const accuracy = scoreReading(READING_SAMPLE, transcript);
      recordReadingAttempt({
        text: READING_SAMPLE,
        transcript,
        accuracy,
      });
      setReadingFeedback(
        accuracy >= 85
          ? `Excellent reading — ${accuracy}% word match. Try reading it once more with smooth expression.`
          : accuracy >= 65
            ? `Good effort — ${accuracy}% word match. Read it again slowly and watch the words that were missed.`
            : `You scored ${accuracy}%. Try one sentence at a time and sound out difficult words before reading the whole passage again.`,
      );
    };
    recognition.start();
  }

  function scoreTypedReading() {
    const transcript = readingTranscript.trim();
    if (!transcript) return;
    const accuracy = scoreReading(READING_SAMPLE, transcript);
    recordReadingAttempt({ text: READING_SAMPLE, transcript, accuracy });
    setReadingFeedback(
      accuracy >= 85
        ? `Excellent reading — ${accuracy}% word match.`
        : `Your word match is ${accuracy}%. Try it again and focus on any words you skipped or changed.`,
    );
  }

  async function addPortfolio(file?: File | null) {
    if (!portfolioTitle.trim()) return;
    let dataUrl: string | undefined;
    if (file && file.size <= 1_500_000) {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }).catch(() => undefined);
    }
    addPortfolioItem({
      title: portfolioTitle.trim(),
      category: portfolioCategory,
      note: portfolioNote.trim() || "Added to Oliver’s learning portfolio.",
      fileName: file?.name,
      dataUrl,
    });
    setPortfolioTitle("");
    setPortfolioNote("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <section className="lf-section lf-ai-card" id="ai-companion" aria-labelledby="lf-ai-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">AI LEARNING COMPANION</span>
            <h2 id="lf-ai-title">Ask Littleleaf</h2>
            <p>Hints first, explanations next — never a shortcut around learning.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="sparkles" size={23} /></span>
        </div>
        <div className="lf-chat-window" aria-live="polite">
          {conversation.slice(-6).map((message, index) => (
            <div className={`lf-chat ${message.role === "child" ? "is-child" : "is-tutor"}`} key={index}>
              <strong>{message.role === "child" ? "You" : "Littleleaf"}</strong>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <form
          className="lf-chat-form"
          onSubmit={(event) => {
            event.preventDefault();
            askTutor();
          }}
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about fractions, spelling, plants or homework…"
            aria-label="Ask the learning companion"
          />
          <Button type="submit">Ask</Button>
        </form>
        <div className="lf-quick-prompts">
          {["Help me with fractions", "Give me a spelling hint", "How do plants grow?"].map((prompt) => (
            <button key={prompt} type="button" onClick={() => setQuestion(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className="lf-section" id="learning-path" aria-labelledby="lf-path-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">PERSONALISED LEARNING</span>
            <h2 id="lf-path-title">My learning path</h2>
            <p>Practice is prioritised from the skills that need the most support.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="sprout" size={23} /></span>
        </div>
        <div className="lf-path-grid">
          {path.map((item, index) => (
            <article className="lf-path-card" key={`${item.subject}-${item.topic}`}>
              <span className="lf-step">0{index + 1}</span>
              <div>
                <small>{item.subject} · {item.score}% mastery</small>
                <h3>{item.topic}</h3>
                <p>{item.activity}</p>
                <span>{item.minutes} min · {item.reason}</span>
              </div>
              <Button type="button" variant="outline" onClick={() => addXp(15)}>
                Start practice
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="lf-section" id="reading-coach" aria-labelledby="lf-reading-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">READING COACH</span>
            <h2 id="lf-reading-title">Read aloud with confidence</h2>
            <p>Practise fluency and get immediate word-level feedback in supported browsers.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="volume" size={23} /></span>
        </div>
        <blockquote className="lf-reading-passage">{READING_SAMPLE}</blockquote>
        <div className="lf-reading-actions">
          <Button type="button" onClick={startReadingCoach} disabled={listening}>
            <IOSIcon name="volume" size={17} />
            {listening ? "Listening…" : "Start reading"}
          </Button>
          <span>or</span>
          <textarea
            value={readingTranscript}
            onChange={(event) => setReadingTranscript(event.target.value)}
            placeholder="Type what you read to test the scoring fallback…"
            aria-label="Typed reading transcript"
          />
          <Button type="button" variant="outline" onClick={scoreTypedReading}>
            Score my reading
          </Button>
        </div>
        {readingFeedback && <p className="lf-feedback" role="status">{readingFeedback}</p>}
        {state.readingAttempts[0] && (
          <div className="lf-reading-score">
            <strong>{state.readingAttempts[0].accuracy}%</strong>
            <span>latest reading word match</span>
          </div>
        )}
      </section>

      <section className="lf-section" id="mastery" aria-labelledby="lf-mastery-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">PROGRESS & MASTERY</span>
            <h2 id="lf-mastery-title">What I can do</h2>
            <p>Topic mastery shows learning depth, not only task completion.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="trophy" size={23} /></span>
        </div>
        <MasteryBars />
      </section>

      <section className="lf-section" id="rewards" aria-labelledby="lf-rewards-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">GAMIFIED LEARNING</span>
            <h2 id="lf-rewards-title">My rewards</h2>
            <p>Celebrate consistency and effort without turning every activity into a competition.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="sparkles" size={23} /></span>
        </div>
        <div className="lf-reward-grid">
          <article><strong>{state.xp}</strong><span>XP</span></article>
          <article><strong>{rewards.level}</strong><span>Level</span></article>
          <article><strong>{state.streak} days</strong><span>Learning streak</span></article>
          <article><strong>{state.stars}</strong><span>Stars</span></article>
        </div>
        <div className="lf-level-progress">
          <span style={{ width: `${Math.min(100, (rewards.currentLevelXp / rewards.levelSpan) * 100)}%` }} />
        </div>
        <div className="lf-badges">
          {(rewards.badges.length ? rewards.badges : ["First steps"]).map((badge) => (
            <span key={badge}>★ {badge}</span>
          ))}
        </div>
      </section>

      <section className="lf-section" id="homework-help" aria-labelledby="lf-homework-help-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">AI HOMEWORK HELP</span>
            <h2 id="lf-homework-help-title">Hints, not answers</h2>
            <p>Open a hint only when you need one. The second hint goes one step further.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="help" size={23} /></span>
        </div>
        <div className="lf-hint-list">
          {assignments.filter((assignment) => !assignment.completed).slice(0, 4).map((assignment) => {
            const step = hintStep[assignment.id] ?? 0;
            return (
              <article key={assignment.id}>
                <div>
                  <small>{assignment.subject}</small>
                  <h3>{assignment.title}</h3>
                  {step > 0 && <p>{getHomeworkHint(assignment.title, assignment.subject, assignment.description, step)}</p>}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setHintStep((current) => ({
                      ...current,
                      [assignment.id]: Math.min(2, (current[assignment.id] ?? 0) + 1),
                    }))
                  }
                >
                  {step === 0 ? "Give me a hint" : step === 1 ? "One more hint" : "Hint shown"}
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="lf-section" id="portfolio" aria-labelledby="lf-portfolio-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">DIGITAL PORTFOLIO</span>
            <h2 id="lf-portfolio-title">Things I’m proud of</h2>
            <p>Keep projects, reading milestones, drawings and achievements together.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="clipboard" size={23} /></span>
        </div>
        <div className="lf-portfolio-layout">
          <form
            className="lf-portfolio-form"
            onSubmit={(event) => {
              event.preventDefault();
              void addPortfolio(fileInputRef.current?.files?.[0]);
            }}
          >
            <input
              value={portfolioTitle}
              onChange={(event) => setPortfolioTitle(event.target.value)}
              placeholder="Title"
              required
            />
            <select value={portfolioCategory} onChange={(event) => setPortfolioCategory(event.target.value as typeof portfolioCategory)}>
              <option>Drawing</option>
              <option>Project</option>
              <option>Reading</option>
              <option>Achievement</option>
            </select>
            <textarea value={portfolioNote} onChange={(event) => setPortfolioNote(event.target.value)} placeholder="A short note about this work" />
            <input ref={fileInputRef} type="file" accept="image/*,audio/*" />
            <Button type="submit">Add to portfolio</Button>
          </form>
          <div className="lf-portfolio-grid">
            {state.portfolio.slice(0, 6).map((item) => (
              <article key={item.id}>
                {item.dataUrl?.startsWith("data:image") ? <img src={item.dataUrl} alt="" /> : <span className="lf-portfolio-art"><IOSIcon name="book" size={26} /></span>}
                <small>{item.category}</small>
                <h3>{item.title}</h3>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ParentIntelligenceHub({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const state = useLearningIntelligence();
  const insight = useMemo(() => getParentIntelligence(state), [state]);
  const warnings = useMemo(
    () => getEarlyWarnings(state, assignments.filter((item) => !item.completed).length),
    [state, assignments],
  );
  const [message, setMessage] = useState("");
  const [appointment, setAppointment] = useState({ date: "", time: "", reason: "" });

  return (
    <>
      <section className="lf-section" id="intelligence" aria-labelledby="lf-parent-intelligence">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">PARENT INTELLIGENCE</span>
            <h2 id="lf-parent-intelligence">What to know this week</h2>
            <p>A simple view of strengths, learning gaps and the most useful thing to practise at home.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="sparkles" size={23} /></span>
        </div>
        <div className="lf-parent-insights">
          <article>
            <span>Growing strongly</span>
            {insight.strengths.map((item) => <strong key={item.topic}>{item.topic} · {item.score}%</strong>)}
          </article>
          <article>
            <span>Needs a little practice</span>
            {insight.needsPractice.map((item) => <strong key={item.topic}>{item.topic} · {item.score}%</strong>)}
          </article>
          <article>
            <span>Latest reading coach</span>
            <strong>{insight.lastReading ? `${insight.lastReading.accuracy}% word match` : "No reading attempt yet"}</strong>
            <p>{insight.lastReading ? "Use the next attempt to improve smoothness and expression." : "Oliver can make a first recording from the student Reading Coach."}</p>
          </article>
          <article className="lf-parent-recommendation">
            <span>Try this at home</span>
            <p>{insight.recommendation}</p>
          </article>
        </div>
        <MasteryBars />
        <div className="lf-family-portfolio">
          <div>
            <strong>Recent portfolio</strong>
            <span>Projects and achievements saved by Oliver</span>
          </div>
          {state.portfolio.slice(0, 3).map((item) => (
            <article key={item.id}>
              <small>{item.category}</small>
              <strong>{item.title}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lf-section" id="alerts" aria-labelledby="lf-alerts-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">SMART EARLY WARNING</span>
            <h2 id="lf-alerts-title">Things worth noticing early</h2>
            <p>Signals are based on mastery, workload and learning routine in this browser demo.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="info" size={23} /></span>
        </div>
        <div className="lf-warning-list">
          {warnings.length === 0 ? <p>No early-warning signals right now.</p> : warnings.map((warning) => (
            <article className={`is-${warning.severity}`} key={warning.title}>
              <strong>{warning.title}</strong>
              <p>{warning.detail}</p>
              <span>{warning.action}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="lf-section" id="communication" aria-labelledby="lf-parent-comms">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">PARENT–TEACHER COMMUNICATION</span>
            <h2 id="lf-parent-comms">Messages & appointments</h2>
            <p>Keep learning conversations attached to the child’s portal.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="support" size={23} /></span>
        </div>
        <div className="lf-comms-grid">
          <div>
            <div className="lf-message-list">
              {state.messages.slice(0, 6).map((item) => (
                <article key={item.id} className={item.from === "Parent" ? "is-parent" : "is-teacher"}>
                  <strong>{item.from}</strong>
                  <p>{item.body}</p>
                  <small>{new Date(item.createdAt).toLocaleString("en-GB")}</small>
                </article>
              ))}
            </div>
            <form
              className="lf-message-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!message.trim()) return;
                sendPortalMessage("Parent", message);
                setMessage("");
                markMessagesRead("Parent");
              }}
            >
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message to the class teacher…" required />
              <Button type="submit">Send message</Button>
            </form>
          </div>
          <form
            className="lf-appointment-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!appointment.date || !appointment.time || !appointment.reason.trim()) return;
              requestAppointment(appointment);
              setAppointment({ date: "", time: "", reason: "" });
            }}
          >
            <h3>Request an appointment</h3>
            <input type="date" value={appointment.date} onChange={(event) => setAppointment((current) => ({ ...current, date: event.target.value }))} required />
            <input type="time" value={appointment.time} onChange={(event) => setAppointment((current) => ({ ...current, time: event.target.value }))} required />
            <textarea value={appointment.reason} onChange={(event) => setAppointment((current) => ({ ...current, reason: event.target.value }))} placeholder="What would you like to discuss?" required />
            <Button type="submit" variant="outline">Request time</Button>
            {state.appointments.slice(0, 3).map((item) => (
              <p className="lf-appointment-status" key={item.id}>
                {item.date} · {item.time} · <strong>{item.status}</strong>
              </p>
            ))}
          </form>
        </div>
      </section>
    </>
  );
}

export function TeacherAIHub({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const state = useLearningIntelligence();
  const warnings = useMemo(
    () => getEarlyWarnings(state, assignments.filter((item) => !item.completed).length),
    [state, assignments],
  );
  const [kind, setKind] = useState<"lesson" | "quiz" | "worksheet" | "comment" | "differentiate">("lesson");
  const [subject, setSubject] = useState<LearningSubject>("Maths");
  const [topic, setTopic] = useState("Fractions");
  const [level, setLevel] = useState<"Support" | "Core" | "Stretch">("Core");
  const [output, setOutput] = useState("");
  const [reply, setReply] = useState("");

  return (
    <>
      <section className="lf-section" id="teacher-ai" aria-labelledby="lf-teacher-ai-title">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">TEACHER AI ASSISTANT</span>
            <h2 id="lf-teacher-ai-title">Plan, differentiate and write faster</h2>
            <p>Generate classroom-ready starting points that the teacher can review and adapt.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="sparkles" size={23} /></span>
        </div>
        <div className="lf-teacher-ai-grid">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setOutput(generateTeacherResource({ kind, subject, topic, level }));
            }}
          >
            <label>Generate
              <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
                <option value="lesson">Lesson plan</option>
                <option value="quiz">Quiz</option>
                <option value="worksheet">Worksheet</option>
                <option value="comment">Report comment</option>
                <option value="differentiate">Differentiated activity</option>
              </select>
            </label>
            <label>Subject
              <select value={subject} onChange={(event) => setSubject(event.target.value as LearningSubject)}>
                <option>Maths</option>
                <option>English</option>
                <option>Science</option>
              </select>
            </label>
            <label>Topic
              <input value={topic} onChange={(event) => setTopic(event.target.value)} />
            </label>
            <label>Level
              <select value={level} onChange={(event) => setLevel(event.target.value as typeof level)}>
                <option>Support</option>
                <option>Core</option>
                <option>Stretch</option>
              </select>
            </label>
            <Button type="submit">Generate draft</Button>
          </form>
          <div className="lf-ai-output">
            {output ? <pre>{output}</pre> : <p>Choose a resource type and generate a draft.</p>}
            {output && (
              <Button type="button" variant="outline" onClick={() => void navigator.clipboard?.writeText(output)}>
                Copy draft
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="lf-section" id="early-warning" aria-labelledby="lf-teacher-warning">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">SMART EARLY WARNING</span>
            <h2 id="lf-teacher-warning">Pupils who may need attention</h2>
            <p>Turn learning signals into a short list of practical next actions.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="info" size={23} /></span>
        </div>
        <div className="lf-warning-list">
          {state.readingAttempts[0] && (
            <article className={state.readingAttempts[0].accuracy < 65 ? "is-high" : "is-medium"}>
              <strong>Oliver James · latest reading coach</strong>
              <p>Latest word match: {state.readingAttempts[0].accuracy}%.</p>
              <span>{state.readingAttempts[0].accuracy < 65 ? "Use a shorter passage and practise difficult words first." : "Repeat the passage once for fluency and expression."}</span>
            </article>
          )}
          {warnings.map((warning) => (
            <article className={`is-${warning.severity}`} key={warning.title}>
              <strong>Oliver James · {warning.title}</strong>
              <p>{warning.detail}</p>
              <span>{warning.action}</span>
            </article>
          ))}
          <article className="is-medium">
            <strong>Ava Brooks · reading confidence</strong>
            <p>Three recent classroom checks were below her usual range.</p>
            <span>Use a shorter reading passage and check decoding before comprehension.</span>
          </article>
        </div>
      </section>

      <section className="lf-section" id="teacher-communication" aria-labelledby="lf-teacher-comms">
        <div className="lf-section-heading">
          <div>
            <span className="lf-kicker">FAMILY COMMUNICATION</span>
            <h2 id="lf-teacher-comms">Parent messages & appointments</h2>
            <p>Reply to the same conversation visible in the parent portal.</p>
          </div>
          <span className="lf-icon-bubble"><IOSIcon name="support" size={23} /></span>
        </div>
        <div className="lf-comms-grid">
          <div>
            <div className="lf-message-list">
              {state.messages.slice(0, 8).map((item) => (
                <article key={item.id} className={item.from === "Parent" ? "is-parent" : "is-teacher"}>
                  <strong>{item.from}</strong>
                  <p>{item.body}</p>
                  <small>{new Date(item.createdAt).toLocaleString("en-GB")}</small>
                </article>
              ))}
            </div>
            <form
              className="lf-message-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!reply.trim()) return;
                sendPortalMessage("Teacher", reply);
                setReply("");
                markMessagesRead("Teacher");
              }}
            >
              <textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply to the parent…" required />
              <Button type="submit">Send reply</Button>
            </form>
          </div>
          <div className="lf-appointment-list">
            <h3>Appointment requests</h3>
            {state.appointments.length === 0 ? <p>No appointment requests yet.</p> : state.appointments.map((item) => (
              <article key={item.id}>
                <strong>{item.date} · {item.time}</strong>
                <p>{item.reason}</p>
                <span>{item.status}</span>
                {item.status === "Requested" && (
                  <Button type="button" size="sm" variant="outline" onClick={() => confirmAppointment(item.id)}>
                    Confirm
                  </Button>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
