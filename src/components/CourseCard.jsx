import { Link } from "react-router-dom";
import CourseCover from "./CourseCover";
export default function CourseCard({ course }) {
  return (
    <article className="course-card market-card">
      <Link to={`/courses/${course.id}`} tabIndex={-1} aria-hidden="true">
        <CourseCover course={course} />
      </Link>
      <div className="market-card-body">
        {course.recommendation_reason && (
          <p className="recommendation-reason">
            {course.recommendation_reason}
          </p>
        )}
        <div className="market-card-tags">
          <span>{course.category}</span>
          <span>{course.level}</span>
        </div>
        <h2>
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
        </h2>
        <p className="market-card-description">
          {course.subtitle || course.description}
        </p>
        <p className="market-instructor">
          {course.instructor || "StudyFlow educator"}
        </p>
        <p className="market-card-meta">
          {course.total_lessons || 0} lessons · {course.total_sections || 0}{" "}
          modules
        </p>
        <p className="market-card-meta">
          {course.duration || "Self-paced"} · {course.enrolment_count || 0}{" "}
          enrolments
        </p>
        <div className="market-card-footer">
          <strong>Free</strong>
          <Link className="course-card-link" to={`/courses/${course.id}`}>
            View course →
          </Link>
        </div>
      </div>
    </article>
  );
}
