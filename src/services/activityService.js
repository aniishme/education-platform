const ACTIVITY_KEY = "studyflowActivity";
const MAX_ENTRIES = 20;

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

// seed data: only used the first time the admin opens the dashboard in a browser
const seedActivity = [
  { id: "seed-1", message: "Sarah Lee enrolled in Cybersecurity Essentials", timestamp: hoursAgo(2) },
  { id: "seed-2", message: "John Carter completed React Fundamentals", timestamp: hoursAgo(9) },
  { id: "seed-3", message: "Priya Sharma enrolled in Networking Basics", timestamp: hoursAgo(27) },
  { id: "seed-4", message: "Daniel Morgan's account was deactivated", timestamp: hoursAgo(48) },
];

function readActivity() {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to reseeding
  }

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(seedActivity));
  return seedActivity;
}

function writeActivity(list) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list));
}

export function getRecentActivity(limit = 6) {
  return readActivity().slice(0, limit);
}

export function logActivity(message) {
  const entry = { id: `a-${Date.now().toString(36)}`, message, timestamp: new Date().toISOString() };
  writeActivity([entry, ...readActivity()].slice(0, MAX_ENTRIES));
  return entry;
}

export function timeAgo(isoDate) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
