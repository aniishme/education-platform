import { Link } from "react-router-dom";
import useResource from "../utils/useResource";
import ResourceState from "./ResourceState";
import CourseCard from "./CourseCard";
export default function Recommendations({ limit = 3 }) {
  const resource = useResource("/courses/recommended");
  return (
    <section className="recommendations">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your next step</p>
          <h2>Recommended courses</h2>
          <p>Based on your learning interests and course enrolments.</p>
        </div>
        <Link className="text-link" to="/courses">
          Explore all courses →
        </Link>
      </div>
      <ResourceState resource={resource} />
      {resource.data && (
        <>
          {resource.data.length ? (
            <div className="market-grid">
              {resource.data.slice(0, limit).map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <p>
              You're enrolled in every available course. More learning
              opportunities will appear here as educators publish courses.
            </p>
          )}
        </>
      )}
    </section>
  );
}
