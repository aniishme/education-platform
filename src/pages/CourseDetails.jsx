import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { getAuth, getRole } from "../utils/auth";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import CourseCover from "../components/CourseCover";
import YouTubePlayer from "../components/YouTubePlayer";
import Recommendations from "../components/Recommendations";
export default function CourseDetails() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const resource = useResource("/courses/" + id);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [completion, setCompletion] = useState({ courseId: null, ids: [] });
  const course = resource.data,
    user = getAuth(),
    role = getRole();
  const manager =
    user &&
    (role === "ADMIN" ||
      (role === "EDUCATOR" && course?.educator_id === user.id));
  const canLearn = Boolean(course && (course.enrolment || manager));
  const lessonId = params.get("lesson");
  const completed = completion.courseId === id ? completion.ids : [];
  useEffect(() => {
    let current = true;
    if (canLearn)
      api("/courses/" + id + "/progress")
        .then((ids) => {
          if (current) setCompletion({ courseId: id, ids });
        })
        .catch((e) => {
          if (current) setError(e.message);
        });
    return () => {
      current = false;
    };
  }, [id, canLearn]);
  async function enrol() {
    setBusy(true);
    setError("");
    try {
      await api("/enrolments", {
        method: "POST",
        body: { course_id: Number(id) },
      });
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (resource.loading || resource.error)
    return <ResourceState resource={resource} />;
  const lessons = course.sections.flatMap((s) => s.lessons),
    percentage = lessons.length
      ? Math.round((100 * completed.length) / lessons.length)
      : 0;
  const select = (lesson) => setParams({ lesson: String(lesson) });
  const nextLesson =
    lessons.find((l) => !completed.includes(l.id)) || lessons[0];
  const activeIndex = lessons.findIndex((l) => String(l.id) === lessonId);
  return (
    <section className="course-detail-page">
      <Link className="text-link" to="/courses">
        ← Course catalogue
      </Link>
      <div className="course-detail-hero">
        <div>
          <p className="eyebrow">
            {course.category} · {course.level}
          </p>
          <h1>{course.title}</h1>
          <p className="course-subtitle">
            {course.subtitle || course.description}
          </p>
          <p>
            Created by <strong>{course.instructor}</strong>
          </p>
          <div className="course-facts">
            <span>{lessons.length} lessons</span>
            <span>{course.sections.length} modules</span>
            <span>{course.duration || "Self-paced"}</span>
            <span>
              Updated {new Date(course.updated_at).toLocaleDateString()}
            </span>
          </div>
          <div className="lms-actions">
            {!user ? (
              <Link className="primary-button" to="/login">
                Log in to enrol
              </Link>
            ) : role === "LEARNER" && !course.enrolment ? (
              <button
                className="primary-button"
                disabled={busy}
                onClick={enrol}
              >
                {busy ? "Enrolling…" : "Enrol for free"}
              </button>
            ) : course.enrolment ? (
              <>
                <span className="lms-notice">You are enrolled</span>
                {nextLesson && (
                  <button
                    className="primary-button"
                    onClick={() =>
                      select(course.enrolment.last_lesson_id || nextLesson.id)
                    }
                  >
                    Continue learning
                  </button>
                )}
              </>
            ) : null}
            {manager && (
              <Link
                className="secondary-button"
                to={"/educator/courses/" + id + "/edit"}
              >
                Edit course
              </Link>
            )}
          </div>
        </div>
        <aside className="course-includes">
          <CourseCover course={course} />
          <div>
            <strong className="course-price">Free</strong>
            <p>No payment required</p>
            <h3>This course includes</h3>
            <ul>
              <li>Structured, self-paced modules</li>
              <li>Video resources and lesson notes</li>
              <li>Worked examples and practice exercises</li>
              <li>Saved lesson completion and resume links</li>
            </ul>
          </div>
        </aside>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {canLearn && (
        <div className="course-progress-summary">
          <p>
            {completed.length} of {lessons.length} lessons complete ·{" "}
            {percentage}%
          </p>
          <progress max="100" value={percentage} aria-label="Course progress" />
        </div>
      )}
      <div className="learning-workspace">
        <div className="learning-main">
          {canLearn && lessonId ? (
            <>
              <Lesson
                key={id + "-" + lessonId}
                id={lessonId}
                expectedCourseId={Number(id)}
                learner={role === "LEARNER"}
                playlist={
                  activeIndex >= 0
                    ? course.sections.find(
                        (s) => s.id === lessons[activeIndex].section_id,
                      )?.video_url
                    : ""
                }
                fallbackVideo={course.video_url}
                credit={course.resource_credit}
                onComplete={(lesson, done) =>
                  setCompletion((previous) => ({
                    courseId: id,
                    ids: done
                      ? [
                          ...new Set([
                            ...(previous.courseId === id ? previous.ids : []),
                            lesson,
                          ]),
                        ]
                      : (previous.courseId === id ? previous.ids : []).filter(
                          (l) => l !== lesson,
                        ),
                  }))
                }
              />
              <nav className="lesson-navigation" aria-label="Lesson navigation">
                <button
                  className="secondary-button"
                  disabled={activeIndex <= 0}
                  onClick={() => select(lessons[activeIndex - 1].id)}
                >
                  ← Previous lesson
                </button>
                <button
                  className="primary-button"
                  disabled={
                    activeIndex < 0 || activeIndex >= lessons.length - 1
                  }
                  onClick={() => select(lessons[activeIndex + 1].id)}
                >
                  Next lesson →
                </button>
              </nav>
            </>
          ) : (
            <>
              {course.video_url && (
                <YouTubePlayer
                  url={course.video_url}
                  title={course.title + " preview"}
                />
              )}
              <section className="detail-panel">
                <h2>What you'll learn</h2>
                {course.outcomes ? (
                  <ul className="outcomes-list">
                    {course.outcomes
                      .split("\n")
                      .filter(Boolean)
                      .map((text, i) => (
                        <li key={i}>✓ {text}</li>
                      ))}
                  </ul>
                ) : (
                  <p>
                    Follow the curriculum below to build your understanding of{" "}
                    {course.category.toLowerCase()}.
                  </p>
                )}
              </section>
              <section className="detail-panel">
                <h2>About this course</h2>
                <p className="description-text">{course.description}</p>
                <h3>Requirements</h3>
                {course.requirements ? (
                  <ul>
                    {course.requirements
                      .split("\n")
                      .filter(Boolean)
                      .map((text, i) => (
                        <li key={i}>{text}</li>
                      ))}
                  </ul>
                ) : (
                  <p>Review the course level and curriculum before starting.</p>
                )}
                <h3>Your instructor</h3>
                <p>
                  <strong>{course.instructor}</strong> · {course.category}{" "}
                  educator
                </p>
                {course.resource_credit && (
                  <p className="helper-text">{course.resource_credit}</p>
                )}
              </section>
            </>
          )}
        </div>
        <aside className="curriculum">
          <div className="curriculum-heading">
            <h2>Course modules</h2>
            <p>
              {lessons.length} lessons · {course.sections.length} modules
            </p>
          </div>
          {!course.sections.length && <p>No modules yet.</p>}
          {course.sections.map((section, index) => (
            <details key={section.id} open className="curriculum-module">
              <summary>
                <strong>
                  {index + 1}. {section.title}
                </strong>
                <small>{section.lessons.length} lessons</small>
              </summary>
              {section.lessons.map((lesson) => (
                <div
                  className={
                    "curriculum-lesson" +
                    (lessonId === String(lesson.id) ? " selected" : "")
                  }
                  key={lesson.id}
                >
                  {canLearn ? (
                    <button
                      aria-label={lesson.title}
                      aria-current={
                        lessonId === String(lesson.id) ? "step" : undefined
                      }
                      onClick={() => select(lesson.id)}
                    >
                      <span aria-hidden="true">
                        {completed.includes(lesson.id) ? "✓" : "▷"}
                      </span>
                      <span>
                        {lesson.title}
                        <small>
                          {completed.includes(lesson.id)
                            ? "Completed"
                            : "Incomplete"}{" "}
                          · {lesson.duration_minutes} min
                        </small>
                      </span>
                    </button>
                  ) : (
                    <p>
                      {lesson.title}
                      <small>
                        {lesson.duration_minutes} min ·{" "}
                        {lesson.has_video
                          ? "Video & exercise"
                          : "Lesson & exercise"}
                      </small>
                    </p>
                  )}
                </div>
              ))}
              {!section.lessons.length && <p>No lessons yet.</p>}
            </details>
          ))}
        </aside>
      </div>
      {!lessonId && <Recommendations />}
    </section>
  );
}
function LessonNotes({ content }) {
  const headings = {
    CONCEPTS: "Key concepts",
    "WORKED EXAMPLE": "Worked example",
    "PRACTICE LAB": "Practice lab",
    "CHECK YOUR UNDERSTANDING": "Check your understanding",
  };
  if (!content?.startsWith("CONCEPTS\n"))
    return (
      <div className="lms-content">
        {content || "No text content provided."}
      </div>
    );
  const parts = content.split(
    /^(CONCEPTS|WORKED EXAMPLE|PRACTICE LAB|CHECK YOUR UNDERSTANDING)\n/gm,
  );
  return (
    <div className="lesson-notes">
      {parts.map((part, index) =>
        headings[part] ? (
          <section key={index}>
            <h4>{headings[part]}</h4>
            {part === "WORKED EXAMPLE" ? (
              <pre>
                <code>{parts[index + 1]?.trim()}</code>
              </pre>
            ) : (
              <p>{parts[index + 1]?.trim()}</p>
            )}
          </section>
        ) : null,
      )}
    </div>
  );
}
function Lesson({
  id,
  expectedCourseId,
  learner,
  onComplete,
  playlist,
  fallbackVideo,
  credit,
}) {
  const resource = useResource("/lessons/" + id),
    lesson = resource.data;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const data = await api("/lessons/" + id + "/progress", {
        method: "PUT",
        body: { completed: !lesson.completed },
      });
      onComplete(Number(id), data.completed);
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (resource.loading || resource.error)
    return <ResourceState resource={resource} />;
  if (lesson.course_id !== expectedCourseId)
    return (
      <p role="alert">
        This lesson belongs to a different course. Choose a lesson from this
        curriculum.
      </p>
    );
  return (
    <article
      className="detail-panel lesson-content"
      aria-label="Lesson content"
    >
      <p className="eyebrow">{lesson.duration_minutes} minute guided lesson</p>
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>
      <YouTubePlayer
        url={lesson.video_url || playlist || fallbackVideo}
        title={lesson.title + " video"}
      />
      <h3>Lesson notes & practice</h3>
      <LessonNotes content={lesson.content} />
      {credit && <p className="helper-text">{credit}</p>}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {learner && (
        <div className="lesson-completion">
          <p>
            {lesson.completed
              ? "Lesson completed. You can revisit it anytime."
              : "Work through the resource and exercise, then save your completion."}
          </p>
          <button className="primary-button" disabled={busy} onClick={toggle}>
            {busy
              ? "Saving…"
              : lesson.completed
                ? "Mark incomplete"
                : "Mark lesson complete"}
          </button>
        </div>
      )}
    </article>
  );
}
