import { Link } from "react-router-dom";
import courses from "../data/courses.json";
import "../MyLearning.css";

const enrolledCourses = [
  { courseId: "react-fundamentals", progress: 72, status: "In progress" },
  { courseId: "cybersecurity-essentials", progress: 38, status: "In progress" },
  { courseId: "ui-ux-design-basics", progress: 100, status: "Completed" },
];

function MyLearning() {
  return (
    <section className="learning-page" aria-labelledby="learning-title">
      <div className="learning-heading">
        <p className="eyebrow">Your courses</p>
        <h1 id="learning-title">My Learning</h1>
        <p>Pick up where you left off and keep building your skills.</p>
      </div>

      <div className="learning-summary" aria-label="Learning summary">
        <div>
          <strong>{enrolledCourses.length}</strong>
          <span>Enrolled courses</span>
        </div>
        <div>
          <strong>{enrolledCourses.filter((course) => course.progress === 100).length}</strong>
          <span>Completed</span>
        </div>
        <div>
          <strong>67%</strong>
          <span>Overall progress</span>
        </div>
      </div>

      <div className="learning-course-list">
        {enrolledCourses.map((enrollment) => {
          const course = courses.find((item) => item.id === enrollment.courseId);

          if (!course) {
            return null;
          }

          return (
            <article className="learning-course-card" key={course.id}>
              <div className="learning-course-main">
                <div className="learning-course-topline">
                  <span className="course-category">{course.category}</span>
                  <span className={`learning-status${enrollment.progress === 100 ? " completed" : ""}`}>
                    {enrollment.status}
                  </span>
                </div>
                <h2>{course.title}</h2>
                <p className="learning-instructor">Instructor: {course.instructor}</p>
                <p className="learning-description">{course.description}</p>
              </div>

              <div className="learning-course-progress">
                <div className="learning-progress-heading">
                  <span>Course progress</span>
                  <strong>{enrollment.progress}%</strong>
                </div>
                <div className="learning-progress-track" aria-label={`${enrollment.progress}% complete`}>
                  <span style={{ width: `${enrollment.progress}%` }} />
                </div>
                <Link className="learning-continue-button" to={`/courses/${course.id}`}>
                  {enrollment.progress === 100 ? "Review Course" : "Continue Learning"}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default MyLearning;
