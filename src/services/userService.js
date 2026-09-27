const USERS_KEY = "studyflowUsers";

// seed data: only used the first time the admin opens Manage Users in a browser
const seedUsers = [
  {
    id: "u1",
    name: "John Carter",
    email: "john@gmail.com",
    role: "Student",
    status: "active",
    enrolledCourseIds: ["react-fundamentals", "python-programming"],
  },
  {
    id: "u2",
    name: "Sarah Lee",
    email: "sarah@gmail.com",
    role: "Student",
    status: "active",
    enrolledCourseIds: ["cybersecurity-essentials"],
  },
  {
    id: "u3",
    name: "Priya Sharma",
    email: "priya@gmail.com",
    role: "Student",
    status: "active",
    enrolledCourseIds: ["cloud-computing-foundations", "networking-basics"],
  },
  {
    id: "u4",
    name: "Daniel Morgan",
    email: "daniel@gmail.com",
    role: "Student",
    status: "deactivated",
    enrolledCourseIds: ["ui-ux-design-basics"],
  },
];

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to reseeding
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
  return seedUsers;
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUsers() {
  return readUsers();
}

export function setUserStatus(id, status) {
  const users = readUsers().map((user) => (user.id === id ? { ...user, status } : user));
  writeUsers(users);
  return users.find((user) => user.id === id);
}

export function updateUser(id, { name, email, role }) {
  const users = readUsers().map((user) =>
    user.id === id ? { ...user, name: name.trim(), email: email.trim(), role } : user,
  );
  writeUsers(users);
  return users.find((user) => user.id === id);
}
