import { Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import CourseCover from "../components/CourseCover";
import Recommendations from "../components/Recommendations";
import WorkspaceHeader from "../components/WorkspaceHeader";
export default function Learning() {
  const resource = useResource("/enrolments"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(null),
    [tab, setTab] = useState("all"),
    [search, setSearch] = useState("");
  const all = resource.data || [],
    completed = all.filter((c) => c.total_lessons > 0 && c.progress === 100),
    inProgress = all.filter((c) => c.completed_lessons > 0 && c.progress < 100),
    notStarted = all.filter((c) => !c.completed_lessons);
  const courses = all.filter(
    (c) =>
      (tab === "all" ||
        (tab === "progress" && c.completed_lessons > 0 && c.progress < 100) ||
        (tab === "completed" && c.total_lessons > 0 && c.progress === 100) ||
        (tab === "new" && !c.completed_lessons)) &&
      `${c.title} ${c.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  async function leave(id) {
    if (!window.confirm("Leave this course and remove your progress?")) return;
    setBusy(id);
    setError("");
    try {
      await api("/enrolments/" + id, { method: "DELETE" });
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }
  const resume = all.find(
    (c) => c.progress < 100 && c.status === "PUBLISHED" && c.last_lesson_id,
  );
  return (
    <section className="workspace-page library-workspace">
      <WorkspaceHeader
        eyebrow="Your personal classroom"
        title="My Learning"
        description="Your courses, ready when you are. Pick up a lesson, explore your library, and keep building your skills."
        action={
          <Link className="secondary-button" to="/courses">
            Explore courses ↗
          </Link>
        }
      />
      {resume && (
        <div className="library-resume">
          <div>
            <span className="eyebrow">Pick up where you left off</span>
            <h2>{resume.title}</h2>
            <p>
              {resume.total_lessons - resume.completed_lessons} lessons left in
              your learning journey
            </p>
          </div>
          <Link
            className="primary-button"
            to={
              "/courses/" +
              resume.course_id +
              "?lesson=" +
              resume.last_lesson_id
            }
          >
            Resume last lesson →
          </Link>
        </div>
      )}
      <div className="workspace-toolbar library-toolbar">
        <div className="workspace-tabs" aria-label="Learning library filters">
          {[
            ["all", "All courses", all.length],
            ["progress", "In progress", inProgress.length],
            ["new", "Not started", notStarted.length],
            ["completed", "Completed", completed.length],
          ].map(([key, label, count]) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>
        <label className="toolbar-search">
          Search my learning
          <input
            type="search"
            placeholder="Find a course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <ResourceState resource={resource} />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {resource.data && !courses.length && (
        <div className="workspace-empty">
          <span>▣</span>
          <h2>
            {all.length
              ? "No courses in this view"
              : "Your classroom is waiting"}
          </h2>
          <p>
            {all.length
              ? "Choose another filter or search to find a course."
              : "Enrol in a course and start your first lesson. Your learning library will grow here."}
          </p>
          <Link className="primary-button" to="/courses">
            Browse the catalogue
          </Link>
        </div>
      )}
      <div className="library-course-grid">
        {courses.map((c) => (
          <article className="library-course-card" key={c.id}>
            <CourseCover course={c} />
            <div className="library-card-body">
              <div className="library-card-tags">
                <span>{c.category}</span>
                <span
                  className={
                    "status-badge " +
                    (c.progress === 100 ? "badge-active" : "badge-draft")
                  }
                >
                  {c.progress === 100
                    ? "Completed"
                    : c.completed_lessons
                      ? "In progress"
                      : "Ready to start"}
                </span>
              </div>
              <h2>{c.title}</h2>
              <p className="library-subtitle">
                {c.status === "PUBLISHED"
                  ? c.subtitle || c.description
                  : "This course is temporarily unpublished."}
              </p>
              <div className="library-progress">
                <div>
                  <strong>{c.progress}%</strong>
                  <span>
                    {c.completed_lessons}/{c.total_lessons} lessons
                  </span>
                </div>
                <progress
                  aria-label={c.title + " progress"}
                  max="100"
                  value={c.progress}
                />
              </div>
              {c.status === "PUBLISHED" && (
                <Link
                  className="primary-button"
                  to={
                    "/courses/" +
                    c.course_id +
                    (c.last_lesson_id ? "?lesson=" + c.last_lesson_id : "")
                  }
                >
                  {c.progress === 100
                    ? "Review course"
                    : c.completed_lessons
                      ? "Continue learning"
                      : "Start learning"}{" "}
                  →
                </Link>
              )}
              <div className="library-card-footer">
                <span>
                  {c.last_accessed_at
                    ? "Opened " +
                      new Date(c.last_accessed_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )
                    : "No lessons opened yet"}
                </span>
                <button
                  className="delete-link"
                  disabled={busy === c.id}
                  onClick={() => leave(c.id)}
                >
                  {busy === c.id ? "Leaving…" : "Leave course"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="library-progress-link">
        <div>
          <h3>See how far you've come</h3>
          <p>
            Explore your completion history, activity trends, and module
            progress.
          </p>
        </div>
        <Link className="secondary-button" to="/progress">
          View My Progress →
        </Link>
      </div>
      <Recommendations />
    </section>
  );
}
