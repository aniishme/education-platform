import courses from "../data/courses.json";

const ADDED_COURSES_KEY = "studyflowAdminCourses";
// edits to a built-in course (from data/courses.json) can't be written back to the
// file, so they're kept here as a patch layered on top of it, keyed by course id
const COURSE_EDITS_KEY = "studyflowCourseEdits";
const ENROLLMENTS_KEY = "studyflowEnrollments";

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

export function getCourses() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getAllCourses()), 500);
  });
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

export function addCourse({ title, description, category, level, duration }) {
  const course = {
    id: `${slugify(title)}-${Date.now().toString(36)}`,
    title: title.trim(),
    description: description.trim(),
    category,
    level,
    duration: duration.trim(),
    instructor: "TBD",
    totalLessons: 0,
    lessons: [],
  };

  writeAddedCourses([...readAddedCourses(), course]);
  return course;
}

export function updateCourse(id, { title, description, category, level, duration }) {
  const fields = { title: title.trim(), description: description.trim(), category, level, duration: duration.trim() };

  const addedCourses = readAddedCourses();
  const addedIndex = addedCourses.findIndex((course) => course.id === id);

  if (addedIndex !== -1) {
    addedCourses[addedIndex] = { ...addedCourses[addedIndex], ...fields };
    writeAddedCourses(addedCourses);
    return addedCourses[addedIndex];
  }

  const edits = readCourseEdits();
  edits[id] = { ...edits[id], ...fields };
  writeCourseEdits(edits);

  const base = courses.find((course) => course.id === id);
  return { ...base, ...edits[id] };
}
