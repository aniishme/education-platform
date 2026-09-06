import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { isLoggedIn, logout } from "../utils/auth";

const guestNavItems = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
];

const memberNavItems = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/my-learning", label: "My Learning" },
  { to: "/progress", label: "Progress" },
  { to: "/profile", label: "Profile" },
];

function Navbar() {
  const [authed, setAuthed] = useState(isLoggedIn);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setAuthed(false);
    navigate("/login", { replace: true });
  };

  const navigationItems = authed ? memberNavItems : guestNavItems;

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <NavLink className="navbar-brand" to="/">
          StudyFlow
        </NavLink>

        <div className="navbar-links">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {authed ? (
            <button type="button" className="nav-link nav-link-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
