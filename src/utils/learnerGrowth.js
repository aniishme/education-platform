const API_URL = "http://localhost:5000/api/learner-growth";

export async function getLearnerGrowth(period) {
  const response = await fetch(API_URL);

  const users = await response.json();

  if (!response.ok) {
    throw new Error(users.message || "Unable to fetch learner growth");
  }

  const students = users.map((user) => ({
    createdAt: new Date(user.created_at),
  }));

  if (period === "months") {
    return buildMonths(students);
  }

  if (period === "years") {
    return buildYears(students);
  }

  return buildDays(students);
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function buildDays(students) {
  const today = startOfToday();
  const points = [];

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    const value = students.filter((student) => {
      const created = new Date(student.createdAt);

      return (
        created.getFullYear() === date.getFullYear() &&
        created.getMonth() === date.getMonth() &&
        created.getDate() === date.getDate()
      );
    }).length;

    points.push({
      value,
      isCurrent: daysAgo === 0,
      shortLabel: String(date.getDate()),
      longLabel: date.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "short",
      }),
    });
  }

  return points;
}

function buildMonths(students) {
  const today = startOfToday();
  const points = [];

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - monthsAgo,
      1
    );

    const value = students.filter((student) => {
      const created = new Date(student.createdAt);

      return (
        created.getFullYear() === date.getFullYear() &&
        created.getMonth() === date.getMonth()
      );
    }).length;

    points.push({
      value,
      isCurrent: monthsAgo === 0,
      shortLabel: date.toLocaleDateString(undefined, {
        month: "short",
      }),
      longLabel: date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    });
  }

  return points;
}

function buildYears(students) {
  const today = startOfToday();
  const points = [];

  for (let yearsAgo = 4; yearsAgo >= 0; yearsAgo--) {
    const year = today.getFullYear() - yearsAgo;

    const value = students.filter((student) => {
      const created = new Date(student.createdAt);

      return created.getFullYear() === year;
    }).length;

    points.push({
      value,
      isCurrent: yearsAgo === 0,
      shortLabel: String(year),
      longLabel: String(year),
    });
  }

  return points;
}