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

const studentGlassStyles = `
  .student-portal {
    --student-ink: #293b4b;
    --student-muted: #71808d;
    background: radial-gradient(ellipse at 9% 8%, rgba(248, 217, 228, .58), transparent 31%), radial-gradient(ellipse at 87% 18%, rgba(194, 220, 244, .62), transparent 34%), radial-gradient(ellipse at 72% 91%, rgba(215, 237, 220, .58), transparent 36%), linear-gradient(125deg, #f7f8fa 0%, #eef2f6 48%, #f8f3f7 100%);
    color: var(--student-ink);
  }
  .student-portal .portal-sidebar {
    position: sticky;
    isolation: isolate;
    overflow: hidden;
    border-right: 1px solid rgba(255, 255, 255, .82);
    background: linear-gradient(155deg, rgba(255,255,255,.57), rgba(245,248,252,.34) 55%, rgba(242,238,249,.43));
    box-shadow: 12px 0 36px rgba(66, 87, 111, .11), inset -1px 0 rgba(255,255,255,.68);
    backdrop-filter: blur(36px) saturate(180%);
    -webkit-backdrop-filter: blur(36px) saturate(180%);
  }
  .student-portal .portal-sidebar::before {
    position: absolute;
    z-index: 0;
    inset: 0;
    background: linear-gradient(145deg, rgba(255,255,255,.64), transparent 28%, rgba(255,255,255,.12) 60%, rgba(255,255,255,.3));
    content: "";
    pointer-events: none;
  }
  .student-portal .portal-sidebar::after {
    position: absolute;
    z-index: 0;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.34) 48%, rgba(255,255,255,.82));
    content: "";
    pointer-events: none;
  }
  .student-portal .portal-sidebar > * { position: relative; z-index: 1; }
  .student-portal .portal-sidebar,
  .student-portal .portal-sidebar button,
  .student-portal .portal-sidebar a {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .student-portal .brand-mark {
    border: 1px solid rgba(255,255,255,.9);
    background: linear-gradient(145deg, rgba(255,255,255,.9), rgba(248,230,165,.78));
    box-shadow: 0 5px 14px rgba(123, 117, 76, .1);
  }
  .student-portal .profile-card {
    border: 1px solid rgba(255,255,255,.84);
    background: linear-gradient(135deg, rgba(255,255,255,.58), rgba(255,255,255,.28));
    box-shadow: 0 8px 22px rgba(69, 89, 112, .075), inset 0 1px rgba(255,255,255,.9), inset 0 -1px rgba(255,255,255,.22);
    backdrop-filter: blur(24px) saturate(155%);
    -webkit-backdrop-filter: blur(24px) saturate(155%);
  }
  .student-portal .side-nav { margin-top: 25px; gap: 4px; }
  .student-portal .side-link {
    min-height: 40px;
    gap: 11px;
    border: 1px solid transparent;
    color: #56697b;
    font-size: 12px;
    font-weight: 560;
    letter-spacing: -.18px;
    transition: background .18s ease, color .18s ease, box-shadow .18s ease, transform .18s ease;
  }
  .student-portal .side-link svg {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
    stroke-width: 1.65;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .student-portal .side-link:hover,
  .student-portal .side-link:focus-visible {
    transform: translateX(1px);
    border-color: rgba(255,255,255,.68);
    background: linear-gradient(115deg, rgba(255,255,255,.65), rgba(255,255,255,.3));
    box-shadow: inset 0 1px rgba(255,255,255,.98), 0 5px 15px rgba(73,94,115,.075);
    color: #365b79;
  }
  .student-portal .side-link.selected {
    border: 1px solid rgba(255,255,255,.94);
    background: linear-gradient(115deg, rgba(220,242,232,.73), rgba(220,232,251,.62));
    box-shadow: 0 6px 16px rgba(61,105,113,.1), inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(255,255,255,.28);
    color: #316852;
    font-weight: 620;
    backdrop-filter: blur(22px) saturate(175%);
    -webkit-backdrop-filter: blur(22px) saturate(175%);
  }
  .student-portal .sidebar-note {
    border: 1px solid rgba(255,255,255,.86);
    background: linear-gradient(145deg, rgba(255,249,218,.69), rgba(255,237,225,.47));
    box-shadow: 0 10px 26px rgba(117,106,70,.09), inset 0 1px rgba(255,255,255,.98), inset 0 -1px rgba(255,255,255,.32);
    backdrop-filter: blur(28px) saturate(155%);
    -webkit-backdrop-filter: blur(28px) saturate(155%);
  }
  .student-portal .sidebar-note strong { color: #465642; font-size: 11px; letter-spacing: -.12px; }
  .student-portal .sidebar-note p { color: #717864; font-size: 10px; line-height: 1.5; }
  .student-portal .settings-link { color: #687a88; font-size: 12px; }
  .student-portal .settings-link svg { stroke-width: 1.65; }
  .student-portal .sidebar-note {
    border: 1px solid rgba(255,255,255,.76);
    background: linear-gradient(145deg, rgba(255,249,218,.88), rgba(255,237,225,.76));
    box-shadow: 0 9px 23px rgba(117, 106, 70, .08), inset 0 1px rgba(255,255,255,.8);
  }
  .student-portal .portal-main { background: transparent; }
  .student-portal .eyebrow { color: #314455; }
  .student-portal .date-line { color: #82909c; }
  .student-portal .header-tools > div:first-child {
    border: 1px solid rgba(255,255,255,.92);
    background: rgba(255,255,255,.47);
    box-shadow: 0 5px 16px rgba(70,90,112,.06), inset 0 1px rgba(255,255,255,.9);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
  }
  .student-portal .header-tools > div:first-child a { color: #607181; }
  .student-portal .header-tools > div:first-child a:hover { background: rgba(255,255,255,.6); color: #375d78; }
  .student-portal .header-tools > div:first-child a[class*="bg-[#286c52]"] {
    background: linear-gradient(130deg, #507f73, #637da0) !important;
    box-shadow: 0 3px 10px rgba(64,104,121,.22);
    color: white !important;
  }
  .student-portal .icon-button,
  .student-portal .read-aloud {
    border: 1px solid rgba(255,255,255,.94);
    background: rgba(255,255,255,.66);
    box-shadow: 0 5px 16px rgba(70,90,112,.07), inset 0 1px rgba(255,255,255,.9);
    color: #526f84;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  }
  .student-portal .icon-button:hover,
  .student-portal .read-aloud:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(70,90,112,.12); }
  .student-portal .header-profile {
    display: flex;
    align-items: center;
    gap: 9px;
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255,255,255,.72), rgba(255,255,255,.42));
    padding: 5px 10px 5px 5px;
    box-shadow: 0 6px 18px rgba(70,90,112,.08), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(24px) saturate(150%);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
  }
  .student-portal .header-profile .avatar { width: 34px; height: 34px; flex: 0 0 34px; }
  .student-portal .header-profile-copy { display: grid; gap: 3px; }
  .student-portal .header-profile-copy strong { color: #3e5362; font-size: 10px; }
  .student-portal .header-profile-copy span { color: #82909c; font-size: 8px; }
  .student-portal .content-wrap { max-width: 1180px; }
  .student-portal .welcome-banner {
    border: 1px solid rgba(255,255,255,.93);
    background: linear-gradient(112deg, rgba(255,255,255,.72), rgba(229,241,236,.54) 57%, rgba(226,235,247,.56));
    box-shadow: 0 16px 40px rgba(72, 93, 115, .11), inset 0 1px 0 rgba(255,255,255,.98), inset 0 -1px rgba(255,255,255,.25);
    backdrop-filter: blur(34px) saturate(155%);
    -webkit-backdrop-filter: blur(34px) saturate(155%);
  }
  .student-portal .welcome-copy h1 { color: #293d4b; }
  .student-portal .welcome-copy p { color: #687b84; }
  .student-portal .welcome-pills span {
    border: 1px solid rgba(255,255,255,.94);
    background: rgba(255,255,255,.58);
    box-shadow: inset 0 1px rgba(255,255,255,.86);
    color: #4d6e71;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .student-portal .fox-scene { filter: saturate(.9); }
  .student-portal .section-heading h2,
  .student-portal .side-card-title h2 { color: #344858; }
  .student-portal .section-heading p { color: #84919c; }
  .student-portal .text-link { color: #527f77; }
  .student-portal .lesson-card {
    border: 1px solid rgba(255,255,255,.9);
    box-shadow: 0 12px 25px rgba(74, 93, 113, .09), inset 0 1px rgba(255,255,255,.98), inset 0 -1px rgba(255,255,255,.26);
    backdrop-filter: blur(24px) saturate(150%);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
    transition: transform .18s ease, box-shadow .18s ease;
  }
  .student-portal .lesson-card:hover { transform: translateY(-2px); box-shadow: 0 14px 26px rgba(74,93,113,.1), inset 0 1px rgba(255,255,255,.88); }
  .student-portal .lesson-maths { background: linear-gradient(145deg, rgba(255,246,202,.66), rgba(250,231,176,.44)); }
  .student-portal .lesson-english { background: linear-gradient(145deg, rgba(233,243,255,.7), rgba(214,229,248,.48)); }
  .student-portal .lesson-science { background: linear-gradient(145deg, rgba(255,237,227,.7), rgba(248,218,207,.48)); }
  .student-portal .lesson-icon { border: 1px solid rgba(255,255,255,.88); background: rgba(255,255,255,.6); box-shadow: inset 0 1px rgba(255,255,255,.9); color: #577581; }
  .student-portal .up-next { border: 1px solid rgba(255,255,255,.82); background: rgba(255,255,255,.58); color: #89784a; }
  .student-portal .lunch-note { color: #81909a; }
  .student-portal .practice-card,
  .student-portal .growth-card,
  .student-portal .help-card,
  .student-portal .timetable-card {
    border: 1px solid rgba(255,255,255,.94);
    background: linear-gradient(135deg, rgba(255,255,255,.72), rgba(255,255,255,.38));
    box-shadow: 0 14px 32px rgba(70, 90, 111, .09), inset 0 1px 0 rgba(255,255,255,.98), inset 0 -1px rgba(255,255,255,.24);
    backdrop-filter: blur(28px) saturate(150%);
    -webkit-backdrop-filter: blur(28px) saturate(150%);
  }
  .student-portal .featured-task {
    border: 1px solid rgba(255,255,255,.86);
    background: linear-gradient(115deg, rgba(223,241,226,.68), rgba(222,238,234,.44));
    box-shadow: inset 0 1px rgba(255,255,255,.98), inset 0 -1px rgba(255,255,255,.28), 0 5px 14px rgba(78,112,95,.06);
    backdrop-filter: blur(22px) saturate(145%);
    -webkit-backdrop-filter: blur(22px) saturate(145%);
  }
  .student-portal .task-stamp { border: 1px solid rgba(255,255,255,.85); background: rgba(255,246,206,.82); color: #7e794b; }
  .student-portal .start-button { background: linear-gradient(135deg, #4b806f, #587e9b) !important; box-shadow: 0 5px 13px rgba(58,105,109,.2); }
  .student-portal .start-button:hover { background: linear-gradient(135deg, #3f715f, #496d8b) !important; }
  .student-portal .assignment-row { border-bottom-color: rgba(128,145,155,.12); }
  .student-portal .assignment-icon { border: 1px solid rgba(255,255,255,.9); background: rgba(224,237,246,.74); color: #5d7e91; }
  .student-portal .assignment-copy strong { color: #465a69; }
  .student-portal .assignment-copy span { color: #84919c; }
  .student-portal .due-pill { border: 1px solid rgba(255,255,255,.88); background: rgba(244,247,248,.8); color: #758691; }
  .student-portal .row-action { border-color: rgba(255,255,255,.95); background: rgba(255,255,255,.72); box-shadow: 0 3px 9px rgba(68,89,110,.05); color: #55816e; }
  .student-portal .row-action:hover { background: rgba(224,241,227,.86); }
  .student-portal .all-done { border-color: rgba(255,255,255,.9); background: rgba(229,243,227,.74); }
  .student-portal .progress-ring { border-color: rgba(121,178,145,.32); border-left-color: #57947b; border-bottom-color: #668fb0; color: #3d5c61; box-shadow: 0 4px 12px rgba(70,119,107,.08); }
  .student-portal .week-dots > span.done svg { background: rgba(217,239,222,.88); }
  .student-portal .tiny-note { color: #598477; }
  .student-portal .badge-card {
    border: 1px solid rgba(255,255,255,.88);
    background: linear-gradient(125deg, rgba(255,246,208,.7), rgba(255,231,219,.48));
    box-shadow: 0 12px 26px rgba(111,94,61,.09), inset 0 1px rgba(255,255,255,.96), inset 0 -1px rgba(255,255,255,.3);
    backdrop-filter: blur(24px) saturate(145%);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
  }
  .student-portal .help-card > p { color: #778792; }
  .student-portal .ask-button { border-color: rgba(255,255,255,.94) !important; background: rgba(255,255,255,.6) !important; box-shadow: inset 0 1px rgba(255,255,255,.86); color: #557b78 !important; }
  .student-portal .ask-button:hover { background: rgba(235,244,240,.82) !important; }
  .student-portal .timetable-card > p { border-top-color: rgba(128,145,155,.14); color: #758692; }
  .student-portal button:focus-visible,
  .student-portal a:focus-visible { outline-color: #7198b5; }
  @media (max-width: 760px) {
    .student-portal .portal-sidebar { border-bottom: 1px solid rgba(255,255,255,.86); background: rgba(248,250,252,.68); box-shadow: 0 7px 22px rgba(75,93,112,.075); }
    .student-portal .portal-sidebar::after { top: auto; right: 0; bottom: 0; width: 100%; height: 1px; }
    .student-portal .side-nav { margin-top: 11px; }
    .student-portal .header-tools { flex-wrap: wrap; justify-content: flex-end; }
    .student-portal .header-profile { gap: 0; padding: 4px; }
    .student-portal .header-profile-copy { display: none; }
    .student-portal .welcome-banner { overflow: hidden; }
    .student-portal .fox-scene { opacity: .86; }
  }
  @media (prefers-reduced-motion: reduce) {
    .student-portal *, .student-portal *::before, .student-portal *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
  }
`;

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
    <div className={`portal-page min-h-screen text-[#263b31] ${current === "student" ? "student-portal" : ""}`}>
      {current === "student" && <style>{studentGlassStyles}</style>}
      <aside className="portal-sidebar">
        <Link to="/" className="brand-lockup" aria-label="Littleleaf home">
          <span className="brand-mark"><IconLeaf size={21} stroke={2.4} /></span>
          <span><strong>littleleaf</strong><small>A place to grow</small></span>
        </Link>
        {current !== "student" && <div className="profile-card">
          <div className="avatar avatar-student">{current === "teacher" ? "MT" : "OJ"}</div>
          <strong>{name}</strong>
          <span>{subtitle}</span>
        </div>}
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
            {current === "student" && <div className="header-profile"><div className="avatar avatar-student">OJ</div><div className="header-profile-copy"><strong>{name}</strong><span>{subtitle}</span></div></div>}
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
