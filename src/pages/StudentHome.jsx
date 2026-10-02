import { Link } from "react-router-dom";
import WeeklyActivityChart from "../components/WeeklyActivityChart";
import { getSavedProfile } from "../utils/profile";
import { getDeadlines, getGreeting, getResumeLesson, getStreak, getWeekActivity } from "../utils/studyData";
import "../Dashboard.css";

function StudentHome() {
  const firstName = getSavedProfile().name.trim().split(" ")[0] || "there";
  const resume = getResumeLesson();
  const streak = getStreak();
  const weekActivity = getWeekActivity();
  const deadlines = getDeadlines();

  return (
    <div className="dashboard">
      <header className="dashboard-heading">
        <p className="eyebrow">Your dashboard</p>
        <h1>
          {getGreeting()}, {firstName}
        </h1>
        <p>Pick up where you left off and keep your study streak going.</p>
      </header>

      <div className="dashboard-grid">
        {resume && (
          <section className="dash-card continue-card" aria-labelledby="continue-heading">
            <p className="dash-kicker">Continue where you left off</p>
            <h2 className="dash-title" id="continue-heading">
              {resume.lesson.title}
            </h2>
            <p className="dash-copy">
              {resume.course.title} · Lesson {resume.lessonNumber} of {resume.totalLessons} · {resume.lesson.duration}
            </p>

            <ol
              className="lesson-steps"
              role="img"
              aria-label={`Lesson ${resume.lessonNumber} of ${resume.totalLessons}, ${resume.lessonNumber - 1} completed`}
            >
              {Array.from({ length: resume.totalLessons }, (_, index) => (
                <li
                  key={index}
                  className={index + 1 < resume.lessonNumber ? "done" : index + 1 === resume.lessonNumber ? "current" : ""}
                />
              ))}
            </ol>

            <Link className="primary-button" to={`/courses/${resume.course.id}?lesson=${resume.lesson.id}`}>
              Resume lesson <span aria-hidden="true">→</span>
            </Link>
          </section>
        )}

        <section className="dash-card streak-card" aria-labelledby="streak-heading">
          <p className="dash-kicker">Study streak</p>
          <h2 className="dash-title" id="streak-heading">
            {streak.current}-day streak
          </h2>
          <p className="dash-copy">
            {streak.studiedToday
              ? "You've studied today. Come back tomorrow to keep it going."
              : "Study today to keep your streak alive."}
          </p>

          <ul
            className="streak-days"
            aria-label={`Studied on ${streak.lastSevenDays.filter(Boolean).length} of the last 7 days`}
          >
            {streak.lastSevenDays.map((studied, index) => (
              <li key={index} className={studied ? "studied" : ""} />
            ))}
          </ul>

          <dl className="dash-stats single">
            <div>
              <dt>Longest streak</dt>
              <dd>{streak.best} days</dd>
            </div>
          </dl>
        </section>

        <section className="dash-card" aria-labelledby="activity-heading">
          <WeeklyActivityChart days={weekActivity} />
        </section>

        <section className="dash-card" aria-labelledby="deadlines-heading">
          <p className="dash-kicker">Upcoming deadlines</p>
          <h2 className="dash-title" id="deadlines-heading">
            Due soon
          </h2>

          {deadlines.length > 0 ? (
            <ul className="deadline-list">
              {deadlines.map((deadline) => (
                <li key={deadline.id}>
                  <time className="deadline-date" dateTime={deadline.isoDate} aria-label={deadline.fullDate}>
                    <span aria-hidden="true">{deadline.month}</span>
                    <strong aria-hidden="true">{deadline.day}</strong>
                  </time>
                  <div className="deadline-body">
                    <Link to={`/courses/${deadline.courseId}`}>{deadline.title}</Link>
                    <span>
                      {deadline.type} · {deadline.courseTitle}
                    </span>
                  </div>
                  <span className={`deadline-due${deadline.isUrgent ? " urgent" : ""}`}>{deadline.dueLabel}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dash-copy">Nothing due soon. Enjoy the breathing room.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudentHome;
