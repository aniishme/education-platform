import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { restoreAuth, setAuth } from "./utils/auth";
import Loading from "./components/Loading";
import CourseManagement from "./pages/CourseManagement";
import CourseEditor from "./pages/CourseEditor";
import CourseLearners from "./pages/CourseLearners";
import RoleDashboard from "./pages/RoleDashboard";
import "./Lms.css";
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
import "./Marketplace.css";

// what sits behind the Settings card when there is no page to go back to (e.g. a pasted /settings link)
const homeLocation = {
  pathname: "/",
  search: "",
  hash: "",
  state: null,
  key: "default",
};

function AppRoutes() {
  const location = useLocation();
  const isSettingsOpen = location.pathname.startsWith("/settings");

  // Settings opens as a card over the page you were on: that page is rendered from the
  // saved background location while the URL points at /settings
  const savedBackground = location.state?.backgroundLocation;
  const background =
    savedBackground && !savedBackground.pathname.startsWith("/settings")
      ? savedBackground
      : homeLocation;

  return (
    <>
      <div inert={isSettingsOpen}>
        <Routes location={isSettingsOpen ? background : location}>
          <Route element={<AppLayout />}>
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <RoleDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educator"
              element={
                <ProtectedRoute role="EDUCATOR">
                  <RoleDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learner"
              element={
                <ProtectedRoute role="LEARNER">
                  <RoleDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educator/courses"
              element={
                <ProtectedRoute roles={["ADMIN", "EDUCATOR"]}>
                  <CourseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educator/courses/new"
              element={
                <ProtectedRoute roles={["ADMIN", "EDUCATOR"]}>
                  <CourseEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educator/courses/:id/edit"
              element={
                <ProtectedRoute roles={["ADMIN", "EDUCATOR"]}>
                  <CourseEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educator/courses/:id/learners"
              element={
                <ProtectedRoute roles={["ADMIN", "EDUCATOR"]}>
                  <CourseLearners />
                </ProtectedRoute>
              }
            />
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
                  <ProtectedRoute role="LEARNER">
                    <MyLearning />
                  </ProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProtectedRoute role="LEARNER">
                    <Progress />
                  </ProtectedRoute>
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
                <ProtectedRoute role="ADMIN">
                  <ManageCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="ADMIN">
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
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [, refresh] = useState(0);
  useEffect(() => {
    const changed = () => refresh((v) => v + 1);
    const expired = () => setAuth(null);
    window.addEventListener("studyflow-auth-updated", changed);
    window.addEventListener("studyflow-session-expired", expired);
    restoreAuth()
      .then(() => {
        setError("");
        setReady(true);
      })
      .catch((error) => setError(error.message));
    return () => {
      window.removeEventListener("studyflow-auth-updated", changed);
      window.removeEventListener("studyflow-session-expired", expired);
    };
  }, [version]);
  if (error)
    return (
      <div className="lms-page">
        <h1>Unable to connect</h1>
        <p role="alert">{error}</p>
        <button onClick={() => setVersion((v) => v + 1)}>Try again</button>
      </div>
    );
  if (!ready) return <Loading message="Checking your session…" />;
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
