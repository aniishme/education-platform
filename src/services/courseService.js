import courses from "../data/courses.json";

export function getCourses() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(courses), 500);
  });
}

export function getCourseById(courseId) {
  return courses.find((course) => course.id === courseId);
}
