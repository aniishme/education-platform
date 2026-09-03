import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/my-learning", label: "My Learning" },
  { to: "/progress", label: "Progress" },
  { to: "/profile", label: "Profile" },
  { to: "/login", label: "Login" },
  { to: "/signup", label: "Sign Up" },
];

function Navbar() {
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
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
