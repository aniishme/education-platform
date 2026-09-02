import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

 const validateForm = () => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) {
      navigate("/dashboard");
    }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>StudyFlow</h1>

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
        </form>

        <p className="login-footer">
          Don't have an account? <a href="/SignUp">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;