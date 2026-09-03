import { Link } from "react-router-dom";

function FeaturedCourseCard({ course }) {
  return (
    <article className="featured-card">
      <span className="course-category">{course.category}</span>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <Link className="text-link" to={`/courses/${course.id}`}>
        View course <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default FeaturedCourseCard;
