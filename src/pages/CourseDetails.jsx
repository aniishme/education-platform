import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  getCourseById,
  isEnrolledInCourse,
  enrollInCourse,
} from "../services/courseService";

function CourseDetails() {
  const { id } = useParams();

  const courseIdMap = {
    "python-programming": 5,
  };

  const course = getCourseById(id);

  const [isEnrolled, setIsEnrolled] = useState(() =>
    isEnrolledInCourse(id)
  );

  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonsError, setLessonsError] = useState("");

  const resumeRef = useRef(null);
  const lessonSectionRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const resumeLessonId = searchParams.get("lesson");
  const [completedLessons, setCompletedLessons] = useState([]);
const [completionLoading, setCompletionLoading] = useState(false);

const userId = localStorage.getItem("userId") || localStorage.getItem("user_id");

  useEffect(() => {
    const backendCourseId = courseIdMap[id];

    const fetchLessons = async () => {
      try {
        setLessonsLoading(true);
        setLessonsError("");

        const response = await fetch(
          `http://localhost:5000/api/lessons/course/${backendCourseId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lessons");
        }

        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setLessonsError("Unable to load lessons.");
      } finally {
        setLessonsLoading(false);
      }
    };

    if (id && backendCourseId) {
      fetchLessons();
    } else {
      setLessons([]);
      setLessonsLoading(false);
    }
  }, [id]);
  useEffect(() => {
  const backendCourseId = courseIdMap[id];

  const fetchProgress = async () => {
    if (!userId || !backendCourseId) {
      setCompletedLessons([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/lessons/progress/${userId}/${backendCourseId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lesson progress");
      }

      const data = await response.json();

      setCompletedLessons(
        data.map((item) => Number(item.lesson_id))
      );
    } catch (error) {
      console.error("Error fetching lesson progress:", error);
    }
  };

  fetchProgress();
}, [id, userId]);

  const resumeIndex = lessons.findIndex(
    (lesson) => String(lesson.id) === String(resumeLessonId)
  );

  useEffect(() => {
    if (resumeIndex === -1) return undefined;

    const frame = requestAnimationFrame(() => {
      resumeRef.current?.scrollIntoView({
        block: "center",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [resumeIndex]);

const handleCompleteLesson = async (lessonId) => {
  if (!userId) {
    alert("Please log in to track your progress.");
    return;
  }

  try {
    setCompletionLoading(true);

    const response = await fetch(
      "http://localhost:5000/api/lessons/complete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(userId),
          lessonId: Number(lessonId),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to complete lesson");
    }

    setCompletedLessons((previous) => {
      if (previous.includes(Number(lessonId))) {
        return previous;
      }

      return [...previous, Number(lessonId)];
    });

    alert("Lesson completed!");
  } catch (error) {
    console.error("Error completing lesson:", error);
    alert("Unable to mark lesson as completed.");
  } finally {
    setCompletionLoading(false);
  }
};

  if (!course) {
    return (
      <section className="empty-state course-not-found">
        <p className="eyebrow">Course not found</p>

        <h1>We could not find that course</h1>

        <p>
          The course may have moved or the address may be incorrect.
        </p>

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

          <p className="course-details-description">
            {course.description}
          </p>
        </div>

        <aside
          className="enrol-card"
          aria-label="Course enrolment"
        >
          {isEnrolled ? (
            <>
              <p className="enrol-card-label">
                Welcome back!
              </p>

              <p>
                Pick up right where you left off.
              </p>

              <button
                className="enrol-button"
                type="button"
                onClick={() =>
                  lessonSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                Start Learning
              </button>
            </>
          ) : (
            <>
              <p className="enrol-card-label">
                Ready to begin?
              </p>

              <p>
                Start this course and learn one lesson at a time.
              </p>

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
          <dd>{lessons.length}</dd>
        </div>
      </dl>

      <section
        className="lesson-section"
        aria-labelledby="lessons-heading"
        ref={lessonSectionRef}
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Course outline</p>

            <h2 id="lessons-heading">
              Lessons
            </h2>
          </div>

          <span className="lesson-count">
            {lessons.length} lessons
          </span>
        </div>

        <ol className="lesson-list">
          {lessonsLoading && (
            <li>Loading lessons...</li>
          )}

          {lessonsError && (
            <li>{lessonsError}</li>
          )}

          {lessons.map((lesson, index) => {
            const isCurrent = index === resumeIndex;
            const isDone = completedLessons.includes(Number(lesson.id));

            return (
              <li
                key={lesson.id}
                ref={isCurrent ? resumeRef : null}
                className={
                  isCurrent
                    ? "lesson-current"
                    : isDone
                      ? "lesson-done"
                      : undefined
                }
                aria-current={
                  isCurrent ? "step" : undefined
                }
              >
                <button
                  type="button"
                  className="lesson-item-button"
                  disabled={!isEnrolled}
                  onClick={() =>
                    setSearchParams({
                      lesson: lesson.id,
                    })
                  }
                >
                  <div>
                    <span
                      className="lesson-number"
                      aria-hidden="true"
                    />

                    <span>
                      {lesson.title}
                    </span>

                    {isCurrent && (
                      <span className="lesson-resume-badge">
                        Continue here
                      </span>
                    )}

                    {isDone && (
                      <span className="visually-hidden">
                        Completed
                      </span>
                    )}
                  </div>

                  <span className="lesson-duration">
                    {lesson.duration}
                  </span>
                  </button>
                  {isEnrolled && (
  <button
    type="button"
    className="lesson-complete-button"
    disabled={isDone || completionLoading}
    onClick={() => handleCompleteLesson(lesson.id)}
    >
      
     {isDone ? "✓ Completed" : "Mark Complete"}
  </button>
)}
            
             </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}

export default CourseDetails;