import { useState } from "react";
import "../InfoPages.css";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const clearError = (field) => {
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Enter your name.";
    }

    if (!email.trim()) {
      newErrors.email = "Enter your email.";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!message.trim()) {
      newErrors.message = "Write a message.";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // replace this with your real contact request
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <section className="info-page" aria-labelledby="contact-title">
      <div className="info-heading">
        <p className="eyebrow">Contact</p>
        <h1 id="contact-title">Get in touch</h1>
        <p>Have a question about a course or your account? Send us a message.</p>
      </div>

      <div className="contact-layout">
        <form className="info-card contact-form" onSubmit={handleSubmit} noValidate>
          {sent && (
            <p className="contact-success" role="status">
              Thanks for reaching out. Your message has been sent.
            </p>
          )}

          <div className="form-group">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              placeholder="First and last name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSent(false);
                clearError("name");
              }}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
            />
            {errors.name && (
              <p id="contact-name-error" className="error-message">
                {errors.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSent(false);
                clearError("email");
              }}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
            />
            {errors.email && (
              <p id="contact-email-error" className="error-message">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              rows="5"
              placeholder="How can we help?"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setSent(false);
                clearError("message");
              }}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
            />
            {errors.message && (
              <p id="contact-message-error" className="error-message">
                {errors.message}
              </p>
            )}
          </div>

          <button type="submit" className="login-button">
            Send message
          </button>
        </form>

        <aside className="info-card contact-details">
          <h2>Other ways to reach us</h2>
          <dl>
            <dt>Email</dt>
            <dd>support@studyflow.com</dd>
            <dt>Support hours</dt>
            <dd>Monday to Friday, 9am to 5pm</dd>
            <dt>Response time</dt>
            <dd>We usually reply within one business day.</dd>
          </dl>
        </aside>
      </div>
    </section>
  );
}

export default Contact;
