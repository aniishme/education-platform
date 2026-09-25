import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/studyflow-favicon.svg";
import FormField from "../components/FormField";
import { verifyPassword } from "../utils/password";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = async () => {
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

    if (Object.keys(newErrors).length === 0) {
      const normalizedEmail = email.trim().toLowerCase();
      const isAdminLogin = normalizedEmail === ADMIN_EMAIL;
      const credentialsValid = isAdminLogin
        ? password === ADMIN_PASSWORD
        : normalizedEmail === "student@gmail.com" && (await verifyPassword(password));

      if (!credentialsValid) {
        newErrors.credentials = "Invalid email or password.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (await validateForm()) {
      const normalizedEmail = email.trim().toLowerCase();
      const isAdminLogin = normalizedEmail === ADMIN_EMAIL;

      localStorage.setItem(
        "studyflowAuth",
        JSON.stringify({
          email: normalizedEmail,
          isLoggedIn: true,
          role: isAdminLogin ? "admin" : "student",
        }),
      );
      navigate("/", { replace: true });
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
            onChange={(event) =>
              setPassword(event.target.value)
            }
            error={errors.password}
          />    

          <button type="submit" className="login-button">
            Login
          </button>

          {errors.credentials && (
            <p className="error-message login-form-error" role="alert">
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
