import {
  IconArrowUpRight,
  IconBook2,
  IconDeviceDesktop,
  IconSchool,
  IconUsers,
} from "@tabler/icons-react";
import { Link } from "react-router";

import { SchoolBrand } from "@/components/school/portal-shell";
import { SAMPLE_LEARNER } from "@/lib/school";

import "./demo-home.css";

const demoViews = [
  {
    role: "student",
    title: "Student",
    description: "Explore lessons, see homework and mark tasks complete.",
    profile: SAMPLE_LEARNER.name,
    icon: IconBook2,
  },
  {
    role: "parent",
    title: "Parent",
    description: "Follow the sample learner’s school day and shared homework.",
    profile: "James family",
    icon: IconUsers,
  },
  {
    role: "teacher",
    title: "Teacher",
    description: "Create homework and manage the classroom task list.",
    profile: SAMPLE_LEARNER.teacher,
    icon: IconSchool,
  },
];

export function DemoHome() {
  return (
    <div className="school-shell local-demo-home">
      <a className="school-skip-link" href="#demo-content">
        Skip to demo views
      </a>

      <header className="local-demo-home-header">
        <SchoolBrand />
        <span className="local-demo-home-badge">
          <span aria-hidden="true" />
          Local demo
        </span>
      </header>

      <main className="local-demo-home-main" id="demo-content" tabIndex={-1}>
        <div className="local-demo-home-intro">
          <h1>
            A place to learn.
            <span>A place to grow.</span>
          </h1>
          <p>Choose a view and explore a school day together.</p>
        </div>

        <nav className="local-demo-home-views" aria-label="Choose a demo view">
          {demoViews.map(
            ({ role, title, description, profile, icon: Icon }) => (
              <Link
                key={role}
                className={`local-demo-home-card local-demo-home-card--${role}`}
                to={`/${role}`}
              >
                <span className="local-demo-home-icon" aria-hidden="true">
                  <Icon size={27} stroke={1.6} />
                </span>
                <h2>{title}</h2>
                <p>{description}</p>
                <div className="local-demo-home-card-footer">
                  <span>Sample profile: {profile}</span>
                  <IconArrowUpRight size={20} stroke={1.7} aria-hidden="true" />
                </div>
              </Link>
            ),
          )}
        </nav>

        <aside
          className="local-demo-home-note"
          aria-label="About this local demo"
        >
          <IconDeviceDesktop size={21} stroke={1.6} aria-hidden="true" />
          <p>
            <strong>Homework is saved only in this browser.</strong>
            <span>
              All three views share the same classroom tasks. This demo uses
              sample profiles, with no real sign-in or account creation.
            </span>
          </p>
        </aside>
      </main>
    </div>
  );
}
