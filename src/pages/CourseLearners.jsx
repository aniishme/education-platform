import { Link, useParams } from "react-router-dom";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import WorkspaceHeader from "../components/WorkspaceHeader";
export default function CourseLearners() {
  const { id } = useParams(),
    resource = useResource("/courses/" + id + "/learners"),
    course = useResource("/courses/" + id);
  const learners = resource.data || [],
    average = learners.length
      ? Math.round(
          learners.reduce((n, l) => n + l.progress, 0) / learners.length,
        )
      : 0;
  return (
    <section className="workspace-page">
      <WorkspaceHeader
        eyebrow="Educator studio / Learning community"
        title="Enrolled learners"
        description={
          course.data
            ? `Follow the learning journey in ${course.data.title}.`
            : "See who is learning with you and how their progress is growing."
        }
        action={
          <Link
            className="secondary-button"
            to={"/educator/courses/" + id + "/edit"}
          >
            ← Back to course
          </Link>
        }
      />
      <ResourceState resource={course} />
      <ResourceState resource={resource} />
      {resource.data && (
        <>
          <div className="workspace-metrics">
            {[
              ["Enrolled learners", learners.length, "◎"],
              ["Average progress", average + "%", "↗"],
              [
                "Course completions",
                learners.filter(
                  (l) => l.total_lessons > 0 && l.progress === 100,
                ).length,
                "✓",
              ],
              [
                "Completed lessons",
                learners.reduce((n, l) => n + l.completed_lessons, 0),
                "▣",
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
          <div className="workspace-panel directory-panel">
            <div className="panel-heading">
              <div>
                <h2>Learner roster</h2>
                <p>Progress calculated from saved lesson completions.</p>
              </div>
              <span className="panel-label">{learners.length} learners</span>
            </div>
            {!learners.length ? (
              <div className="workspace-empty">
                <span>◎</span>
                <h3>Your learning community starts here</h3>
                <p>
                  Publish your course and learners can enrol from the catalogue.
                </p>
              </div>
            ) : (
              <div className="lms-table-wrap">
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Enrolled</th>
                      <th>Lessons</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learners.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="directory-person">
                            <span className="person-avatar avatar-learner">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <strong>{user.name}</strong>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td className="muted-cell">
                          {new Date(user.enrolled_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </td>
                        <td>
                          {user.completed_lessons}/{user.total_lessons}
                        </td>
                        <td>
                          <div className="roster-progress">
                            <progress
                              max="100"
                              value={user.progress}
                              aria-label={user.name + " progress"}
                            />
                            <strong>{user.progress}%</strong>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
