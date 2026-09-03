import { useEffect, useMemo, useState } from "react";
import CourseCard from "../components/CourseCard";
import CourseFilter from "../components/CourseFilter";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import SearchBar from "../components/SearchBar";
import { getCourses } from "../services/courseService";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadCourses() {
      try {
        const courseData = await getCourses();
        if (isCurrent) setCourses(courseData);
      } catch {
        if (isCurrent) {
          setError("Unable to load courses. Please try again.");
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadCourses();
    return () => {
      isCurrent = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(courses.map((course) => course.category))].sort(),
    [courses],
  );
  const levels = useMemo(
    () => [...new Set(courses.map((course) => course.level))].sort(),
    [courses],
  );

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesCategory = !category || course.category === category;
    const matchesLevel = !level || course.level === level;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const hasFilters = Boolean(search || category || level);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setLevel("");
  }

  return (
    <section className="courses-page" aria-labelledby="courses-heading">
      <div className="page-heading">
        <p className="eyebrow">Course catalogue</p>
        <h1 id="courses-heading">Explore Courses</h1>
        <p>Find a course that matches your goals and current experience.</p>
      </div>

      <div className="course-filters">
        <SearchBar value={search} onChange={setSearch} />
        <CourseFilter
          id="category-filter"
          label="Categories"
          value={category}
          options={categories}
          onChange={setCategory}
        />
        <CourseFilter
          id="level-filter"
          label="Levels"
          value={level}
          options={levels}
          onChange={setLevel}
        />
        <button
          className="secondary-button"
          type="button"
          onClick={clearFilters}
          disabled={!hasFilters}
        >
          Clear filters
        </button>
      </div>

      {isLoading ? (
        <Loading message="Loading courses..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} found
          </p>

          {filteredCourses.length > 0 ? (
            <div className="course-grid">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No courses found"
              message="No courses match your search. Try changing or clearing the filters."
            />
          )}
        </>
      )}
    </section>
  );
}

export default Courses;
