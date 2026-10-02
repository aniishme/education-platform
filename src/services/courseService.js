import courses from "../data/courses.json";

const ADDED_COURSES_KEY = "studyflowAdminCourses";
// edits to a built-in course (from data/courses.json) can't be written back to the
// file, so they're kept here as a patch layered on top of it, keyed by course id
const COURSE_EDITS_KEY = "studyflowCourseEdits";
const ENROLLMENTS_KEY = "studyflowEnrollments";
const API_URL = "http://localhost:5000/api/courses";


function readAddedCourses() {
  try {
    const raw = localStorage.getItem(ADDED_COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAddedCourses(list) {
  localStorage.setItem(ADDED_COURSES_KEY, JSON.stringify(list));
}

function readCourseEdits() {
  try {
    const raw = localStorage.getItem(COURSE_EDITS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCourseEdits(edits) {
  localStorage.setItem(COURSE_EDITS_KEY, JSON.stringify(edits));
}

function slugify(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// the full catalogue, synchronously: the built-in courses (patched with any edits)
// plus anything an admin added
export function getAllCourses() {
  const edits = readCourseEdits();
  const builtIn = courses.map((course) => (edits[course.id] ? { ...course, ...edits[course.id] } : course));
  return [...builtIn, ...readAddedCourses()];
}

export async function getCourses() {
  const response = await fetch("http://localhost:5000/api/courses");

  if (!response.ok) {
    throw new Error("Unable to fetch courses");
  }

  return response.json();
}

export function getCourseById(courseId) {
  return getAllCourses().find((course) => course.id === courseId);
}

function readEnrollments() {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isEnrolledInCourse(courseId) {
  return readEnrollments().includes(courseId);
}

export function enrollInCourse(courseId) {
  const ids = readEnrollments();
  if (!ids.includes(courseId)) {
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify([...ids, courseId]));
  }
}

export async function addCourse({
  title,
  description,
  category,
  level,
  duration,
}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title.trim(),
      description: description.trim(),
      category,
      level,
      duration: duration.trim(),
      instructor: "StudyFlow Team",
      image: "",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create course");
  }

  return data.course;
}
export async function updateCourse(
  id,
  { title, description, category, level, duration }
) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title.trim(),
      description: description.trim(),
      category,
      level,
      duration: duration.trim(),
      instructor: "StudyFlow Team",
      image: "",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update course");
  }

  return data.course;
}

export async function deleteCourse(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete course");
  }

  return data;
}