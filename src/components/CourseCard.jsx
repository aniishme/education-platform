import { Link } from "react-router-dom";

function CourseCard({ course }) {
  return (
    <article className="course-card">
      <div className="course-card-header">
        <span className="course-category">{course.category}</span>
        <span className="course-level">{course.level}</span>
      </div>
      <h2>{course.title}</h2>
      <p className="course-description">{course.description}</p>
      <dl className="course-meta">
        <div>
          <dt>Instructor</dt>
          <dd>{course.instructor}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{course.duration}</dd>
        </div>
      </dl>
      <Link className="course-card-link" to={`/courses/${course.id}`}>
        View course <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default CourseCard;
