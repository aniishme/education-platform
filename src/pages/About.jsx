import { Link } from "react-router-dom";
import "../InfoPages.css";

const values = [
  {
    title: "Learn at your pace",
    text: "Pick up a course whenever you have time and continue exactly where you left off.",
  },
  {
    title: "See your progress",
    text: "Track completed lessons and overall progress so you always know how far you have come.",
  },
  {
    title: "Stay focused",
    text: "Clear course pages and a simple layout keep the attention on what you are studying.",
  },
];

function About() {
  return (
    <section className="info-page" aria-labelledby="about-title">
      <div className="info-heading">
        <p className="eyebrow">About us</p>
        <h1 id="about-title">Learning that fits your schedule</h1>
        <p>
          StudyFlow is an education platform that helps you find courses, follow your lessons
          and keep track of your progress in one place.
        </p>
      </div>

      <div className="info-card-grid">
        {values.map((value) => (
          <article className="info-card" key={value.title}>
            <h2>{value.title}</h2>
            <p>{value.text}</p>
          </article>
        ))}
      </div>

      <div className="info-cta">
        <div>
          <h2>Ready to start learning?</h2>
          <p>Browse the course catalogue and enrol in something new today.</p>
        </div>
        <Link className="info-button" to="/courses">
          Explore courses
        </Link>
      </div>
    </section>
  );
}

export default About;
