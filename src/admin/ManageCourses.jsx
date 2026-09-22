import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import SortIcon from "./SortIcon";
import { logActivity } from "../services/activityService";
import { addCourse, getAllCourses, updateCourse } from "../services/courseService";
import { getUsers } from "../services/userService";
import useFocusTrap from "../utils/useFocusTrap";
import "../Dashboard.css";
import "../Admin.css";

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

const levels = ["Beginner", "Intermediate", "Advanced"];
const levelRank = { Beginner: 0, Intermediate: 1, Advanced: 2 };

const columns = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "level", label: "Difficulty" },
  { key: "duration", label: "Duration" },
  { key: "enrollments", label: "Enrollments" },
];

const emptyForm = { title: "", description: "", category: categories[0], level: levels[0], duration: "" };

function ManageCourses() {
  const [courses, setCourses] = useState(getAllCourses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [sort, setSort] = useState({ key: "title", direction: "asc" });

  const enrollmentCounts = {};
  getUsers().forEach((user) => {
    user.enrolledCourseIds?.forEach((id) => {
      enrollmentCounts[id] = (enrollmentCounts[id] ?? 0) + 1;
    });
  });

  const filteredCourses = courses.filter((course) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      course.title.toLowerCase().includes(term) ||
      course.category.toLowerCase().includes(term) ||
      course.level.toLowerCase().includes(term)
    );
  });

  const sortFactor = sort.direction === "asc" ? 1 : -1;
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sort.key) {
      case "level":
        return (levelRank[a.level] - levelRank[b.level]) * sortFactor;
      case "duration":
        return (parseFloat(a.duration) - parseFloat(b.duration)) * sortFactor;
      case "enrollments":
        return ((enrollmentCounts[a.id] ?? 0) - (enrollmentCounts[b.id] ?? 0)) * sortFactor;
      default:
        return a[sort.key].localeCompare(b[sort.key]) * sortFactor;
    }
  });

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  useFocusTrap(dialogRef, isFormOpen, closeForm);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const updateField = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Enter a course title.";
    if (!form.description.trim()) newErrors.description = "Enter a short description.";
    if (!form.duration.trim()) newErrors.duration = "Enter an estimated duration, e.g. 6 hours.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingId) {
      const course = updateCourse(editingId, form);
      logActivity(`Course updated: ${course.title}`);
    } else {
      const course = addCourse(form);
      logActivity(`New course added: ${course.title}`);
    }

    setCourses(getAllCourses());
    closeForm();
  };

  return (
    <div className="dashboard admin-dashboard">
      <header className="dashboard-heading admin-page-heading">
        <div>
          <p className="eyebrow">Course catalogue</p>
          <h1>Manage Courses</h1>
          <p>Review every course on StudyFlow, and add new ones as they're ready.</p>
        </div>
        <button type="button" className="primary-button admin-add-button" onClick={openAddForm}>
          + Add Course
        </button>
      </header>

      <p className="result-count" aria-live="polite">
        {query
          ? `${filteredCourses.length} ${filteredCourses.length === 1 ? "course" : "courses"} match "${query}"`
          : `${sortedCourses.length} ${sortedCourses.length === 1 ? "course" : "courses"} total`}
        {query && (
          <button type="button" className="text-link admin-link-button" onClick={() => setSearchParams({})}>
            Clear
          </button>
        )}
      </p>

      {sortedCourses.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={sort.key === column.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button type="button" className="admin-th-sort" onClick={() => toggleSort(column.key)}>
                      {column.label}
                      <SortIcon direction={sort.key === column.key ? sort.direction : null} />
                    </button>
                  </th>
                ))}
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCourses.map((course) => (
                <tr key={course.id}>
                  <th scope="row">
                    <span className="admin-course-title">{course.title}</span>
                  </th>
                  <td>
                    <span className="admin-chip">{course.category}</span>
                  </td>
                  <td>
                    <span className={`admin-level admin-level-${course.level.toLowerCase()}`}>{course.level}</span>
                  </td>
                  <td>{course.duration}</td>
                  <td>{enrollmentCounts[course.id] ?? 0}</td>
                  <td className="admin-table-actions">
                    <button type="button" className="secondary-button admin-status-button" onClick={() => openEditForm(course)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : query ? (
        <EmptyState title="No courses found" message="No courses match your search." />
      ) : (
        <EmptyState title="No courses yet" message="Add your first course to get the catalogue started." />
      )}

      {isFormOpen && (
        <div className="admin-overlay" onMouseDown={closeForm}>
          <div
            ref={dialogRef}
            className="admin-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="admin-dialog-header">
              <h2 id="course-form-title">{editingId ? "Edit Course" : "Add Course"}</h2>
              <button type="button" className="settings-close" onClick={closeForm} aria-label="Close">
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmit} noValidate>
              <FormField
                label="Course Title"
                id="course-title"
                type="text"
                placeholder="e.g. Introduction to Data Analytics"
                value={form.title}
                onChange={updateField("title")}
                error={errors.title}
              />

              <div className="form-group">
                <label htmlFor="course-description">Description</label>
                <textarea
                  id="course-description"
                  rows={3}
                  placeholder="What will learners be able to do after this course?"
                  value={form.description}
                  onChange={updateField("description")}
                  aria-invalid={errors.description ? true : undefined}
                  aria-describedby={errors.description ? "course-description-error" : undefined}
                />
                {errors.description && (
                  <p id="course-description-error" className="error-message">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="admin-form-row">
                <div className="form-group">
                  <label htmlFor="course-category">Category</label>
                  <select id="course-category" value={form.category} onChange={updateField("category")}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="course-level">Difficulty</label>
                  <select id="course-level" value={form.level} onChange={updateField("level")}>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <FormField
                label="Duration"
                id="course-duration"
                type="text"
                placeholder="e.g. 6 hours"
                value={form.duration}
                onChange={updateField("duration")}
                error={errors.duration}
              />

              <button type="submit" className="login-button">
                {editingId ? "Save Changes" : "Create Course"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCourses;
