import courses from "../data/courses.json";

// Sample data until the app tracks real study activity.
// Everything is relative to today, so the dashboard never goes stale.

// where the learner stopped: an exact lesson inside a course
const resumePoint = { courseId: "react-fundamentals", lessonId: "react-lesson-4" };

// minutes studied, newest first: index 0 is today, 1 is yesterday, and so on
const minutesByDaysAgo = [35, 50, 20, 45, 65, 0, 30, 40, 25, 55, 30, 20, 45, 0];

const upcomingDeadlines = [
  { id: "state-quiz", title: "Managing State quiz", type: "Quiz", courseId: "react-fundamentals", dueInDays: 1 },
  { id: "phishing-case", title: "Phishing case study", type: "Assignment", courseId: "cybersecurity-essentials", dueInDays: 3 },
  { id: "wireframes", title: "Wireframe submission", type: "Project", courseId: "ui-ux-design-basics", dueInDays: 6 },
  { id: "forms-exercise", title: "Events and Forms exercise", type: "Exercise", courseId: "react-fundamentals", dueInDays: 9 },
];

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export function getResumeLesson() {
  const course = courses.find((item) => item.id === resumePoint.courseId);
  const lessonIndex = course?.lessons.findIndex((lesson) => lesson.id === resumePoint.lessonId) ?? -1;

  if (!course || lessonIndex === -1) return null;

  return {
    course,
    lesson: course.lessons[lessonIndex],
    lessonNumber: lessonIndex + 1,
    totalLessons: course.lessons.length,
  };
}

export function getStreak() {
  // count back from today; a day off today doesn't break the streak until the day is over
  let current = 0;
  const startIndex = minutesByDaysAgo[0] > 0 ? 0 : 1;
  for (let index = startIndex; index < minutesByDaysAgo.length && minutesByDaysAgo[index] > 0; index += 1) {
    current += 1;
  }

  let best = 0;
  let run = 0;
  minutesByDaysAgo.forEach((minutes) => {
    run = minutes > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  });

  // last seven days, oldest first, for the dots under the streak count
  const lastSevenDays = minutesByDaysAgo
    .slice(0, 7)
    .map((minutes) => minutes > 0)
    .reverse();

  return { current, best: Math.max(best, current), studiedToday: minutesByDaysAgo[0] > 0, lastSevenDays };
}

// the last seven days ending today, oldest first
export function getWeekActivity() {
  const today = startOfToday();

  return minutesByDaysAgo
    .slice(0, 7)
    .map((minutes, daysAgo) => {
      const date = addDays(today, -daysAgo);
      return {
        minutes,
        isToday: daysAgo === 0,
        shortLabel: date.toLocaleDateString(undefined, { weekday: "short" }),
        weekday: date.toLocaleDateString(undefined, { weekday: "long" }),
        dateLabel: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        longLabel: date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" }),
      };
    })
    .reverse();
}

export function getDeadlines() {
  const today = startOfToday();

  return upcomingDeadlines
    .map((deadline) => {
      const dueDate = addDays(today, deadline.dueInDays);
      const course = courses.find((item) => item.id === deadline.courseId);

      let dueLabel = `Due in ${deadline.dueInDays} days`;
      if (deadline.dueInDays < 0) dueLabel = "Overdue";
      else if (deadline.dueInDays === 0) dueLabel = "Due today";
      else if (deadline.dueInDays === 1) dueLabel = "Due tomorrow";

      const isoDate = [
        dueDate.getFullYear(),
        String(dueDate.getMonth() + 1).padStart(2, "0"),
        String(dueDate.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        ...deadline,
        courseTitle: course?.title ?? "",
        isoDate,
        dueLabel,
        isUrgent: deadline.dueInDays <= 1,
        month: dueDate.toLocaleDateString(undefined, { month: "short" }),
        day: dueDate.getDate(),
        fullDate: dueDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }),
      };
    })
    .sort((first, second) => first.dueInDays - second.dueInDays);
}

export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
