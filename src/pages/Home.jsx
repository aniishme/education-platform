import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCourses } from "../services/courseService";
import AdminDashboard from "../admin/AdminDashboard";
import FeaturedCourseCard from "../components/FeaturedCourseCard";
import { getRole, isLoggedIn } from "../utils/auth";
import StudentHome from "./StudentHome";

const categories = [
  "Web Development",
  "Cybersecurity",
  "Cloud Computing",
  "Programming",
  "Networking",
  "Database",
  "UI/UX",
  "Project Management",
];

function GuestHome() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  useEffect(() => {
    let current = true;
    getCourses()
      .then((courses) => {
        if (current) setFeaturedCourses(courses.slice(0, 3));
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, []);
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">Learn with StudyFlow</p>
          <h1>Learn New Skills at Your Own Pace</h1>
          <p className="hero-description">
            Explore practical courses, build your knowledge, and keep your
            learning goals moving forward.
          </p>
          <Link className="primary-button" to="/courses">
            Browse Courses
          </Link>
        </div>
        <div className="hero-note" role="group" aria-label="StudyFlow benefits">
          <span className="hero-note-number">01</span>
          <h2>Simple, focused learning</h2>
          <p>Choose a course and learn through short, manageable lessons.</p>
        </div>
      </section>

      <section className="home-section" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Start exploring</p>
            <h2 id="featured-heading">Featured Courses</h2>
          </div>
          <Link className="text-link" to="/courses">
            View all courses <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="featured-grid">
          {featuredCourses.map((course) => (
            <FeaturedCourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section
        className="home-section category-section"
        aria-labelledby="categories-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Find your direction</p>
            <h2 id="categories-heading">Course Categories</h2>
          </div>
        </div>
        <div className="category-list">
          {categories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      </section>
    </>
  );
}

// admins land on their dashboard, learners get theirs, visitors get the marketing page
function Home() {
  if (!isLoggedIn()) return <GuestHome />;
  return getRole() === "ADMIN" ? <AdminDashboard /> : <StudentHome />;
}

export default Home;
