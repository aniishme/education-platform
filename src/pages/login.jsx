
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/studyflow-favicon.svg";
import FormField from "../components/FormField";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          credentials: data.message || "Invalid email or password.",
        });
        return;
      }

      localStorage.setItem(
        "studyflowAuth",
        JSON.stringify({
          email: data.user.email,
          name: data.user.name,
          userId: data.user.id,
          role: data.user.role,
          isLoggedIn: true,
        })
      );

      navigate("/", { replace: true });

    } catch (error) {
      console.error("Login error:", error);

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
          Welcome back! Please log in to continue learning.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />

          <FormField
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />

          <button type="submit" className="login-button">
            Login
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
          Don't have an account? <a href="/SignUp">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;

