import courses from "../data/courses.json";
import "../Progress.css";

const courseProgress = [
  { courseId: "react-fundamentals", progress: 72, completedLessons: 4, status: "In progress" },
  { courseId: "cybersecurity-essentials", progress: 38, completedLessons: 2, status: "In progress" },
  { courseId: "ui-ux-design-basics", progress: 100, completedLessons: 5, status: "Completed" },
];

const completedCourses = courseProgress.filter((course) => course.status === "Completed");
const coursesInProgress = courseProgress.filter((course) => course.status === "In progress");
const completedLessons = courseProgress.reduce((total, course) => total + course.completedLessons, 0);
const totalLessons = courseProgress.reduce((total, courseProgressItem) => {
  const course = courses.find((item) => item.id === courseProgressItem.courseId);
  return total + (course?.totalLessons ?? 0);
}, 0);
const overallProgress = Math.round(
  courseProgress.reduce((total, course) => total + course.progress, 0) / courseProgress.length,
);

function ProgressBar({ value, label }) {
  return (
    <div className="progress-bar-group">
      <div className="progress-bar-heading">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-bar-track" aria-label={`${value}% complete`}>
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Progress() {
  return (
    <section className="progress-page" aria-labelledby="progress-title">
      <div className="progress-heading">
        <p className="eyebrow">Learning summary</p>
        <h1 id="progress-title">Your progress</h1>
        <p>See how far you have come and keep your learning momentum going.</p>
      </div>

      <div className="progress-overview">
        <article className="progress-card progress-total-card">
          <div className="progress-total-visual" style={{ "--progress-value": `${overallProgress}%` }}>
            <div>
              <strong>{overallProgress}%</strong>
              <span>Overall</span>
            </div>
          </div>
          <div>
            <p className="progress-card-kicker">Learning journey</p>
            <h2>Keep going, Sameera</h2>
            <p className="progress-card-copy">
              You have completed {completedLessons} of {totalLessons} lessons across your enrolled courses.
            </p>
          </div>
        </article>

        <div className="progress-stat-grid">
          <article className="progress-card progress-stat-card">
            <strong>{completedCourses.length}</strong>
            <span>Completed courses</span>
          </article>
          <article className="progress-card progress-stat-card">
            <strong>{coursesInProgress.length}</strong>
            <span>Courses in progress</span>
          </article>
          <article className="progress-card progress-stat-card">
            <strong>{completedLessons}</strong>
            <span>Completed lessons</span>
          </article>
          <article className="progress-card progress-stat-card">
            <strong>{totalLessons}</strong>
            <span>Total lessons</span>
          </article>
        </div>
      </div>

      <div className="progress-section-heading">
        <div>
          <p className="progress-card-kicker">Course breakdown</p>
          <h2>Course progress</h2>
        </div>
        <span className="progress-lesson-count">{completedLessons} of {totalLessons} lessons completed</span>
      </div>

      <div className="progress-course-list">
        {courseProgress.map((courseProgressItem) => {
          const course = courses.find((item) => item.id === courseProgressItem.courseId);

          if (!course) {
            return null;
          }

          return (
            <article className="progress-course-card" key={course.id}>
              <div className="progress-course-header">
                <div>
                  <span className="course-category">{course.category}</span>
                  <h3>{course.title}</h3>
                  <p>Instructor: {course.instructor}</p>
                </div>
                <span className={`progress-status${courseProgressItem.status === "Completed" ? " completed" : ""}`}>
                  {courseProgressItem.status}
                </span>
              </div>
              <ProgressBar value={courseProgressItem.progress} label={`${courseProgressItem.completedLessons} of ${course.totalLessons} lessons`} />
            </article>
          );
        })}
      </div>

      <section className="progress-learning-stats" aria-labelledby="learning-stats-title">
        <div className="progress-section-heading">
          <div>
            <p className="progress-card-kicker">Your activity</p>
            <h2 id="learning-stats-title">Learning statistics</h2>
          </div>
        </div>
        <div className="learning-stats-grid">
          <div>
            <span className="learning-stat-icon" aria-hidden="true">✓</span>
            <div><strong>{completedLessons}</strong><span>Lessons completed</span></div>
          </div>
          <div>
            <span className="learning-stat-icon" aria-hidden="true">◷</span>
            <div><strong>18.5 hrs</strong><span>Learning time</span></div>
          </div>
          <div>
            <span className="learning-stat-icon" aria-hidden="true">★</span>
            <div><strong>3 days</strong><span>Current streak</span></div>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Progress;
