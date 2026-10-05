import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/studyflow-favicon.svg";
import { getRole, isLoggedIn, logout } from "../utils/auth";
import NavSearch from "./NavSearch";
import NotificationMenu from "./NotificationMenu";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import "../Navbar.css";

const guestNavItems = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
];

const memberNavItems = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/my-learning", label: "My Learning" },
  { to: "/progress", label: "Progress" },
];

const adminNavItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/admin/courses", label: "Manage Courses" },
  { to: "/admin/users", label: "Manage Users" },
];

function Navbar() {
  const [authed, setAuthed] = useState(isLoggedIn);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {await logout();setAuthed(false);navigate("/login", { replace: true });}
    catch(error){window.alert(error.message);}
  };

  const navigationItems = !isLoggedIn() ? guestNavItems : getRole() === "ADMIN" ? adminNavItems : getRole()==='EDUCATOR' ? [{to:'/',label:'Dashboard',end:true},{to:'/educator/courses',label:'My Courses'},{to:'/courses',label:'Catalogue'}] : memberNavItems;

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <NavLink className="navbar-brand" to="/">
          <img className="navbar-logo" src={logo} alt="" />
          StudyFlow
        </NavLink>

        <div className={`navbar-links${authed ? " navbar-links-member" : ""}`}>
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

          {!authed && (
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

        {authed && (
          <div className="navbar-tools">
            <NavSearch />
            <ThemeToggle />
            <NotificationMenu />
            <UserMenu onLogout={handleLogout} />
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
