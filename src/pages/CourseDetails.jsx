import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getCourseById, isEnrolledInCourse, enrollInCourse } from "../services/courseService";

function CourseDetails() {
  const { id } = useParams();
  const course = getCourseById(id);
  const [isEnrolled, setIsEnrolled] = useState(() => isEnrolledInCourse(id));
  const resumeRef = useRef(null);
  const lessonSectionRef = useRef(null);

  // ?lesson=<id> comes from "Resume lesson" on the dashboard, or from clicking a lesson below
  const [searchParams, setSearchParams] = useSearchParams();
  const resumeLessonId = searchParams.get("lesson");
  const resumeIndex = course?.lessons.findIndex((lesson) => lesson.id === resumeLessonId) ?? -1;

  useEffect(() => {
    if (resumeIndex === -1) return undefined;

    // wait a frame: the layout's scroll-to-top on navigation runs after this effect
    const frame = requestAnimationFrame(() => resumeRef.current?.scrollIntoView({ block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [resumeIndex]);

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
          {isEnrolled ? (
            <>
              <p className="enrol-card-label">Welcome back!</p>
              <p>Pick up right where you left off.</p>
              <button
                className="enrol-button"
                type="button"
                onClick={() => lessonSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Start Learning
              </button>
            </>
          ) : (
            <>
              <p className="enrol-card-label">Ready to begin?</p>
              <p>Start this course and learn one lesson at a time.</p>
              <button
                className="enrol-button"
                type="button"
                onClick={() => {
                  enrollInCourse(id);
                  setIsEnrolled(true);
                }}
              >
                Enrol Now
              </button>
            </>
          )}
        </aside>
      </header>

      <dl className="details-meta">
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

      <section className="lesson-section" aria-labelledby="lessons-heading" ref={lessonSectionRef}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Course outline</p>
            <h2 id="lessons-heading">Lessons</h2>
          </div>
          <span className="lesson-count">{course.totalLessons} lessons</span>
        </div>

        <ol className="lesson-list">
          {course.lessons.map((lesson, index) => {
            const isCurrent = index === resumeIndex;
            const isDone = resumeIndex !== -1 && index < resumeIndex;

            return (
              <li
                key={lesson.id}
                ref={isCurrent ? resumeRef : null}
                className={isCurrent ? "lesson-current" : isDone ? "lesson-done" : undefined}
                aria-current={isCurrent ? "step" : undefined}
              >
                <button
                  type="button"
                  className="lesson-item-button"
                  disabled={!isEnrolled}
                  onClick={() => setSearchParams({ lesson: lesson.id })}
                >
                  <div>
                    <span className="lesson-number" aria-hidden="true" />
                    <span>{lesson.title}</span>
                    {isCurrent && <span className="lesson-resume-badge">Continue here</span>}
                    {isDone && <span className="visually-hidden">Completed</span>}
                  </div>
                  <span className="lesson-duration">{lesson.duration}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}

export default CourseDetails;
