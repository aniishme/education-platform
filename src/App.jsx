import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ManageCourses from "./admin/ManageCourses";
import ManageUsers from "./admin/ManageUsers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import CourseDetails from "./pages/CourseDetails";
import Courses from "./pages/Courses";
import Home from "./pages/Home";
import Login from "./pages/login";
import MyLearning from "./pages/MyLearning";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import "./Accessibility.css";

// what sits behind the Settings card when there is no page to go back to (e.g. a pasted /settings link)
const homeLocation = { pathname: "/", search: "", hash: "", state: null, key: "default" };

function AppRoutes() {
  const location = useLocation();
  const isSettingsOpen = location.pathname.startsWith("/settings");

  // Settings opens as a card over the page you were on: that page is rendered from the
  // saved background location while the URL points at /settings
  const savedBackground = location.state?.backgroundLocation;
  const background =
    savedBackground && !savedBackground.pathname.startsWith("/settings") ? savedBackground : homeLocation;

  return (
    <>
      <div inert={isSettingsOpen}>
        <Routes location={isSettingsOpen ? background : location}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/my-learning"
              element={
                <ProtectedRoute>
                  <MyLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute role="admin">
                  <ManageCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="admin">
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {isSettingsOpen && (
        <Routes>
          <Route
            path="/settings/:section?"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
