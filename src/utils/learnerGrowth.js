// Sample data until the app tracks real sign-ups: how many learners joined
// per day, month, or year. Values are oldest first, ending at the current period.

const dailyCounts = [2, 3, 1, 4, 2, 5, 3, 2, 4, 3, 5, 4, 3, 6];
const monthlyCounts = [12, 16, 14, 21, 18, 26];
const yearlyCounts = [24, 38, 51, 67, 84];

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

function buildDays() {
  const today = startOfToday();

  return dailyCounts.map((value, index) => {
    const daysAgo = dailyCounts.length - 1 - index;
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    return {
      value,
      isCurrent: daysAgo === 0,
      shortLabel: String(date.getDate()),
      longLabel: date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" }),
    };
  });
}

function buildMonths() {
  const today = startOfToday();

  return monthlyCounts.map((value, index) => {
    const monthsAgo = monthlyCounts.length - 1 - index;
    const date = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);

    return {
      value,
      isCurrent: monthsAgo === 0,
      shortLabel: date.toLocaleDateString(undefined, { month: "short" }),
      longLabel: date.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    };
  });
}

function buildYears() {
  const today = startOfToday();

  return yearlyCounts.map((value, index) => {
    const yearsAgo = yearlyCounts.length - 1 - index;
    const year = today.getFullYear() - yearsAgo;

    return {
      value,
      isCurrent: yearsAgo === 0,
      shortLabel: String(year),
      longLabel: String(year),
    };
  });
}

const builders = { days: buildDays, months: buildMonths, years: buildYears };

export function getLearnerGrowth(period) {
  return (builders[period] ?? builders.days)();
}
