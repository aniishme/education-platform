import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";
import { getRole } from "../utils/auth";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import CourseCover from "../components/CourseCover";
import StatusBadge from "../components/StatusBadge";
import WorkspaceHeader from "../components/WorkspaceHeader";
export default function CourseManagement() {
  const resource = useResource("/courses?mine=true"),
    [params, setParams] = useSearchParams();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(null);
  const status = params.get("status") || "",
    search = params.get("q") || "",
    all = resource.data || [];
  const courses = all.filter(
    (c) =>
      (!status || c.status === status) &&
      `${c.title} ${c.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  function filter(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  }
  async function remove(id) {
    if (
      !window.confirm(
        "Delete this course, its lessons, enrolments and progress?",
      )
    )
      return;
    setBusy(id);
    setError("");
    try {
      await api("/courses/" + id, { method: "DELETE" });
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <section className="workspace-page">
      <WorkspaceHeader
        eyebrow={
          getRole() === "ADMIN"
            ? "Administration / Catalogue"
            : "Educator studio"
        }
        title="Manage courses"
        description="A home for your expertise. Shape a curriculum, publish your next course, and help learners move forward."
        action={
          <Link
            className="primary-button"
            aria-label="Create course"
            to="/educator/courses/new"
          >
            ＋ Create course
          </Link>
        }
      />
      <div className="workspace-metrics">
        {[
          ["Total courses", all.length, "▣"],
          [
            "Published",
            all.filter((c) => c.status === "PUBLISHED").length,
            "◉",
          ],
          ["Drafts", all.filter((c) => c.status === "DRAFT").length, "✎"],
          [
            "Course enrolments",
            all.reduce((n, c) => n + c.enrolment_count, 0),
            "◎",
          ],
        ].map(([label, value, icon]) => (
          <article key={label}>
            <span className="metric-icon">{icon}</span>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="workspace-toolbar course-manager-toolbar">
        <div className="workspace-tabs" aria-label="Course status">
          {[
            ["", "All courses"],
            ["PUBLISHED", "Published"],
            ["DRAFT", "Drafts"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={status === value ? "active" : ""}
              aria-pressed={status === value}
              onClick={() => filter("status", value)}
            >
              {label}
              <span>
                {value
                  ? all.filter((c) => c.status === value).length
                  : all.length}
              </span>
            </button>
          ))}
        </div>
        <label className="toolbar-search">
          Search your courses
          <input
            type="search"
            value={search}
            placeholder="Find a course or topic…"
            onChange={(e) => filter("q", e.target.value)}
          />
        </label>
      </div>
      <ResourceState resource={resource} />
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {resource.data && !courses.length && (
        <div className="workspace-empty">
          <span>▣</span>
          <h2>
            {all.length
              ? "No matching courses"
              : "Your next course starts here"}
          </h2>
          <p>
            {all.length
              ? "Try another search or status."
              : "Create a draft, outline your modules, and add your first lesson."}
          </p>
          <Link className="primary-button" to="/educator/courses/new">
            Create course
          </Link>
        </div>
      )}
      <div className="studio-course-grid">
        {courses.map((c) => (
          <article className="studio-course-card" key={c.id}>
            <div className="studio-cover">
              <CourseCover course={c} />
              <StatusBadge value={c.status} />
            </div>
            <div className="studio-card-body">
              <span className="studio-category">
                {c.category} · {c.level}
              </span>
              <h2>{c.title}</h2>
              <p className="studio-subtitle">{c.subtitle || c.description}</p>
              <div className="studio-card-stats">
                <div>
                  <strong>{c.total_lessons}</strong>
                  <span>Lessons</span>
                </div>
                <div>
                  <strong>{c.total_sections}</strong>
                  <span>Modules</span>
                </div>
                <div>
                  <strong>{c.enrolment_count}</strong>
                  <span>Enrolments</span>
                </div>
              </div>
              <p className="studio-updated">
                {c.instructor} · Updated{" "}
                {new Date(c.updated_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <div className="studio-card-actions">
                <Link
                  className="primary-button"
                  to={"/educator/courses/" + c.id + "/edit"}
                >
                  Edit course
                </Link>
                <Link
                  className="secondary-button"
                  to={"/educator/courses/" + c.id + "/learners"}
                >
                  Learners & progress
                </Link>
              </div>
              <div className="studio-card-footer">
                <Link to={"/courses/" + c.id}>Preview course ↗</Link>
                <button
                  disabled={busy === c.id}
                  className="delete-link"
                  onClick={() => remove(c.id)}
                >
                  {busy === c.id ? "Deleting…" : "Delete course"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
