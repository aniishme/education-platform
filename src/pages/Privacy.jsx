import { Link } from "react-router-dom";
import "../InfoPages.css";

const sections = [
  {
    title: "Information we collect",
    text: "When you create an account or edit your profile, we store the details you give us, such as your name and email address. We also keep your course progress so you can pick up where you left off.",
  },
  {
    title: "How we store it",
    text: "Your login state and profile details are saved in your browser's local storage on your own device. Logging out clears your login state.",
  },
  {
    title: "How we use it",
    text: "We use your information to run your account, show your courses and progress, and answer the messages you send us. We do not sell your personal information.",
  },
  {
    title: "Your choices",
    text: "You can update your profile at any time and log out whenever you like. Clearing your browser data removes what is stored on your device.",
  },
];

function Privacy() {
  return (
    <section className="info-page" aria-labelledby="privacy-title">
      <div className="info-heading">
        <p className="eyebrow">Privacy</p>
        <h1 id="privacy-title">Privacy policy</h1>
        <p>A plain-language summary of how StudyFlow handles your information.</p>
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
