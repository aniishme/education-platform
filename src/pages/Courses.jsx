import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import CourseFilter from "../components/CourseFilter";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import SearchBar from "../components/SearchBar";
import { getCourses } from "../services/courseService";

function Courses() {
  const [courses, setCourses] = useState([]);
  // the search term lives in the URL (?q=) so the navbar search can set it
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const setSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set("q", value) : next.delete("q");
    setSearchParams(next, { replace: true });
  };
  const category = searchParams.get("category") || "";
  const setCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set("category", value) : next.delete("category");
    setSearchParams(next, { replace: true });
  };
  const [sort, setSort] = useState("popular");
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

  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch = (
        course.title +
        " " +
        course.description +
        " " +
        course.category +
        " " +
        course.instructor
      )
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesCategory = !category || course.category === category;
      const matchesLevel = !level || course.level === level;

      return matchesSearch && matchesCategory && matchesLevel;
    })
    .sort((a, b) =>
      sort === "popular"
        ? b.enrolment_count - a.enrolment_count
        : sort === "title"
          ? a.title.localeCompare(b.title)
          : new Date(b.created_at) - new Date(a.created_at),
    );

  const hasFilters = Boolean(search || category || level);

  function clearFilters() {
    setSearchParams({}, { replace: true });
    setLevel("");
  }

  return (
    <section className="courses-page" aria-labelledby="courses-heading">
      <div className="page-heading">
        <p className="eyebrow">Course catalogue</p>
        <h1 id="courses-heading">Explore Courses</h1>
        <p>
          Build practical skills with guided modules, video resources, worked
          examples, and portfolio exercises. Every course is free to enrol.
        </p>
      </div>

      <div className="category-tabs" aria-label="Browse categories">
        <button
          className={!category ? "active" : ""}
          onClick={() => setCategory("")}
        >
          All topics
        </button>
        {categories.map((c) => (
          <button
            className={category === c ? "active" : ""}
            key={c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
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
        <label className="sort-control">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="popular">Most enrolled</option>
            <option value="recent">Newest</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <Loading message="Loading courses..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"} found
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
