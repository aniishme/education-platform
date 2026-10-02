
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/studyflow-favicon.svg";
import FormField from "../components/FormField";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Wipe a field's error when the user starts fixing it
  const clearError = (field) => {
    setErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Enter your name.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!email.trim()) {
      newErrors.email = "Enter your email.";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Choose a password.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Re-enter your password.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          credentials: data.message || "Unable to create account.",
        });
        return;
      }

      alert("Account created successfully!");
      navigate("/login");

    } catch (error) {
      console.error("Signup error:", error);

      setErrors({
        credentials:
          "Unable to connect to the server. Please try again.",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>
          <img className="login-logo" src={logo} alt="" />
          StudyFlow
        </h1>

        <p className="login-subtitle">
          Create an account to start tracking what you study.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Name"
            id="name"
            type="text"
            placeholder="First and last name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
            error={errors.name}
          />

          <FormField
            label="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError("email");
            }}
            error={errors.email}
          />

          <FormField
            label="Password"
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearError("password");
            }}
            error={errors.password}
          />

          <FormField
            label="Confirm password"
            id="confirmPassword"
            type="password"
            placeholder="Type it once more"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearError("confirmPassword");
            }}
            error={errors.confirmPassword}
          />

          <button type="submit" className="login-button">
            Create account
          </button>

          {errors.credentials && (
            <p
              className="error-message login-form-error"
              role="alert"
            >
              {errors.credentials}
            </p>
          )}
        </form>

        <p className="login-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
