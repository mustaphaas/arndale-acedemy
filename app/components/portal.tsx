import { useActionMutation, useActionQuery } from "@/lib/assignment-hooks";
import {
  IconArrowRight,
  IconBook,
  IconCheck,
  IconClipboardCheck,
  IconLeaf,
  IconPlus,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { Assignment } from "@/lib/school";
import { TeacherAIHub } from "@/components/school/learning-features";
import { TeacherStudentWorkflows } from "@/components/school/student-experience";

function AssignmentRows({
  assignments,
  onComplete,
  canComplete = false,
  onDelete,
}: {
  assignments: Assignment[];
  onComplete?: (assignment: Assignment) => void;
  canComplete?: boolean;
  onDelete?: (assignment: Assignment) => void;
}) {
  if (!assignments.length)
    return (
      <p className="empty-message">
        Nothing here just yet. Your next little adventure is on its way.
      </p>
    );
  return (
    <div className="assignment-list">
      {assignments.map((assignment) => (
        <div
          className={`assignment-row ${assignment.completed ? "is-complete" : ""}`}
          key={assignment.id}
        >
          <span className="assignment-icon">
            <IconBook size={17} />
          </span>
          <div className="assignment-copy">
            <strong>{assignment.title}</strong>
            <span>
              {assignment.subject} ·{" "}
              {assignment.description || `Due ${assignment.dueDate}`}
            </span>
          </div>
          <span className="due-pill">
            {assignment.completed ? "Done" : assignment.dueDate}
          </span>
          {canComplete && !assignment.completed && onComplete && (
            <button
              onClick={() => onComplete(assignment)}
              className="row-action"
              aria-label={`Complete ${assignment.title}`}
            >
              <IconCheck size={17} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(assignment)}
              className="row-action row-delete"
              aria-label={`Remove ${assignment.title}`}
            >
              <IconTrash size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
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

  function addAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    createAssignment.mutate(
      { title, subject, description, dueDate: "Friday" },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
        },
      },
    );
  }

  const pendingCount = assignments.filter(
    (assignment) => !assignment.completed,
  ).length;
  return (
    <>
      <div className="content-wrap role-content" id="overview">
        <section className="role-welcome">
          <div>
            <span className="welcome-kicker">
              <IconLeaf size={15} /> WILLOW CLASS · WEDNESDAY
            </span>
            <h1>A lovely day to learn, Ms. Taylor.</h1>
            <p>Your class is ready for today’s little adventures.</p>
          </div>
          <div className="role-illustration">🌱</div>
        </section>
        <div className="stat-grid">
          <article className="stat-card">
            <span className="stat-icon stat-green">
              <IconUsers size={20} />
            </span>
            <span>Students in class</span>
            <strong>24</strong>
            <small>Willow class</small>
          </article>
          <article className="stat-card">
            <span className="stat-icon stat-yellow">
              <IconClipboardCheck size={20} />
            </span>
            <span>Open assignments</span>
            <strong>{pendingCount}</strong>
            <small>Ready for your learners</small>
          </article>
          <article className="stat-card">
            <span className="stat-icon stat-blue">
              <IconCheck size={20} />
            </span>
            <span>Completed today</span>
            <strong>{assignments.length - pendingCount}</strong>
            <small>Great effort so far</small>
          </article>
        </div>
        <div className="role-grid">
          <section className="role-panel" id="homework">
            <div className="section-heading">
              <div>
                <h2>Class assignments</h2>
                <p>Keep learning moving, one task at a time.</p>
              </div>
              <span className="count-chip">{assignments.length} total</span>
            </div>
            <AssignmentRows
              assignments={assignments}
              onComplete={(assignment) =>
                updateAssignment.mutate({ id: assignment.id, completed: true })
              }
              onDelete={(assignment) =>
                deleteAssignment.mutate({ id: assignment.id })
              }
            />
          </section>
          <section className="role-panel composer-panel">
            <div className="side-card-title">
              <h2>Give them a new task</h2>
              <IconPlus size={18} />
            </div>
            <p className="panel-intro">Add a little challenge for the class.</p>
            <form className="assignment-form" onSubmit={addAssignment}>
              <label>
                Task name
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Nature detectives"
                  required
                />
              </label>
              <label>
                Subject
                <select
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                >
                  <option>Maths</option>
                  <option>English</option>
                  <option>Science</option>
                  <option>Art</option>
                </select>
              </label>
              <label>
                What should they do?
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="A short, friendly description"
                  rows={3}
                />
              </label>
              <Button
                className="start-button form-submit"
                type="submit"
                disabled={createAssignment.isPending}
              >
                <IconPlus size={16} /> Add assignment
              </Button>
            </form>
          </section>
        </div>
        <section className="role-panel class-panel" id="people">
          <div className="section-heading">
            <div>
              <h2>Your class at a glance</h2>
              <p>Small wins worth celebrating today.</p>
            </div>
            <a href="#homework" className="text-link">
              View class <IconArrowRight size={15} />
            </a>
          </div>
          <div className="student-chips">
            <span>
              <i className="student-dot dot-mint" /> Oliver James{" "}
              <strong>On track</strong>
            </span>
            <span>
              <i className="student-dot dot-peach" /> Ava Brooks{" "}
              <strong>Needs a hand</strong>
            </span>
            <span>
              <i className="student-dot dot-blue" /> Noah Patel{" "}
              <strong>On track</strong>
            </span>
            <span>
              <i className="student-dot dot-yellow" /> Mia Chen{" "}
              <strong>On track</strong>
            </span>
          </div>
        </section>
        <TeacherAIHub assignments={assignments} />
        <TeacherStudentWorkflows />
      </div>
    </>
  );
}
