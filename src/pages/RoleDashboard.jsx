import { Link } from "react-router-dom";
import { getAuth, getRole } from "../utils/auth";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import Recommendations from "../components/Recommendations";
import CourseCover from "../components/CourseCover";
import "../Dashboard.css";
import "../Admin.css";
export default function RoleDashboard() {
  const role = getRole();
  const resource = useResource(
    role === "LEARNER" ? "/enrolments" : "/dashboard",
  );
  const insights = useResource("/dashboard/details");
  const descriptions = {
    LEARNER:
      "Build your next skill. Pick up where you left off, see your progress, and explore something new.",
    EDUCATOR:
      "Turn your expertise into practical courses. Follow learner activity and improve your curriculum.",
    ADMIN:
      "A clear view of the learning community, course catalogue, and platform activity.",
  };
  return (
    <div className="dashboard rich-dashboard">
      <header className="dashboard-banner">
        <div className="dashboard-heading">
          <p className="eyebrow">{role.toLowerCase()} dashboard</p>
          <h1>Welcome, {getAuth()?.name}</h1>
          <p>{descriptions[role]}</p>
        </div>
        <Link
          className="primary-button"
          to={
            role === "LEARNER"
              ? "/courses"
              : role === "EDUCATOR"
                ? "/educator/courses/new"
                : "/admin/users"
          }
        >
          {role === "LEARNER"
            ? "Find your next course"
            : role === "EDUCATOR"
              ? "Create course"
              : "Manage users"}
        </Link>
      </header>
      <ResourceState resource={resource} />
      {resource.data && (
        <>
          {role === "LEARNER" ? (
            <LearnerOverview enrolments={resource.data} />
          ) : (
            <>
              <div className="admin-stats-grid">
                {Object.entries(resource.data).map(([key, value]) => (
                  <Stat key={key} label={key} value={value} />
                ))}
              </div>
              <div className="lms-actions">
                <Link
                  className="secondary-button"
                  to={role === "ADMIN" ? "/admin/courses" : "/educator/courses"}
                >
                  Manage courses
                </Link>
                {role === "ADMIN" && (
                  <>
                    <Link
                      className="secondary-button"
                      to="/admin/users?role=EDUCATOR"
                    >
                      View educators
                    </Link>
                    <Link
                      className="secondary-button"
                      to="/admin/users?role=LEARNER"
                    >
                      View learners
                    </Link>
                  </>
                )}
              </div>
              <ManagedCourses role={role} />
            </>
          )}
        </>
      )}
      <ResourceState resource={insights} />
      {insights.data && (
        <>
          <div className="insights-grid">
            <WeeklyActivity weekly={insights.data.weekly} />
            <section className="dash-card activity-panel">
              <p className="eyebrow">
                {role === "LEARNER"
                  ? "Your learning history"
                  : "Community learning"}
              </p>
              <h2>Recently completed lessons</h2>
              {insights.data.recent.length ? (
                <ul className="activity-list">
                  {insights.data.recent.slice(0, 4).map((item, index) => (
                    <li key={index}>
                      <span className="activity-dot">✓</span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>
                          {role !== "LEARNER" && `${item.name} · `}
                          {item.course_title}
                        </p>
                        <time dateTime={item.completed_at}>
                          {formatDate(item.completed_at)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="helper-text">
                  Completed lessons will appear here as learners work through
                  their courses.
                </p>
              )}
            </section>
          </div>
          <div className="insights-grid">
            <section className="dash-card">
              <p className="eyebrow">Learning interests</p>
              <h2>
                {role === "LEARNER" ? "Your topics" : "Course categories"}
              </h2>
              {insights.data.categories.length ? (
                <div className="topic-list">
                  {insights.data.categories.map((c) => (
                    <Link
                      key={c.category}
                      to={"/courses?category=" + encodeURIComponent(c.category)}
                    >
                      <strong>{c.category}</strong>
                      <span>
                        {c.courses} courses · {c.enrolments} enrolments →
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>Explore the catalogue to discover your first topic.</p>
              )}
            </section>
            <section className="dash-card">
              <p className="eyebrow">
                {role === "ADMIN" ? "Growing community" : "Course activity"}
              </p>
              <h2>
                {role === "ADMIN"
                  ? "Recent registrations"
                  : "Recent enrolments"}
              </h2>
              {insights.data.registrations.length ? (
                <ul className="activity-list">
                  {insights.data.registrations.slice(0, 4).map((r, i) => (
                    <li key={i}>
                      <span className="avatar-initial">{r.name[0]}</span>
                      <div>
                        <strong>{r.name}</strong>
                        <p>{r.title || r.role.toLowerCase()}</p>
                        <time dateTime={r.created_at || r.enrolled_at}>
                          {formatDate(r.created_at || r.enrolled_at)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Your enrolment activity will appear here.</p>
              )}
            </section>
          </div>
        </>
      )}
      {role === "LEARNER" && <Recommendations />}
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <article className="dash-card admin-stat-card">
      <p className="dash-kicker">{label}</p>
      <strong className="admin-stat-value">{value}</strong>
    </article>
  );
}
function LearnerOverview({ enrolments }) {
  const finished = enrolments.filter(
    (c) => c.total_lessons && c.progress === 100,
  ).length;
  const completed = enrolments.reduce((n, c) => n + c.completed_lessons, 0),
    total = enrolments.reduce((n, c) => n + c.total_lessons, 0);
  return (
    <>
      <div className="admin-stats-grid">
        <Stat label="Enrolled courses" value={enrolments.length} />
        <Stat label="Completed courses" value={finished} />
        <Stat label="Completed lessons" value={completed} />
        <Stat
          label="Overall progress"
          value={(total ? Math.round((100 * completed) / total) : 0) + "%"}
        />
      </div>
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Make a little progress today</p>
            <h2>Continue learning</h2>
          </div>
          <Link className="text-link" to="/my-learning">
            View all my learning →
          </Link>
        </div>
        {!enrolments.length ? (
          <div className="dash-card">
            <h3>Your learning journey starts here</h3>
            <p>
              Enrol in a course to save lessons, track progress, and receive
              suggestions based on your interests.
            </p>
            <Link className="primary-button" to="/courses">
              Explore courses
            </Link>
          </div>
        ) : (
          <div className="continue-grid">
            {[...enrolments]
              .sort((a, b) => (a.progress === 100) - (b.progress === 100))
              .slice(0, 3)
              .map((c) => (
                <article key={c.id} className="continue-card">
                  <CourseCover compact course={c} />
                  <div className="continue-card-body">
                    <span className="eyebrow">{c.category}</span>
                    <h3>{c.title}</h3>
                    <p>
                      {c.completed_lessons} of {c.total_lessons} lessons
                      completed
                    </p>
                    <progress
                      aria-label={c.title + " progress"}
                      max="100"
                      value={c.progress}
                    />
                    <div className="progress-meta">
                      <strong>{c.progress}%</strong>
                      <span>
                        {c.last_accessed_at
                          ? "Last opened " + formatDate(c.last_accessed_at)
                          : "Ready to start"}
                      </span>
                    </div>
                    {c.status === "PUBLISHED" ? (
                      <Link
                        className="primary-button"
                        to={
                          "/courses/" +
                          c.course_id +
                          (c.last_lesson_id
                            ? "?lesson=" + c.last_lesson_id
                            : "")
                        }
                      >
                        {c.progress === 100
                          ? "Review course"
                          : "Continue learning"}
                      </Link>
                    ) : (
                      <p>This course is temporarily unpublished.</p>
                    )}
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    </>
  );
}
function ManagedCourses({ role }) {
  const courses = useResource(
      role === "ADMIN" ? "/courses" : "/courses?mine=true",
    ),
    enrolments = useResource("/enrolments");
  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Course performance</p>
          <h2>
            {role === "ADMIN" ? "Catalogue overview" : "Your course overview"}
          </h2>
        </div>
        <Link
          className="text-link"
          to={role === "ADMIN" ? "/admin/courses" : "/educator/courses"}
        >
          View all courses →
        </Link>
      </div>
      <ResourceState resource={courses} />
      <ResourceState resource={enrolments} />
      {courses.data && enrolments.data && (
        <>
          {!courses.data.length ? (
            <div className="dash-card">
              <h3>Share what you know</h3>
              <p>
                Create a draft, outline your modules, and add your first lesson.
              </p>
              <Link to="/educator/courses/new">Create course →</Link>
            </div>
          ) : (
            <div className="course-performance-list">
              {courses.data.slice(0, role === "ADMIN" ? 5 : 6).map((c) => {
                const learners = enrolments.data.filter(
                    (e) => e.course_id === c.id,
                  ),
                  average = learners.length
                    ? Math.round(
                        learners.reduce((n, e) => n + e.progress, 0) /
                          learners.length,
                      )
                    : 0;
                return (
                  <article className="performance-row" key={c.id}>
                    <CourseCover compact course={c} />
                    <div>
                      <h3>{c.title}</h3>
                      <p>
                        {c.status === "PUBLISHED" ? "Published" : "Draft"} ·{" "}
                        {c.total_lessons} lessons · {learners.length} enrolments
                      </p>
                    </div>
                    <div className="performance-progress">
                      <strong>{average}%</strong>
                      <small>Average learner progress</small>
                      <progress
                        aria-label={c.title + " average progress"}
                        max="100"
                        value={average}
                      />
                    </div>
                    <div className="performance-links">
                      <Link to={"/educator/courses/" + c.id + "/edit"}>
                        Edit course
                      </Link>
                      <Link to={"/educator/courses/" + c.id + "/learners"}>
                        View learners
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
function WeeklyActivity({ weekly }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 6 + i);
    const key = date.toISOString().slice(0, 10);
    return {
      date,
      lessons:
        weekly.find((d) => String(d.day).slice(0, 10) === key)?.lessons || 0,
    };
  });
  const maximum = Math.max(1, ...days.map((d) => d.lessons)),
    total = days.reduce((n, d) => n + d.lessons, 0);
  return (
    <section className="dash-card weekly-panel">
      <p className="eyebrow">The past seven days · UTC</p>
      <h2>Learning activity</h2>
      <p>
        <strong>{total} lessons completed</strong> in the last seven days
      </p>
      <div
        className="activity-bars"
        role="img"
        aria-label={days
          .map(
            (d) =>
              d.date.toLocaleDateString("en", {
                weekday: "long",
                timeZone: "UTC",
              }) +
              ": " +
              d.lessons +
              " lessons",
          )
          .join(", ")}
      >
        {days.map((d) => (
          <div key={d.date.toISOString()}>
            <strong>{d.lessons}</strong>
            <div className="bar-track">
              <span
                style={{
                  height: `${Math.max(3, (100 * d.lessons) / maximum)}%`,
                }}
              />
            </div>
            <small>
              {d.date.toLocaleDateString("en", {
                weekday: "short",
                timeZone: "UTC",
              })}
            </small>
          </div>
        ))}
      </div>
      <p className="helper-text">
        Calculated from saved lesson completion records.
      </p>
    </section>
  );
}
function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
