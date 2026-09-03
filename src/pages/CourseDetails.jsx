import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourseById } from "../services/courseService";

function CourseDetails() {
  const { id } = useParams();
  const course = getCourseById(id);
  const [isEnrolled, setIsEnrolled] = useState(false);

  if (!course) {
    return (
      <section className="empty-state course-not-found">
        <p className="eyebrow">Course not found</p>
        <h1>We could not find that course</h1>
        <p>The course may have moved or the address may be incorrect.</p>
        <Link className="primary-button" to="/courses">
          Back to Courses
        </Link>
      </section>
    );
  }

  return (
    <article className="course-details-page">
      <Link className="back-link" to="/courses">
        <span aria-hidden="true">←</span> All courses
      </Link>

      <header className="course-details-hero">
        <div>
          <p className="eyebrow">{course.category}</p>
          <h1>{course.title}</h1>
          <p className="course-details-description">{course.description}</p>
        </div>

        <aside className="enrol-card" aria-label="Course enrolment">
          <p className="enrol-card-label">Ready to begin?</p>
          <p>Start this course and learn one lesson at a time.</p>
          <button
            className="enrol-button"
            type="button"
            onClick={() => setIsEnrolled(true)}
            disabled={isEnrolled}
          >
            {isEnrolled ? "Enrolled" : "Enrol Now"}
          </button>
          {isEnrolled && (
            <p className="enrol-confirmation" role="status">
              You have enrolled in this course.
            </p>
          )}
        </aside>
      </header>

      <dl className="details-meta">
        <div>
          <dt>Instructor</dt>
          <dd>{course.instructor}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>{course.level}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{course.duration}</dd>
        </div>
        <div>
          <dt>Lessons</dt>
          <dd>{course.totalLessons}</dd>
        </div>
      </dl>

      <section className="lesson-section" aria-labelledby="lessons-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Course outline</p>
            <h2 id="lessons-heading">Lessons</h2>
          </div>
          <span className="lesson-count">{course.totalLessons} lessons</span>
        </div>

        <ol className="lesson-list">
          {course.lessons.map((lesson) => (
            <li key={lesson.id}>
              <div>
                <span className="lesson-number" aria-hidden="true" />
                <span>{lesson.title}</span>
              </div>
              <span className="lesson-duration">{lesson.duration}</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}

export default CourseDetails;
