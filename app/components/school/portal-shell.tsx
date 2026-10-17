import {
  IconArrowUpRight,
  IconBook2,
  IconCalendarWeek,
  IconChevronDown,
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
import { useState, type ReactNode } from "react";
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
import { isLocalDemo, signOut } from "@/lib/portal-session";
import { SAMPLE_LEARNER, SCHOOL_NAME, type PortalRole } from "@/lib/school";

import "@/styles/school-portal.css";

const studentNavigation = [
  { label: "My day", section: "overview", icon: IconHome2 },
  { label: "My lessons", section: "lessons", icon: IconBook2 },
  { label: "My homework", section: "homework", icon: IconClipboardCheck },
  { label: "My progress", section: "progress", icon: IconSeedling },
  { label: "My timetable", section: "timetable", icon: IconCalendarWeek },
  { label: "A helping hand", section: "help", icon: IconHeartHandshake },
];

const parentNavigation = [
  { label: "Family overview", section: "overview", icon: IconHome2 },
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
        <IconLeaf size={25} stroke={1.7} />
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
        {navigation.map(({ label, section: target, icon: Icon }) => (
          <Link
            key={target}
            to={`${basePath}#${target}`}
            className={`school-nav-link${section === target ? " is-active" : ""}`}
            aria-current={section === target ? "location" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <Icon size={20} stroke={1.65} />
            <span>{label}</span>
            {section === target && (
              <span className="school-active-dot" aria-hidden="true" />
            )}
          </Link>
        ))}
      </nav>
      <div className="school-sidebar-note">
        <span className="school-note-icon">
          <IconSeedling size={28} stroke={1.4} />
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
            <IconHelpCircle size={20} stroke={1.65} />
            <span>Need a hand?</span>
          </Link>
        )}
        <button
          className="school-nav-link school-signout"
          onClick={logOut}
          disabled={signingOut}
        >
          <IconLogout size={20} stroke={1.65} />
          <span>
            {isLocalDemo
              ? signingOut
                ? "Opening demo home…"
                : "Demo home"
              : signingOut
                ? "Signing out…"
                : "Sign out"}
          </span>
        </button>
        <p>Learning with Littleleaf</p>
      </div>
    </>
  );

  return (
    <div className={`school-shell school-${role}`}>
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
                  <IconMenu2 size={21} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="school-mobile-sheet">
                <SheetTitle className="sr-only">
                  {portalLabels[role]} navigation
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {isLocalDemo
                    ? "Choose a dashboard section or return to the demo home."
                    : "Choose a dashboard section or sign out."}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="school-view-switch">
                  Switch view <IconChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Classroom preview</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/student">
                    <IconBook2 size={16} /> Student dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/parent">
                    <IconUsers size={16} /> Parent dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/teacher">
                    <IconSchool size={16} /> Teacher dashboard
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="school-header-separator" />
            <div className="school-account">
              <span
                className={`school-account-avatar${role === "parent" ? " is-parent" : ""}`}
                aria-hidden="true"
              >
                {role === "teacher"
                  ? "MT"
                  : role === "parent"
                    ? "JF"
                    : SAMPLE_LEARNER.initials}
              </span>
              <span className="school-account-copy">
                <strong>
                  {role === "teacher"
                    ? SAMPLE_LEARNER.teacher
                    : role === "parent"
                      ? "James family"
                      : SAMPLE_LEARNER.name}
                </strong>
                <small>Sample profile</small>
              </span>
            </div>
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
