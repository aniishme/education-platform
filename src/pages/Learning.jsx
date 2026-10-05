import { Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import "../MyLearning.css";
import CourseCover from "../components/CourseCover";
import Recommendations from "../components/Recommendations";
export default function Learning({ summary = false }) {
  const resource = useResource("/enrolments");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  async function leave(id) {
    if (!window.confirm("Leave this course and remove your progress?")) return;
    setBusy(id);
    try {
      await api("/enrolments/" + id, { method: "DELETE" });
      resource.reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(null);
    }
  }
  const courses = resource.data || [];
  const total = courses.reduce((n, c) => n + c.total_lessons, 0);
  const done = courses.reduce((n, c) => n + c.completed_lessons, 0);
  return (
    <section className="my-learning-page">
      <div className="page-heading">
        <p className="eyebrow">Your learning</p>
        <h1>{summary ? "Learning progress" : "My Learning"}</h1>
        <p>
          {done} of {total} lessons completed ·{" "}
          {total ? Math.round((done * 100) / total) : 0}% overall
        </p>
      </div>
      <ResourceState resource={resource} />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {!resource.loading && !resource.error && !courses.length && (
        <p>
          No enrolled courses. <Link to="/courses">Browse the catalogue</Link>.
        </p>
      )}
      <div className="learning-course-list">
        {courses.map((c) => (
          <article className="learning-course-card" key={c.id}>
            <div className="learning-course-main">
              <CourseCover compact course={c} />
              <span className="course-category">{c.category}</span>
              <h2>{c.title}</h2>
              <p>
                {c.status === "PUBLISHED"
                  ? c.subtitle || c.description
                  : "This course is temporarily unpublished."}
              </p>
            </div>
            <div className="learning-course-progress">
              <strong>{c.progress}%</strong>
              <p>
                {c.completed_lessons} of {c.total_lessons} lessons complete
              </p>
              <progress
                aria-label={c.title + " progress"}
                max="100"
                value={c.progress}
              />
              {c.status === "PUBLISHED" && (
                <Link
                  className="learning-continue-button"
                  to={
                    "/courses/" +
                    c.course_id +
                    (c.last_lesson_id ? "?lesson=" + c.last_lesson_id : "")
                  }
                >
                  {c.progress === 100 ? "Review course" : "Continue learning"}
                </Link>
              )}
              <button
                className="learning-leave-button"
                disabled={busy === c.id}
                onClick={() => leave(c.id)}
              >
                Leave course
              </button>
            </div>
          </article>
        ))}
      </div>
      {!summary && <Recommendations />}
    </section>
  );
}
