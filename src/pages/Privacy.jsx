import { Link } from "react-router-dom";
import "../InfoPages.css";

const sections = [
  {
    title: "Information we collect",
    text: "When you create an account or edit your profile, we store the details you give us, such as your name and email address. We also keep your course progress so you can pick up where you left off.",
  },
  {
    title: "How we store it",
    text: "Account details, enrolments and lesson progress are stored in PostgreSQL. Passwords are hashed. A secure session cookie keeps you logged in; logout revokes that session. Theme and accessibility settings are stored on your device.",
  },
  {
    title: "How we use it",
    text: "This university demonstration uses account information to show your courses and learning progress. Educators can see learners and progress in their own courses. Administrators manage users and courses.",
  },
  {
    title: "Your choices",
    text: "You can update your profile, change your password or log out. Clearing browser data removes local preferences; your account and progress remain in the database. Leaving a course removes its enrolment and progress.",
  },
];

function Privacy() {
  return (
    <section className="info-page" aria-labelledby="privacy-title">
      <div className="info-heading">
        <p className="eyebrow">Privacy</p>
        <h1 id="privacy-title">Privacy policy</h1>
        <p>
          A plain-language summary of how StudyFlow handles your information.
        </p>
      </div>

      <div className="info-stack">
        {sections.map((section) => (
          <article className="info-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}

        <article className="info-card">
          <h2>Questions?</h2>
          <p>
            If you have any questions about this policy, please{" "}
            <Link to="/contact">contact us</Link>.
          </p>
        </article>
      </div>
    </section>
  );
}

export default Privacy;
