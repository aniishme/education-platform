import { Link } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";
import RoleDashboard from "./RoleDashboard";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import CourseCard from "../components/CourseCard";
function GuestHome() {
  const resource = useResource("/courses");
  const courses = resource.data || [],
    categories = [...new Set(courses.map((c) => c.category))];
  const featured = [...courses]
    .sort((a, b) => b.enrolment_count - a.enrolment_count)
    .slice(0, 4);
  return (
    <>
      <section className="market-hero">
        <div>
          <p className="eyebrow">Invest in your next chapter</p>
          <h1>
            Real skills.
            <br />A future you can build.
          </h1>
          <p>
            Go from curious to capable with practical courses, expert video
            resources, and projects that put your knowledge to work.
          </p>
          <div className="lms-actions">
            <Link className="primary-button" to="/courses">
              Browse Courses →
            </Link>
            <Link className="secondary-button" to="/signup">
              Start learning for free
            </Link>
          </div>
          <p className="helper-text">
            Free enrolment · Learn at your pace · Progress that stays with you
          </p>
        </div>
        <div className="hero-learning-board">
          <span className="hero-board-label">
            A little learning. A lot of possibility.
          </span>
          <div className="hero-code">
            <span>// your next chapter</span>
            <p>
              learn.skills(
              <br />
              &nbsp; 'build',
              <br />
              &nbsp; 'design',
              <br />
              &nbsp; 'solve'
              <br />
              );
            </p>
          </div>
          <div className="hero-board-bottom">
            <strong>Choose your own path</strong>
            <span>Video + notes + practice</span>
          </div>
        </div>
      </section>
      <ResourceState resource={resource} />
      {resource.data && (
        <>
          <div className="catalogue-highlights">
            <div>
              <strong>{courses.length}</strong>
              <span>courses to explore</span>
            </div>
            <div>
              <strong>
                {courses.reduce((n, c) => n + c.total_lessons, 0)}
              </strong>
              <span>guided lessons</span>
            </div>
            <div>
              <strong>{categories.length}</strong>
              <span>skill categories</span>
            </div>
            <div>
              <strong>100% free</strong>
              <span>course enrolment</span>
            </div>
          </div>
          <section className="home-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Where learners are starting</p>
                <h2>Popular courses</h2>
                <p>Build a foundation, then take your skills further.</p>
              </div>
              <Link className="text-link" to="/courses">
                View all courses →
              </Link>
            </div>
            <div className="market-grid home-market-grid">
              {featured.map((c) => (
                <CourseCard course={c} key={c.id} />
              ))}
            </div>
          </section>
          <section className="home-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Find your direction</p>
                <h2>Explore by topic</h2>
              </div>
            </div>
            <div className="category-explore-grid">
              {categories.map((c) => (
                <Link key={c} to={"/courses?category=" + encodeURIComponent(c)}>
                  <span>{c}</span>
                  <small>
                    {courses.filter((course) => course.category === c).length}{" "}
                    courses
                  </small>
                  <strong>→</strong>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
      <section className="learning-promise">
        <div>
          <p className="eyebrow">More than watching a video</p>
          <h2>Learn it. Try it. Make it yours.</h2>
          <p>
            Each course brings together a structured curriculum, companion
            videos, clear explanations, and exercises. Mark lessons complete and
            return to your last lesson whenever you're ready.
          </p>
        </div>
        <div>
          <h3>Have a skill to share?</h3>
          <p>
            Create a course, organise modules, and add YouTube videos or
            playlists. Follow your learners' progress from your educator
            dashboard.
          </p>
          <Link className="primary-button" to="/signup">
            Become an educator →
          </Link>
        </div>
      </section>
    </>
  );
}
export default function Home() {
  return isLoggedIn() ? <RoleDashboard /> : <GuestHome />;
}
