import {
  IconArrowUpRight,
  IconBook2,
  IconCalendarWeek,
  IconClipboardCheck,
  IconHeartHandshake,
  IconHelpCircle,
  IconHome2,
  IconLeaf,
  IconLogout,
  IconMenu2,
  IconSchool,
  IconSeedling,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { viewForPath } from "@/lib/portal-navigation";
import { signOut } from "@/lib/portal-session";
import { SAMPLE_LEARNER, SCHOOL_NAME, type PortalRole } from "@/lib/school";
import { IOSIcon, type IOSIconName } from "@/components/school/ios-icons";

import "@/styles/school-portal.css";

const studentNavigation: Array<{ label: string; section: string; iosIcon: IOSIconName }> = [
  { label: "My day", section: "overview", iosIcon: "home" },
  { label: "My lessons", section: "lessons", iosIcon: "book" },
  { label: "My homework", section: "homework", iosIcon: "checklist" },
  { label: "AI companion", section: "ai-companion", iosIcon: "sparkles" },
  { label: "Learning path", section: "learning-path", iosIcon: "sprout" },
  { label: "Reading coach", section: "reading-coach", iosIcon: "volume" },
  { label: "Mastery map", section: "mastery", iosIcon: "trophy" },
  { label: "Rewards", section: "rewards", iosIcon: "sparkles" },
  { label: "Homework help", section: "homework-help", iosIcon: "help" },
  { label: "My portfolio", section: "portfolio", iosIcon: "clipboard" },
  { label: "My timetable", section: "timetable", iosIcon: "calendar" },
  { label: "A helping hand", section: "help", iosIcon: "support" },
];

const parentNavigation = [
  { label: "Family overview", section: "overview", icon: IconHome2 },
  { label: "Parent intelligence", section: "intelligence", icon: IconSeedling },
  { label: "Early alerts", section: "alerts", icon: IconCalendarWeek },
  { label: "Messages", section: "communication", icon: IconHeartHandshake },
  { label: "Homework", section: "homework", icon: IconClipboardCheck },
  { label: "Learning progress", section: "progress", icon: IconSeedling },
  {
    label: "Attendance & results",
    section: "attendance",
    icon: IconCalendarWeek,
  },
  { label: "School updates", section: "people", icon: IconSchool },
  { label: "School support", section: "help", icon: IconHeartHandshake },
];

const teacherNavigation = [
  { label: "Class overview", section: "overview", icon: IconHome2 },
  { label: "AI assistant", section: "teacher-ai", icon: IconSeedling },
  { label: "Early warnings", section: "early-warning", icon: IconCalendarWeek },
  { label: "Family messages", section: "teacher-communication", icon: IconHeartHandshake },
  { label: "Assignments", section: "homework", icon: IconClipboardCheck },
  { label: "My class", section: "people", icon: IconUsers },
];

const portalLabels: Record<PortalRole, string> = {
  student: "Student portal",
  parent: "Parent portal",
  teacher: "Teacher portal",
};

export function SchoolBrand() {
  return (
    <Link className="school-brand" to="/" aria-label={`${SCHOOL_NAME} home`}>
      <span className="school-brand-mark">
        <IOSIcon name="leaf" size={24} />
      </span>
      <span>
        <strong>{SCHOOL_NAME}</strong>
        <small>PRIMARY SCHOOL</small>
      </span>
    </Link>
  );
}

export function PortalShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const role = viewForPath(location.pathname);
  const navigation =
    role === "parent"
      ? parentNavigation
      : role === "teacher"
        ? teacherNavigation
        : studentNavigation;
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [studentTheme, setStudentTheme] = useState<"garden" | "sky" | "sunshine" | "midnight" | "glass">("garden");

  useEffect(() => {
    if (role !== "student") return;
    const saved = window.localStorage.getItem("arndale-academy.student-theme");
    if (saved === "garden" || saved === "sky" || saved === "sunshine" || saved === "midnight" || saved === "glass") {
      setStudentTheme(saved);
    }
  }, [role]);

  function chooseStudentTheme(theme: "garden" | "sky" | "sunshine" | "midnight" | "glass") {
    setStudentTheme(theme);
    try {
      window.localStorage.setItem("arndale-academy.student-theme", theme);
    } catch {
      // The visual change still applies for this session.
    }
  }
  const basePath =
    role === "parent"
      ? "/parent"
      : role === "teacher"
        ? "/teacher"
        : location.pathname === "/student"
          ? "/student"
          : "/";
  const section = location.hash.slice(1) || "overview";

  async function logOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      await signOut();
    } catch {
      setSignOutError("We couldn’t sign you out. Please try again.");
      setSigningOut(false);
    }
  }

  const sidebarContents = (
    <>
      <SchoolBrand />
      <div className="school-nav-heading">
        {role === "student"
          ? "MY LEARNING SPACE"
          : role === "parent"
            ? "HOME & SCHOOL"
            : "CLASSROOM"}
      </div>
      <nav
        aria-label={`${portalLabels[role]} navigation`}
        className="school-nav"
      >
        {navigation.map((item) => {
          const target = item.section;
          const label = item.label;
          const LegacyIcon = "icon" in item ? item.icon : null;
          return (
            <Link
              key={target}
              to={`${basePath}#${target}`}
              className={`school-nav-link${section === target ? " is-active" : ""}`}
              aria-current={section === target ? "location" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {role === "student" && "iosIcon" in item ? (
                <IOSIcon name={item.iosIcon} size={19} />
              ) : LegacyIcon ? (
                <LegacyIcon size={19} stroke={1.65} />
              ) : null}
              <span>{label}</span>
              {section === target && (
                <span className="school-active-dot" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="school-sidebar-note">
        <span className="school-note-icon">
          {role === "student" ? <IOSIcon name="sprout" size={27} /> : <IconSeedling size={28} stroke={1.4} />}
        </span>
        <strong>
          {role === "student" ? "A little every day." : "Better, together."}
        </strong>
        <p>
          {role === "student"
            ? "Small steps make wonderful learning adventures."
            : "Every small moment of support helps a child grow."}
        </p>
      </div>
      <div className="school-sidebar-footer">
        {role !== "teacher" && (
          <Link
            to={`${basePath}#help`}
            className="school-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {role === "student" ? <IOSIcon name="help" size={19} /> : <IconHelpCircle size={20} stroke={1.65} />}
            <span>Need a hand?</span>
          </Link>
        )}
        <button
          className="school-nav-link school-signout"
          onClick={logOut}
          disabled={signingOut}
        >
          {role === "student" ? <IOSIcon name="logout" size={19} /> : <IconLogout size={20} stroke={1.65} />}
          <span>
            {signingOut ? "Signing out…" : "Logout"}
          </span>
        </button>
        <p>Learning with Littleleaf</p>
      </div>
    </>
  );

  return (
    <div className={`school-shell school-${role}${role === "student" ? ` student-theme-${studentTheme}` : ""}`}>
      <a className="school-skip-link" href="#portal-content">
        Skip to dashboard
      </a>
      <aside className="school-sidebar">{sidebarContents}</aside>
      <main className="school-content" id="portal-content" tabIndex={-1}>
        <header className="school-topbar">
          <div className="school-topbar-left">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="school-mobile-menu"
                  aria-label="Open navigation"
                >
                  {role === "student" ? <IOSIcon name="menu" size={20} /> : <IconMenu2 size={21} />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="school-mobile-sheet">
                <SheetTitle className="sr-only">
                  {portalLabels[role]} navigation
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Choose a dashboard section or log out.
                </SheetDescription>
                {sidebarContents}
              </SheetContent>
            </Sheet>
            <div className="school-location">
              <span>{portalLabels[role]}</span>
              <span className="school-location-divider">/</span>
              <strong>
                {navigation.find((item) => item.section === section)?.label ||
                  navigation[0].label}
              </strong>
            </div>
          </div>
          <div className="school-topbar-right">
            {role === "student" && (
              <Button
                type="button"
                variant="ghost"
                className="school-read-aloud-button"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("arndale:read-to-me"))
                }
              >
                <IOSIcon name="volume" size={17} />
                Read to me
              </Button>
            )}
            <span className="school-header-separator" />
            {role === "student" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="school-account school-account-button" type="button">
                    <span className="school-account-avatar" aria-hidden="true">
                      {SAMPLE_LEARNER.initials}
                    </span>
                    <span className="school-account-copy">
                      <strong>{SAMPLE_LEARNER.name}</strong>
                      <small>{SAMPLE_LEARNER.className}</small>
                    </span>
                    <IOSIcon name="chevronDown" size={15} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="school-profile-menu">
                  <DropdownMenuLabel>
                    <span className="school-profile-name">{SAMPLE_LEARNER.name}</span>
                    <span className="school-profile-class">{SAMPLE_LEARNER.className}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="school-theme-label">
                    <IOSIcon name="palette" size={15} /> Dashboard theme
                  </DropdownMenuLabel>
                  {([
                    ["garden", "Garden"],
                    ["sky", "Sky"],
                    ["sunshine", "Sunshine"],
                    ["midnight", "Midnight"],
                    ["glass", "Clear Glass"],
                  ] as const).map(([value, label]) => (
                    <DropdownMenuItem
                      key={value}
                      onSelect={() => chooseStudentTheme(value)}
                      className="school-theme-option"
                    >
                      <span className={`school-theme-swatch is-${value}`} aria-hidden="true" />
                      {label}
                      {studentTheme === value ? <span className="school-theme-selected">Selected</span> : null}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => void logOut()}
                    disabled={signingOut}
                    className="school-profile-logout"
                  >
                    <IOSIcon name="logout" size={16} />
                    {signingOut ? "Logging out…" : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="school-account">
                <span
                  className={`school-account-avatar${role === "parent" ? " is-parent" : ""}`}
                  aria-hidden="true"
                >
                  {role === "teacher" ? "MT" : "JF"}
                </span>
                <span className="school-account-copy">
                  <strong>{role === "teacher" ? SAMPLE_LEARNER.teacher : "James family"}</strong>
                  <small>Sample profile</small>
                </span>
              </div>
            )}
          </div>
        </header>
        {signOutError && (
          <p role="alert" className="school-session-error">
            {signOutError} <button onClick={logOut}>Try again</button>
          </p>
        )}
        <div className="school-page-content">{children}</div>
        <footer className="school-page-footer">
          <span>{SCHOOL_NAME} · A place to grow</span>
          <Link to={role === "teacher" ? "/parent#help" : `${basePath}#help`}>
            School support <IconArrowUpRight size={14} />
          </Link>
        </footer>
      </main>
    </div>
  );
}
