import { Link } from "react-router-dom";
import FeaturedCourseCard from "../components/FeaturedCourseCard";

const featuredCourses = [
  {
    id: "react-fundamentals",
    title: "React Fundamentals",
    category: "Web Development",
    description: "Build a strong foundation in components, props, and state.",
  },
  {
    id: "cybersecurity-essentials",
    title: "Cybersecurity Essentials",
    category: "Cybersecurity",
    description: "Learn practical ways to recognise and reduce digital risks.",
  },
  {
    id: "ui-ux-design-basics",
    title: "UI/UX Design Basics",
    category: "UI/UX",
    description: "Create clear, accessible interfaces centred on user needs.",
  },
];

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

function Home() {
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
        <div className="hero-note" aria-label="StudyFlow benefits">
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

      <section className="home-section category-section" aria-labelledby="categories-heading">
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

export default Home;
