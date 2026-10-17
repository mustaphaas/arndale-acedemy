import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import {
  IconArrowRight,
  IconBell,
  IconBook,
  IconBooks,
  IconCalendar,
  IconCheck,
  IconClipboardCheck,
  IconClock,
  IconHeart,
  IconHome,
  IconLeaf,
  IconMessageCircle,
  IconPencil,
  IconPlus,
  IconSchool,
  IconSettings,
  IconSparkles,
  IconTrash,
  IconTrophy,
  IconUsers,
  IconVolume,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

const links = [
  { label: "My day", href: "/", icon: IconHome },
  { label: "My lessons", href: "/#lessons", icon: IconBook },
  { label: "Homework", href: "/#homework", icon: IconPencil, badge: "2" },
  { label: "My progress", href: "/#progress", icon: IconLeaf },
  { label: "My backpack", href: "/#homework", icon: IconSchool },
  { label: "Messages", href: "/#help", icon: IconMessageCircle, badge: "1" },
];

type Assignment = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  completed: boolean;
};

function RoleLinks({ current }: { current: "student" | "teacher" | "parent" }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[#dce8db] bg-white/80 p-1 shadow-sm">
      {([
        ["student", "Student", "/"],
        ["teacher", "Teacher", "/teacher"],
        ["parent", "Parent", "/parent"],
      ] as const).map(([role, label, href]) => (
        <Link
          key={role}
          to={href}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${current === role ? "bg-[#286c52] text-white shadow-sm" : "text-[#627267] hover:bg-[#f0f5ed] hover:text-[#25553f]"}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

function PortalFrame({
  current,
  children,
  name,
  subtitle,
}: {
  current: "student" | "teacher" | "parent";
  children: React.ReactNode;
  name: string;
  subtitle: string;
}) {
  return (
    <div className="portal-page min-h-screen text-[#263b31]">
      <aside className="portal-sidebar">
        <Link to="/" className="brand-lockup" aria-label="Littleleaf home">
          <span className="brand-mark"><IconLeaf size={21} stroke={2.4} /></span>
          <span><strong>littleleaf</strong><small>A place to grow</small></span>
        </Link>
        <div className="profile-card">
          <div className="avatar avatar-student">{current === "student" ? "OJ" : current === "teacher" ? "MT" : "OJ"}</div>
          <strong>{name}</strong>
          <span>{subtitle}</span>
        </div>
        {current === "student" ? (
          <nav className="side-nav" aria-label="Student navigation">
            {links.map(({ label, href, icon: Icon, badge }, index) => (
              <a key={label} href={href} className={`side-link ${index === 0 ? "selected" : ""}`}>
                <Icon size={18} stroke={1.8} />
                <span>{label}</span>
                {badge && <small>{badge}</small>}
              </a>
            ))}
          </nav>
        ) : (
          <nav className="side-nav" aria-label={`${current} navigation`}>
            <a href="#overview" className="side-link selected"><IconHome size={18} /><span>Overview</span></a>
            <a href="#homework" className="side-link"><IconClipboardCheck size={18} /><span>Assignments</span></a>
            <a href="#people" className="side-link"><IconUsers size={18} /><span>{current === "teacher" ? "My class" : "School updates"}</span></a>
            <a href="#help" className="side-link"><IconMessageCircle size={18} /><span>Messages</span></a>
          </nav>
        )}
        <div className="sidebar-note">
          <span className="note-sun">✳</span>
          <strong>{current === "student" ? "A little every day!" : "Growing together"}</strong>
          <p>{current === "student" ? "Small steps make big learning adventures." : "A brighter school day starts with a little connection."}</p>
          <span className="note-flower">✿</span>
        </div>
        <a className="side-link settings-link" href="#help"><IconSettings size={18} /><span>Settings</span></a>
      </aside>
      <main className="portal-main">
        <header className="portal-header">
          <div>
            <p className="eyebrow">{current === "student" ? "My day" : current === "teacher" ? "Teacher dashboard" : "Family dashboard"}</p>
            <p className="date-line">Wednesday, 21 October</p>
          </div>
          <div className="header-tools">
            <RoleLinks current={current} />
            <button className="icon-button" aria-label="Notifications"><IconBell size={18} /><i /></button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function AssignmentRows({ assignments, onComplete, canComplete = false, onDelete }: {
  assignments: Assignment[];
  onComplete?: (assignment: Assignment) => void;
  canComplete?: boolean;
  onDelete?: (assignment: Assignment) => void;
}) {
  if (!assignments.length) return <p className="empty-message">Nothing here just yet. Your next little adventure is on its way.</p>;
  return <div className="assignment-list">{assignments.map((assignment) => (
    <div className={`assignment-row ${assignment.completed ? "is-complete" : ""}`} key={assignment.id}>
      <span className="assignment-icon"><IconBook size={17} /></span>
      <div className="assignment-copy"><strong>{assignment.title}</strong><span>{assignment.subject} · {assignment.description || `Due ${assignment.dueDate}`}</span></div>
      <span className="due-pill">{assignment.completed ? "Done" : assignment.dueDate}</span>
      {canComplete && !assignment.completed && onComplete && <button onClick={() => onComplete(assignment)} className="row-action" aria-label={`Complete ${assignment.title}`}><IconCheck size={17} /></button>}
      {onDelete && <button onClick={() => onDelete(assignment)} className="row-action row-delete" aria-label={`Remove ${assignment.title}`}><IconTrash size={16} /></button>}
    </div>
  ))}</div>;
}

export function StudentDashboard() {
  const { data } = useActionQuery("list-assignments", {});
  const assignments = (data ?? []) as Assignment[];
  const updateAssignment = useActionMutation("update-assignment");
  const [speaking, setSpeaking] = useState(false);
  const nextTask = assignments.find((assignment) => !assignment.completed);
  const completedCount = assignments.filter((assignment) => assignment.completed).length;

  function readPage() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance("Good morning, Oliver! You have three lessons today and two tasks to try. Have a wonderful day!");
    message.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(message);
  }

  return <PortalFrame current="student" name="Oliver James" subtitle="Year 3 · Willow class">
    <div className="content-wrap">
      <section className="welcome-banner" id="overview">
        <div className="welcome-copy">
          <span className="welcome-kicker"><IconSparkles size={15} /> A fresh page awaits</span>
          <h1>Good morning, Oliver!</h1>
          <p>A new day, a new little adventure. Let’s grow!</p>
          <div className="welcome-pills"><span><IconBook size={14} /> 3 lessons today</span><span><IconPencil size={14} /> {assignments.filter((item) => !item.completed).length} tasks to try</span></div>
        </div>
        <div className="fox-scene" aria-hidden="true"><span className="sun-dot" /><span className="fox">🦊</span><span className="pencil-plant">✎</span><span className="grass grass-one">✿</span><span className="grass grass-two">❋</span></div>
        <button className="read-aloud" onClick={readPage}><IconVolume size={16} /> {speaking ? "Reading…" : "Read to me"}</button>
      </section>
      <div className="dashboard-grid">
        <div className="primary-column">
          <div className="section-heading" id="lessons"><div><h2>Today’s lessons</h2><p>Your Wednesday learning plan</p></div><a className="text-link" href="#timetable">My timetable <IconArrowRight size={15} /></a></div>
          <div className="lesson-grid">
            <article className="lesson-card lesson-maths"><span className="lesson-icon"><IconClipboardCheck size={19} /></span><span className="up-next">UP NEXT</span><h3>Maths</h3><p>Fun with fractions</p><span className="lesson-time"><IconClock size={14} /> 9:00 – 9:45</span></article>
            <article className="lesson-card lesson-english"><span className="lesson-icon"><IconBook size={19} /></span><h3>English</h3><p>Story explorers</p><span className="lesson-time"><IconClock size={14} /> 10:00 – 10:45</span></article>
            <article className="lesson-card lesson-science"><span className="lesson-icon"><IconLeaf size={19} /></span><h3>Science</h3><p>How plants grow</p><span className="lesson-time"><IconClock size={14} /> 11:15 – 12:00</span></article>
          </div>
          <p className="lunch-note"><IconCalendar size={15} /> Then it’s time for lunch and a little play! · 12:00</p>
          <section className="practice-card" id="homework">
            <div className="section-heading practice-heading"><div><h2>A little practice</h2><p>One small task at a time. You’ve got this!</p></div><a className="text-link" href="#assignment-list">All homework <IconArrowRight size={15} /></a></div>
            {nextTask ? <div className="featured-task">
              <div className="task-topline"><span><IconSparkles size={14} /> YOUR NEXT TASK</span><span>Due {nextTask.dueDate}</span></div>
              <div className="featured-task-body"><span className="task-stamp"><IconClipboardCheck size={21} /></span><div><h3>{nextTask.title}</h3><p>{nextTask.subject} · {nextTask.description || "A little practice makes a big difference"}</p></div><Button className="start-button" onClick={() => updateAssignment.mutate({ id: nextTask.id, completed: true })} disabled={updateAssignment.isPending}>Let’s start <IconArrowRight size={16} /></Button></div>
            </div> : <div className="all-done"><span><IconCheck size={18} /></span><div><strong>All done for now!</strong><p>Lovely work, Oliver. Keep that bright mind growing.</p></div></div>}
            <div id="assignment-list"><AssignmentRows assignments={assignments.filter((assignment) => assignment.id !== nextTask?.id)} canComplete onComplete={(assignment) => updateAssignment.mutate({ id: assignment.id, completed: true })} /></div>
          </section>
        </div>
        <aside className="right-column">
          <section className="growth-card" id="progress"><div className="side-card-title"><h2>Look at you grow!</h2><IconLeaf size={19} /></div><div className="growth-content"><div className="progress-ring"><span>8/10</span></div><div><strong>This week</strong><p>{Math.min(8 + completedCount, 10)} activities finished. Just 2 more to your goal!</p></div></div><div className="week-dots">{["M", "T", "W", "T", "F"].map((day, index) => <span className={index < 3 + completedCount ? "done" : ""} key={`${day}-${index}`}><IconCheck size={13} /><small>{day}</small></span>)}</div><p className="tiny-note">Every little step counts.</p></section>
          <section className="badge-card"><div className="badge-medal"><IconTrophy size={24} /></div><div><span className="badge-kicker">✦ NEW BADGE!</span><h3>Brilliant bookworm</h3><p>You read 5 stories. Keep exploring!</p></div></section>
          <section className="help-card" id="help"><div className="side-card-title"><h2>A helping hand</h2><IconHeart size={18} /></div><div className="teacher-mini"><span className="teacher-avatar">MT</span><div><strong>Ms. Taylor</strong><small>Your class teacher</small></div></div><p>A bit stuck? That’s okay. Ask a question, big or small.</p><button className="ask-button" onClick={() => window.alert("Ms. Taylor will be ready to help you soon!")}>Ask my teacher <IconMessageCircle size={15} /></button></section>
          <section className="timetable-card" id="timetable"><div className="side-card-title"><h2>Coming up</h2><IconCalendar size={18} /></div><p><strong>12:00</strong><span>Lunch & play</span></p><p><strong>1:00</strong><span>Art with Mr. Fox</span></p><p><strong>2:15</strong><span>Story circle</span></p></section>
        </aside>
      </div>
    </div>
  </PortalFrame>;
}

export function TeacherDashboard() {
  const { data } = useActionQuery("list-assignments", {});
  const assignments = (data ?? []) as Assignment[];
  const createAssignment = useActionMutation("create-assignment");
  const deleteAssignment = useActionMutation("delete-assignment");
  const updateAssignment = useActionMutation("update-assignment");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Maths");
  const [description, setDescription] = useState("");

  function addAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    createAssignment.mutate({ title, subject, description, dueDate: "Friday" }, { onSuccess: () => { setTitle(""); setDescription(""); } });
  }

  const pendingCount = assignments.filter((assignment) => !assignment.completed).length;
  return <PortalFrame current="teacher" name="Ms. Taylor" subtitle="Year 3 · Willow class">
    <div className="content-wrap role-content" id="overview">
      <section className="role-welcome"><div><span className="welcome-kicker"><IconLeaf size={15} /> WILLOW CLASS · WEDNESDAY</span><h1>A lovely day to learn, Ms. Taylor.</h1><p>Your class is ready for today’s little adventures.</p></div><div className="role-illustration">🌱</div></section>
      <div className="stat-grid"><article className="stat-card"><span className="stat-icon stat-green"><IconUsers size={20} /></span><span>Students in class</span><strong>24</strong><small>Willow class</small></article><article className="stat-card"><span className="stat-icon stat-yellow"><IconClipboardCheck size={20} /></span><span>Open assignments</span><strong>{pendingCount}</strong><small>Ready for your learners</small></article><article className="stat-card"><span className="stat-icon stat-blue"><IconCheck size={20} /></span><span>Completed today</span><strong>{assignments.length - pendingCount}</strong><small>Great effort so far</small></article></div>
      <div className="role-grid">
        <section className="role-panel" id="homework"><div className="section-heading"><div><h2>Class assignments</h2><p>Keep learning moving, one task at a time.</p></div><span className="count-chip">{assignments.length} total</span></div><AssignmentRows assignments={assignments} onComplete={(assignment) => updateAssignment.mutate({ id: assignment.id, completed: true })} onDelete={(assignment) => deleteAssignment.mutate({ id: assignment.id })} /></section>
        <section className="role-panel composer-panel"><div className="side-card-title"><h2>Give them a new task</h2><IconPlus size={18} /></div><p className="panel-intro">Add a little challenge for the class.</p><form className="assignment-form" onSubmit={addAssignment}><label>Task name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Nature detectives" required /></label><label>Subject<select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Maths</option><option>English</option><option>Science</option><option>Art</option></select></label><label>What should they do?<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short, friendly description" rows={3} /></label><Button className="start-button form-submit" type="submit" disabled={createAssignment.isPending}><IconPlus size={16} /> Add assignment</Button></form></section>
      </div>
      <section className="role-panel class-panel" id="people"><div className="section-heading"><div><h2>Your class at a glance</h2><p>Small wins worth celebrating today.</p></div><a href="#homework" className="text-link">View class <IconArrowRight size={15} /></a></div><div className="student-chips"><span><i className="student-dot dot-mint" /> Oliver James <strong>On track</strong></span><span><i className="student-dot dot-peach" /> Ava Brooks <strong>Needs a hand</strong></span><span><i className="student-dot dot-blue" /> Noah Patel <strong>On track</strong></span><span><i className="student-dot dot-yellow" /> Mia Chen <strong>On track</strong></span></div></section>
    </div>
  </PortalFrame>;
}

export function ParentDashboard() {
  const { data } = useActionQuery("list-assignments", {});
  const assignments = (data ?? []) as Assignment[];
  const done = assignments.filter((assignment) => assignment.completed).length;
  return <PortalFrame current="parent" name="Oliver’s family" subtitle="Parent account · Willow class">
    <div className="content-wrap role-content" id="overview">
      <section className="role-welcome parent-welcome"><div><span className="welcome-kicker"><IconHeart size={15} /> A LITTLE LEARNING GOES A LONG WAY</span><h1>Good morning, James family.</h1><p>Here’s Oliver’s school day, all in one happy place.</p></div><div className="role-illustration">☀️</div></section>
      <div className="family-summary"><div className="family-profile"><div className="avatar avatar-student">OJ</div><div><span>YOUR LEARNER</span><h2>Oliver James</h2><p>Year 3 · Willow class</p></div></div><div className="summary-progress"><div className="progress-ring"><span>{done}/{assignments.length}</span></div><div><strong>Homework progress</strong><p>Tasks completed this week</p></div></div></div>
      <div className="role-grid parent-grid">
        <section className="role-panel" id="homework"><div className="section-heading"><div><h2>Oliver’s homework</h2><p>A little practice at home makes a big difference.</p></div><span className="count-chip">{assignments.length - done} to do</span></div><AssignmentRows assignments={assignments} /></section>
        <section className="role-panel updates-panel" id="people"><div className="side-card-title"><h2>From Willow class</h2><IconSchool size={18} /></div><article className="update-note"><span className="update-icon"><IconBooks size={17} /></span><div><strong>Our reading adventure</strong><p>We’re exploring new story worlds this week. Ask Oliver which character is their favorite!</p><small>Today · Ms. Taylor</small></div></article><article className="update-note"><span className="update-icon update-yellow"><IconCalendar size={17} /></span><div><strong>Forest school next Friday</strong><p>Please bring a warm coat and wellies for our outdoor learning morning.</p><small>Yesterday · School office</small></div></article></section>
      </div>
      <section className="role-panel teacher-contact" id="help"><div className="teacher-mini"><span className="teacher-avatar">MT</span><div><strong>Need a hand?</strong><small>Ms. Taylor · Oliver’s class teacher</small></div></div><p>Questions about Oliver’s learning? We’re here to help.</p><Button className="ask-button" onClick={() => window.alert("Your message to Ms. Taylor is ready to send.")}>Message the teacher <IconMessageCircle size={15} /></Button></section>
    </div>
  </PortalFrame>;
}
