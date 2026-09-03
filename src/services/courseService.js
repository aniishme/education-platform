import courses from "../data/courses.json";

export function getCourses() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(courses), 500);
  });
}
