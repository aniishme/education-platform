import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../MyLearning.css";
import { getEnrolments,  deleteEnrolment, } from "../services/enrolmentService";
import { getCourses } from "../services/courseService";
import { getAuth } from "../utils/auth";

function MyLearning() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyLearning() {
      try {
        const auth = getAuth();

        if (!auth?.userId) {
          setEnrolledCourses([]);
          return;
        }

        const [enrolments, courseData] = await Promise.all([
          getEnrolments(),
          getCourses(),
        ]);

        const myEnrolments = enrolments.filter(
          (enrolment) =>
            Number(enrolment.user_id) === Number(auth.userId)
        );

        setEnrolledCourses(myEnrolments);
        setCourses(courseData);
      } catch (error) {
        console.error("Unable to load My Learning:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMyLearning();
  }, []);

  const handleLeaveCourse = async (enrolmentId) => {
  const confirmed = window.confirm(
    "Are you sure you want to leave this course?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteEnrolment(enrolmentId);

    setEnrolledCourses((currentCourses) =>
      currentCourses.filter(
        (enrollment) => enrollment.id !== enrolmentId
      )
    );
  } catch (error) {
    console.error("Unable to leave course:", error);
    alert("Unable to leave course. Please try again.");
  }
};
  return (
    <section className="learning-page" aria-labelledby="learning-title">
      <div className="learning-heading">
        <p className="eyebrow">Your courses</p>
        <h1 id="learning-title">My Learning</h1>
        <p>Pick up where you left off and keep building your skills.</p>
      </div>

      <div className="learning-summary" role="group" aria-label="Learning summary">
        <div>
          <strong>{enrolledCourses.length}</strong>
          <span>Enrolled courses</span>
        </div>
        <div>
         <strong>0</strong>
          <span>Completed</span>
        </div>
        <div>
          <strong>0%</strong>
          <span>Overall progress</span>
        </div>
      </div>

      <div className="learning-course-list">
        {enrolledCourses.map((enrollment) => {
         const course = courses.find(
  (item) => Number(item.id) === Number(enrollment.course_id)
);

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
                  <strong>0%</strong>
                </div>
                <div
                  className="learning-progress-track"
                  role="progressbar"
                  aria-label={`${course.title} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={enrollment.progress}
                >
                  <span style={{ width: "0%" }} />
                </div>
                <Link className="learning-continue-button" to={`/courses/${course.id}`}>
                  {false ? "Review Course" : "Continue Learning"}
                  <span aria-hidden="true">→</span>
                </Link>
                <button
  type="button"
  className="learning-leave-button"
  onClick={() => handleLeaveCourse(enrollment.id)}
>
  Leave Course
</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default MyLearning;
