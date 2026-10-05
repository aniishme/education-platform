import { Link } from "react-router-dom";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import WorkspaceHeader from "../components/WorkspaceHeader";
export default function Progress() {
  const enrolments = useResource("/enrolments"),
    details = useResource("/learning/progress");
  const courses = enrolments.data || [],
    completed = courses.reduce((n, c) => n + c.completed_lessons, 0),
    total = courses.reduce((n, c) => n + c.total_lessons, 0),
    percentage = total ? Math.round((100 * completed) / total) : 0;
  const finished = courses.filter(
    (c) => c.total_lessons > 0 && c.progress === 100,
  );
  const activity = details.data?.activity || [];
  const days = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 27 + i);
    const key = date.toISOString().slice(0, 10);
    return {
      date,
      key,
      count: activity.find((a) => a.day === key)?.lessons || 0,
    };
  });
  const week = days.slice(-7).reduce((n, d) => n + d.count, 0),
    activeDays = days.filter((d) => d.count > 0).length;
  const categories = [...new Set(courses.map((c) => c.category))].map(
    (category) => {
      const subset = courses.filter((c) => c.category === category);
      return {
        category,
        total: subset.reduce((n, c) => n + c.total_lessons, 0),
        done: subset.reduce((n, c) => n + c.completed_lessons, 0),
      };
    },
  );
  return (
    <section className="workspace-page progress-workspace">
      <WorkspaceHeader
        eyebrow="Your learning, in perspective"
        title="My Progress"
        description="Measure the skills you're building. See your completion history, learning activity, and progress through each module."
        action={
          <Link className="secondary-button" to="/my-learning">
            Go to My Learning →
          </Link>
        }
      />
      <ResourceState resource={enrolments} />
      <ResourceState resource={details} />
      {enrolments.data && details.data && (
        <>
          {!courses.length ? (
            <div className="workspace-empty">
              <span>◉</span>
              <h2>A fresh start, full of possibility</h2>
              <p>
                Complete your first lesson to start building your learning
                history.
              </p>
              <Link className="primary-button" to="/courses">
                Find your first course
              </Link>
            </div>
          ) : (
            <>
              <div className="progress-overview">
                <article className="progress-overall workspace-panel">
                  <div
                    className="completion-ring"
                    style={{ "--completion": percentage + "%" }}
                    role="img"
                    aria-label={`${percentage}% overall lesson completion`}
                  >
                    <div>
                      <strong>{percentage}%</strong>
                      <span>Overall completion</span>
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow">Every lesson adds up</p>
                    <h2>{completed} lessons completed</h2>
                    <p>
                      {total - completed} lessons remaining across{" "}
                      {courses.length} enrolled courses.
                    </p>
                    <small>
                      Weighted by lesson count across your current enrolments.
                    </small>
                  </div>
                </article>
                <div className="progress-stat-stack">
                  <article>
                    <span>✓</span>
                    <div>
                      <strong>{finished.length}</strong>
                      <p>Courses completed</p>
                    </div>
                  </article>
                  <article>
                    <span>↗</span>
                    <div>
                      <strong>{week}</strong>
                      <p>Lessons in the last 7 days</p>
                    </div>
                  </article>
                  <article>
                    <span>◷</span>
                    <div>
                      <strong>{activeDays}</strong>
                      <p>Active days in the last 28 days</p>
                    </div>
                  </article>
                </div>
              </div>
              <section className="workspace-panel activity-insights">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Small steps, lasting skills</p>
                    <h2>28-day learning activity</h2>
                    <p>
                      {days.reduce((n, d) => n + d.count, 0)} lessons completed
                      · UTC calendar days
                    </p>
                  </div>
                  <span className="panel-label">Saved completion records</span>
                </div>
                <div
                  className="completion-calendar"
                  role="img"
                  aria-label={days
                    .map((d) => `${d.key}: ${d.count} lessons`)
                    .join(", ")}
                >
                  {days.map((d) => (
                    <div
                      key={d.key}
                      className={
                        "calendar-day intensity-" +
                        (d.count === 0
                          ? 0
                          : d.count < 2
                            ? 1
                            : d.count < 4
                              ? 2
                              : 3)
                      }
                      title={
                        d.date.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        }) +
                        ": " +
                        d.count +
                        " lessons"
                      }
                    >
                      <small>{d.date.getUTCDate()}</small>
                      <strong>{d.count || "·"}</strong>
                    </div>
                  ))}
                </div>
                <div className="calendar-caption">
                  <span>
                    {days[0].date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}{" "}
                    —{" "}
                    {days[27].date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>
                  <span>
                    Less <i className="intensity-0" />
                    <i className="intensity-1" />
                    <i className="intensity-2" />
                    <i className="intensity-3" /> More
                  </span>
                </div>
              </section>
              <div className="progress-detail-grid">
                <section className="workspace-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Know where you stand</p>
                      <h2>Course & module breakdown</h2>
                    </div>
                  </div>
                  <div className="progress-course-breakdown">
                    {courses.map((c) => (
                      <details key={c.id} className="progress-course-detail">
                        <summary>
                          <span
                            className={
                              "breakdown-symbol " +
                              (c.progress === 100 ? "done" : "")
                            }
                          >
                            {c.progress === 100 ? "✓" : "◉"}
                          </span>
                          <div>
                            <h3>{c.title}</h3>
                            <p>
                              {c.completed_lessons} of {c.total_lessons} lessons
                              completed
                            </p>
                          </div>
                          <strong>{c.progress}%</strong>
                        </summary>
                        <div className="module-progress-list">
                          {details.data.modules
                            .filter((m) => m.course_id === c.course_id)
                            .map((m) => (
                              <div key={m.id}>
                                <div>
                                  <strong>{m.title}</strong>
                                  <span>
                                    {m.completed_lessons}/{m.total_lessons}{" "}
                                    lessons · {m.progress}%
                                  </span>
                                </div>
                                <progress
                                  max="100"
                                  value={m.progress}
                                  aria-label={m.title + " completion"}
                                />
                              </div>
                            ))}
                          {!details.data.modules.some(
                            (m) => m.course_id === c.course_id,
                          ) && <p>No modules in this course yet.</p>}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
                <section className="workspace-panel topic-progress">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Your skill landscape</p>
                      <h2>Progress by topic</h2>
                    </div>
                  </div>
                  {categories.map((c) => (
                    <div className="topic-progress-row" key={c.category}>
                      <div>
                        <strong>{c.category}</strong>
                        <span>
                          {c.total ? Math.round((100 * c.done) / c.total) : 0}%
                        </span>
                      </div>
                      <progress
                        max={c.total || 1}
                        value={c.done}
                        aria-label={c.category + " completion"}
                      />
                      <small>
                        {c.done} of {c.total} lessons complete
                      </small>
                    </div>
                  ))}
                </section>
              </div>
              <div className="progress-detail-grid">
                <section className="workspace-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Your recent milestones</p>
                      <h2>Completion history</h2>
                    </div>
                  </div>
                  {details.data.history.length ? (
                    <ol className="completion-timeline">
                      {details.data.history.map((h) => (
                        <li key={h.lesson_id}>
                          <span>✓</span>
                          <div>
                            <strong>{h.title}</strong>
                            <p>{h.course_title}</p>
                            <time dateTime={h.completed_at}>
                              {new Date(h.completed_at).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="workspace-muted">
                      Complete a lesson and your milestone will appear here.
                    </p>
                  )}
                </section>
                <section className="workspace-panel completion-milestones">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Celebrate your progress</p>
                      <h2>Completed courses</h2>
                    </div>
                  </div>
                  {finished.length ? (
                    finished.map((c) => (
                      <article key={c.id}>
                        <span>✦</span>
                        <div>
                          <h3>{c.title}</h3>
                          <p>All {c.total_lessons} lessons completed</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="milestone-empty">
                      <span>✦</span>
                      <h3>Your first finish is ahead</h3>
                      <p>
                        Keep going through your lessons. Courses with every
                        lesson completed will appear here.
                      </p>
                    </div>
                  )}
                  <p className="helper-text">
                    Completion reflects your saved lesson records and the
                    current curriculum. It isn't a formal certificate.
                  </p>
                </section>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
